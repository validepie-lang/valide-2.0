"""
Servidor HTTP do Valide (`backend/`).

É o único lugar que monta a aplicação: middlewares, tratamento de erro,
arquivos de foto e os routers do contrato. Nenhuma regra de negócio mora aqui
— ela está no `database.py` (RBAC, FEFO, auditoria) e nas rotas.

Como subir (a partir da raiz do projeto):

    python -m uvicorn backend.main:app --reload --port 8000

O prefixo de tudo é `/api/v1`, então o login é `POST /api/v1/auth/login`.
Ver `frontend/docs/01-references/api-contract.md`.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import API_PREFIX, CORS_ORIGINS, DEMO_PASSWORD, UPLOAD_DIR
from .db import consultar, executar, transacao
from .errors import ApiError, traduzir_erro_de_banco
from .routes import (
    auth,
    companies,
    dashboard,
    folders,
    lots,
    movements,
    product_extras,
    products,
    users,
)
from .security import gerar_hash_senha, hash_valido


# --------------------------------------------------------------------------
# Senhas de demonstração
# --------------------------------------------------------------------------
def bootstrap_senhas_demo() -> list[str]:
    """
    Troca os hashes fictícios do seed ("$2b$12$adminXXXX") por um hash real
    de `DEMO_PASSWORD`.

    Um hash de verdade sempre começa com "pbkdf2_sha256$", então qualquer
    linha fora desse formato é placeholder de demonstração. A troca é idempotente:
    na segunda subida não sobra nenhuma.
    """
    with transacao() as conn:
        linhas = consultar(conn, "SELECT id_usuario, login, senha_hash FROM usuarios")
        pendentes = [linha for linha in linhas if not hash_valido(linha.get("senha_hash"))]
        for linha in pendentes:
            executar(
                conn,
                """
                UPDATE usuarios
                   SET senha_hash = %(hash)s, updated_at = CURRENT_TIMESTAMP
                 WHERE id_usuario = %(id)s
                """,
                {"hash": gerar_hash_senha(DEMO_PASSWORD), "id": linha["id_usuario"]},
            )
    return [linha["login"] for linha in pendentes]


@asynccontextmanager
async def ciclo(app: FastAPI):
    """Prepara a pasta da foto e semeia as senhas antes de aceitar requisição."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    semeados = bootstrap_senhas_demo()
    if semeados:
        print(
            f"[valide] {len(semeados)} senha(s) de demonstração criadas "
            f"(logins: {', '.join(semeados)}) — senha '{DEMO_PASSWORD}'."
        )
    yield


app = FastAPI(
    title="Valide API",
    version="1.0.0",
    openapi_url=f"{API_PREFIX}/openapi.json",
    docs_url=f"{API_PREFIX}/docs",
    lifespan=ciclo,
)


# --------------------------------------------------------------------------
# CORS
# --------------------------------------------------------------------------
# `allow_credentials=True` é obrigatório: a sessão viaja em cookie httpOnly, e
# sem isso o navegador descarta o cookie numa chamada de outra origem.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# Envelope de erro: { "error": { "code", "message" } }
# --------------------------------------------------------------------------
def _resposta_de_erro(erro: ApiError) -> JSONResponse:
    corpo = {"code": erro.code, "message": erro.message}
    if erro.details is not None:
        corpo["details"] = erro.details
    return JSONResponse(status_code=erro.status_code, content={"error": corpo})


@app.exception_handler(ApiError)
async def tratar_api_error(request: Request, erro: ApiError) -> JSONResponse:
    """Erro esperado: já traz status, código e mensagem em português."""
    return _resposta_de_erro(erro)


@app.exception_handler(RequestValidationError)
async def tratar_validacao(request: Request, erro: RequestValidationError) -> JSONResponse:
    """Corpo/parametro fora do formato: mesmo envelope, sem vazar detalhe interno."""
    return _resposta_de_erro(
        ApiError(422, "VALIDATION_ERROR", "Confira os dados enviados e tente de novo.")
    )


@app.exception_handler(Exception)
async def tratar_erro_inesperado(request: Request, erro: Exception) -> JSONResponse:
    """
    Rede de segurança. A regra de negócio do `database.py` continua sendo
    traduzida pelo `traduzir_erro_de_banco` (RBAC, estoque, lote ausente);
    o que sobrar é 500 sem detalhe técnico na resposta.
    """
    traduzido = traduzir_erro_de_banco(erro)
    if traduzido is not None:
        return _resposta_de_erro(traduzido)
    import traceback

    traceback.print_exc()
    return _resposta_de_erro(
        ApiError(500, "INTERNAL_ERROR", "Algo saiu errado no servidor. Tente de novo em instantes.")
    )


# --------------------------------------------------------------------------
# Foto do produto
# --------------------------------------------------------------------------
# O produto guarda o endereço completo (`.../uploads/<arquivo>`), então este
# `mount` é o que faz a imagem abrir. Ver `product_extras.py`.
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# --------------------------------------------------------------------------
# Rotas do contrato
# --------------------------------------------------------------------------
for modulo in (
    auth,
    companies,
    users,
    folders,
    products,
    product_extras,
    lots,
    movements,
    dashboard,
):
    app.include_router(modulo.router, prefix=API_PREFIX)
