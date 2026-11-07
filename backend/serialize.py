"""
Tradução do banco (português) para o contrato (inglês).

O contrato manda inglês (`name`, `expiresAt`), o banco do Antônio usa português
(`nome_comercial`, `data_validade`). Toda a tradução mora aqui, num lugar só,
para não existir `nome_comercial` vazando em resposta de API por descuido.

Convenções que este arquivo garante:
  - `expiresAt`/`manufacturedAt` saem como meia-noite UTC ("2026-11-30T00:00:00Z");
  - `createdAt`/`finishedAt` saem como instante real em UTC;
  - dinheiro em centavos, inteiro;
  - booleano é `true`/`false`, mesmo no SQLite, que guarda 0/1.
"""

from datetime import date, datetime, timezone

# Níveis do perfil_acesso -> cargos do contrato
CARGO_POR_NIVEL = {1: "clerk", 2: "pharmacist", 3: "admin"}
NIVEL_POR_CARGO = {cargo: nivel for nivel, cargo in CARGO_POR_NIVEL.items()}

# Tipo do histórico -> tipo do Movement
TIPO_MOVIMENTACAO_PARA_MOVEMENT = {
    "ENTRADA": "in",
    "VENDA": "out",
    "DESCARTE": "out",
    "AJUSTE": "adjust",
}


def booleano(valor) -> bool:
    if valor is None:
        return False
    if isinstance(valor, bool):
        return valor
    return str(valor).strip().lower() in {"1", "true", "t", "sim", "yes"}


def texto_ou_nulo(valor) -> str | None:
    if valor is None:
        return None
    texto = str(valor)
    return texto if texto != "" else None


# --------------------------------------------------------------------------
# Datas e instantes
# --------------------------------------------------------------------------
def data_iso(valor) -> str | None:
    """Validade e fabricação: data, que o contrato lê em UTC."""
    if valor is None:
        return None
    if isinstance(valor, datetime):
        return valor.strftime("%Y-%m-%dT00:00:00Z")
    if isinstance(valor, date):
        return f"{valor.isoformat()}T00:00:00Z"
    texto = str(valor).strip()
    if not texto:
        return None
    return f"{texto[:10]}T00:00:00Z"


def instante_iso(valor) -> str | None:
    """Data e hora de verdade (created_at, data_registro), sempre em UTC."""
    if valor is None:
        return None
    if isinstance(valor, datetime):
        if valor.tzinfo is None:
            valor = valor.replace(tzinfo=timezone.utc)
        return valor.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    texto = str(valor).strip()
    if not texto:
        return None
    texto = texto.replace(" ", "T").split("+")[0].split(".")[0]
    if len(texto) == 16:
        texto += ":00"
    return texto[:19] + "Z"


