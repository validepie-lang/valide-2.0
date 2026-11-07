"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { HELP_QUESTIONS, HELP_TOPICS, type HelpQuestion } from "@/components/help/help-content"

/** Sem acento e em minúscula: "validade" acha "Validades", "senha" acha "Senha" */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

const INDEX = HELP_QUESTIONS.map((q) => ({ q, text: normalize(`${q.question} ${q.keywords}`) }))

/**
 * Pergunta que abre e fecha, como a FAQ Section (Behance): a linha com "+" à
 * direita, que gira para "×" aberta. É o `<details>` do navegador, então
 * teclado e leitor de tela funcionam sem nada a mais.
 */
function Question({ item, topicTitle }: { item: HelpQuestion; topicTitle?: string }) {
  return (
    <details className="group border-b border-line last:border-b-0">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 md:px-6 [&::-webkit-details-marker]:hidden">
        <span>
          {topicTitle ? <span className="block text-label text-fg-muted">{topicTitle}</span> : null}
          <span className="text-body font-medium text-fg">{item.question}</span>
        </span>
        <Plus
          className="size-4 shrink-0 text-fg-muted transition-transform group-open:rotate-45"
          aria-hidden
        />
      </summary>
      <div className="flex max-w-2xl flex-col gap-3 px-4 pt-1 pb-5 text-body text-fg-muted md:px-6">
        {item.answer}
      </div>
    </details>
  )
}

/**
 * Ajuda (issue 043), da Knowledge Base Landing Page (Behance): a busca larga no
 * topo e os assuntos em cartões; e das perguntas da FAQ Section. Buscar troca
 * os assuntos por uma lista só com o que bate.
 */
export function HelpCenter() {
  const [term, setTerm] = useState("")
  const query = normalize(term.trim())
  const found = query ? INDEX.filter((entry) => entry.text.includes(query)).map((entry) => entry.q) : null
  const titleOf = (id: string) => HELP_TOPICS.find((t) => t.id === id)?.title

  return (
    <div className="flex flex-col gap-6">
      <div role="search" className="relative max-w-2xl">
        <label htmlFor="ajuda-busca" className="sr-only">
          Escreva a dúvida
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-fg-muted"
          aria-hidden
        />
        <input
          id="ajuda-busca"
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Qual é a dúvida?"
          autoComplete="off"
          className="h-12 w-full rounded-pill border border-line bg-surface pr-4 pl-12 text-body text-fg shadow-card transition-colors placeholder:text-fg-muted hover:border-line-strong"
        />
      </div>

      <p role="status" className="sr-only">
        {found
          ? `${found.length} ${found.length === 1 ? "pergunta encontrada" : "perguntas encontradas"}`
          : ""}
      </p>

      {found ? (
        <Card className="p-0 md:p-0">
          {found.length > 0 ? (
            found.map((item) => <Question key={item.id} item={item} topicTitle={titleOf(item.topic)} />)
          ) : (
            <EmptyState
              icon={Search}
              title={`Nada sobre “${term.trim()}”`}
              description="Tente outra palavra, como importar, validade, entrada, saída ou senha. Ou veja os assuntos, apagando a busca."
            />
          )}
        </Card>
      ) : (
        <>
          <nav aria-label="Assuntos" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {HELP_TOPICS.map((topic) => {
              const count = HELP_QUESTIONS.filter((q) => q.topic === topic.id).length
              return (
                <a
                  key={topic.id}
                  href={`#${topic.id}`}
                  className="flex flex-col rounded-md border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong md:p-5"
                >
                  <span className="block text-body font-semibold text-fg">{topic.title}</span>
                  <span className="mt-1 block text-label text-fg-muted">{topic.summary}</span>
                  <span className="mt-auto block pt-3 text-label text-fg-muted tnum">
                    {count} {count === 1 ? "pergunta" : "perguntas"}
                  </span>
                </a>
              )
            })}
          </nav>

          {HELP_TOPICS.map((topic) => (
            <section
              key={topic.id}
              id={topic.id}
              aria-labelledby={`${topic.id}-titulo`}
              className="scroll-mt-24"
            >
              <h2 id={`${topic.id}-titulo`} className="mb-3 font-display text-section font-bold text-fg">
                {topic.title}
              </h2>
              <Card className="p-0 md:p-0">
                {HELP_QUESTIONS.filter((q) => q.topic === topic.id).map((item) => (
                  <Question key={item.id} item={item} />
                ))}
              </Card>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
