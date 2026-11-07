import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * O design system do Valide substitui a escala de tamanho de texto do Tailwind
 * por nomes próprios (text-body, text-label, text-metric). O tailwind-merge não
 * conhece esses nomes e classificava todos como cor de texto, o que fazia
 * `cn("text-primary-fg", "text-body")` apagar a cor e deixar botão primário com
 * texto escuro sobre fundo escuro.
 *
 * Declarar a escala aqui resolve isso em todo lugar que usa cn().
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "display-sm",
            "section",
            "body",
            "label",
            "micro",
            "metric",
            "hero",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
