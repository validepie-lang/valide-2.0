import Link from "next/link"
import { StatusChip } from "@/components/ui/status-chip"

/**
 * As perguntas da Ajuda (issue 043). Cada resposta sai de uma regra que já
 * vale (business-rules.md, contrato, telas): nada aqui promete o que a tela
 * não faz. Ao mudar uma regra, mudar a resposta junto.
 */

export type HelpTopic = { id: string; title: string; summary: string }

export type HelpQuestion = {
  id: string
  topic: string
  question: string
  /** palavras que a pessoa pode digitar na busca e não estão na pergunta */
  keywords: string
  answer: React.ReactNode
}

export const HELP_TOPICS: HelpTopic[] = [
  { id: "comecar", title: "Começar", summary: "Trazer os produtos e informar as validades" },
  { id: "validades", title: "Validades", summary: "O que cada situação quer dizer" },
  { id: "entrada-e-saida", title: "Entrada e saída", summary: "Mercadoria que chega, venda, descarte" },
  { id: "pessoas", title: "Pessoas e acesso", summary: "Senha, cargos e quem saiu da farmácia" },
]

function To({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-fg underline underline-offset-4 hover:text-primary">
      {children}
    </Link>
  )
}

export const HELP_QUESTIONS: HelpQuestion[] = [
  {
    id: "importar",
    topic: "comecar",
    question: "Como trago os produtos que a farmácia já tem?",
    keywords: "importar planilha excel csv exportar sistema catálogo",
    answer: (
      <>
        <p>
          Pelo sistema que a farmácia já usa: procure uma opção como “Exportar”, “Relatório de produtos” ou
          “Salvar como planilha”, e salve em Excel ou CSV. Depois, envie o arquivo em{" "}
          <To href="/estoque/importar">Estoque, Importar produtos</To>.
        </p>
        <p>
          O Valide mostra as colunas que achou e o campo de cada uma. Confira, revise as linhas e importe.
          Nada muda no sistema da farmácia.
        </p>
      </>
    ),
  },
  {
    id: "depois-de-importar",
    topic: "comecar",
    question: "Importei. Por que tudo aparece como Sem validade?",
    keywords: "fila validades pendentes lote informar",
    answer: (
      <p>
        A importação traz o catálogo, não a validade. Cada produto entra como Sem validade até alguém informar
        o lote e a data. Faça isso em <To href="/estoque/validades-pendentes">Validades pendentes</To>: um
        produto por vez, do que tem mais dinheiro parado para o que tem menos. Com o teclado, Enter salva e
        passa ao próximo.
      </p>
    ),
  },
  {
    id: "cadastrar",
    topic: "comecar",
    question: "Posso cadastrar um produto só, sem planilha?",
    keywords: "novo adicionar produto manual",
    answer: (
      <p>
        Pode. Em <To href="/estoque/novo">Estoque, Adicionar produto</To>, com o lote e a validade já no mesmo
        formulário.
      </p>
    ),
  },
  {
    id: "situacoes",
    topic: "validades",
    question: "O que quer dizer cada situação?",
    keywords: "vencido a vencer no prazo sem validade cor status",
    answer: (
      <dl className="grid gap-3">
        <div>
          <dt>
            <StatusChip status="expired" size="sm" />
          </dt>
          <dd className="mt-1">A validade já passou. O próprio dia do vencimento já conta como Vencido.</dd>
        </div>
        <div>
          <dt>
            <StatusChip status="soon" size="sm" />
          </dt>
          <dd className="mt-1">
            Vence dentro da janela de aviso: 30 dias, ou o que estiver em{" "}
            <To href="/configuracoes/empresa">Configurações, Empresa</To>.
          </dd>
        </div>
        <div>
          <dt>
            <StatusChip status="ok" size="sm" />
          </dt>
          <dd className="mt-1">Vence depois da janela de aviso.</dd>
        </div>
        <div>
          <dt>
            <StatusChip status="unknown" size="sm" />
          </dt>
          <dd className="mt-1">
            Nenhum lote informado. O Valide não sabe a validade, e por isso nunca conta o produto como No
            prazo.
          </dd>
        </div>
      </dl>
    ),
  },
  {
    id: "varios-lotes",
    topic: "validades",
    question: "O produto tem lotes com validades diferentes. Qual vale?",
    keywords: "lote primeiro vence situação produto",
    answer: (
      <p>
        O produto mostra a situação do lote que vence primeiro. Se um lote venceu e os outros estão no prazo,
        o produto aparece como Vencido, porque há algo para resolver nele. Os lotes, um por um, ficam na
        página do produto.
      </p>
    ),
  },
  {
    id: "valor-em-risco",
    topic: "validades",
    question: "O que é o valor em risco do painel?",
    keywords: "dinheiro custo início painel risco",
    answer: (
      <p>
        A soma do custo dos produtos Vencidos e A vencer. Sem validade fica de fora, porque não dá para saber
        se está em risco. O valor parado dos Sem validade aparece à parte.
      </p>
    ),
  },
  {
    id: "entrada",
    topic: "entrada-e-saida",
    question: "Chegou mercadoria. Como registro?",
    keywords: "entrada receber caixa leitor código de barras bipar lote",
    answer: (
      <p>
        Em <To href="/estoque/entrada">Registrar entrada</To> (também em Estoque, Movimentações): bipe o
        código de barras da caixa com o leitor do caixa, ou escreva o nome. Depois, o número do lote, a
        validade e a quantidade, que vêm impressos na caixa. Seu nome, a data e a hora entram no histórico
        sozinhos.
      </p>
    ),
  },
  {
    id: "saida",
    topic: "entrada-e-saida",
    question: "Como registro uma saída?",
    keywords: "baixa venda avaria roubo consumo interno motivo lote fefo",
    answer: (
      <p>
        Na página do produto, “Registrar saída”. O Valide já sugere o lote que vence primeiro; se a caixa que
        saiu é de outro lote, troque. O motivo é obrigatório: venda, avaria, roubo, vencimento ou consumo
        interno. É o motivo que mostra onde a farmácia perde dinheiro.
      </p>
    ),
  },
  {
    id: "vencidos",
    topic: "entrada-e-saida",
    question: "Como tiro os vencidos da prateleira?",
    keywords: "descarte retirar vencidos lote prateleira",
    answer: (
      <p>
        Em <To href="/estoque/retirar-vencidos">Retirar vencidos</To>, que abre também pelo painel: todos os
        lotes vencidos numa lista, já marcados, para registrar o descarte de uma vez. Descartar por vencimento
        ou avaria é do Farmacêutico e do Administrador; o Balconista vê a lista para separar as caixas.
      </p>
    ),
  },
  {
    id: "corrigir",
    topic: "entrada-e-saida",
    question: "Registrei errado. Dá para apagar?",
    keywords: "erro apagar desfazer corrigir histórico movimentação",
    answer: (
      <p>
        Não. O histórico não se apaga, para mostrar sempre quem fez o quê. Para corrigir, registre outra
        movimentação: uma entrada para devolver o que saiu a mais, ou uma saída para o que entrou a mais. Tudo
        aparece em <To href="/estoque/movimentacoes">Movimentações</To>.
      </p>
    ),
  },
  {
    id: "senha",
    topic: "pessoas",
    question: "Esqueci a senha. E agora?",
    keywords: "senha login entrar esqueci trocar",
    answer: (
      <p>
        Peça a quem administra a conta da farmácia. Em Configurações, Usuários, “Editar”, essa pessoa define
        uma senha nova para você. Depois de entrar, troque por uma sua em{" "}
        <To href="/configuracoes">Meu perfil</To>.
      </p>
    ),
  },
  {
    id: "cargos",
    topic: "pessoas",
    question: "O que cada cargo pode fazer?",
    keywords: "cargo balconista farmacêutico administrador permissão acesso",
    answer: (
      <p>
        Balconista cadastra produto, informa validade e registra saída. Farmacêutico faz o mesmo e também
        descarta por vencimento ou avaria. Administrador faz tudo, inclusive importar, pastas, pessoas e dados
        da empresa. A tabela completa está em <To href="/configuracoes/usuarios">Configurações, Usuários</To>.
        Quem não pode fazer algo simplesmente não vê a opção.
      </p>
    ),
  },
  {
    id: "saiu",
    topic: "pessoas",
    question: "Alguém saiu da farmácia. Como tiro o acesso?",
    keywords: "bloquear acesso demitido saiu usuário",
    answer: (
      <p>
        Quem administra abre Configurações, Usuários, “Editar” na pessoa, e “Bloquear acesso”. Ela não entra
        mais, e o que registrou continua no histórico com o nome dela. Dá para liberar de novo depois.
      </p>
    ),
  },
]
