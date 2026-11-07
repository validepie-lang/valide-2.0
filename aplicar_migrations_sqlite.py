# ============================================================
# SISTEMA VALIDE - APLICADOR DE MIGRATIONS (SQLite local)
# ============================================================
# PROPÓSITO:
#   Aplicar no banco LOCAL data/valide.db as migrations 003 (expansão do
#   schema) e 004 (seed complementar) escritas em dialeto SQLite, que ficam
#   em supabase/migrations/sqlite/. Faz o mesmo papel do aplicar_migrations.py
#   (Postgres/Supabase), mas para o motor SQLite, útil enquanto o Supabase
#   está inacessível.
#
# COMO USAR:
#   python aplicar_migrations_sqlite.py            -> aplica 003 e 004
#   python aplicar_migrations_sqlite.py 003        -> aplica só a 003
#   python aplicar_migrations_sqlite.py 003 004    -> aplica ambas
#
# IDEMPOTÊNCIA:
#   Pode rodar quantas vezes quiser sem erro:
#     - "ALTER TABLE <t> ADD COLUMN <col> ..." só executa se <col> ainda não
#       existir (verificado com PRAGMA table_info(<t>)).
#     - CREATE TABLE / CREATE INDEX usam IF NOT EXISTS.
#     - INSERT usa OR IGNORE.
#
# OBS:
#   - Lê SQLITE_PATH do .env da raiz (padrão: ./data/valide.db).
#   - Usa apenas a biblioteca padrão sqlite3 + python-dotenv.
# ============================================================
import os
import re
import sqlite3
import sys
import time
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError as erro:
    print(f"[ERRO] Dependência faltando: {erro}")
    print("       Rode: pip install python-dotenv")
    sys.exit(1)

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env")

# ---- Caminho do arquivo SQLite (relativo à raiz do projeto) ----
SQLITE_PATH = os.getenv("SQLITE_PATH", "./data/valide.db")
DB_PATH = Path(SQLITE_PATH)
if not DB_PATH.is_absolute():
    DB_PATH = BASE / DB_PATH

PASTA = BASE / "supabase" / "migrations" / "sqlite"
# Por padrão, aplica a 003, a 004 e a 005 (nesta ordem).
PADRAO = ["003", "004", "005"]

# Detecta comandos "ALTER TABLE <t> ADD COLUMN <col> ..." (para pular se a
# coluna já existir — o SQLite não aceita "ADD COLUMN IF NOT EXISTS").
RX_ALTER_ADD = re.compile(
    r"^\s*ALTER\s+TABLE\s+([A-Za-z_][A-Za-z0-9_]*)\s+"
    r"ADD\s+COLUMN\s+([A-Za-z_][A-Za-z0-9_]*)",
    re.IGNORECASE,
)


def arquivos_a_aplicar(pref):
    """Devolve os arquivos .sql da pasta, filtrados pelos prefixos pedidos."""
    todos = sorted(PASTA.glob("*.sql"))
    if not pref:
        return todos
    return [f for f in todos if any(f.name.startswith(p) for p in pref)]


def dividir_comandos(texto: str):
    """
    Separa o arquivo em comandos SQL. Um comando começa na primeira linha
    útil e termina na linha que fecha com ';'. Comentários de linha (--...)
    e linhas em branco são ignorados.
    """
    comandos = []
    buffer = []
    for linha_bruta in texto.splitlines():
        # Remove comentário de linha (-- até o fim da linha).
        pos = linha_bruta.find("--")
        linha = linha_bruta[:pos] if pos != -1 else linha_bruta
        if not linha.strip():
            continue
        buffer.append(linha.rstrip())
        if linha.rstrip().endswith(";"):
            comandos.append("\n".join(buffer).strip())
            buffer = []
    resto = "\n".join(buffer).strip()
    if resto:
        comandos.append(resto)
    return comandos


def colunas_de(conn: sqlite3.Connection, tabela: str):
    """Conjunto de nomes de colunas de uma tabela (via PRAGMA table_info)."""
    cursor = conn.execute(f'PRAGMA table_info("{tabela}")')
    return {linha[1] for linha in cursor.fetchall()}


def aplicar(conn: sqlite3.Connection, caminho: Path) -> bool:
    print(f"\n{'=' * 70}\n▶ APLICANDO: {caminho.name}\n{'=' * 70}")
    comandos = dividir_comandos(caminho.read_text(encoding="utf-8"))
    cache_colunas = {}
    executados = 0
    pulados = 0
    for comando in comandos:
        match = RX_ALTER_ADD.match(comando)
        if match:
            tabela, coluna = match.group(1), match.group(2)
            if tabela not in cache_colunas:
                cache_colunas[tabela] = colunas_de(conn, tabela)
            if coluna in cache_colunas[tabela]:
                print(f"   ⏭️  pulado (já existe): {tabela}.{coluna}")
                pulados += 1
                continue
        try:
            conn.execute(comando)
        except sqlite3.Error as erro:
            print(f"❌ FALHA no comando:\n   {comando}\n   -> {type(erro).__name__}: {erro}")
            return False
        if match:
            cache_colunas[match.group(1)].add(match.group(2))
        executados += 1
    conn.commit()
    print(f"✅ OK — {caminho.name} ({executados} comandos executados, {pulados} pulados)")
    return True


def listar_tabelas(conn: sqlite3.Connection):
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' "
        "AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    )
    return [linha[0] for linha in cursor.fetchall()]


def listar_views(conn: sqlite3.Connection):
    cursor = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='view' ORDER BY name;"
    )
    return [linha[0] for linha in cursor.fetchall()]


def main():
    pref = sys.argv[1:] or PADRAO
    arquivos = arquivos_a_aplicar(pref)
    if not arquivos:
        print(f"Nenhum .sql encontrado para: {pref}")
        sys.exit(1)

    print(f"🔌 Abrindo banco SQLite local: {DB_PATH.resolve()}")
    if not DB_PATH.exists():
        print(f"❌ Banco não encontrado: {DB_PATH.resolve()}")
        print("   Rode o sistema uma vez com DB_ENGINE=sqlite para criá-lo (DDL+seed).")
        sys.exit(1)

    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA foreign_keys = ON;")
    print("✅ Conectado ao SQLite local.")

    t0 = time.time()
    tudo_ok = True
    for arquivo in arquivos:
        if not aplicar(conn, arquivo):
            tudo_ok = False
            break

    if tudo_ok:
        print(f"\n{'=' * 70}\n🎉 MIGRATIONS SQLITE APLICADAS EM {time.time() - t0:.2f}s\n{'=' * 70}")

        print("\n📊 TABELAS E CONTAGEM DE LINHAS:")
        for tabela in listar_tabelas(conn):
            total = conn.execute(f'SELECT COUNT(*) FROM "{tabela}";').fetchone()[0]
            print(f"   · {tabela:<24s}: {total:>4d}")

        print("\n👁️  VIEWS:")
        for view in listar_views(conn):
            print(f"   · {view}")

    conn.close()
    sys.exit(0 if tudo_ok else 2)


if __name__ == "__main__":
    main()
