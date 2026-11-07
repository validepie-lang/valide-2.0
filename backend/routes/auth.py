"""
Autenticação: entrar, sair, quem sou eu e trocar a própria senha.

A sessão vive em cookie httpOnly (`valide_session`), nunca no corpo da
resposta (decisão de 16/09). É este arquivo que grava e apaga o cookie.

Usuário inexistente, senha errada e usuário bloqueado respondem a MESMA
mensagem, de propósito: mensagem diferente permite descobrir quais logins
existem (contrato, seção de autenticação).
"""

from fastapi import APIRouter, Depends, Response

from ..config import SESSION_COOKIE, SESSION_COOKIE_SECURE, SESSION_TTL_HOURS
from ..db import conexao, consultar_um, executar, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import ApiError, erro_validacao
from ..security import criar_token, gerar_hash_senha, senha_confere
from ..serialize import empresa as serializar_empresa
from ..serialize import usuario as serializar_usuario

router = APIRouter(tags=["auth"])

SENHA_MINIMA = 8


def _atributos_do_cookie() -> dict:
    return {
        "httponly": True,
        "samesite": "lax",
        "secure": SESSION_COOKIE_SECURE,
        "path": "/",
        "max_age": SESSION_TTL_HOURS * 3600,
    }


@router.post("/auth/login")
def entrar(response: Response, dados: dict = Depends(corpo)):
    """Valida o par usuário/senha e devolve a sessão com o cookie."""
    login = str(dados.get("login") or "").strip()
    senha = str(dados.get("password") or dados.get("senha") or "")
    if not login or not senha:
        raise erro_validacao("Informe usuário e senha.")

    with conexao() as conn:
        usuario = consultar_um(
            conn,
            """
            SELECT u.*, pa.nivel, pa.nome_perfil
              FROM usuarios u
              JOIN perfil_acesso pa ON pa.id_perfil = u.id_perfil
             WHERE LOWER(u.login) = LOWER(%(login)s)
            """,
            {"login": login},
        )
        if (
            not usuario
            or not int(usuario.get("ativo") or 0)
            or not senha_confere(senha, usuario.get("senha_hash"))
        ):
            raise ApiError(
                401,
                "INVALID_CREDENTIALS",
                "Usuário ou senha incorretos. Confira os dados e tente de novo.",
            )
        empresa = consultar_um(
            conn,
            "SELECT * FROM empresas WHERE id_empresa = %(id)s",
            {"id": usuario["id_empresa"]},
        )

    response.set_cookie(
        SESSION_COOKIE, criar_token(int(usuario["id_usuario"])), **_atributos_do_cookie()
    )
    return {"user": serializar_usuario(usuario), "company": serializar_empresa(empresa)}


@router.post("/auth/logout", status_code=204)
def sair(response: Response):
    """Apaga o cookie da sessão. `204`, sem corpo."""
    response.delete_cookie(SESSION_COOKIE, path="/", samesite="lax", httponly=True)


@router.get("/auth/me")
def eu(sessao: Sessao = Depends(sessao_atual)):
    """Quem está falando com a API e a empresa a que pertence."""
    return {
        "user": serializar_usuario(sessao.usuario),
        "company": serializar_empresa(sessao.empresa),
    }


@router.post("/auth/password", status_code=204)
def trocar_senha(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    """Troca a própria senha, conferindo a atual (ponto aberto 10)."""
    atual = str(dados.get("currentPassword") or "")
    nova = str(dados.get("newPassword") or "")
    if not senha_confere(atual, sessao.usuario.get("senha_hash")):
        raise ApiError(422, "WRONG_PASSWORD", "A senha atual não confere.")
    if len(nova) < SENHA_MINIMA:
        raise erro_validacao(f"A nova senha precisa de ao menos {SENHA_MINIMA} caracteres.")

    with transacao() as conn:
        executar(
            conn,
            """
            UPDATE usuarios
               SET senha_hash = %(hash)s, updated_at = CURRENT_TIMESTAMP
             WHERE id_usuario = %(id)s
            """,
            {"hash": gerar_hash_senha(nova), "id": sessao.id},
        )
