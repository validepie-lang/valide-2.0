"""
Movimentação: saída (avulsa e em lote), listagem, desfazer e correção.

O histórico é um livro razão imutável: nenhuma linha é apagada ou editada. Por
isso "desfazer" e "corrigir" são movimentações NOVAS, ligadas à original por
`id_movimentacao_origem` — é o que o contrato v27/v28 chama de estorno e de
ajuste, e é o que faz a original passar a vir com `correctedAt`.

O banco só conhece ENTRADA, VENDA, DESCARTE e AJUSTE (não existe ESTORNO). O
estorno de uma saída entra como ENTRADA, com `id_movimentacao_origem` apontando
para a saída: devolve a quantidade ao lote sem inventar um tipo que o banco não
tem, e deixa o mesmo cargo que registrou a saída desfazer (o AJUSTE é de nível 2,
e o Balconista também vende).

Descarte (motivo `expiry` ou `damage`) é de Farmacêutico ou Administrador — o
nível 2 autoriza descartes e ajustes (regra do banco, business-rules seção 5).
"""

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query

from ..config import fuso
from ..db import conexao, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import ApiError, erro_conflito, erro_nao_encontrado, erro_validacao
from ..repo import (
    aplicar_delta_lote,
    carregar_movimento,
    inserir_movimento,
    instantes_do_periodo,
    lote_da_empresa,
    movimento_bruto,
    movimentos,
)
from ..serialize import booleano, instante_utc

router = APIRouter(tags=["movements"])

PER_PAGE_MAXIMO = 100
ITENS_MAXIMOS = 1000
NOTA_MAXIMA = 500
NOTA_MINIMA = 3

# Até quanto tempo depois dá para desfazer a saída no botão da faixa
# "Saída registrada" (contrato v27: "logo depois de registrar").
JANELA_ESTORNO_MINUTOS = 30

# Motivos de saída (os `motivo` do banco) e os que contam como descarte.
MOTIVOS = ("sale", "damage", "theft", "expiry", "internal")
DESCARTE = ("expiry", "damage")

# Tipo do histórico -> tipo do contrato
TIPOS_MOVIMENT = ("in", "out", "adjust")


# --------------------------------------------------------------------------
# Normalização
# --------------------------------------------------------------------------
def _inteiro(valor) -> int | None:
    if valor is None or isinstance(valor, bool):
        return None
    if isinstance(valor, int):
        return valor
    try:
        return int(str(valor).strip())
    except (TypeError, ValueError):
        return None


def _nota(valor, minimo: int = 0) -> str | None:
    """Justificativa do histórico: espaços colapsados, de `minimo` a 500 letras."""
    texto = " ".join(str(valor or "").split())
    if len(texto) < max(minimo, 1):
        if minimo:
            raise erro_validacao("Diga o que aconteceu, para quem conferir depois.")
        return None
    if len(texto) > NOTA_MAXIMA:
        raise erro_validacao(f"A justificativa passou de {NOTA_MAXIMA} letras.")
    return texto


def _dia(valor, rotulo: str) -> str | None:
    texto = str(valor or "").strip()
    if not texto:
        return None
    try:
        date.fromisoformat(texto[:10])
    except ValueError:
        raise erro_validacao(f"A data de {rotulo} do período está em formato inválido.")
    return texto[:10]


def _quantidade(numero: int, unidade: str | None) -> str:
    """Para a mensagem: "14 un", como a tela mostra a quantidade."""
    return f"{numero} {unidade or 'un'}"


def _quando(valor, sessao: Sessao) -> str:
    """Instante no fuso da farmácia, "13/10, 14:22", como a tela escreve."""
    instante = instante_utc(valor)
    if not instante:
        return "agora há pouco"
    local = instante.astimezone(fuso(sessao.empresa.get("fuso_horario")))
    return local.strftime("%d/%m, %H:%M")


def _motivo(dados: dict) -> tuple[str, str | None]:
    """Motivo da saída e a justificativa já limpa."""
    motivo = str(dados.get("reason") or "").strip().lower()
    if motivo not in MOTIVOS:
        raise erro_validacao("Escolha o motivo da saída.")
    return motivo, _nota(dados.get("note"))


