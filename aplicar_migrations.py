# ============================================================
# SISTEMA VALIDE - APLICADOR DE MIGRATIONS
# ============================================================
# PROPÓSITO:
#   Ler os arquivos .sql em supabase/migrations/ e aplicá-los no
#   PostgreSQL do Supabase (Transaction Pooler), em ordem numérica.
#   Serve para não depender do SQL Editor manual em cada alteração.
#
# COMO USAR:
#   python aplicar_migrations.py            -> aplica todas as pendentes (003+)
#   python aplicar_migrations.py 003 004    -> aplica só as indicadas
#
# OBS:
#   - Usa as mesmas credenciais do .env que o database.py já usa.
#   - Roda cada arquivo em autocommit (DDL no Postgres precisa disso).
# ============================================================
import os
import sys
import time
from pathlib import Path

try:
    import psycopg2
    from dotenv import load_dotenv
except ImportError as erro:
    print(f"[ERRO] Dependência faltando: {erro}")
    print("       Rode: pip install psycopg2-binary python-dotenv")
    sys.exit(1)

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env")

# ---- Monta o DSN a partir do .env ----
DSN = (
    f"host={os.getenv('SUPABASE_HOST')} "
    f"port={os.getenv('SUPABASE_PORT', '6543')} "
    f"dbname={os.getenv('SUPABASE_DB', 'postgres')} "
    f"user={os.getenv('SUPABASE_USER')} "
    f"password={os.getenv('SUPABASE_PASSWORD')} "
    f"sslmode={os.getenv('SUPABASE_SSLMODE', 'require')}"
)

PASTA = BASE / "supabase" / "migrations"
# Por padrão, aplica da 003 em diante (001 e 002 já rodaram no painel).
PADRAO = ["003", "004"]


def arquivos_a_aplicar(pref):
    """Devolve os arquivos .sql da pasta, filtrados pelos prefixos pedidos."""
    todos = sorted(PASTA.glob("*.sql"))
    if not pref:
        return todos
    return [f for f in todos if any(f.name.startswith(p) for p in pref)]


def aplicar(cursor, caminho: Path) -> bool:
    print(f"\n{'=' * 70}\n▶ APLICANDO: {caminho.name}\n{'=' * 70}")
    try:
        cursor.execute(caminho.read_text(encoding="utf-8"))
        print(f"✅ OK — {caminho.name}")
        return True
    except Exception as erro:
        print(f"❌ FALHA em {caminho.name}: {type(erro).__name__}: {erro}")
        return False


def main():
    pref = sys.argv[1:] or PADRAO
    arquivos = arquivos_a_aplicar(pref)
    if not arquivos:
        print(f"Nenhum .sql encontrado para: {pref}")
        sys.exit(1)

    print("🔌 Conectando no Supabase (Transaction Pooler)...")
    conn = psycopg2.connect(DSN, connect_timeout=30)
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("SELECT current_user, current_database(), now();")
    usuario, banco, agora = cursor.fetchone()
    print(f"✅ Conectado como {usuario} no banco {banco} em {agora}")

    t0 = time.time()
    tudo_ok = True
    for arquivo in arquivos:
        if not aplicar(cursor, arquivo):
            tudo_ok = False
            break

    if tudo_ok:
        print(f"\n{'=' * 70}\n🎉 MIGRATIONS APLICADAS EM {time.time() - t0:.1f}s\n{'=' * 70}")
        print("\n📊 CONTAGEM DAS TABELAS:")
        for tabela in ["empresas", "pastas", "perfil_acesso", "usuarios", "produtos",
                       "lotes_estoque", "historico_movimentacao", "notificacoes",
                       "produto_notas", "produto_alteracoes", "importacoes"]:
            cursor.execute(f"SELECT COUNT(*) FROM public.{tabela};")
            print(f"   · {tabela:<24s}: {cursor.fetchone()[0]:>4d}")
        print("\n👁️  VIEWS:")
        cursor.execute("""SELECT table_name FROM information_schema.views
                          WHERE table_schema='public' AND table_name LIKE 'vw_%'
                          ORDER BY table_name;""")
        for (v,) in cursor.fetchall():
            print(f"   · {v}")

    cursor.close()
    conn.close()
    sys.exit(0 if tudo_ok else 2)


if __name__ == "__main__":
    main()
