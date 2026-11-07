"""
Lotes: entrada, desfazer e o calendário de vencimentos.

`POST /products/:id/lots` grava o lote E a ENTRADA no histórico, na mesma
transação (decisão do Marcus em 10/10). Se o lote não entrar, a ENTRADA não
fica. Quem registra entrada é o Balconista também: a matriz do banco libera
ENTRADA para o nível 1.

`DELETE /products/:id/lots/:lotId` é o "Desfazer" da fila de validades. O
banco proíbe hard-delete em `lotes_estoque` e em `historico_movimentacao`, e a
regra do projeto é que toda movimentação continue rastreável — então desfazer
é desativar o lote e zerar o saldo, deixando a ENTRADA no histórico. Quem
decide se pode desfazer é a regra do contrato: só lote sem outra movimentação
além da própria ENTRADA (`409 LOT_NOT_REMOVABLE` fora disso).

`GET /lots` alimenta o calendário de vencimentos (contrato v17).
"""

import re
from datetime import date

from fastapi import APIRouter, Depends

from ..db import conexao, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import erro_conflito, erro_nao_encontrado, erro_validacao
from ..repo import (
    carregar_produto,
    desativar_lote,
    inserir_lote,
    inserir_movimento,
    lote_da_empresa,
    lote_por_codigo,
    lote_tem_um_movimento,
    lotes_expirando,
)
from ..serialize import lote as serializar_lote, so_dia

router = APIRouter(tags=["lots"])

CODIGO_MAXIMO = 50
FORNECEDOR_MAXIMO = 80
NOTA_MAXIMA = 20

# "começando por número, só números, ponto, traço e barra" (contrato v27)
_NOTA_VALIDA = re.compile(r"^[0-9][0-9./-]*$")


def _inteiro(valor) -> int | None:
    if valor is None or isinstance(valor, bool):
        return None
    if isinstance(valor, int):
        return valor
    try:
        return int(str(valor).strip())
    except (TypeError, ValueError):
        return None


def _data(texto, rotulo: str) -> str | None:
    dia = so_dia(texto)
    if not dia:
        return None
    try:
        date.fromisoformat(dia)
    except ValueError:
        raise erro_validacao(f"A data de {rotulo} está em formato inválido.")
    return dia


# --------------------------------------------------------------------------
# Regras do lote (compartilhadas com POST /products, que cria lotes iniciais)
# --------------------------------------------------------------------------
def validar_lote(dados: dict) -> dict:
    """Valida e normaliza o corpo do lote; devolve o que vai para o banco."""
    codigo = str(dados.get("code") or "").strip()
    if not codigo or len(codigo) > CODIGO_MAXIMO:
        raise erro_validacao(
            f"Informe o código do lote (até {CODIGO_MAXIMO} caracteres)."
        )

    validade = _data(dados.get("expiresAt"), "validade")
    if not validade:
        raise erro_validacao("Informe a data de validade do lote.")

    quantidade = _inteiro(dados.get("quantity"))
    if quantidade is None or quantidade <= 0:
        raise erro_validacao("A quantidade precisa ser maior que zero.")

    fornecedor = str(dados.get("supplier") or "").strip() or None
    if fornecedor and len(fornecedor) > FORNECEDOR_MAXIMO:
        raise erro_validacao(f"O fornecedor tem até {FORNECEDOR_MAXIMO} caracteres.")

    nota = str(dados.get("invoiceNumber") or "").strip() or None
    if nota and (len(nota) > NOTA_MAXIMA or not _NOTA_VALIDA.match(nota)):
        raise erro_validacao(
            "A nota fiscal deve começar com número e ter até "
            f"{NOTA_MAXIMA} caracteres (números, ponto, traço ou barra)."
        )

    return {
        "code": codigo,
        "expiresAt": validade,
        "manufacturedAt": _data(dados.get("manufacturedAt"), "fabricação"),
        "quantity": quantidade,
        "supplier": fornecedor,
        "invoiceNumber": nota,
    }


