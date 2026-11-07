import { cn } from "@/lib/utils/cn"

/**
 * Logo do Valide, definido pelo Marcus em 11/10/2026 (issue 062): um V que é
 * também o visto de "validar", ao lado de três barras que diminuem, o estoque
 * baixando. Não é símbolo de farmácia (decisão de 16/09): serve a bebidas e
 * delicatessen.
 *
 * Arte dos arquivos que ele mandou (valide-marca.svg, valide-logo-escuro.svg,
 * valide-favicon.svg), com o nome já em curvas. Cor pelo `currentColor`:
 * cobalto no claro, lavanda sobre fundo escuro (trilho e painel do login),
 * nunca cor de status. O favicon em `src/app/icon.svg` usa só o V.
 */
const V_PATH =
  "M4.661 7 L16.59 33.678 Q16.957 34.5 17.857 34.5 L22.202 34.5 Q23.102 34.5 23.431 33.662 L34.918 4.4 L25.654 7.2 L20.102 21.349 Q19.773 22.187 19.406 21.365 L12.986 7 Z"

const WORD_PATH =
  "M304.72 100.00V88.41Q302.39 93.41 297.38 96.76Q290.46 101.39 280.83 101.39Q271.16 101.39 264.00 96.85Q256.85 92.31 252.94 84.12Q249.03 75.93 249.03 64.86Q249.03 53.66 253.06 45.32Q257.08 36.99 264.35 32.41Q271.62 27.82 281.34 27.82Q291.44 27.82 297.92 32.59Q302.07 35.65 304.21 40.22V0.00H321.81V100.00ZM370.60 101.39Q359.35 101.39 350.93 96.69Q342.50 91.99 337.82 83.66Q333.15 75.32 333.15 64.49Q333.15 53.56 337.80 45.30Q342.45 37.04 350.83 32.41Q359.21 27.78 370.23 27.78Q380.83 27.78 388.63 32.18Q396.44 36.57 400.72 44.44Q405.00 52.31 405.00 62.96Q405.00 64.91 404.88 66.57Q404.77 68.24 404.49 69.86H351.03Q351.97 77.60 355.90 82.20Q361.06 88.24 370.69 88.24Q376.30 88.24 380.42 86.13Q384.54 84.03 386.53 79.68H403.10Q399.63 89.77 391.32 95.58Q383.01 101.39 370.60 101.39ZM153.61 100.00Q152.87 97.18 152.57 93.84Q152.37 91.58 152.30 88.72Q149.51 94.23 144.47 97.41Q138.15 101.39 129.03 101.39Q118.33 101.39 112.01 96.04Q105.69 90.69 105.69 81.67Q105.69 71.99 112.78 66.25Q119.86 60.51 132.82 58.61L151.67 55.76V52.27Q151.67 46.71 148.54 43.82Q145.42 40.93 138.98 40.93Q132.78 40.93 129.10 43.22Q125.42 45.51 124.58 49.81H107.78Q108.94 40.00 117.22 33.89Q125.51 27.78 139.58 27.78Q154.17 27.78 161.67 34.40Q169.17 41.02 169.17 53.70V85.88Q169.17 89.21 169.63 92.66Q170.09 96.11 171.07 100.00ZM38.63 94.50 3.89 0.00H22.78L51.39 82.68L80.05 0.00H97.96L63.23 94.50ZM185.23 100.00V0.00H202.82V100.00ZM285.97 87.04Q294.44 87.04 299.51 81.13Q304.58 75.23 304.58 64.54Q304.58 53.94 299.44 48.06Q294.31 42.18 285.79 42.18Q277.45 42.18 272.36 48.10Q267.27 54.03 267.27 64.77Q267.27 75.42 272.36 81.23Q277.45 87.04 285.97 87.04ZM219.68 100.00V29.17H237.27V100.00ZM351.32 57.59H387.26Q386.59 50.08 382.80 45.95Q378.19 40.93 370.05 40.93Q361.06 40.93 355.90 47.06Q352.47 51.14 351.32 57.59ZM151.67 66.88 135.69 69.35Q129.40 70.32 126.30 72.78Q123.19 75.23 123.19 79.68Q123.19 83.80 126.09 85.93Q128.98 88.06 134.17 88.06Q141.62 88.06 146.64 84.28Q151.67 80.51 151.67 75.09ZM218.94 17.50V-1.85H238.01V17.50Z"

/** O V e as três barras, sem o nome */
function MarkShapes() {
  return (
    <>
      <path d={V_PATH} />
      <rect x="41" y="4.4" width="16" height="6.2" rx="3.1" />
      <rect x="41" y="16.35" width="12.5" height="6.2" rx="3.1" />
      <rect x="41" y="28.3" width="9" height="6.2" rx="3.1" />
    </>
  )
}

export function Logo({
  className,
  tone = "default",
  markOnly = false,
}: {
  className?: string
  tone?: "default" | "onDeep"
  /** Só o símbolo, para o trilho lateral. O nome continua no aria-label do link. */
  markOnly?: boolean
}) {
  // No escuro do tema, o primário é água clara: o símbolo continua legível
  const mark = tone === "onDeep" ? "text-signature" : "text-primary"
  const word = tone === "onDeep" ? "text-deep-fg" : "text-fg"

  if (markOnly) {
    return (
      <svg viewBox="0 0 61.7 40" className={cn("h-7 w-auto fill-current", mark, className)} aria-hidden>
        <MarkShapes />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 144.9 40" className={cn("h-8 w-auto", className)} role="img" aria-label="Valide">
      <g className={cn("fill-current", mark)}>
        <MarkShapes />
      </g>
      <g className={cn("fill-current", word)} transform="translate(67.3 10.491) scale(0.18)">
        <path d={WORD_PATH} />
      </g>
    </svg>
  )
}