def instante_utc(valor) -> datetime | None:
    """
    Data e hora de verdade, sempre com tz UTC, para comparar e calcular.

    O Postgres devolve `datetime` e o SQLite devolve texto ("2026-10-15 12:00:00",
    em UTC, como o `CURRENT_TIMESTAMP` dele). Quem precisa dos dois caminhos —
    a janela do estorno e a idade da conta — passa por aqui.
    """
    if valor is None:
        return None
    if isinstance(valor, datetime):
        return valor if valor.tzinfo else valor.replace(tzinfo=timezone.utc)
    texto = str(valor).replace("T", " ").split("+")[0].split(".")[0].strip()
    try:
        return datetime.strptime(texto[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def so_dia(valor) -> str | None:
    """Só a parte da data, "2026-11-30", como o contrato usa nos filtros."""
    if valor is None:
        return None
    return str(valor)[:10]


def dias_ate(valor_data, hoje: date) -> int:
    """Dias entre a data de validade (texto 'YYYY-MM-DD' ou date) e hoje."""
    if isinstance(valor_data, datetime):
        vencimento = valor_data.date()
    elif isinstance(valor_data, date):
        vencimento = valor_data
    else:
        vencimento = date.fromisoformat(str(valor_data)[:10])
    return (vencimento - hoje).days


# --------------------------------------------------------------------------
# Classificação de validade (decisão 10: o dia do vencimento já é Vencido)
# --------------------------------------------------------------------------
def status_validade(dias: int, janela_a_vencer: int) -> str:
    if dias <= 0:
        return "expired"
    if dias <= janela_a_vencer:
        return "soon"
    return "ok"


def cargo_do_nivel(nivel) -> str:
    return CARGO_POR_NIVEL.get(int(nivel), "clerk")


# --------------------------------------------------------------------------
# Empresa, usuário, pasta
# --------------------------------------------------------------------------
def empresa(linha: dict) -> dict:
    """Uma linha de `empresas` no objeto `Company` do contrato."""
    return {
        "id": str(linha["id_empresa"]),
        "cnpj": linha["cnpj"] or "",
        "legalName": linha["razao_social"] or "",
        "tradeName": linha["nome_fantasia"] or "",
        "stateRegistration": texto_ou_nulo(linha.get("inscricao_estadual")),
        "cityRegistration": texto_ou_nulo(linha.get("inscricao_municipal")),
        "taxRegime": linha.get("regime_tributario") or "",
        "address": {
            "zipCode": linha.get("cep") or "",
            "street": linha.get("logradouro") or "",
            "number": linha.get("numero") or "",
            "complement": texto_ou_nulo(linha.get("complemento")),
            "district": linha.get("bairro") or "",
            "city": linha.get("cidade") or "",
            "state": linha.get("uf") or "",
        },
        "phone": linha.get("telefone") or "",
        "email": linha.get("email") or "",
        "website": texto_ou_nulo(linha.get("site")),
        "logoUrl": texto_ou_nulo(linha.get("logo_url")),
        "timezone": linha.get("fuso_horario") or "America/Sao_Paulo",
        "currency": linha.get("moeda") or "BRL",
        "locale": linha.get("idioma") or "pt-BR",
        "soonThresholdDays": int(linha.get("janela_a_vencer_dias") or 30),
    }


def usuario(linha: dict) -> dict:
    """Uma linha de `usuarios` no objeto `User` do contrato."""
    return {
        "id": str(linha["id_usuario"]),
        "name": linha["nome"],
        "login": linha["login"],
        # aceita tanto `nivel` (JOIN com perfil_acesso) quanto `id_perfil`
        "role": cargo_do_nivel(linha.get("nivel", linha.get("id_perfil", 1))),
        "active": booleano(linha.get("ativo", True)),
        "avatarUrl": texto_ou_nulo(linha.get("avatar_url")),
    }


def pasta(linha: dict) -> dict:
    return {
        "id": str(linha["id_pasta"]),
        "name": linha["nome"],
        "productCount": int(linha.get("total_produtos") or 0),
        "active": booleano(linha.get("ativo", True)),
    }


# --------------------------------------------------------------------------
# Produto e lote
# --------------------------------------------------------------------------
def lote(linha: dict, hoje: date, janela_a_vencer: int) -> dict:
    dias = dias_ate(linha["data_validade"], hoje)
    return {
        "id": str(linha["id_lote"]),
        "productId": str(linha["id_produto"]),
        "code": linha["numero_lote"],
        "manufacturedAt": data_iso(linha.get("data_fabricacao")),
        "expiresAt": data_iso(linha["data_validade"]),
        "quantity": int(linha["quantidade_atual"]),
        "status": status_validade(dias, janela_a_vencer),
    }


def produto(linha: dict, lotes: list[dict], pastas: dict[int, str]) -> dict:
    """Linha de `produtos` + lotes no objeto `Product` do contrato."""
    itens = [lote(l, linha["_hoje"], linha["_janela"]) for l in lotes]
    itens.sort(key=lambda item: item["expiresAt"])
    total = sum(item["quantity"] for item in itens)
    mais_proxima = itens[0]["expiresAt"] if itens else None
    return {
        "id": str(linha["id_produto"]),
        "name": linha["nome_comercial"],
        "sku": linha.get("sku") or "",
        "barcode": texto_ou_nulo(linha.get("ean")),
        "folderId": str(linha["id_pasta"]) if linha.get("id_pasta") else None,
        "folderName": pastas.get(linha.get("id_pasta")),
        "brand": texto_ou_nulo(linha.get("marca")),
        "supplier": texto_ou_nulo(linha.get("fornecedor")),
        "unit": linha.get("unidade") or "un",
        "minStock": int(linha.get("estoque_minimo") or 0),
        "maxStock": int(linha["estoque_maximo"]) if linha.get("estoque_maximo") is not None else None,
        "acquisitionCost": int(linha.get("custo_aquisicao") or 0),
        "operationalCost": int(linha.get("custo_operacional") or 0),
        "salePrice": int(linha.get("preco_venda") or 0),
        "totalQuantity": total,
        "nearestExpiry": mais_proxima,
        # 'unknown' quando não há nenhum lote com saldo, nunca null
        "nearestExpiryStatus": itens[0]["status"] if itens else "unknown",
        "lots": itens,
        "source": linha.get("fonte") or "manual",
        "externalId": texto_ou_nulo(linha.get("id_externo")),
        "active": booleano(linha.get("ativo", True)),
        "photoUrl": texto_ou_nulo(linha.get("foto_url")),
    }


def empresa_publica(empresa_traduzida: dict) -> dict:
    """Só o nome fantasia, para telas que não podem ver o cadastro inteiro."""
    return {"tradeName": empresa_traduzida["tradeName"]}
