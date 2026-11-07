"""
Pastas de produto: criar, renomear, ativar/desativar e excluir.

Toda escrita é de Administrador (o contrato manda `403 FORBIDDEN` para os
outros cargos). `GET /folders` devolve todas, com `active`, inclusive as
desativadas — o front é quem tira a desativada das escolhas.

Excluir pasta com produto só com destino: `?moveTo=<id>` leva os produtos
para outra pasta, `?moveTo=none` os deixa sem pasta, e sem `moveTo` a
resposta é `409 FOLDER_NOT_EMPTY`.
"""

from database import SQL_BOOL_FALSE, SQL_BOOL_TRUE
from fastapi import APIRouter, Depends

from ..db import conexao, consultar, consultar_um, executar, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import erro_conflito, erro_nao_encontrado, erro_validacao
from ..repo import definir_pasta_de_produtos
from ..serialize import pasta as serializar_pasta

router = APIRouter(tags=["folders"])

NOME_MAXIMO = 60
SQL = f"""
    SELECT p.*,
           (SELECT COUNT(*) FROM produtos pr
             WHERE pr.id_pasta = p.id_pasta AND pr.ativo = {SQL_BOOL_TRUE}) AS total_produtos
      FROM pastas p
     WHERE p.id_empresa = %(empresa)s
"""


def _pasta(conn, id_empresa: int, id_pasta: int) -> dict:
    linha = consultar_um(
        conn, SQL + " AND p.id_pasta = %(id)s", {"empresa": id_empresa, "id": id_pasta}
    )
    if not linha:
        raise erro_nao_encontrado("FOLDER_NOT_FOUND", "Esta pasta não existe mais. Recarregue a página.")
    return linha


def _nome_valido(nome, id_empresa: int, conn, ignorar: int | None = None) -> str:
    texto = str(nome or "").strip()
    if not texto or len(texto) > NOME_MAXIMO:
        raise erro_validacao(
            f"O nome da pasta é obrigatório e tem até {NOME_MAXIMO} letras."
        )
    sql = (
        "SELECT nome FROM pastas WHERE id_empresa = %(empresa)s"
        " AND LOWER(nome) = LOWER(%(nome)s)"
    )
    params = {"empresa": id_empresa, "nome": texto}
    if ignorar:
        sql += " AND id_pasta <> %(ignorar)s"
        params["ignorar"] = ignorar
    repetida = consultar_um(conn, sql, params)
    if repetida:
        raise erro_conflito("FOLDER_NAME_TAKEN", f"Já existe a pasta {repetida['nome']}. Escolha outro nome.")
    return texto


@router.get("/folders")
def listar(sessao: Sessao = Depends(sessao_atual)):
    with conexao() as conn:
        linhas = consultar(conn, SQL + " ORDER BY p.nome ASC", {"empresa": sessao.id_empresa})
    return {"data": [serializar_pasta(linha) for linha in linhas]}


@router.post("/folders", status_code=201)
def criar(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_admin("Só quem administra a conta cria pastas.")
    with transacao() as conn:
        nome = _nome_valido(dados.get("name"), sessao.id_empresa, conn)
        criada = consultar_um(
            conn,
            f"""
            INSERT INTO pastas (id_empresa, nome, ativo)
            VALUES (%(empresa)s, %(nome)s, {SQL_BOOL_TRUE})
            RETURNING id_pasta
            """,
            {"empresa": sessao.id_empresa, "nome": nome},
        )
        return serializar_pasta(_pasta(conn, sessao.id_empresa, int(criada["id_pasta"])))


@router.patch("/folders/{id_pasta}")
def editar(id_pasta: int, dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_admin("Só quem administra a conta edita pastas.")
    with transacao() as conn:
        _pasta(conn, sessao.id_empresa, id_pasta)

        colunas: dict = {}
        if "name" in dados:
            colunas["nome"] = _nome_valido(
                dados.get("name"), sessao.id_empresa, conn, ignorar=id_pasta
            )
        if "active" in dados:
            colunas["ativo"] = SQL_BOOL_TRUE if dados.get("active") else SQL_BOOL_FALSE
        if not colunas:
            raise erro_validacao("Nada para alterar nesta pasta.")

        atribuicoes = ", ".join(f"{coluna} = %({coluna})s" for coluna in colunas)
        executar(
            conn,
            f"""
            UPDATE pastas SET {atribuicoes}, updated_at = CURRENT_TIMESTAMP
             WHERE id_pasta = %(id)s
            """,
            {**colunas, "id": id_pasta},
        )
        return serializar_pasta(_pasta(conn, sessao.id_empresa, id_pasta))


@router.delete("/folders/{id_pasta}", status_code=204)
def excluir(
    id_pasta: int,
    moveTo: str | None = None,
    sessao: Sessao = Depends(sessao_atual),
):
    sessao.exige_admin("Só quem administra a conta exclui pastas.")
    with transacao() as conn:
        pasta = _pasta(conn, sessao.id_empresa, id_pasta)
        tem_produtos = int(pasta.get("total_produtos") or 0) > 0

        if tem_produtos and moveTo is None:
            raise erro_conflito(
                "FOLDER_NOT_EMPTY",
                f"A pasta {pasta['nome']} tem produtos. Escolha para onde eles vão e exclua de novo.",
            )

        destino: int | None = None
        if moveTo is not None and moveTo != "none":
            try:
                destino = int(moveTo)
            except (TypeError, ValueError):
                destino = None
            if destino is None or destino == id_pasta:
                raise erro_validacao(
                    "A pasta de destino não existe mais. Escolha outra.", "FOLDER_TARGET_INVALID"
                )
            _pasta(conn, sessao.id_empresa, destino)

        if tem_produtos:
            definir_pasta_de_produtos(
                conn,
                sessao.id_empresa,
                _ids_da_pasta(conn, id_pasta),
                destino,
            )

        executar(conn, "DELETE FROM pastas WHERE id_pasta = %(id)s", {"id": id_pasta})


def _ids_da_pasta(conn, id_pasta: int) -> list[int]:
    linhas = consultar(
        conn, "SELECT id_produto FROM produtos WHERE id_pasta = %(id)s", {"id": id_pasta}
    )
    return [int(linha["id_produto"]) for linha in linhas]
