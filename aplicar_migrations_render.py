"""
aplicar_migrations_render.py
----------------------------
Aplica as migrations de schema (001, 003, 005) no banco Postgres do Render.
Não aplica 002 e 004 (seeds) — os dados reais virão do Supabase via
importar_render.py.

Uso:
  python aplicar_migrations_render.py

Requer RENDER_DATABASE_URL no .env.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

import psycopg2

MIGRATIONS_DIR = Path("supabase/migrations")
# Apenas schema (002 e 004 são seeds de dados mock)
MIGRATIONS = ["001_create_schema.sql", "003_expand_schema.sql", "005_performance_indexes.sql"]


def main():
    url = os.getenv("RENDER_DATABASE_URL")
    if not url:
        print("ERRO: RENDER_DATABASE_URL não definida no .env")
        return

    conn = psycopg2.connect(url)
    conn.autocommit = True
    cur = conn.cursor()

    for nome in MIGRATIONS:
        caminho = MIGRATIONS_DIR / nome
        if not caminho.exists():
            print(f"AVISO: {nome} não encontrado, pulando.")
            continue
        sql = caminho.read_text(encoding="utf-8")
        print(f"Aplicando {nome}...")
        try:
            cur.execute(sql)
            print(f"  OK")
        except Exception as e:
            print(f"  ERRO: {str(e)[:200]}")
            return

    cur.close()
    conn.close()
    print("\nSchema criado no Render com sucesso!")


if __name__ == "__main__":
    main()
