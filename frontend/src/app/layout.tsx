import type { Metadata, Viewport } from "next"
import { Instrument_Sans } from "next/font/google"
import "./globals.css"

/**
 * Uma família só desde 11/10/2026 (issue 061), como nas duas referências mais
 * próximas do Behance: Pharmacy CRM Software (só General Sans) e BetterData,
 * que tem a tela de produtos vencendo (só Inter). Hierarquia por peso e
 * tamanho, não por troca de fonte.
 *
 * Instrument Sans porque, medida com fontTools, tem algarismos tabulares com
 * zero sem ponto, e o tabular não alarga vírgula nem hífen (Schibsted e Onest
 * alargam). A General Sans, da referência, não tem tabular. Licença OFL.
 */
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Valide",
    template: "%s | Valide",
  },
  description:
    "Controle de validade do seu estoque. Veja o que está vencido, o que vence em breve e o que ainda não tem validade informada.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Cor da barra do navegador no celular. É a única exceção à regra de zero hex
  // solto: este valor é lido pelo sistema operacional antes de existir CSS, então
  // não pode apontar para uma variable. Precisa acompanhar --bg-page em globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1220" },
  ],
}

/**
 * Aplica o tema antes da primeira pintura. Sem isso a tela pisca em claro
 * ao carregar para quem escolheu escuro.
 */
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("valide-theme");
    var system = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (saved !== "light" && system)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={instrument.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
