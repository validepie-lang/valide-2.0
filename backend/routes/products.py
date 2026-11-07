"""
Produtos: listagem, ficha, cadastro, edição, move de pasta e excluir.

O `status` de validade e o `totalQuantity` são calculados no servidor, a partir
dos lotes com saldo — é a mesma regra da tela, mas quem decide é aqui. Por isso
os filtros `status` e `belowMin` são aplicados depois de montar o produto, e não
em SQL.

O cadastro guarda a trilha em `produto_alteracoes`: uma linha por campo mudado,
como pede o contrato v26. `PATCH /products/folder` grava a mesma trilha, campo
`folder`, com o nome da pasta antes e depois.

Editar cadastro e mover de pasta é de Farmacêutico ou Admin (item 18, decisão
do Marcus em 12/10). Excluir não apaga: vira `active: false` (decisão de 16/09).
"""

import re
import unicodedata

from fastapi import APIRouter, Depends

from ..db import conexao, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import erro_conflito, erro_nao_encontrado, erro_validacao
from ..repo import (
    atualizar_produto,
    carregar_produto,
    definir_pasta_de_produtos,
    desativar_produto,
    facetas,
    inserir_produto,
    mapa_pastas,
    montar_produtos,
    produto_por_ean,
    produto_por_sku,
    produtos_brutos,
    produtos_por_ids,
    registrar_alteracao,
)
from .lots import gravar_lote

router = APIRouter(tags=["products"])

PER_PAGE_MAXIMO = 100
MAX_MOVE = 500
NOME_MAXIMO = 150
SKU_MAXIMO = 60
MARCA_MAXIMA = 80
FORNECEDOR_MAXIMO = 80

UNIDADES = ("un", "kg", "cx")
STATUS = ("expired", "soon", "ok", "unknown")
FONTES = ("file", "integration", "manual")
ORDENACOES = ("expiry_asc", "expiry_desc", "name_asc", "quantity_asc", "value_desc")

# "só números, de 8 a 14 dígitos", como a tela avisa antes de enviar
_EAN = re.compile(r"^\d{8,14}$")

# Campo do contrato -> campo da trilha (contrato v26)
CAMPO_TRILHA = {
    "name": "name",
    "salePrice": "salePrice",
    "acquisitionCost": "acquisitionCost",
    "minStock": "minStock",
    "folderId": "folder",
    "barcode": "barcode",
    "brand": "brand",
    "supplier": "supplier",
}


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


def _texto_ou_nulo(valor) -> str | None:
    if valor is None:
        return None
    texto = str(valor).strip()
    return texto or None


def _nao_negativo(valor, rotulo: str) -> int:
    numero = _inteiro(valor)
    if numero is None or numero < 0:
        raise erro_validacao(f"{rotulo} precisa ser um número igual ou maior que zero.")
    return numero


def _sem_acento(texto: str) -> str:
    """Chave de ordenação alfabética: "Ácido" vem antes de "B12"."""
    base = unicodedata.normalize("NFD", texto or "")
    return "".join(c for c in base if unicodedata.category(c) != "Mn").casefold()


def _id_pasta(conn, id_empresa: int, valor) -> int | None:
    if valor is None:
        return None
    texto = str(valor).strip()
    if not texto:
        return None
    id_pasta = _inteiro(texto)
    if id_pasta is None or id_pasta not in mapa_pastas(conn, id_empresa):
        raise erro_nao_encontrado(
            "FOLDER_NOT_FOUND", "Esta pasta não existe mais. Recarregue a página."
        )
    return id_pasta


