"""
Repositório: as consultas do backend e a montagem dos objetos do contrato.

Fica entre as rotas e o `database.py`. Aqui mora o SQL (sempre com
placeholders `%(nome)s`, que o `database.py` traduz para o motor do momento) e
a chamada à tradução PT->EN de `serialize.py`. As rotas não escrevem SQL.
"""

from datetime import date, datetime, timedelta, timezone

from database import (
    EstoqueInsuficienteError,
    LoteNaoEncontradoError,
    SQL_BOOL_FALSE,
    SQL_BOOL_TRUE,
)

from .config import fuso
from .serialize import (
    TIPO_MOVIMENTACAO_PARA_MOVEMENT,
    instante_iso,
    lote as serializar_lote,
    produto as serializar_produto,
    texto_ou_nulo,
)

# --------------------------------------------------------------------------
# Produto: linha crua + lotes com saldo
# --------------------------------------------------------------------------
_SELECT_PRODUTO = f"""
    SELECT p.*,
           (SELECT COALESCE(SUM(l.quantidade_atual), 0)
              FROM lotes_estoque l
             WHERE l.id_produto = p.id_produto
               AND l.ativo = {SQL_BOOL_TRUE}
               AND l.quantidade_atual > 0)                       AS total_qtd,
           (SELECT MIN(l.data_validade)
              FROM lotes_estoque l
             WHERE l.id_produto = p.id_produto
               AND l.ativo = {SQL_BOOL_TRUE}
               AND l.quantidade_atual > 0)                       AS prox_validade
      FROM produtos p
     WHERE p.id_empresa = %(empresa)s
"""


def produtos_brutos(
    conn,
    id_empresa: int,
    *,
    busca: str | None = None,
    folder_id: str | None = None,
    fonte: str | None = None,
    fornecedor: str | None = None,
    marca: str | None = None,
    ativos: bool = True,
) -> list[dict]:
    """Produtos da conta, com os filtros que o SQL resolve sem ambiguidade."""
    sql = _SELECT_PRODUTO
    params: dict = {"empresa": id_empresa}

    if ativos:
        sql += f" AND p.ativo = {SQL_BOOL_TRUE}"

    if busca:
        sql += (
            " AND (LOWER(p.nome_comercial) LIKE %(busca)s"
            "      OR LOWER(COALESCE(p.sku, '')) LIKE %(busca)s"
            "      OR COALESCE(p.ean, '') LIKE %(busca_b)s)"
        )
        params["busca"] = f"%{busca.lower()}%"
        params["busca_b"] = f"%{busca}%"

    if folder_id == "none":
        sql += " AND p.id_pasta IS NULL"
    elif folder_id:
        sql += " AND p.id_pasta = %(pasta)s"
        params["pasta"] = int(folder_id)

    if fonte:
        sql += " AND p.fonte = %(fonte)s"
        params["fonte"] = fonte
    if fornecedor:
        sql += " AND p.fornecedor = %(fornecedor)s"
        params["fornecedor"] = fornecedor
    if marca:
        sql += " AND p.marca = %(marca)s"
        params["marca"] = marca

    return conn_exec(conn, sql, params)


def conn_exec(conn, sql, params):
    """Atalho interno (evita import circular de `db` no topo do módulo)."""
    from .db import consultar

    return consultar(conn, sql, params)


def lotes_por_produto(conn, ids: list[int]) -> dict[int, list[dict]]:
    """Lotes com saldo (>0) dos produtos informados, agrupados por produto."""
    if not ids:
        return {}
    marcadores = ", ".join(f"%(p{i})s" for i in range(len(ids)))
    params = {f"p{i}": valor for i, valor in enumerate(ids)}
    linhas = conn_exec(
        conn,
        f"""
        SELECT * FROM lotes_estoque
         WHERE id_produto IN ({marcadores})
           AND ativo = {SQL_BOOL_TRUE}
           AND quantidade_atual > 0
         ORDER BY data_validade ASC, data_entrada ASC
        """,
        params,
    )
    agrupado: dict[int, list[dict]] = {}
    for linha in linhas:
        agrupado.setdefault(int(linha["id_produto"]), []).append(linha)
    return agrupado


