"""
Acesso ao banco do servidor.

Toda a conversa com o banco passa por aqui e, por baixo, pelo `database.py`:
é lá que mora a fachada dual-engine (SQLite local / PostgreSQL-Supabase), a
classificação de validade e o RBAC. Este módulo só acrescenta o que o servidor
HTTP precisa:

  - conexão com transação explícita (`transaction()`), para operações
    "tudo ou nada" como o descarte em lote;
  - atalhos de consulta que devolvem dicionário em vez de tupla.

Escreva as consultas com placeholders no formato `%(nome)s`: o `database.py`
traduz para `:nome` quando o motor é SQLite.
"""

from contextlib import contextmanager
from typing import Any, Iterator

from database import DB_ENGINE, DatabaseConnection


@contextmanager
def conexao() -> Iterator[Any]:
    """Conexão de leitura: fecha no fim, sem commit."""
    conn = DatabaseConnection.get_connection()
    _preparar(conn)
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def transacao() -> Iterator[Any]:
    """
    Conexão de escrita: COMMIT no fim, ROLLBACK se algo levantar.

    O SQLite do `database.py` abre com `isolation_level = None` (autocommit),
    o que anularia o rollback. Aqui voltamos ao modo transacional antes de
    qualquer escrita.
    """
    conn = DatabaseConnection.get_connection()
    _preparar(conn)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _preparar(conn) -> None:
    if DB_ENGINE == "sqlite":
        # "" = o Python abre a transação sozinho antes de INSERT/UPDATE/DELETE
        # e só grava no commit(). É o que permite desfazer tudo num erro.
        conn.isolation_level = ""


def consultar(conn, sql: str, params: dict | None = None) -> list[dict]:
    """SELECT: sempre uma lista de dicionários."""
    return DatabaseConnection.executar_sql(conn, sql, params or {})


def consultar_um(conn, sql: str, params: dict | None = None) -> dict | None:
    """SELECT que devolve no máximo uma linha."""
    return DatabaseConnection.executar_sql_retorna_um(conn, sql, params or {})


def executar(conn, sql: str, params: dict | None = None) -> list[dict]:
    """
    INSERT/UPDATE/DELETE. Com `RETURNING`, a lista vem preenchida (o SQLite
    local é 3.50, então também suporta); sem `RETURNING`, vem vazia.
    """
    return DatabaseConnection.executar_sql(conn, sql, params or {})
