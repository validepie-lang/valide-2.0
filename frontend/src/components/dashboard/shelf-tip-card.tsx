import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { LinkButton } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

/**
 * Cartão com foto do Início (issue 067, item 3), como o "Discover How to
 * Maximize Your Pharmacy's Efficiency" do Pharmly: foto de farmacêutico na
 * prateleira, frase curta e um botão. Aqui leva à resposta da Ajuda sobre
 * retirar os vencidos.
 *
 * O texto fica numa faixa sólida da cor do trilho, e não num degradê sobre a
 * foto (design-system 14.9): contraste garantido seja qual for a foto.
 *
 * Foto: National Cancer Institute, no Unsplash (https://unsplash.com/photos/byGTytEGjBo),
 * Licença da Unsplash. Se a farmácia parceira mandar a dela, troca-se o arquivo.
 */
export function ShelfTipCard({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="dica-prateleira"
      className={cn("relative isolate min-h-80 overflow-hidden rounded-md bg-rail shadow-card", className)}
    >
      <Image
        src="/inicio/farmaceutica-prateleira.jpg"
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="-z-10 object-cover object-[30%_center]"
      />
      <div className="absolute inset-x-3 bottom-3 flex flex-col gap-3 rounded-sm bg-rail/90 p-4 text-rail-fg">
        <div>
          <h2 id="dica-prateleira" className="font-display text-body font-semibold">
            Tire os vencidos da prateleira
          </h2>
          <p className="mt-1 text-label text-rail-muted">
            O passo a passo para retirar e registrar o descarte.
          </p>
        </div>
        <LinkButton href="/ajuda#entrada-e-saida" variant="inverse" size="sm" className="self-start">
          Ver como fazer
          <ArrowRight className="size-4" aria-hidden />
        </LinkButton>
      </div>
    </section>
  )
}
