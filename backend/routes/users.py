"""
Usuários da conta: listar, criar, editar e bloquear.

Usuário não é apagado: `active: false` bloqueia o acesso e preserva o
histórico, que aponta para ele. O `login` é único no banco inteiro, não só
na conta (o front confere só a própria lista; quem decide é o servidor).

`PATCH /users/me` (o próprio nome) atende qualquer cargo e é declarado antes
de `PATCH /users/:id` de propósito: o FastAPI casa as rotas em ordem, e
`me` cairia no `{id}` se viesse depois.
"""

from fastapi import APIRouter, Depends

from ..db import conexao, consultar, consultar_um, executar, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import erro_conflito, erro_nao_encontrado, erro_permissao, erro_validacao
from ..security import gerar_hash_senha
from ..serialize import NIVEL_POR_CARGO, usuario as serializar_usuario

router = APIRouter(tags=["users"])

SENHA_MINIMA = 8

_SELECT_USUARIOS = """
    SELECT u.*, pa.nivel, pa.nome_perfil
      FROM usuarios u
      JOIN perfil_acesso pa ON pa.id_perfil = u.id_perfil
"""
_SELECT_USUARIO = _SELECT_USUARIOS + " WHERE u.id_usuario = %(id)s"


def _usuario(conn, id_usuario: int) -> dict:
    linha = consultar_um(conn, _SELECT_USUARIO, {"id": id_usuario})
    if not linha:
        raise erro_nao_encontrado("USER_NOT_FOUND", "Esta pessoa não foi encontrada.")
    return linha


def _usuario_da_conta(conn, id_usuario: int, id_empresa: int) -> dict:
    """Só devolve quem é da conta da sessão; fora dela, 404."""
    linha = consultar_um(
        conn,
        _SELECT_USUARIO + " AND u.id_empresa = %(empresa)s",
        {"id": id_usuario, "empresa": id_empresa},
    )
    if not linha:
        raise erro_nao_encontrado("USER_NOT_FOUND", "Esta pessoa não foi encontrada.")
    return linha


def _id_perfil_de(conn, nivel: int) -> int | None:
    linha = consultar_um(
        conn, "SELECT id_perfil FROM perfil_acesso WHERE nivel = %(nivel)s", {"nivel": nivel}
    )
    return int(linha["id_perfil"]) if linha else None


def _nivel_do_cargo(cargo) -> int:
    nivel = NIVEL_POR_CARGO.get(str(cargo or ""))
    if nivel is None:
        raise erro_validacao("Cargo inválido. Use balconista, farmacêutico ou administrador.")
    return nivel


@router.get("/users")
def listar(sessao: Sessao = Depends(sessao_atual)):
    with conexao() as conn:
        linhas = consultar(
            conn,
            _SELECT_USUARIOS + " WHERE u.id_empresa = %(empresa)s ORDER BY u.nome ASC",
            {"empresa": sessao.id_empresa},
        )
    return {"data": [serializar_usuario(linha) for linha in linhas]}


@router.post("/users", status_code=201)
def criar(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_admin("Só quem administra a conta adiciona pessoas.")

    nome = str(dados.get("name") or "").strip()
    login = str(dados.get("login") or "").strip()
    senha = str(dados.get("password") or "")
    if not nome or not login:
        raise erro_validacao("Informe o nome e o usuário da pessoa.")
    if len(senha) < SENHA_MINIMA:
        raise erro_validacao(f"A senha precisa de ao menos {SENHA_MINIMA} caracteres.")
    nivel = _nivel_do_cargo(dados.get("role"))

    with transacao() as conn:
        repetido = consultar_um(
            conn,
            "SELECT id_usuario FROM usuarios WHERE LOWER(login) = LOWER(%(login)s)",
            {"login": login},
        )
        if repetido:
            raise erro_conflito("LOGIN_TAKEN", f"O usuário {login} já existe. Escolha outro.")

        id_perfil = _id_perfil_de(conn, nivel)
        if id_perfil is None:
            raise erro_validacao("Cargo inválido.")

        criado = consultar_um(
            conn,
            """
            INSERT INTO usuarios (nome, login, senha_hash, ativo, id_perfil, id_empresa)
            VALUES (%(nome)s, %(login)s, %(hash)s, 1, %(perfil)s, %(empresa)s)
            RETURNING id_usuario
            """,
            {
                "nome": nome,
                "login": login,
                "hash": gerar_hash_senha(senha),
                "perfil": id_perfil,
                "empresa": sessao.id_empresa,
            },
        )
        return serializar_usuario(_usuario(conn, int(criado["id_usuario"])))


@router.patch("/users/me")
def editar_meu_nome(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    """O próprio nome, para qualquer cargo (v21)."""
    nome = str(dados.get("name") or "").strip()
    if not nome:
        raise erro_validacao("O nome não pode ficar em branco.")
    with transacao() as conn:
        executar(
            conn,
            """
            UPDATE usuarios SET nome = %(nome)s, updated_at = CURRENT_TIMESTAMP
             WHERE id_usuario = %(id)s
            """,
            {"nome": nome, "id": sessao.id},
        )
        return serializar_usuario(_usuario(conn, sessao.id))


@router.patch("/users/{id_usuario}")
def editar(id_usuario: int, dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_admin("Só quem administra a conta edita as pessoas.")

    with transacao() as conn:
        alvo = _usuario_da_conta(conn, id_usuario, sessao.id_empresa)

        colunas: dict = {}
        if "name" in dados:
            nome = str(dados.get("name") or "").strip()
            if not nome:
                raise erro_validacao("O nome não pode ficar em branco.")
            colunas["nome"] = nome

        if "active" in dados:
            ativo = bool(dados.get("active"))
            if id_usuario == sessao.id and not ativo:
                raise erro_permissao(
                    "Você não pode mudar o próprio cargo nem bloquear o próprio acesso. "
                    "Peça a outro administrador."
                )
            colunas["ativo"] = 1 if ativo else 0

        if "role" in dados:
            nivel = _nivel_do_cargo(dados.get("role"))
            if id_usuario == sessao.id and nivel != int(alvo["nivel"]):
                raise erro_permissao(
                    "Você não pode mudar o próprio cargo nem bloquear o próprio acesso. "
                    "Peça a outro administrador."
                )
            colunas["id_perfil"] = _id_perfil_de(conn, nivel)

        if dados.get("password"):
            senha = str(dados["password"])
            if len(senha) < SENHA_MINIMA:
                raise erro_validacao(f"A senha precisa de ao menos {SENHA_MINIMA} caracteres.")
            colunas["senha_hash"] = gerar_hash_senha(senha)

        if colunas:
            atribuicoes = ", ".join(f"{coluna} = %({coluna})s" for coluna in colunas)
            executar(
                conn,
                f"""
                UPDATE usuarios SET {atribuicoes}, updated_at = CURRENT_TIMESTAMP
                 WHERE id_usuario = %(id)s
                """,
                {**colunas, "id": id_usuario},
            )
        return serializar_usuario(_usuario(conn, id_usuario))