def _movimento_ou_404(conn, sessao: Sessao, id_movimentacao: int) -> dict:
    movimento = movimento_bruto(conn, sessao.id_empresa, id_movimentacao)
    if not movimento:
        raise erro_nao_encontrado(
            "MOVEMENT_NOT_FOUND", "Esta movimentação não foi encontrada."
        )
    return movimento


def _lote_da_saida(conn, sessao: Sessao, id_lote: int) -> dict | None:
    """O lote da conta, desde que ainda esteja no estoque."""
    lote = lote_da_empresa(conn, sessao.id_empresa, id_lote)
    if not lote or not booleano(lote.get("ativo")):
        return None
    return lote


def _tipo_do_motivo(motivo: str) -> str:
    return "DESCARTE" if motivo in DESCARTE else "VENDA"


# --------------------------------------------------------------------------
# Rotas
# --------------------------------------------------------------------------
@router.post("/movements/out")
def saida(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    """Baixa de um lote: VENDA (ou roubo, consumo interno) e DESCARTE."""
    motivo, nota = _motivo(dados)
    if motivo in DESCARTE:
        sessao.exige_ajuste_de_estoque("o descarte")

    id_lote = _inteiro(dados.get("lotId"))
    quantidade = _inteiro(dados.get("quantity"))
    if id_lote is None:
        raise erro_nao_encontrado(
            "LOT_NOT_FOUND",
            "Este lote não está mais no estoque. Volte ao produto e confira os lotes.",
        )
    if quantidade is None or quantidade <= 0:
        raise erro_validacao("A quantidade precisa ser maior que zero.")

    with transacao() as conn:
        lote = _lote_da_saida(conn, sessao, id_lote)
        if not lote:
            raise erro_nao_encontrado(
                "LOT_NOT_FOUND",
                "Este lote não está mais no estoque. Volte ao produto e confira os lotes.",
            )
        if quantidade > int(lote["quantidade_atual"]):
            raise erro_validacao(
                f"O lote {lote['numero_lote']} tem "
                f"{_quantidade(int(lote['quantidade_atual']), lote['unidade'])}. "
                "Confira a quantidade.",
                "LOT_QUANTITY_EXCEEDED",
            )

        id_movimentacao = inserir_movimento(
            conn,
            id_lote=id_lote,
            id_usuario=sessao.id,
            tipo=_tipo_do_motivo(motivo),
            quantidade=quantidade,
            justificativa=nota,
            motivo=motivo,
        )
        aplicar_delta_lote(conn, id_lote, -quantidade)
        return carregar_movimento(conn, sessao.id_empresa, id_movimentacao)


@router.post("/movements/out/batch", status_code=201)
def saida_em_lote(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    """Várias saídas numa transação só: ou todas entram, ou nenhuma."""
    motivo, nota = _motivo(dados)
    if motivo in DESCARTE:
        sessao.exige_ajuste_de_estoque("o descarte")

    itens = dados.get("items")
    if not isinstance(itens, list) or not itens:
        raise erro_validacao("Marque ao menos um lote para retirar.", "NOTHING_SELECTED")
    if len(itens) > ITENS_MAXIMOS:
        raise erro_validacao(
            f"Dá para retirar até {ITENS_MAXIMOS} lotes de cada vez. "
            "Filtre a lista e retire por partes."
        )

    pedidos: list[tuple[int, int]] = []
    for item in itens:
        if not isinstance(item, dict):
            raise erro_validacao("Cada item precisa do lote e da quantidade.")
        id_lote = _inteiro(item.get("lotId"))
        quantidade = _inteiro(item.get("quantity"))
        if id_lote is None:
            raise erro_nao_encontrado(
                "LOT_NOT_FOUND",
                "Algum lote marcado não existe mais. Recarregue a página e confira a lista.",
            )
        if quantidade is None or quantidade <= 0:
            raise erro_validacao("A quantidade precisa ser maior que zero.")
        pedidos.append((id_lote, quantidade))

    # O mesmo lote pode aparecer duas vezes: quem decide se cabe é a soma.
    somados: dict[int, int] = {}
    for id_lote, quantidade in pedidos:
        somados[id_lote] = somados.get(id_lote, 0) + quantidade

    with transacao() as conn:
        lotes: dict[int, dict] = {}
        for id_lote in somados:
            lote = _lote_da_saida(conn, sessao, id_lote)
            if not lote:
                raise erro_nao_encontrado(
                    "LOT_NOT_FOUND",
                    "Algum lote marcado não existe mais. Recarregue a página e confira a lista.",
                )
            lotes[id_lote] = lote

        excedidos = [
            str(id_lote)
            for id_lote, quantidade in somados.items()
            if quantidade > int(lotes[id_lote]["quantidade_atual"])
        ]
        if excedidos:
            raise ApiError(
                422,
                "LOT_QUANTITY_EXCEEDED",
                "Algum lote marcado tem menos do que a quantidade pedida. "
                "Recarregue a lista e confira as quantidades.",
                {"lotIds": excedidos},
            )

        saidas = []
        for id_lote, quantidade in pedidos:
            id_movimentacao = inserir_movimento(
                conn,
                id_lote=id_lote,
                id_usuario=sessao.id,
                tipo=_tipo_do_motivo(motivo),
                quantidade=quantidade,
                justificativa=nota,
                motivo=motivo,
            )
            aplicar_delta_lote(conn, id_lote, -quantidade)
            saidas.append(carregar_movimento(conn, sessao.id_empresa, id_movimentacao))
        return {"data": saidas}


@router.get("/movements")
def listar(
    page: int = 1,
    perPage: int = 20,
    productId: str | None = None,
    type: str | None = None,
    reason: str | None = None,
    userId: str | None = None,
    de: str | None = Query(None, alias="from"),
    ate: str | None = Query(None, alias="to"),
    sessao: Sessao = Depends(sessao_atual),
):
    """
    Histórico da conta, do mais recente ao mais antigo.

    `from`/`to` são dias no fuso da farmácia e viram instantes UTC aqui, como
    as outras datas de calendário. `meta.countsByType` conta cada tipo sem
    contar o próprio `type` nem o `reason` (contrato v28).
    """
    if perPage < 1 or perPage > PER_PAGE_MAXIMO:
        raise erro_validacao(f"A página aceita de 1 a {PER_PAGE_MAXIMO} linhas.")
    page = max(page, 1)
    if type is not None and type not in TIPOS_MOVIMENT:
        raise erro_validacao("O tipo pedido não existe.")
    if reason is not None and reason not in MOTIVOS:
        raise erro_validacao("O motivo pedido não existe.")

    inicio, fim = instantes_do_periodo(
        sessao.empresa.get("fuso_horario"), _dia(de, "início"), _dia(ate, "fim")
    )

    with conexao() as conn:
        lista, total, contagens = movimentos(
            conn,
            sessao.id_empresa,
            produto_id=_inteiro(productId),
            tipo=type,
            motivo=reason,
            usuario_id=_inteiro(userId),
            de=inicio,
            ate=fim,
            page=page,
            per_page=perPage,
        )
    return {
        "data": lista,
        "meta": {
            "page": page,
            "perPage": perPage,
            "total": total,
            "countsByType": contagens,
        },
    }


@router.post("/movements/{id_movimentacao}/reverse")
def desfazer(id_movimentacao: int, sessao: Sessao = Depends(sessao_atual)):
    """
    O "Desfazer" da faixa "Saída registrada": devolve a quantidade ao lote.

    Vale só para a saída da própria pessoa, uma vez e nos primeiros minutos —
    fora disso a correção é o `POST /movements/:id/adjust` (contrato v27).
    """
    with transacao() as conn:
        movimento = _movimento_ou_404(conn, sessao, id_movimentacao)
        original = (
            movimento["tipo_movimentacao"] in ("VENDA", "DESCARTE")
            and not movimento.get("id_movimentacao_origem")
            and not movimento.get("corrigida_em")
        )
        if not original or int(movimento["id_usuario"]) != sessao.id:
            raise erro_conflito(
                "MOVEMENT_NOT_REVERSIBLE",
                "Esta saída já não pode ser desfeita. Corrija com uma movimentação de ajuste.",
            )

        minutos = instante_utc(movimento["data_registro"])
        minutos = (
            (datetime.now(timezone.utc) - minutos).total_seconds() / 60 if minutos else None
        )
        if minutos is None or minutos > JANELA_ESTORNO_MINUTOS:
            raise erro_conflito(
                "MOVEMENT_NOT_REVERSIBLE",
                "Já passou do tempo de desfazer esta saída "
                f"({JANELA_ESTORNO_MINUTOS} minutos). Corrija com uma movimentação de ajuste.",
            )

        if movimento.get("motivo") in DESCARTE:
            sessao.exige_ajuste_de_estoque("o estorno de um descarte")

        id_lote = int(movimento["id_lote"])
        lote = _lote_da_saida(conn, sessao, id_lote)
        if not lote:
            raise erro_conflito(
                "LOT_NOT_FOUND",
                f"O lote {movimento['numero_lote']} já não está no estoque. "
                "Registre uma entrada com o que voltou.",
            )

        quantidade = int(movimento["quantidade"])
        novo = inserir_movimento(
            conn,
            id_lote=id_lote,
            id_usuario=sessao.id,
            tipo="ENTRADA",
            quantidade=quantidade,
            justificativa=f"Estorno da saída #{id_movimentacao}.",
            id_origem=id_movimentacao,
        )
        aplicar_delta_lote(conn, id_lote, quantidade)
        return carregar_movimento(conn, sessao.id_empresa, novo)


@router.post("/movements/{id_movimentacao}/adjust")
def corrigir(
    id_movimentacao: int,
    dados: dict = Depends(corpo),
    sessao: Sessao = Depends(sessao_atual),
):
    """
    Corrige uma entrada ou saída gravando um AJUSTE com a diferença.

    `quantity` é o que de fato aconteceu (zero se não aconteceu). A original não
    muda: passa a vir com `correctedAt`, e o ajuste com `corrects`. Uma vez por
    movimentação, e um ajuste não se corrige (contrato v28, business-rules 3.5).
    """
    sessao.exige_ajuste_de_estoque("a correção de uma movimentação")

    with transacao() as conn:
        movimento = _movimento_ou_404(conn, sessao, id_movimentacao)
        if movimento["tipo_movimentacao"] == "AJUSTE":
            raise erro_conflito(
                "MOVEMENT_NOT_CORRECTABLE",
                "Um ajuste não se corrige. Se ele ficou errado, fale com quem administra a conta.",
            )
        if movimento.get("corrigida_em"):
            raise erro_conflito(
                "MOVEMENT_ALREADY_CORRECTED",
                "Esta movimentação já foi corrigida em "
                f"{_quando(movimento['corrigida_em'], sessao)}.",
            )

        registrada = int(movimento["quantidade"])
        quantidade = _inteiro(dados.get("quantity"))
        if quantidade is None or quantidade < 0:
            raise erro_validacao(
                "A quantidade não pode ser negativa. Use zero se não aconteceu."
            )
        if quantidade == registrada:
            raise erro_validacao(
                f"É a mesma quantidade registrada "
                f"({_quantidade(registrada, movimento['unidade'])}). "
                "Se está certa, não precisa corrigir."
            )
        nota = _nota(dados.get("note"), NOTA_MINIMA)

        # Na saída o ajuste devolve a diferença ao lote; na entrada, tira.
        eh_saida = movimento["tipo_movimentacao"] in ("VENDA", "DESCARTE")
        delta = registrada - quantidade if eh_saida else quantidade - registrada

        id_lote = int(movimento["id_lote"])
        lote = _lote_da_saida(conn, sessao, id_lote)
        if not lote:
            raise ApiError(
                409,
                "LOT_NOT_FOUND",
                f"O lote {movimento['numero_lote']} já não está no estoque. "
                "Registre uma entrada com o que voltou.",
            )
        saldo = int(lote["quantidade_atual"])
        if saldo + delta < 0:
            raise erro_validacao(
                f"O lote {lote['numero_lote']} tem "
                f"{_quantidade(saldo, lote['unidade'])}; a correção tiraria "
                f"{_quantidade(-delta, lote['unidade'])}.",
                "LOT_QUANTITY_EXCEEDED",
            )

        novo = inserir_movimento(
            conn,
            id_lote=id_lote,
            id_usuario=sessao.id,
            tipo="AJUSTE",
            quantidade=delta,
            justificativa=nota,
            id_origem=id_movimentacao,
        )
        aplicar_delta_lote(conn, id_lote, delta)
        return carregar_movimento(conn, sessao.id_empresa, novo)