def mapa_pastas(conn, id_empresa: int) -> dict[int, str]:
    """id_pasta -> nome, incluindo pastas desativadas (o produto continua nelas)."""
    linhas = conn_exec(
        conn, "SELECT id_pasta, nome FROM pastas WHERE id_empresa = %(e)s", {"e": id_empresa}
    )
    return {int(l["id_pasta"]): l["nome"] for l in linhas}


def facetas(conn, id_empresa: int) -> tuple[set[str], set[str]]:
    """Fornecedores e marcas distintos dos produtos ativos da conta."""
    linhas = conn_exec(
        conn,
        f"""
        SELECT DISTINCT fornecedor, marca
          FROM produtos
         WHERE id_empresa = %(empresa)s AND ativo = {SQL_BOOL_TRUE}
        """,
        {"empresa": id_empresa},
    )
    fornecedores = {l["fornecedor"] for l in linhas if l["fornecedor"]}
    marcas = {l["marca"] for l in linhas if l["marca"]}
    return fornecedores, marcas


def montar_produtos(conn, linhas: list[dict], id_empresa: int, hoje: date, janela: int) -> list[dict]:
    """Linhas cruas -> objetos `Product`, com lotes e status calculados."""
    ids = [int(l["id_produto"]) for l in linhas]
    lotes = lotes_por_produto(conn, ids)
    pastas = mapa_pastas(conn, id_empresa)
    saida = []
    for linha in linhas:
        linha = dict(linha)
        linha["_hoje"] = hoje
        linha["_janela"] = janela
        saida.append(serializar_produto(linha, lotes.get(int(linha["id_produto"]), []), pastas))
    return saida


def carregar_produto(conn, id_empresa: int, id_produto: int, hoje: date, janela: int) -> dict | None:
    linha = conn_exec(conn, _SELECT_PRODUTO + " AND p.id_produto = %(id)s", {"empresa": id_empresa, "id": id_produto})
    if not linha:
        return None
    return montar_produtos(conn, [linha[0]], id_empresa, hoje, janela)[0]


def lotes_serializados(conn, id_empresa: int, id_produto: int, hoje: date, janela: int) -> list[dict]:
    """Lotes de um produto já no formato do contrato."""
    linhas = lotes_por_produto(conn, [id_produto]).get(id_produto, [])
    return [serializar_lote(linha, hoje, janela) for linha in linhas]


# --------------------------------------------------------------------------
# Movimentação
# --------------------------------------------------------------------------
_SELECT_MOVIMENTO = """
    SELECT hm.id_movimentacao, hm.id_usuario, hm.tipo_movimentacao, hm.quantidade,
           hm.data_registro, hm.justificativa, hm.motivo,
           hm.id_movimentacao_origem,
           l.id_lote, l.id_produto, l.numero_lote,
           p.nome_comercial, p.unidade,
           u.nome AS nome_usuario,
           o.tipo_movimentacao AS origem_tipo,
           o.quantidade        AS origem_qtd,
           o.data_registro     AS origem_data,
           (SELECT MAX(x.data_registro) FROM historico_movimentacao x
             WHERE x.id_movimentacao_origem = hm.id_movimentacao) AS corrigida_em
      FROM historico_movimentacao hm
      JOIN lotes_estoque l ON l.id_lote = hm.id_lote
      JOIN produtos      p ON p.id_produto = l.id_produto
      JOIN usuarios      u ON u.id_usuario = hm.id_usuario
      LEFT JOIN historico_movimentacao o ON o.id_movimentacao = hm.id_movimentacao_origem
     WHERE p.id_empresa = %(empresa)s
"""

# tipo do contrato -> tipos do banco
_TIPOS_POR_MOVIMENT = {
    "in": ("ENTRADA",),
    "out": ("VENDA", "DESCARTE"),
    "adjust": ("AJUSTE",),
}


def _filtros_movimento(
    *, produto_id=None, tipo=None, motivo=None, usuario_id=None, de=None, ate=None
) -> tuple[str, dict]:
    sql = ""
    params: dict = {}
    if produto_id:
        sql += " AND l.id_produto = %(produto)s"
        params["produto"] = int(produto_id)
    if usuario_id:
        sql += " AND hm.id_usuario = %(usuario)s"
        params["usuario"] = int(usuario_id)
    if de:
        sql += " AND hm.data_registro >= %(de)s"
        params["de"] = de
    if ate:
        sql += " AND hm.data_registro < %(ate)s"
        params["ate"] = ate
    if tipo in _TIPOS_POR_MOVIMENT:
        nomes = _TIPOS_POR_MOVIMENT[tipo]
        marcadores = ", ".join(f"%(t{i})s" for i in range(len(nomes)))
        sql += f" AND hm.tipo_movimentacao IN ({marcadores})"
        for i, nome in enumerate(nomes):
            params[f"t{i}"] = nome
    if motivo:
        sql += " AND hm.motivo = %(motivo)s"
        params["motivo"] = motivo
    return sql, params


