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
    """Dependência do FastAPI: monta a `Sessao` ou responde 401.

    Uma única consulta JOIN busca usuário, perfil e empresa. Antes eram duas
    consultas separadas (usuário + empresa), e como esta dependência roda em
    TODA rota protegida, cada requisição ganhava uma ida e volta ao banco.
    Combinando as duas, economizamos uma consulta por requisição.
    """
    usuario_id = ler_token(valide_session)
    if usuario_id is None:
        raise nao_autorizado()

    with conexao() as conn:
        linha = consultar_um(
            conn,
            """
            SELECT u.*, pa.nivel, pa.nome_perfil,
                   e.id_empresa AS emp_id_empresa,
                   e.cnpj AS emp_cnpj,
                   e.razao_social AS emp_razao_social,
                   e.nome_fantasia AS emp_nome_fantasia,
                   e.inscricao_estadual AS emp_inscricao_estadual,
                   e.inscricao_municipal AS emp_inscricao_municipal,
                   e.regime_tributario AS emp_regime_tributario,
                   e.cep AS emp_cep,
                   e.logradouro AS emp_logradouro,
                   e.numero AS emp_numero,
                   e.complemento AS emp_complemento,
                   e.bairro AS emp_bairro,
                   e.cidade AS emp_cidade,
                   e.uf AS emp_uf,
                   e.telefone AS emp_telefone,
                   e.email AS emp_email,
                   e.site AS emp_site,
                   e.logo_url AS emp_logo_url,
                   e.fuso_horario AS emp_fuso_horario,
                   e.moeda AS emp_moeda,
                   e.idioma AS emp_idioma,
                   e.janela_a_vencer_dias AS emp_janela_a_vencer_dias,
                   e.created_at AS emp_created_at,
                   e.updated_at AS emp_updated_at
              FROM usuarios u
              JOIN perfil_acesso pa ON pa.id_perfil = u.id_perfil
              JOIN empresas e ON e.id_empresa = u.id_empresa
             WHERE u.id_usuario = %(id)s
            """,
            {"id": usuario_id},
        )
        if not linha or not int(linha.get("ativo") or 0):
            raise nao_autorizado()
        # Separa os campos da empresa (prefixo emp_) dos campos do usuário.
        empresa = {
            "id_empresa": linha.pop("emp_id_empresa"),
            "cnpj": linha.pop("emp_cnpj"),
            "razao_social": linha.pop("emp_razao_social"),
            "nome_fantasia": linha.pop("emp_nome_fantasia"),
            "inscricao_estadual": linha.pop("emp_inscricao_estadual"),
            "inscricao_municipal": linha.pop("emp_inscricao_municipal"),
            "regime_tributario": linha.pop("emp_regime_tributario"),
            "cep": linha.pop("emp_cep"),
            "logradouro": linha.pop("emp_logradouro"),
            "numero": linha.pop("emp_numero"),
            "complemento": linha.pop("emp_complemento"),
            "bairro": linha.pop("emp_bairro"),
            "cidade": linha.pop("emp_cidade"),
            "uf": linha.pop("emp_uf"),
            "telefone": linha.pop("emp_telefone"),
            "email": linha.pop("emp_email"),
            "site": linha.pop("emp_site"),
            "logo_url": linha.pop("emp_logo_url"),
            "fuso_horario": linha.pop("emp_fuso_horario"),
            "moeda": linha.pop("emp_moeda"),
            "idioma": linha.pop("emp_idioma"),
            "janela_a_vencer_dias": linha.pop("emp_janela_a_vencer_dias"),
            "created_at": linha.pop("emp_created_at"),
            "updated_at": linha.pop("emp_updated_at"),
        }
        usuario = linha
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
