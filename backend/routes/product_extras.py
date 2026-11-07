"""
Detalhe do produto: notas, alterações do cadastro e foto (contrato v26).

Nota é de qualquer cargo — o balconista é quem vê a caixa amassada. Não se
edita nem se apaga: some da tela, não do histórico.

A foto vai para `data/uploads` e o produto guarda o endereço completo, porque
a tela usa a foto direto no `src` da imagem e ele precisa alcançar o servidor
da API, não o do Next.

A trilha de alterações é escrita pelo `PATCH /products/:id` e pelo
`PATCH /products/folder`; aqui só se lê.
"""

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Request, UploadFile

from ..config import FOTO_TAMANHO_MAXIMO, FOTO_TIPOS_ACEITOS, UPLOAD_DIR
from ..db import conexao, transacao
from ..deps import Sessao, corpo, sessao_atual
from ..errors import erro_nao_encontrado, erro_validacao
from ..repo import (
    alteracoes_do_produto,
    definir_foto_produto,
    inserir_nota,
    notas_do_produto,
    produtos_por_ids,
)
from ..serialize import instante_iso, texto_ou_nulo

router = APIRouter(tags=["products"])

NOTA_MAXIMA = 500


def _produto_ou_404(conn, sessao: Sessao, id_produto: int) -> dict:
    linhas = produtos_por_ids(conn, sessao.id_empresa, [id_produto])
    if not linhas:
        raise erro_nao_encontrado(
            "PRODUCT_NOT_FOUND",
            "Este produto não está mais no estoque. Volte ao estoque e confira se ele foi excluído.",
        )
    return linhas[0]


def _nota(linha: dict) -> dict:
    return {
        "id": str(linha["id_nota"]),
        "text": linha["texto"],
        "userName": linha.get("nome_usuario") or "",
        "createdAt": instante_iso(linha["created_at"]),
    }


def _alteracao(linha: dict) -> dict:
    """`created` é o cadastro em si; `updated` traz campo, de e para."""
    mudanca = {
        "id": str(linha["id_alteracao"]),
        "at": instante_iso(linha["created_at"]),
        "userName": texto_ou_nulo(linha.get("nome_usuario")),
    }
    if linha["tipo"] == "created":
        mudanca["kind"] = "created"
        mudanca["source"] = linha.get("origem") or "manual"
        return mudanca
    mudanca["kind"] = "updated"
    mudanca["field"] = linha["campo"]
    mudanca["from"] = linha.get("valor_de")
    mudanca["to"] = linha.get("valor_para")
    return mudanca


def _arquivo_da_foto(endereco: str | None) -> Path | None:
    """O caminho local da foto, quando o endereço aponta para o nosso /uploads."""
    if not endereco:
        return None
    nome = endereco.rsplit("/", 1)[-1]
    if not nome or nome in {".", ".."}:
        return None
    return UPLOAD_DIR / nome


def _apagar_foto(endereco: str | None) -> None:
    """Some com o arquivo trocado. Falhar aqui não desfaz a troca no banco."""
    caminho = _arquivo_da_foto(endereco)
    if caminho is None:
        return
    try:
        caminho.unlink(missing_ok=True)
    except OSError:
        pass


# --------------------------------------------------------------------------
# Rotas
# --------------------------------------------------------------------------
@router.get("/products/{id_produto}/notes")
def listar_notas(id_produto: int, sessao: Sessao = Depends(sessao_atual)):
    with conexao() as conn:
        _produto_ou_404(conn, sessao, id_produto)
        linhas = notas_do_produto(conn, id_produto)
    return {"data": [_nota(linha) for linha in linhas]}


@router.post("/products/{id_produto}/notes", status_code=201)
def criar_nota(id_produto: int, dados: dict = Depends(corpo), sessao: Sessao = Depends(sessao_atual)):
    texto = str(dados.get("text") or "").strip()
    if not texto or len(texto) > NOTA_MAXIMA:
        raise erro_validacao(
            f"Escreva a nota antes de salvar, com até {NOTA_MAXIMA} letras.", "NOTE_INVALID"
        )

    with transacao() as conn:
        _produto_ou_404(conn, sessao, id_produto)
        linha = inserir_nota(conn, id_produto, sessao.id, texto)
        return _nota(linha)


@router.get("/products/{id_produto}/changes")
def listar_alteracoes(id_produto: int, sessao: Sessao = Depends(sessao_atual)):
    with conexao() as conn:
        _produto_ou_404(conn, sessao, id_produto)
        linhas = alteracoes_do_produto(conn, id_produto)
    return {"data": [_alteracao(linha) for linha in linhas]}


@router.post("/products/{id_produto}/photo")
async def enviar_foto(
    id_produto: int,
    request: Request,
    foto: UploadFile = File(...),
    sessao: Sessao = Depends(sessao_atual),
):
    sessao.exige_escrita_de_produto()

    if foto.content_type not in FOTO_TIPOS_ACEITOS:
        raise erro_validacao("Envie a foto em JPG, PNG ou WebP.", "PHOTO_NOT_ACCEPTED")

    conteudo = await foto.read()
    if not conteudo:
        raise erro_validacao("A foto chegou vazia. Escolha o arquivo de novo.", "PHOTO_NOT_ACCEPTED")
    if len(conteudo) > FOTO_TAMANHO_MAXIMO:
        raise erro_validacao("A foto passou de 2 MB. Envie uma menor.", "PHOTO_NOT_ACCEPTED")

    extensao = FOTO_TIPOS_ACEITOS[foto.content_type]
    nome = f"produto-{id_produto}-{uuid4().hex}{extensao}"

    with conexao() as conn:
        antes = _produto_ou_404(conn, sessao, id_produto)

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / nome).write_bytes(conteudo)
    endereco = f"{str(request.base_url).rstrip('/')}/uploads/{nome}"

    with transacao() as conn:
        definir_foto_produto(conn, sessao.id_empresa, id_produto, endereco)

    _apagar_foto(antes.get("foto_url"))
    return {"photoUrl": endereco}


@router.delete("/products/{id_produto}/photo", status_code=204)
def remover_foto(id_produto: int, sessao: Sessao = Depends(sessao_atual)):
    sessao.exige_escrita_de_produto()
    with transacao() as conn:
        antes = _produto_ou_404(conn, sessao, id_produto)
        definir_foto_produto(conn, sessao.id_empresa, id_produto, None)
    _apagar_foto(antes.get("foto_url"))