def movimentos(
    conn,
    id_empresa: int,
    *,
    produto_id=None,
    tipo=None,
    motivo=None,
    usuario_id=None,
    de=None,
    ate=None,
    page: int = 1,
    per_page: int = 20,
):
    """Página de movimentações + total + contagem por tipo (v28)."""
    base, params_base = _filtros_movimento(
        produto_id=produto_id, usuario_id=usuario_id, de=de, ate=ate
    )

    # Contagem por tipo: respeita produto/pessoa/período, ignora tipo e motivo.
    contagens = {"in": 0, "out": 0, "adjust": 0}
    for linha in conn_exec(
        conn,
        f"""
        SELECT hm.tipo_movimentacao AS tipo, COUNT(*) AS n
          FROM historico_movimentacao hm
          JOIN lotes_estoque l ON l.id_lote = hm.id_lote
          JOIN produtos      p ON p.id_produto = l.id_produto
         WHERE p.id_empresa = %(empresa)s{base}
         GROUP BY hm.tipo_movimentacao
        """,
        {"empresa": id_empresa, **params_base},
    ):
        chave = TIPO_MOVIMENTACAO_PARA_MOVEMENT.get(linha["tipo"])
        if chave:
            contagens[chave] += int(linha["n"])

    filtro, params_filtro = _filtros_movimento(
        produto_id=produto_id, tipo=tipo, motivo=motivo, usuario_id=usuario_id, de=de, ate=ate
    )
    total = int(
        conn_exec(
            conn,
            f"""
            SELECT COUNT(*) AS n
              FROM historico_movimentacao hm
              JOIN lotes_estoque l ON l.id_lote = hm.id_lote
              JOIN produtos      p ON p.id_produto = l.id_produto
             WHERE p.id_empresa = %(empresa)s{filtro}
            """,
            {"empresa": id_empresa, **params_filtro},
        )[0]["n"]
    )

    linhas = conn_exec(
        conn,
        _SELECT_MOVIMENTO
        + filtro
        + " ORDER BY hm.data_registro DESC, hm.id_movimentacao DESC LIMIT %(limite)s OFFSET %(offset)s",
        {"empresa": id_empresa, **params_filtro, "limite": per_page, "offset": (page - 1) * per_page},
    )
    return [serializar_movimento(l) for l in linhas], total, contagens


def carregar_movimento(conn, id_empresa: int, id_movimentacao: int) -> dict | None:
    linhas = conn_exec(
        conn, _SELECT_MOVIMENTO + " AND hm.id_movimentacao = %(id)s", {"empresa": id_empresa, "id": id_movimentacao}
    )
    return serializar_movimento(linhas[0]) if linhas else None


def movimento_bruto(conn, id_empresa: int, id_movimentacao: int) -> dict | None:
    linhas = conn_exec(
        conn, _SELECT_MOVIMENTO + " AND hm.id_movimentacao = %(id)s", {"empresa": id_empresa, "id": id_movimentacao}
    )
    return linhas[0] if linhas else None


def recentes(conn, id_empresa: int, limite: int = 6) -> list[dict]:
    linhas = conn_exec(
        conn,
        _SELECT_MOVIMENTO + " ORDER BY hm.data_registro DESC, hm.id_movimentacao DESC LIMIT %(limite)s",
        {"empresa": id_empresa, "limite": limite},
    )
    return [serializar_movimento(l) for l in linhas]


