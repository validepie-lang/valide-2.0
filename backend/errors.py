"""
Erros da API no envelope do contrato:

    { "error": { "code": "PRODUCT_NOT_FOUND", "message": "Produto não encontrado" } }

A `message` sai em português, pronta para a tela mostrar como veio. Os códigos
são os do `docs/01-references/api-contract.md` (v30).

As exceções do `database.py` também são traduzidas aqui, para que a regra de
negócio escrita lá (RBAC, FEFO, justificativa) não precise ser reescrita.
"""

from database import (
    EstoqueInsuficienteError,
    LoteNaoEncontradoError,
    PermissaoInsuficienteError,
    UsuarioNaoEncontradoError,
    ValideError,
)


class ApiError(Exception):
    """Erro esperado, com status HTTP e código do contrato."""

    def __init__(self, status_code: int, code: str, message: str, details=None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


# --------------------------------------------------------------------------
# Atalhos
# --------------------------------------------------------------------------

def erro_validacao(message: str, code: str = "VALIDATION_ERROR") -> ApiError:
    return ApiError(422, code, message)


def erro_nao_encontrado(code: str, message: str) -> ApiError:
    return ApiError(404, code, message)


def erro_conflito(code: str, message: str) -> ApiError:
    return ApiError(409, code, message)


def erro_permissao(message: str) -> ApiError:
    return ApiError(403, "FORBIDDEN", message)


def nao_autorizado(message: str = "Sua sessão expirou. Entre de novo.") -> ApiError:
    return ApiError(401, "UNAUTHENTICATED", message)


# Códigos de exceção do database.py -> resposta HTTP
TRADUCAO_DATABASE = (
    (PermissaoInsuficienteError, 403, "FORBIDDEN"),
    (EstoqueInsuficienteError, 422, "LOT_QUANTITY_EXCEEDED"),
    (LoteNaoEncontradoError, 404, "LOT_NOT_FOUND"),
    (UsuarioNaoEncontradoError, 404, "USER_NOT_FOUND"),
    (ValideError, 422, "VALIDATION_ERROR"),
)


def traduzir_erro_de_banco(erro: Exception) -> ApiError | None:
    """Converte uma exceção do `database.py` no erro do contrato."""
    for tipo, status, code in TRADUCAO_DATABASE:
        if isinstance(erro, tipo):
            return ApiError(status, code, str(erro))
    return None