def _campos(conn, sessao: Sessao, dados: dict, *, exigir_nome: bool) -> dict:
    """
    Normaliza os campos do cadastro presentes no corpo.

    Só o que veio é devolvido: é o que permite o `PATCH` mudar um campo sem
    mexer nos outros, e o `POST` criar com os padrões do banco no que faltar.
    """
    saida: dict = {}

    if exigir_nome or "name" in dados:
        nome = _texto_ou_nulo(dados.get("name"))
        if not nome:
            raise erro_validacao("Escreva o nome do produto, como está na caixa.")
        if len(nome) > NOME_MAXIMO:
            raise erro_validacao(f"O nome do produto tem até {NOME_MAXIMO} caracteres.")
        saida["name"] = nome

    if "sku" in dados:
        sku = _texto_ou_nulo(dados.get("sku"))
        if sku and len(sku) > SKU_MAXIMO:
            raise erro_validacao(f"O código interno tem até {SKU_MAXIMO} caracteres.")
        saida["sku"] = sku

    if "barcode" in dados:
        barras = _texto_ou_nulo(dados.get("barcode"))
        if barras and not _EAN.match(barras):
            raise erro_validacao("O código de barras tem só números, de 8 a 14 dígitos.")
        saida["barcode"] = barras

    if "folderId" in dados:
        saida["folderId"] = _id_pasta(conn, sessao.id_empresa, dados.get("folderId"))

    if "brand" in dados:
        marca = _texto_ou_nulo(dados.get("brand"))
        if marca and len(marca) > MARCA_MAXIMA:
            raise erro_validacao(f"A marca tem até {MARCA_MAXIMA} caracteres.")
        saida["brand"] = marca

    if "supplier" in dados:
        fornecedor = _texto_ou_nulo(dados.get("supplier"))
        if fornecedor and len(fornecedor) > FORNECEDOR_MAXIMO:
            raise erro_validacao(f"O fornecedor tem até {FORNECEDOR_MAXIMO} caracteres.")
        saida["supplier"] = fornecedor

    if "unit" in dados:
        unidade = str(dados.get("unit") or "un").strip()
        if unidade not in UNIDADES:
            raise erro_validacao("A unidade é un, kg ou cx.")
        saida["unit"] = unidade

    if "minStock" in dados:
        saida["minStock"] = _nao_negativo(dados.get("minStock"), "O estoque mínimo")
    if "maxStock" in dados:
        maximo = dados.get("maxStock")
        saida["maxStock"] = (
            None if maximo is None or str(maximo).strip() == "" else _nao_negativo(maximo, "O estoque máximo")
        )
    if "acquisitionCost" in dados:
        saida["acquisitionCost"] = _nao_negativo(dados.get("acquisitionCost"), "O custo de aquisição")
    if "operationalCost" in dados:
        saida["operationalCost"] = _nao_negativo(dados.get("operationalCost"), "O custo operacional")
    if "salePrice" in dados:
        saida["salePrice"] = _nao_negativo(dados.get("salePrice"), "O preço de venda")

    return saida


def _conferir_unico(conn, sessao: Sessao, dados: dict, exceto: int | None = None) -> None:
    """Código de barras e código interno são únicos na conta (contrato v27)."""
    if dados.get("barcode"):
        dono = produto_por_ean(conn, sessao.id_empresa, dados["barcode"], exceto)
        if dono:
            raise erro_conflito(
                "BARCODE_TAKEN",
                f"O código de barras {dados['barcode']} já é do produto "
                f"{dono['nome_comercial']}. Confira o número ou abra aquele produto.",
            )
    if dados.get("sku"):
        dono = produto_por_sku(conn, sessao.id_empresa, dados["sku"], exceto)
        if dono:
            raise erro_conflito(
                "SKU_TAKEN",
                f"O código interno {dono['sku']} já é do produto "
                f"{dono['nome_comercial']}. Use outro ou deixe em branco.",
            )


def _produto_ou_404(conn, sessao: Sessao, id_produto: int) -> dict:
    produto = carregar_produto(conn, sessao.id_empresa, id_produto, sessao.hoje, sessao.janela)
    if not produto:
        raise erro_nao_encontrado(
            "PRODUCT_NOT_FOUND",
            "Este produto não está mais no estoque. Volte ao estoque e confira se ele foi excluído.",
        )
    return produto


# --------------------------------------------------------------------------
# Ordenação e paginação
# --------------------------------------------------------------------------
def _validade_num(iso: str | None) -> int:
    """2026-11-30 -> 20261130, para ordenar validade sem depender de data."""
    return int(iso[:10].replace("-", "")) if iso else 0