def serializar_movimento(linha: dict) -> dict:
    tipo = TIPO_MOVIMENTACAO_PARA_MOVEMENT.get(linha["tipo_movimentacao"], "out")
    movimento = {
        "id": str(linha["id_movimentacao"]),
        "productId": str(linha["id_produto"]),
        "productName": linha["nome_comercial"],
        "lotId": str(linha["id_lote"]),
        "lotCode": linha["numero_lote"],
        "type": tipo,
        "reason": linha["motivo"] if tipo == "out" else None,
        "quantity": int(linha["quantidade"]),
        "unit": linha["unidade"] or "un",
        "userId": str(linha["id_usuario"]),
        "userName": linha["nome_usuario"],
        "createdAt": instante_iso(linha["data_registro"]),
        "note": texto_ou_nulo(linha.get("justificativa")),
    }
    if linha.get("id_movimentacao_origem"):
        movimento["corrects"] = {
            "id": str(linha["id_movimentacao_origem"]),
            "type": TIPO_MOVIMENTACAO_PARA_MOVEMENT.get(linha.get("origem_tipo"), "out"),
            "quantity": int(linha.get("origem_qtd") or 0),
            "createdAt": instante_iso(linha.get("origem_data")),
        }
    if linha.get("corrigida_em"):
        movimento["correctedAt"] = instante_iso(linha["corrigida_em"])
    return movimento


# --------------------------------------------------------------------------
# Lotes do calendário (GET /lots)
# --------------------------------------------------------------------------
def lotes_expirando(conn, id_empresa: int, de: str, ate: str, hoje: date, janela: int) -> list[dict]:
    linhas = conn_exec(
        conn,
        f"""
        SELECT l.*, p.nome_comercial, p.unidade
          FROM lotes_estoque l
          JOIN produtos p ON p.id_produto = l.id_produto
         WHERE p.id_empresa = %(empresa)s
           AND p.ativo = {SQL_BOOL_TRUE}
           AND l.ativo = {SQL_BOOL_TRUE}
           AND l.quantidade_atual > 0
           AND l.data_validade >= %(de)s
           AND l.data_validade <= %(ate)s
         ORDER BY l.data_validade ASC
        """,
        {"empresa": id_empresa, "de": de, "ate": ate},
    )
    itens = []
    for linha in linhas:
        item = serializar_lote(linha, hoje, janela)
        itens.append(
            {
                "lotId": item["id"],
                "productId": item["productId"],
                "productName": linha["nome_comercial"],
                "lotCode": item["code"],
                "expiresAt": item["expiresAt"],
                "status": item["status"],
                "quantity": item["quantity"],
                "unit": linha["unidade"] or "un",
            }
        )
    return itens


# --------------------------------------------------------------------------
# Escrita: lote, movimentação e produto
# --------------------------------------------------------------------------
def _um(conn, sql: str, params: dict) -> dict | None:
    linhas = conn_exec(conn, sql, params)
    return linhas[0] if linhas else None


def lote_da_empresa(conn, id_empresa: int, id_lote: int) -> dict | None:
    """Lote com o produto, só quando os dois são da conta da sessão."""
    return _um(
        conn,
        """
        SELECT l.*, p.nome_comercial, p.unidade, p.custo_aquisicao, p.id_empresa
          FROM lotes_estoque l
          JOIN produtos p ON p.id_produto = l.id_produto
         WHERE l.id_lote = %(lote)s AND p.id_empresa = %(empresa)s
        """,
        {"lote": id_lote, "empresa": id_empresa},
    )


def lote_por_codigo(conn, id_produto: int, codigo: str) -> dict | None:
    """Lote do produto com este código, sem diferenciar maiúscula."""
    return _um(
        conn,
        """
        SELECT * FROM lotes_estoque
         WHERE id_produto = %(produto)s AND LOWER(numero_lote) = LOWER(%(codigo)s)
        """,
        {"produto": id_produto, "codigo": codigo},
    )


def inserir_lote(
    conn,
    *,
    id_produto: int,
    numero_lote: str,
    data_validade: str,
    quantidade: int,
    id_usuario: int,
    fabricacao: str | None = None,
) -> int:
    """Cria o lote com o saldo inicial. Devolve o id."""
    linha = _um(
        conn,
        f"""
        INSERT INTO lotes_estoque
            (id_produto, numero_lote, data_validade, quantidade_atual,
             quantidade_inicial, id_usuario_entrada, ativo, data_fabricacao)
        VALUES (%(produto)s, %(codigo)s, %(validade)s, %(qtd)s,
                %(qtd)s, %(usuario)s, {SQL_BOOL_TRUE}, %(fabricacao)s)
        RETURNING id_lote
        """,
        {
            "produto": id_produto,
            "codigo": numero_lote,
            "validade": data_validade,
            "qtd": quantidade,
            "usuario": id_usuario,
            "fabricacao": fabricacao,
        },
    )
    if not linha:
        raise LoteNaoEncontradoError("Não foi possível criar o lote.")
    return int(linha["id_lote"])


