"""
SISTEMA VALIDE - Backend HTTP (API REST)
========================================
Projeto Acadêmico (ADS) - Controle de Validade de Medicamentos para Farmácias.

Este pacote é o servidor que o frontend consome. Ele fica FORA de `frontend/`
de propósito: o `CLAUDE.md` do frontend proíbe backend e banco lá dentro
(seção 3, "regras duras"). O frontend só sabe a URL da API
(`NEXT_PUBLIC_API_URL`).

O acesso ao banco é feito pela camada que já existe na raiz do projeto,
`database.py` (dual-engine SQLite/Postgres). Nada de SQL duplicado aqui.

Como subir (a partir da raiz do projeto):

    python -m uvicorn backend.main:app --reload --port 8000

Documentação interativa: http://localhost:8000/api/docs
"""