def _ordenar(lista: list[dict], ordem: str) -> list[dict]:
    if ordem == "name_asc":
        return sorted(lista, key=lambda p: _sem_acento(p["name"]))
    if ordem == "quantity_asc":
        return sorted(lista, key=lambda p: (p["totalQuantity"], _sem_acento(p["name"])))
    if ordem == "value_desc":
        return sorted(
            lista,
            key=lambda p: (-(p["totalQuantity"] * p["acquisitionCost"]), _sem_acento(p["name"])),
        )
    if ordem == "expiry_desc":
        # Sem validade no fim também aqui: a ordem é pela data, e ele não tem
        return sorted(
            lista,
            key=lambda p: (
                p["nearestExpiry"] is None,
                -_validade_num(p["nearestExpiry"]),
                _sem_acento(p["name"]),
            ),
        )
    return sorted(
        lista,
        key=lambda p: (
            p["nearestExpiry"] is None,
            _validade_num(p["nearestExpiry"]),
            _sem_acento(p["name"]),
        ),
    )


# --------------------------------------------------------------------------
# Rotas
# --------------------------------------------------------------------------
@router.get("/products")
def listar(
    page: int = 1,
    perPage: int = 20,
    search: str | None = None,
    folderId: str | None = None,
    status: str | None = None,
    source: str | None = None,
    supplier: str | None = None,
    brand: str | None = None,
    belowMin: bool = False,
    sort: str = "expiry_asc",
    active: str = "true",
    sessao: Sessao = Depends(sessao_atual),
):
    if perPage < 1 or perPage > PER_PAGE_MAXIMO:
        raise erro_validacao(f"A página aceita de 1 a {PER_PAGE_MAXIMO} linhas.")
    page = max(page, 1)

    if sort not in ORDENACOES:
        raise erro_validacao("A ordenação pedida não existe.")
    modo = (active or "true").strip().lower()
    if modo not in ("true", "false", "all"):
        raise erro_validacao("active aceita true, false ou all.")
    if source is not None and source not in FONTES:
        raise erro_validacao("A origem aceita file, integration ou manual.")

    desejados: set[str] = set()
    if status:
        desejados = {item.strip() for item in status.split(",") if item.strip()}
        invalidos = desejados - set(STATUS)
        if invalidos:
            raise erro_validacao("O estado de validade pedido não existe.")

    with conexao() as conn:
        brutos = produtos_brutos(
            conn,
            sessao.id_empresa,
            busca=search,
            folder_id=folderId,
            fonte=source,
            fornecedor=supplier,
            marca=brand,
            # "all" traz tudo; "false" traz tudo e o filtro de inativo é aqui
            ativos=modo == "true",
        )
        produtos = montar_produtos(conn, brutos, sessao.id_empresa, sessao.hoje, sessao.janela)

    if modo == "false":
        produtos = [p for p in produtos if not p["active"]]
    if desejados:
        produtos = [p for p in produtos if p["nearestExpiryStatus"] in desejados]
    if belowMin:
        produtos = [p for p in produtos if p["totalQuantity"] < p["minStock"]]

    ordenados = _ordenar(produtos, sort)
    inicio = (page - 1) * perPage
    return {
        "data": ordenados[inicio : inicio + perPage],
        "meta": {"page": page, "perPage": perPage, "total": len(ordenados)},
    }


@router.get("/products/facets")
def listar_facetas(sessao: Sessao = Depends(sessao_atual)):
    with conexao() as conn:
        fornecedores, marcas = facetas(conn, sessao.id_empresa)
    return {
        "suppliers": sorted(fornecedores, key=_sem_acento),
        "brands": sorted(marcas, key=_sem_acento),
    }