def inserir_movimento(
    conn,
    *,
    id_lote: int,
    id_usuario: int,
    tipo: str,
    quantidade: int,
    justificativa: str | None = None,
    motivo: str | None = None,
    id_origem: int | None = None,
    fornecedor: str | None = None,
    nota_fiscal: str | None = None,
) -> int:
    """Grava uma linha no histórico (livro imutável) e devolve o id."""
    linha = _um(
        conn,
        """
        INSERT INTO historico_movimentacao
            (id_lote, id_usuario, tipo_movimentacao, quantidade, justificativa,
             motivo, id_movimentacao_origem, fornecedor, nota_fiscal)
        VALUES (%(lote)s, %(usuario)s, %(tipo)s, %(qtd)s, %(justificativa)s,
                %(motivo)s, %(origem)s, %(fornecedor)s, %(nf)s)
        RETURNING id_movimentacao
        """,
        {
            "lote": id_lote,
            "usuario": id_usuario,
            "tipo": tipo,
            "qtd": quantidade,
            "justificativa": justificativa,
            "motivo": motivo,
            "origem": id_origem,
            "fornecedor": fornecedor,
            "nf": nota_fiscal,
        },
    )
    if not linha:
        raise LoteNaoEncontradoError("Não foi possível registrar a movimentação.")
    return int(linha["id_movimentacao"])


def aplicar_delta_lote(conn, id_lote: int, delta: int) -> int:
    """
    Soma `delta` ao saldo do lote (aceita negativo: é o ajuste que tira).
    Recusa quando o saldo ficaria abaixo de zero. Devolve o novo saldo.
    """
    linha = _um(
        conn,
        """
        UPDATE lotes_estoque
           SET quantidade_atual = quantidade_atual + %(delta)s,
               updated_at = CURRENT_TIMESTAMP
         WHERE id_lote = %(lote)s
           AND quantidade_atual + %(delta)s >= 0
        RETURNING quantidade_atual
        """,
        {"delta": delta, "lote": id_lote},
    )
    if not linha:
        raise EstoqueInsuficienteError("A quantidade pedida é maior que o saldo do lote.")
    return int(linha["quantidade_atual"])


def desativar_lote(conn, id_lote: int) -> None:
    """
    Tira o lote do estoque sem apagar a linha.

    O banco proíbe hard-delete em `lotes_estoque` e em `historico_movimentacao`
    (triggers do 001), então "desfazer o lote" é zerar o saldo e desativar: o
    lote some de toda listagem, e a ENTRADA continua no histórico para auditoria.
    """
    conn_exec(
        conn,
        f"""
        UPDATE lotes_estoque
           SET quantidade_atual = 0, ativo = {SQL_BOOL_FALSE},
               updated_at = CURRENT_TIMESTAMP
         WHERE id_lote = %(lote)s
        """,
        {"lote": id_lote},
    )


def lote_tem_um_movimento(conn, id_lote: int) -> bool:
    """True quando o lote só tem a própria ENTRADA no histórico."""
    linhas = conn_exec(
        conn,
        "SELECT tipo_movimentacao FROM historico_movimentacao WHERE id_lote = %(lote)s",
        {"lote": id_lote},
    )
    return len(linhas) == 1 and linhas[0]["tipo_movimentacao"] == "ENTRADA"


# Campo do contrato -> coluna do banco (produto)
CAMPO_PRODUTO = {
    "name": "nome_comercial",
    "sku": "sku",
    "barcode": "ean",
    "brand": "marca",
    "supplier": "fornecedor",
    "unit": "unidade",
    "minStock": "estoque_minimo",
    "maxStock": "estoque_maximo",
    "acquisitionCost": "custo_aquisicao",
    "operationalCost": "custo_operacional",
    "salePrice": "preco_venda",
    "folderId": "id_pasta",
}


def produto_por_ean(conn, id_empresa: int, ean: str, exceto: int | None = None) -> dict | None:
    sql = "SELECT * FROM produtos WHERE id_empresa = %(empresa)s AND ean = %(ean)s"
    params = {"empresa": id_empresa, "ean": ean}
    if exceto:
        sql += " AND id_produto <> %(exceto)s"
        params["exceto"] = exceto
    return _um(conn, sql, params)