def nota_da_entrada(lote: dict) -> str | None:
    """A observação da ENTRADA: "Fornecedor · NF número" (contrato v27)."""
    nota = f"NF {lote['invoiceNumber']}" if lote.get("invoiceNumber") else None
    juntas = " · ".join(parte for parte in (lote.get("supplier"), nota) if parte)
    return juntas or None


def gravar_lote(conn, sessao: Sessao, id_produto: int, dados: dict) -> int:
    """Confere o código, cria o lote e a ENTRADA. Devolve o id do lote."""
    lote = validar_lote(dados)
    if lote_por_codigo(conn, id_produto, lote["code"]):
        raise erro_conflito(
            "LOT_CODE_TAKEN",
            f"Este produto já tem o lote {lote['code']}. Confira o número impresso na caixa.",
        )

    id_lote = inserir_lote(
        conn,
        id_produto=id_produto,
        numero_lote=lote["code"],
        data_validade=lote["expiresAt"],
        quantidade=lote["quantity"],
        id_usuario=sessao.id,
        fabricacao=lote["manufacturedAt"],
    )
    inserir_movimento(
        conn,
        id_lote=id_lote,
        id_usuario=sessao.id,
        tipo="ENTRADA",
        quantidade=lote["quantity"],
        justificativa=nota_da_entrada(lote),
        fornecedor=lote["supplier"],
        nota_fiscal=lote["invoiceNumber"],
    )
    return id_lote


def _produto_ou_404(conn, sessao: Sessao, id_produto: int) -> dict:
    produto = carregar_produto(conn, sessao.id_empresa, id_produto, sessao.hoje, sessao.janela)
    if not produto:
        raise erro_nao_encontrado(
            "PRODUCT_NOT_FOUND",
            "Este produto não está mais no estoque. Volte ao estoque e confira se ele foi excluído.",
        )
    return produto


# --------------------------------------------------------------------------
# Rotas
# --------------------------------------------------------------------------
@router.post("/products/{id_produto}/lots", status_code=201)
def criar(id_produto: int, dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    with transacao() as conn:
        _produto_ou_404(conn, sessao, id_produto)
        id_lote = gravar_lote(conn, sessao, id_produto, dados)
        return serializar_lote(
            lote_da_empresa(conn, sessao.id_empresa, id_lote), sessao.hoje, sessao.janela
        )


@router.delete("/products/{id_produto}/lots/{id_lote}", status_code=204)
def desfazer(id_produto: int, id_lote: int, sessao: Sessao = Depends(sessao_atual)):
    with transacao() as conn:
        lote = lote_da_empresa(conn, sessao.id_empresa, id_lote)
        if not lote or int(lote["id_produto"]) != id_produto:
            raise erro_nao_encontrado(
                "LOT_NOT_FOUND",
                "Este lote não está mais no estoque. Volte ao produto e confira os lotes.",
            )
        if not lote_tem_um_movimento(conn, id_lote):
            raise erro_conflito(
                "LOT_NOT_REMOVABLE",
                "Este lote já não pode ser desfeito. Corrija pelo produto, com uma saída de ajuste.",
            )
        desativar_lote(conn, id_lote)


@router.get("/lots")
def expirando(
    expiresFrom: str | None = None,
    expiresTo: str | None = None,
    sessao: Sessao = Depends(sessao_atual),
):
    de = so_dia(expiresFrom)
    ate = so_dia(expiresTo)
    if not de or not ate:
        raise erro_validacao("Informe o período (expiresFrom e expiresTo).")
    for dia, rotulo in ((de, "início"), (ate, "fim")):
        try:
            date.fromisoformat(dia)
        except ValueError:
            raise erro_validacao(f"A data de {rotulo} do período está em formato inválido.")

    with conexao() as conn:
        itens = lotes_expirando(conn, sessao.id_empresa, de, ate, sessao.hoje, sessao.janela)
    return {"data": itens}