@router.post("/products", status_code=201)
def criar(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_escrita_de_produto()
    lotes = dados.get("lots") or []
    if not isinstance(lotes, list):
        raise erro_validacao("Os lotes iniciais precisam ser uma lista.")

    with transacao() as conn:
        campos = _campos(conn, sessao, dados, exigir_nome=True)

        minimo = campos.get("minStock", 0)
        maximo = campos.get("maxStock")
        if maximo is not None and maximo < minimo:
            raise erro_validacao("O estoque máximo precisa ser maior que o mínimo.")

        _conferir_unico(conn, sessao, campos)

        id_produto = inserir_produto(conn, sessao.id_empresa, campos)
        registrar_alteracao(
            conn,
            id_produto=id_produto,
            id_usuario=sessao.id,
            tipo="created",
            origem="manual",
        )
        for lote in lotes:
            if not isinstance(lote, dict):
                raise erro_validacao("Cada lote inicial precisa dos seus campos.")
            gravar_lote(conn, sessao, id_produto, lote)

        return _produto_ou_404(conn, sessao, id_produto)


@router.patch("/products/folder")
def mover_de_pasta(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_escrita_de_produto()

    pedidos = dados.get("productIds")
    if not isinstance(pedidos, list) or not pedidos:
        raise erro_validacao("Marque ao menos um produto para mover.", "NOTHING_SELECTED")
    if len(pedidos) > MAX_MOVE:
        raise erro_validacao(
            f"Dá para mover até {MAX_MOVE} produtos de cada vez. Filtre o estoque e mova por partes.",
            "TOO_MANY_PRODUCTS",
        )

    ids = []
    for valor in pedidos:
        id_produto = _inteiro(valor)
        if id_produto is None:
            raise erro_nao_encontrado(
                "PRODUCT_NOT_FOUND",
                "Algum produto marcado não existe mais. Recarregue a página e marque de novo.",
            )
        ids.append(id_produto)
    ids = list(dict.fromkeys(ids))

    with transacao() as conn:
        destino = _id_pasta(conn, sessao.id_empresa, dados.get("folderId"))
        pastas = mapa_pastas(conn, sessao.id_empresa)
        nome_destino = pastas.get(destino) if destino else None

        atuais = produtos_por_ids(conn, sessao.id_empresa, ids)
        if len(atuais) != len(ids):
            raise erro_nao_encontrado(
                "PRODUCT_NOT_FOUND",
                "Algum produto marcado não existe mais. Recarregue a página e marque de novo.",
            )

        definir_pasta_de_produtos(conn, sessao.id_empresa, ids, destino)

        for linha in atuais:
            de = pastas.get(int(linha["id_pasta"])) if linha.get("id_pasta") else None
            if linha.get("id_pasta") == destino or de == nome_destino:
                continue
            registrar_alteracao(
                conn,
                id_produto=int(linha["id_produto"]),
                id_usuario=sessao.id,
                tipo="updated",
                campo="folder",
                de=de,
                para=nome_destino,
            )

    return {"moved": len(ids), "folderName": nome_destino}


@router.get("/products/{id_produto}")
def ficha(id_produto: int, sessao: Sessao = Depends(sessao_atual)):
    with conexao() as conn:
        return _produto_ou_404(conn, sessao, id_produto)


@router.patch("/products/{id_produto}")
def editar(id_produto: int, dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_escrita_de_produto()
    with transacao() as conn:
        antes = _produto_ou_404(conn, sessao, id_produto)
        campos = _campos(conn, sessao, dados, exigir_nome=False)
        if not campos:
            raise erro_validacao("Nada para alterar neste produto.")

        minimo = campos.get("minStock", antes["minStock"])
        maximo = campos.get("maxStock", antes["maxStock"])
        if maximo is not None and maximo < minimo:
            raise erro_validacao("O estoque máximo precisa ser maior que o mínimo.")

        _conferir_unico(conn, sessao, campos, exceto=id_produto)
        atualizar_produto(conn, sessao.id_empresa, id_produto, campos)
        _registrar_trilha(conn, sessao, id_produto, antes, campos)
        return _produto_ou_404(conn, sessao, id_produto)


@router.delete("/products/{id_produto}", status_code=204)
def excluir(id_produto: int, sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_escrita_de_produto()
    with transacao() as conn:
        _produto_ou_404(conn, sessao, id_produto)
        desativar_produto(conn, sessao.id_empresa, id_produto)


def _registrar_trilha(conn, sessao: Sessao, id_produto: int, antes: dict, campos: dict) -> None:
    """Uma linha por campo mudado, só os campos que o contrato lista."""
    pastas = mapa_pastas(conn, sessao.id_empresa)
    for campo, para in campos.items():
        nome_trilha = CAMPO_TRILHA.get(campo)
        if not nome_trilha:
            continue

        if campo == "folderId":
            if (antes.get("folderId") or None) == (str(para) if para else None):
                continue
            de, para = antes.get("folderName"), pastas.get(para) if para else None
        else:
            de = antes.get(campo)
            if de == para:
                continue

        registrar_alteracao(
            conn,
            id_produto=id_produto,
            id_usuario=sessao.id,
            tipo="updated",
            campo=nome_trilha,
            de=de,
            para=para,
        )