def produto_por_sku(conn, id_empresa: int, sku: str, exceto: int | None = None) -> dict | None:
    sql = (
        "SELECT * FROM produtos WHERE id_empresa = %(empresa)s"
        " AND LOWER(sku) = LOWER(%(sku)s)"
    )
    params = {"empresa": id_empresa, "sku": sku}
    if exceto:
        sql += " AND id_produto <> %(exceto)s"
        params["exceto"] = exceto
    return _um(conn, sql, params)


def inserir_produto(conn, id_empresa: int, dados: dict) -> int:
    """Cria o produto. `dados` já vem com as chaves do contrato."""
    colunas = {"id_empresa": id_empresa}
    for campo, coluna in CAMPO_PRODUTO.items():
        if campo in dados:
            colunas[coluna] = dados[campo]
    colunas.setdefault("nome_comercial", "")
    colunas.setdefault("principio_ativo", colunas["nome_comercial"])
    colunas.setdefault("categoria", "")
    colunas["unidade"] = colunas.get("unidade") or "un"
    colunas["ativo"] = SQL_BOOL_TRUE

    nomes = ", ".join(colunas)
    valores = ", ".join(f"%({nome})s" for nome in colunas)
    linha = _um(
        conn,
        f"INSERT INTO produtos ({nomes}) VALUES ({valores}) RETURNING id_produto",
        colunas,
    )
    if not linha:
        raise LoteNaoEncontradoError("Não foi possível criar o produto.")
    return int(linha["id_produto"])


def atualizar_produto(conn, id_empresa: int, id_produto: int, dados: dict) -> None:
    """Atualiza só os campos do contrato presentes em `dados`."""
    colunas = {
        CAMPO_PRODUTO[campo]: valor for campo, valor in dados.items() if campo in CAMPO_PRODUTO
    }
    if not colunas:
        return
    atribuicoes = ", ".join(f"{coluna} = %({coluna})s" for coluna in colunas)
    conn_exec(
        conn,
        f"""
        UPDATE produtos SET {atribuicoes}, updated_at = CURRENT_TIMESTAMP
         WHERE id_produto = %(id)s AND id_empresa = %(empresa)s
        """,
        {**colunas, "id": id_produto, "empresa": id_empresa},
    )


def definir_pasta_de_produtos(conn, id_empresa: int, ids: list[int], id_pasta: int | None) -> None:
    """Move os produtos informados para a pasta (ou para nenhuma)."""
    if not ids:
        return
    marcadores = ", ".join(f"%(p{i})s" for i in range(len(ids)))
    params = {f"p{i}": valor for i, valor in enumerate(ids)}
    params.update({"pasta": id_pasta, "empresa": id_empresa})
    conn_exec(
        conn,
        f"""
        UPDATE produtos SET id_pasta = %(pasta)s, updated_at = CURRENT_TIMESTAMP
         WHERE id_produto IN ({marcadores}) AND id_empresa = %(empresa)s
        """,
        params,
    )


def desativar_produto(conn, id_empresa: int, id_produto: int) -> None:
    """
    Soft delete: o produto sai das listagens, mas lotes e histórico ficam.

    A decisão de 16/09 é que produto que não interessa mais vira inativo, não
    é apagado — apagar destruiria lote e validade que o cliente preencheu à mão.
    """
    conn_exec(
        conn,
        f"""
        UPDATE produtos SET ativo = {SQL_BOOL_FALSE}, updated_at = CURRENT_TIMESTAMP
         WHERE id_produto = %(id)s AND id_empresa = %(empresa)s
        """,
        {"id": id_produto, "empresa": id_empresa},
    )


def produtos_por_ids(conn, id_empresa: int, ids: list[int]) -> list[dict]:
    """id, nome, pasta e foto dos produtos da conta que estão na lista."""
    if not ids:
        return []
    marcadores = ", ".join(f"%(p{i})s" for i in range(len(ids)))
    params = {f"p{i}": valor for i, valor in enumerate(ids)}
    params["empresa"] = id_empresa
    return conn_exec(
        conn,
        f"""
        SELECT id_produto, nome_comercial, id_pasta, foto_url
          FROM produtos
         WHERE id_empresa = %(empresa)s AND id_produto IN ({marcadores})
        """,
        params,
    )


