"""
importar_render.py
------------------
Importa os dados exportados do Supabase (supabase_export.sql) no banco
Postgres do Render.

Uso:
  python importar_render.py

A URL de conexão do Render deve estar em .env:
  RENDER_DATABASE_URL=postgres://usuario:senha@host:port/db?sslmode=require

Antes de importar, certifique-se de que o schema já foi criado no Render
usando aplicar_migrations_render.py.

Estratégia:
  - TRUNCATE de todas as tabelas em um único comando.
  - Importa linha por linha (cada INSERT está em uma linha no export).
  - Desabilita os triggers de USUÁRIO do historico_movimentacao.
"""
import os
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

import psycopg2


def ordem_dependencia(cur):
    """Retorna lista de tabelas ordenada por dependência de FK (folhas primeiro)."""
    cur.execute("""
        SELECT table_name
          FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_type = 'BASE TABLE'
    """)
    tabelas = {r[0] for r in cur.fetchall()}

    deps = defaultdict(set)
    cur.execute("""
        SELECT tc.table_name, ccu.table_name AS referencia
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
           AND tc.table_schema = ccu.table_schema
         WHERE tc.constraint_type = 'FOREIGN KEY'
           AND tc.table_schema = 'public'
    """)
    for tabela, ref in cur.fetchall():
        if tabela != ref:
            deps[tabela].add(ref)

    ordem = []
    visitadas = set()

    def visitar(t):
        if t in visitadas:
            return
        visitadas.add(t)
        for dep in deps[t]:
            if dep in tabelas:
                visitar(dep)
        ordem.append(t)

    for t in sorted(tabelas):
        visitar(t)

    return ordem


def main():
    url = os.getenv("RENDER_DATABASE_URL")
    if not url:
        print("ERRO: RENDER_DATABASE_URL não definida no .env")
        return

    arquivo = Path("supabase_export.sql")
    if not arquivo.exists():
        print(f"ERRO: {arquivo} não encontrado. Rode exportar_supabase.py primeiro.")
        return

    conn = psycopg2.connect(url)
    conn.autocommit = True
    cur = conn.cursor()

    ordem = ordem_dependencia(cur)
    print(f"Ordem de importação: {ordem}")

    # 1) Desabilita triggers de USUÁRIO do historico_movimentacao
    cur.execute("ALTER TABLE public.historico_movimentacao DISABLE TRIGGER USER")
    print("Triggers do historico_movimentacao desabilitados.")

    # 2) TRUNCATE de todas as tabelas em um único comando
    todas = ", ".join(f'"{t}"' for t in ordem)
    cur.execute(f"TRUNCATE TABLE {todas} RESTART IDENTITY CASCADE")
    print("Todas as tabelas truncadas.")

    # 3) Importa linha por linha (cada INSERT está em uma linha)
    ok = 0
    erros = 0
    for linha in arquivo.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if not linha.startswith("INSERT INTO"):
            continue
        try:
            cur.execute(linha)
            ok += 1
        except Exception as e:
            erros += 1
            if erros <= 5:  # mostra só os primeiros 5 erros
                print(f"  ERRO: {str(e)[:120]}")

    # 4) Reabilita triggers de usuário
    cur.execute("ALTER TABLE public.historico_movimentacao ENABLE TRIGGER USER")
    print("Triggers reabilitados.")

    # 5) Verifica contagem final
    print("\nContagem final:")
    for tabela in ordem:
        cur.execute(f'SELECT COUNT(*) FROM "{tabela}"')
        print(f"  {tabela}: {cur.fetchone()[0]} linhas")

    print(f"\nImportação concluída: {ok} statements OK, {erros} erros")
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
