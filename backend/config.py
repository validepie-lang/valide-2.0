"""
Configuração do servidor Valide (`backend/`).

Lê o MESMO .env da raiz que o `database.py` usa, para não existirem duas
verdades sobre `DB_ENGINE`. Aqui ficam só os parâmetros do servidor HTTP:
sessão, CORS e o diretório da foto do produto.

Ver `frontend/CLAUDE.md` seção 3: o backend vive fora de `frontend/`, e o
frontend só conversa com ele por HTTP.
"""

import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import load_dotenv

# Raiz do projeto (uma pasta acima de backend/). É onde mora o .env e o
# database.py. Entra no sys.path para `import database` funcionar de qualquer
# diretório de trabalho.
RAIZ = Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

load_dotenv(RAIZ / ".env")

# --------------------------------------------------------------------------
# Sessão (decisão de 16/09: cookie httpOnly, o front nunca vê o token)
# --------------------------------------------------------------------------
SESSION_COOKIE = "valide_session"
SESSION_SECRET = os.getenv("SESSION_SECRET", "troque-este-segredo-em-producao")
SESSION_TTL_HOURS = int(os.getenv("SESSION_TTL_HOURS", "12"))

# `Secure` impede o cookie de trafegar em http://localhost, então fica
# desligado no desenvolvimento e ligado em produção (HTTPS).
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").strip().lower() in {
    "1",
    "true",
    "sim",
    "yes",
}

# --------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------
API_PREFIX = "/api/v1"

CORS_ORIGINS = [
    origem.strip()
    for origem in os.getenv("API_CORS_ORIGINS", "http://localhost:3000").split(",")
    if origem.strip()
]

# Senha inicial dos usuários de demonstração. O seed do banco tem hashes
# fictícios ("$2b$12$admin"), que não conferem com nada: na primeira subida o
# servidor troca esses placeholders por um hash real desta senha. Ver
# `security.py` e `main.py` (bootstrap_senhas_demo).
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "valide123")

# Foto do produto (POST /products/:id/photo).
UPLOAD_DIR = RAIZ / "data" / "uploads"
FOTO_TAMANHO_MAXIMO = 2 * 1024 * 1024  # 2 MB, como o contrato manda
FOTO_TIPOS_ACEITOS = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}

# Teto de itens do PATCH /products/folder (contrato v25).
MAX_PRODUTOS_POR_MOVIMENTACAO_DE_PASTA = 500

# --------------------------------------------------------------------------
# Fuso da conta
# --------------------------------------------------------------------------
# A janela de "a vencer" e o "hoje" da classificação são do fuso da farmácia,
# não do servidor (ponto aberto 11 do contrato). O Windows não traz a base
# IANA, então há um pequeno mapa de reserva para os fusos brasileiros.
_FUSOS_RESERVA = {
    "America/Sao_Paulo": -3,
    "America/Bahia": -3,
    "America/Fortaleza": -3,
    "America/Recife": -3,
    "America/Belem": -3,
    "America/Cuiaba": -4,
    "America/Manaus": -4,
    "America/Porto_Velho": -4,
    "America/Rio_Branco": -5,
    "America/Noronha": -2,
}


def fuso(nome: str | None):
    """Devolve o tzinfo do fuso pedido, com reserva fixa quando falta a base IANA."""
    if nome:
        try:
            return ZoneInfo(nome)
        except Exception:
            horas = _FUSOS_RESERVA.get(nome)
            if horas is not None:
                return timezone(timedelta(hours=horas))
    return timezone.utc


def hoje_da_empresa(nome_fuso: str | None) -> date:
    """A data de hoje no fuso da conta."""
    return datetime.now(fuso(nome_fuso)).date()