def registrar_alteracao(
    conn,
    *,
    id_produto: int,
    id_usuario: int | None,
    tipo: str,
    campo: str | None = None,
    de=None,
    para=None,
    origem: str = "manual",
) -> None:
    """Uma linha da trilha do cadastro (created/updated), um campo por linha."""
    conn_exec(
        conn,
        """
        INSERT INTO produto_alteracoes
            (id_produto, id_usuario, tipo, campo, valor_de, valor_para, origem)
        VALUES (%(produto)s, %(usuario)s, %(tipo)s, %(campo)s, %(de)s, %(para)s, %(origem)s)
        """,
        {
            "produto": id_produto,
            "usuario": id_usuario,
            "tipo": tipo,
            "campo": campo,
            "de": None if de is None else str(de),
            "para": None if para is None else str(para),
            "origem": origem,
        },
    )


# --------------------------------------------------------------------------
# Detalhe do produto: notas, alterações e foto
# --------------------------------------------------------------------------
def notas_do_produto(conn, id_produto: int) -> list[dict]:
    """Notas do produto, da mais recente para a mais antiga."""
    return conn_exec(
        conn,
        """
        SELECT n.id_nota, n.texto, n.created_at, u.nome AS nome_usuario
          FROM produto_notas n
          JOIN usuarios u ON u.id_usuario = n.id_usuario
         WHERE n.id_produto = %(produto)s
         ORDER BY n.created_at DESC, n.id_nota DESC
        """,
        {"produto": id_produto},
    )


def inserir_nota(conn, id_produto: int, id_usuario: int, texto: str) -> dict:
    """Grava a nota e devolve a linha já com o nome de quem escreveu."""
    linha = _um(
        conn,
        """
        INSERT INTO produto_notas (id_produto, id_usuario, texto)
        VALUES (%(produto)s, %(usuario)s, %(texto)s)
        RETURNING id_nota, texto, created_at
        """,
        {"produto": id_produto, "usuario": id_usuario, "texto": texto},
    )
    if not linha:
        raise LoteNaoEncontradoError("Não foi possível salvar a nota.")
    nome = _um(
        conn, "SELECT nome FROM usuarios WHERE id_usuario = %(id)s", {"id": id_usuario}
    )
    linha["nome_usuario"] = nome["nome"] if nome else ""
    return linha


def alteracoes_do_produto(conn, id_produto: int) -> list[dict]:
    """Trilha do cadastro, da mais recente para a mais antiga (notas e pessoas)."""
    return conn_exec(
        conn,
        """
        SELECT a.id_alteracao, a.tipo, a.campo, a.valor_de, a.valor_para,
               a.origem, a.created_at, u.nome AS nome_usuario
          FROM produto_alteracoes a
          LEFT JOIN usuarios u ON u.id_usuario = a.id_usuario
         WHERE a.id_produto = %(produto)s
         ORDER BY a.created_at DESC, a.id_alteracao DESC
        """,
        {"produto": id_produto},
    )


def definir_foto_produto(conn, id_empresa: int, id_produto: int, foto_url: str | None) -> None:
    conn_exec(
        conn,
        """
        UPDATE produtos SET foto_url = %(foto)s, updated_at = CURRENT_TIMESTAMP
         WHERE id_produto = %(id)s AND id_empresa = %(empresa)s
        """,
        {"foto": foto_url, "id": id_produto, "empresa": id_empresa},
    )


# --------------------------------------------------------------------------
# Instantes do período (dias no fuso da conta -> UTC)
# --------------------------------------------------------------------------
def instantes_do_periodo(fuso_nome: str | None, de: str | None, ate: str | None):
    """Devolve (inicio_utc, fim_utc) para comparar com `data_registro`."""
    tz = fuso(fuso_nome)
    inicio = fim = None
    if de:
        d = date.fromisoformat(de)
        inicio = datetime(d.year, d.month, d.day, tzinfo=tz).astimezone(timezone.utc)
        inicio = inicio.strftime("%Y-%m-%d %H:%M:%S")
    if ate:
        d = date.fromisoformat(ate) + timedelta(days=1)
        fim = datetime(d.year, d.month, d.day, tzinfo=tz).astimezone(timezone.utc)
        fim = fim.strftime("%Y-%m-%d %H:%M:%S")
    return inicio, fim
