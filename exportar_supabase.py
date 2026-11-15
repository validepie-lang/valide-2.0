"""
exportar_supabase.py
--------------------
Exporta schema + dados do Supabase para um arquivo .sql, pronto para
importar no Render Postgres.

Usa as mesmas variáveis de ambiente do aplicar_migrations.py
(SUPABASE_HOST, SUPABASE_PORT, SUPABASE_DB, SUPABASE_USER, SUPABASE_PASSWORD).

As tabelas são ordenadas topologicamente por dependência de FK, para que
a importação no Render não viole chaves estrangeiras.
"""
import os
from pathlib import Path
from collections import defaultdict

from dotenv import load_dotenv

load_dotenv()

import psycopg2


def conectar():
    return psycopg2.connect(
        host=os.getenv("SUPABASE_HOST"),
        port=os.getenv("SUPABASE_PORT", "5432"),
        dbname=os.getenv("SUPABASE_DB", "postgres"),
        user=os.getenv("SUPABASE_USER"),
        password=os.getenv("SUPABASE_PASSWORD"),
        sslmode=os.getenv("SUPABASE_SSLMODE", "require"),
    )


def escapar(valor):
    """Escapa um valor Python para formato SQL compatível com Postgres."""
    if valor is None:
        return "NULL"
    if isinstance(valor, bool):
        return "TRUE" if valor else "FALSE"
    if isinstance(valor, (int, float)):
        return str(valor)
    if isinstance(valor, (bytes, bytearray)):
        return "'\\x" + valor.hex() + "'"
    texto = str(valor).replace("'", "''")
    return f"'{texto}'"


def ordenar_por_fk(cur):
    """Retorna lista de tabelas ordenadas por dependência de FK (folhas primeiro)."""
    cur.execute("""
        SELECT table_name
          FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_type = 'BASE TABLE'
    """)
    tabelas = {r[0] for r in cur.fetchall()}

    # Dependências: tabela -> conjunto de tabelas que ela referencia (FK)
    deps = defaultdict(set)
    cur.execute("""
        SELECT
            tc.table_name,
            ccu.table_name AS referencia
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
         AND tc.table_schema = ccu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
    """)
    for tabela, ref in cur.fetchall():
        if tabela != ref:  # ignora auto-referência
            deps[tabela].add(ref)

    # Ordenação topológica
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
    saida = Path("supabase_export.sql")
    conn = conectar()
    cur = conn.cursor()

    tabelas = ordenar_por_fk(cur)
    print(f"Tabelas (ordenadas por FK): {len(tabelas)}")

    with open(saida, "w", encoding="utf-8") as f:
        f.write("-- Export do Supabase para Render Postgres\n")
        f.write("-- Tabelas ordenadas por dependência de FK\n\n")

        total_inserts = 0
        for tabela in tabelas:
            cur.execute(f"""
                SELECT column_name
                  FROM information_schema.columns
                 WHERE table_schema = 'public'
                   AND table_name = '{tabela}'
                 ORDER BY ordinal_position
            """)
            colunas = [c[0] for c in cur.fetchall()]
            colunas_sql = ", ".join(f'"{c}"' for c in colunas)

            cur.execute(f'SELECT {colunas_sql} FROM "{tabela}"')
            linhas = cur.fetchall()
            print(f"  {tabela}: {len(linhas)} linhas")

            if linhas:
                f.write(f"-- Tabela: {tabela} ({len(linhas)} linhas)\n")
                for linha in linhas:
                    valores = ", ".join(escapar(v) for v in linha)
                    f.write(
                        f'INSERT INTO "{tabela}" ({colunas_sql}) '
                        f"VALUES ({valores});\n"
                    )
                    total_inserts += 1
            f.write("\n")

        # Reseta sequences para o próximo valor após o último ID inserido
        cur.execute("""
            SELECT table_name, column_name
              FROM information_schema.columns
             WHERE table_schema = 'public'
               AND column_default LIKE 'nextval(%'
        """)
        for tabela, coluna in cur.fetchall():
            f.write(
                f"SELECT setval(pg_get_serial_sequence('\"{tabela}\"', '{coluna}'), "
                f"COALESCE((SELECT MAX(\"{coluna}\") FROM \"{tabela}\"), 1), "
                f"(SELECT MAX(\"{coluna}\") FROM \"{tabela}\") IS NOT NULL);\n"
            )

    cur.close()
    conn.close()
    print(f"\nExport concluído: {saida.resolve()} ({total_inserts} INSERTs)")


if __name__ == "__main__":
    main()
