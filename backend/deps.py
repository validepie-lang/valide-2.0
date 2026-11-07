"""
Dependências de requisição: quem está falando com a API.

Toda rota protegida recebe uma `Sessao`, montada a partir do cookie httpOnly
`valide_session`. O tenant (empresa) NUNCA vem do cliente — vem do usuário da
sessão. É a regra da seção 3 de `security-rules.md`: o front não manda id de
conta, e o servidor não confia em nada que ele mande.

O cargo é o nível de `perfil_acesso` (1 Balconista / 2 Farmacêutico / 3 Admin),
traduzido para `clerk`/`pharmacist`/`admin` na resposta.
"""

from datetime import date
from typing import Annotated

from fastapi import Cookie, Request

from .config import hoje_da_empresa
from .db import conexao, consultar_um
from .errors import erro_nao_encontrado, erro_permissao, nao_autorizado
from .security import ler_token
from .serialize import CARGO_POR_NIVEL, cargo_do_nivel


class Sessao:
    """Usuário + empresa da requisição, já validados."""

    def __init__(self, usuario: dict, empresa: dict):
        self.usuario = usuario
        self.empresa = empresa

    @property
    def id(self) -> int:
        return int(self.usuario["id_usuario"])

    @property
    def nome(self) -> str:
        return self.usuario["nome"]

    @property
    def id_empresa(self) -> int:
        return int(self.empresa["id_empresa"])

    @property
    def nivel(self) -> int:
        return int(self.usuario["nivel"])

    @property
    def cargo(self) -> str:
        return cargo_do_nivel(self.nivel)

    @property
    def hoje(self) -> date:
        """O "hoje" no fuso da farmácia, não no do servidor (ponto aberto 11)."""
        return hoje_da_empresa(self.empresa.get("fuso_horario"))

    @property
    def janela(self) -> int:
        """Dias da janela de "a vencer" da conta (padrão 30)."""
        return int(self.empresa.get("janela_a_vencer_dias") or 30)

    # --- RBAC ---------------------------------------------------------
    def exige_admin(self, mensagem: str = "Só quem administra a conta pode fazer isso.") -> None:
        if self.nivel < 3:
            raise erro_permissao(mensagem)

    def exige_escrita_de_produto(self) -> None:
        """Farmacêutico ou Admin (item 18, decisão do Marcus em 12/10)."""
        if self.nivel < 2:
            raise erro_permissao(
                "Só Farmacêutico ou Administrador edita o cadastro do produto."
            )

    def exige_ajuste_de_estoque(self, acao: str = "esta movimentação") -> None:
        """Descarte e ajuste: Farmacêutico ou Admin (regra do banco, v6)."""
        if self.nivel < 2:
            raise erro_permissao(
                f"Só Farmacêutico ou Administrador autoriza {acao}."
            )


def _empresa_de(conn, id_empresa: int) -> dict:
    linha = consultar_um(
        conn, "SELECT * FROM empresas WHERE id_empresa = %(id)s", {"id": id_empresa}
    )
    if not linha:
        raise erro_nao_encontrado("COMPANY_NOT_FOUND", "A conta da farmácia não foi encontrada.")
    return linha


def sessao_atual(valide_session: Annotated[str | None, Cookie()] = None) -> Sessao:
    """Dependência do FastAPI: monta a `Sessao` ou responde 401."""
    usuario_id = ler_token(valide_session)
    if usuario_id is None:
        raise nao_autorizado()

    with conexao() as conn:
        usuario = consultar_um(
            conn,
            """
            SELECT u.*, pa.nivel, pa.nome_perfil
              FROM usuarios u
              JOIN perfil_acesso pa ON pa.id_perfil = u.id_perfil
             WHERE u.id_usuario = %(id)s
            """,
            {"id": usuario_id},
        )
        if not usuario or not int(usuario.get("ativo") or 0):
            raise nao_autorizado()
        empresa = _empresa_de(conn, int(usuario["id_empresa"]))
    return Sessao(usuario, empresa)


async def corpo(request: Request) -> dict:
    """Corpo JSON da requisição, ou `{}`. Quem valida campo a campo é a rota."""
    try:
        data = await request.json()
    except Exception:
        return {}
    return data if isinstance(data, dict) else {}


# Mantém o import de CARGO_POR_NIVEL acessível para as rotas (evita import extra).
__all__ = ["Sessao", "sessao_atual", "corpo", "CARGO_POR_NIVEL"]
