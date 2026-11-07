import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CatalogDrop } from "@/components/import/catalog-drop"

/**
 * Passo 1: origem.
 *
 * Duas origens no piloto: planilha e cadastro manual. A integração com o sistema
 * da farmácia saiu do escopo em 17/09, porque depender de acesso de fornecedor
 * não cabia no prazo do piloto.
 *
 * O fluxo de revisão continua agnóstico de origem, então quando a integração
 * voltar ela entra aqui como uma terceira opção, sem refazer tela nenhuma.
 * Ver docs/01-references/import-strategy.md.
 *
 * Uma coluna, uma ação primária (SPEC 5.5). Até 08/10 havia um card "Como
 * funciona" que repetia as etapas logo acima dele, e "Escolher arquivo", a
 * única coisa a fazer aqui, era botão secundário.
 *
 * Desde a issue 056 a escolha do arquivo é de verdade (`CatalogDrop`).
 */
export function StepSource() {
  return (
    <div className="max-w-2xl rounded-md border border-line bg-surface p-5 shadow-card md:p-7">
      <h2 className="font-display text-section font-bold text-fg">Enviar uma planilha</h2>
      <p className="mt-1 text-body text-fg-muted">
        Não precisa de modelo: no próximo passo você diz qual coluna é qual.
      </p>

      <CatalogDrop />

      <h3 className="mt-8 text-body font-medium text-fg">Onde encontrar essa lista no seu sistema</h3>
      <p className="mt-1 text-body text-fg-muted">
        Na maioria dos sistemas de farmácia, o caminho é Relatórios, depois Produtos ou Cadastro de produtos,
        e então Exportar para Excel. Se o seu sistema exportar lote e validade junto, melhor ainda:
        aproveitamos as duas colunas.
      </p>

      <p className="mt-8 border-t border-line pt-5 text-body text-fg-muted">
        Prefere cadastrar um produto de cada vez?{" "}
        <Link
          href="/estoque/novo"
          className="inline-flex items-center gap-1 font-medium text-fg underline-offset-4 hover:underline"
        >
          Cadastrar um produto
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </p>
    </div>
  )
}
