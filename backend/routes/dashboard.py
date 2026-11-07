"""
Painel da Home: uma chamada só, para a tela carregar rápido (decisão 4 de 16/09).

Tudo sai dos MESMOS objetos `Product` que o estoque usa (`montar_produtos`), não
de um SQL agregado à parte: quem clica em "12 vencidos" tem de achar os mesmos
12 na listagem filtrada, e dois cálculos separados acabariam divergindo.

Regras do contrato v23 que este arquivo garante:
  - `valueAtRisk` não conta produto sem validade (`unknown`): não se sabe se
    está em risco;
  - `counts.ok` só conta produto com validade conhecida e dentro do prazo;
  - `expiringSoon` são os cinco lotes A vencer que vencem primeiro, sem os
    vencidos, que têm contagem e caminho próprios;
  - `expiryByWeek` são oito semanas começando amanhã (o lote que vence hoje já é
    vencido);
  - `byFolder.atRiskCount` conta produtos, e produto sem pasta não entra.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from ..db import conexao
from ..deps import Sessao, sessao_atual
from ..repo import montar_produtos, produtos_brutos, recentes
from ..serialize import data_iso, dias_ate, instante_utc, status_validade

router = APIRouter(tags=["dashboard"])

SEMANAS = 8
EXPIRANDO_SOON = 5
MOVIMENTOS_RECENTES = 6
DIAS_DA_CONTA = 7


# --------------------------------------------------------------------------
# Cálculos
# --------------------------------------------------------------------------
def _status_em(lote: dict, quando, janela: int) -> str:
    """O status que o lote teria com o "hoje" informado (quantidade de hoje)."""
    return status_validade(dias_ate(lote["expiresAt"], quando), janela)


def _em_risco(produtos: list[dict]) -> int:
    """Custo parado em vencido mais a vencer. Produto sem validade fica de fora."""
    total = 0
    for produto in produtos:
        for lote in produto["lots"]:
            if lote["status"] in ("expired", "soon"):
                total += lote["quantity"] * produto["acquisitionCost"]
    return total


def _contagens(produtos: list[dict]) -> dict:
    contagens = {"expired": 0, "soon": 0, "ok": 0, "unknown": 0}
    for produto in produtos:
        contagens[produto["nearestExpiryStatus"]] += 1
    return contagens


def _idade_da_conta(sessao: Sessao) -> int | None:
    """Dias desde a criação da conta, ou None quando o banco não diz."""
    criada = instante_utc(sessao.empresa.get("created_at"))
    if not criada:
        return None
    return int((datetime.now(timezone.utc) - criada).total_seconds() // 86400)


def _por_semana(produtos: list[dict], hoje) -> list[dict]:
    semanas = []
    for numero in range(SEMANAS):
        inicio = numero * 7 + 1
        fim = inicio + 7
        lotes = sum(
            1
            for produto in produtos
            for lote in produto["lots"]
            if inicio <= dias_ate(lote["expiresAt"], hoje) < fim
        )
        semanas.append({"weekStart": data_iso(hoje + timedelta(days=inicio)), "lotCount": lotes})
    return semanas


def _por_pasta(produtos: list[dict]) -> list[dict]:
    pastas: dict[str, dict] = {}
    for produto in produtos:
        if produto["nearestExpiryStatus"] not in ("expired", "soon"):
            continue
        if not produto["folderId"] or not produto["folderName"]:
            continue
        pasta = pastas.setdefault(
            produto["folderId"],
            {"folderId": produto["folderId"], "folderName": produto["folderName"], "atRiskCount": 0},
        )
        pasta["atRiskCount"] += 1
    return sorted(pastas.values(), key=lambda p: (-p["atRiskCount"], p["folderName"]))


def _expirando(produtos: list[dict]) -> list[dict]:
    itens = [
        {
            "productId": produto["id"],
            "productName": produto["name"],
            "lotCode": lote["code"],
            "expiresAt": lote["expiresAt"],
            "status": lote["status"],
            "quantity": lote["quantity"],
            "unit": produto["unit"],
        }
        for produto in produtos
        for lote in produto["lots"]
        if lote["status"] == "soon"
    ]
    itens.sort(key=lambda item: item["expiresAt"])
    return itens[:EXPIRANDO_SOON]


# --------------------------------------------------------------------------
# Rota
# --------------------------------------------------------------------------
@router.get("/dashboard")
def painel(sessao: Sessao = Depends(sessao_atual)):
    hoje = sessao.hoje
    janela = sessao.janela

    with conexao() as conn:
        produtos = montar_produtos(
            conn, produtos_brutos(conn, sessao.id_empresa), sessao.id_empresa, hoje, janela
        )
        movimentos_recentes = recentes(conn, sessao.id_empresa, MOVIMENTOS_RECENTES)

    semana_atras = hoje - timedelta(days=DIAS_DA_CONTA)
    idade = _idade_da_conta(sessao)
    # Conta com menos de uma semana não tem "semana passada" para comparar
    anterior = None
    if idade is None or idade >= DIAS_DA_CONTA:
        anterior = sum(
            lote["quantity"] * produto["acquisitionCost"]
            for produto in produtos
            for lote in produto["lots"]
            if _status_em(lote, semana_atras, janela) in ("expired", "soon")
        )

    sem_validade = [p for p in produtos if p["nearestExpiryStatus"] == "unknown"]
    return {
        "valueAtRisk": _em_risco(produtos),
        "valueAtRiskLastWeek": anterior,
        "counts": _contagens(produtos),
        "pendingExpiry": {
            "productCount": len(sem_validade),
            "valueAtStake": sum(p["totalQuantity"] * p["acquisitionCost"] for p in sem_validade),
        },
        "expiryByWeek": _por_semana(produtos, hoje),
        "byFolder": _por_pasta(produtos),
        "expiringSoon": _expirando(produtos),
        "recentMovements": movimentos_recentes,
    }
