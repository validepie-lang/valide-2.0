"""
A empresa da sessão (`/companies/current`).

O `PATCH` recebe só os campos que a tela de Configurações manda, com o
`address` parcial (a tela não tem complemento nem estado): o servidor junta
com o que já está gravado, para o que não veio não virar branco.

Mudar `soonThresholdDays` muda o `status` de todos os lotes — nada é
recalculado aqui, porque o status é derivado a cada leitura.
"""

from fastapi import APIRouter, Depends

from ..db import conexao, consultar_um, executar, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import erro_validacao
from ..serialize import empresa as serializar_empresa

router = APIRouter(tags=["companies"])

# Campo do contrato -> coluna de `empresas`
_CAMPOS = {
    "cnpj": "cnpj",
    "legalName": "razao_social",
    "tradeName": "nome_fantasia",
    "stateRegistration": "inscricao_estadual",
    "cityRegistration": "inscricao_municipal",
    "taxRegime": "regime_tributario",
    "phone": "telefone",
    "email": "email",
    "website": "site",
    "timezone": "fuso_horario",
    "soonThresholdDays": "janela_a_vencer_dias",
}

# Campo do contrato -> coluna do endereço
_ENDERECO = {
    "zipCode": "cep",
    "street": "logradouro",
    "number": "numero",
    "complement": "complemento",
    "district": "bairro",
    "city": "cidade",
    "state": "uf",
}


def _carregar(conn, id_empresa: int) -> dict:
    return consultar_um(
        conn, "SELECT * FROM empresas WHERE id_empresa = %(id)s", {"id": id_empresa}
    )


@router.get("/companies/current")
def mostrar(sessao: Sessao = Depends(sessao_atual)):
    return serializar_empresa(sessao.empresa)


@router.patch("/companies/current")
def editar(dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_admin("Só quem administra a conta edita os dados da empresa.")

    colunas: dict = {}
    for campo, coluna in _CAMPOS.items():
        if campo in dados:
            colunas[coluna] = dados[campo]

    endereco = dados.get("address")
    if isinstance(endereco, dict):
        for campo, coluna in _ENDERECO.items():
            if campo in endereco:
                colunas[coluna] = endereco[campo]

    if "janela_a_vencer_dias" in colunas:
        try:
            colunas["janela_a_vencer_dias"] = int(colunas["janela_a_vencer_dias"])
        except (TypeError, ValueError):
            raise erro_validacao("A janela de aviso precisa ser um número de dias.")

    # Campo obrigatório nunca pode ser apagado por um valor em branco.
    for obrigatorio in ("cnpj", "razao_social", "nome_fantasia"):
        if obrigatorio in colunas and not str(colunas[obrigatorio] or "").strip():
            raise erro_validacao("Este campo não pode ficar em branco.")

    if colunas:
        atribuicoes = ", ".join(f"{coluna} = %({coluna})s" for coluna in colunas)
        with transacao() as conn:
            executar(
                conn,
                f"""
                UPDATE empresas
                   SET {atribuicoes}, updated_at = CURRENT_TIMESTAMP
                 WHERE id_empresa = %(empresa)s
                """,
                {**colunas, "empresa": sessao.id_empresa},
            )

    with conexao() as conn:
        return serializar_empresa(_carregar(conn, sessao.id_empresa))
