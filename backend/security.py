"""
Senha e token de sessão.

Duas decisões, e nenhuma delas inventa criptografia:

1. **Senha**: `hashlib.pbkdf2_hmac` com sal por usuário (biblioteca padrão).
   O formato guardado é `pbkdf2_sha256$<iterações>$<sal>$<derivado>`, tudo em
   base64 urlsafe. É conferível e não reversível, como qualquer hash sério.
   O seed do banco traz placeholders ("$2b$12$admin") que não passam por
   `hash_valido()`, e é assim que o servidor sabe que precisa semeá-los.

2. **Sessão**: token assinado com HMAC-SHA256 sobre o segredo
   (`SESSION_SECRET`), no formato `v1.<payload base64url>.<assinatura>`. O
   payload leva só `uid`, `iat` e `exp`. Nada de dado sensível, e nada de
   tabela de sessão para manter.
"""

import base64
import hashlib
import hmac
import json
import os
import time

from .config import SESSION_SECRET, SESSION_TTL_HOURS

ITERACOES_PBKDF2 = 120_000
ALGORITMO_SENHA = "pbkdf2_sha256"
PREFIXO_TOKEN = "v1"


# --------------------------------------------------------------------------
# Base64 urlsafe sem "=" (cabe em cookie sem escapar nada)
# --------------------------------------------------------------------------
def _b64(dados: bytes) -> str:
    return base64.urlsafe_b64encode(dados).decode("ascii").rstrip("=")


def _de_b64(texto: str) -> bytes:
    recheio = "=" * (-len(texto) % 4)
    return base64.urlsafe_b64decode(texto + recheio)


# --------------------------------------------------------------------------
# Senha
# --------------------------------------------------------------------------
def gerar_hash_senha(senha: str) -> str:
    """Hash de uma senha nova, com sal aleatório."""
    sal = os.urandom(16)
    derivado = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), sal, ITERACOES_PBKDF2)
    return f"{ALGORITMO_SENHA}${ITERACOES_PBKDF2}${_b64(sal)}${_b64(derivado)}"


def hash_valido(hash_guardado: str | None) -> bool:
    """True quando o hash foi gerado por este módulo (o seed não gera)."""
    return bool(hash_guardado) and hash_guardado.startswith(f"{ALGORITMO_SENHA}$")


def senha_confere(senha: str, hash_guardado: str | None) -> bool:
    """Compara em tempo constante. Hash malformado nunca confere."""
    if not hash_valido(hash_guardado):
        return False
    try:
        _, iteracoes, sal, derivado = hash_guardado.split("$")
        esperado = _de_b64(derivado)
        calculado = hashlib.pbkdf2_hmac(
            "sha256", senha.encode("utf-8"), _de_b64(sal), int(iteracoes)
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(esperado, calculado)


# --------------------------------------------------------------------------
# Token de sessão
# --------------------------------------------------------------------------
def _assinatura(payload: str) -> str:
    mac = hmac.new(SESSION_SECRET.encode("utf-8"), payload.encode("ascii"), hashlib.sha256)
    return _b64(mac.digest())


def criar_token(usuario_id: int) -> str:
    """Token da sessão para o id de usuário informado."""
    agora = int(time.time())
    payload = _b64(
        json.dumps(
            {"uid": usuario_id, "iat": agora, "exp": agora + SESSION_TTL_HOURS * 3600},
            separators=(",", ":"),
        ).encode("utf-8")
    )
    return f"{PREFIXO_TOKEN}.{payload}.{_assinatura(payload)}"


def ler_token(token: str | None) -> int | None:
    """
    Devolve o id de usuário do token, ou None quando ele é inválido, foi
    adulterado ou venceu.
    """
    if not token:
        return None
    partes = token.split(".")
    if len(partes) != 3 or partes[0] != PREFIXO_TOKEN:
        return None
    _, payload, assinatura = partes
    if not hmac.compare_digest(assinatura, _assinatura(payload)):
        return None
    try:
        dados = json.loads(_de_b64(payload))
    except (ValueError, TypeError):
        return None
    if int(dados.get("exp", 0)) < int(time.time()):
        return None
    uid = dados.get("uid")
    return int(uid) if isinstance(uid, int) or str(uid).isdigit() else None
