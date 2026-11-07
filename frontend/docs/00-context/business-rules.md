# business-rules.md: Regras de Negócio do Valide

Regras que a interface precisa respeitar e refletir. A maior parte delas é **implementada pelo backend**, e o frontend apenas exibe e dá feedback. Onde o frontend calcula algo, está marcado.

---

## 1. Validade

### 1.1. Os quatro estados

| Estado | Condição |
| --- | --- |
| **Vencido** | Data de validade anterior a hoje |
| **A vencer** | Vence hoje ou dentro da janela configurada |
| **No prazo** | Vence depois da janela |
| **Sem validade** | Produto sem nenhum lote cadastrado |

### 1.2. Janela de "a vencer"

**30 dias**, como padrão, configurável por conta. Fechado pela equipe em 16/09/2026.

A constante vive em `src/lib/utils/expiry.ts`, nunca espalhada pelas telas.

### 1.3. Quem calcula

O **backend** calcula e devolve o status pronto em cada lote. O **frontend** tem a função `getExpiryStatus` para dar feedback imediato no formulário, antes de salvar. A regra de negócio mora no servidor.

### 1.4. Regras invioláveis de exibição

1. **Produto sem lote nunca aparece como "no prazo".** Confundir "não sei a validade" com "está tudo certo" dá ao usuário uma segurança que ele não tem. É o pior erro que esta interface pode cometer.
2. O contador de "No prazo" no dashboard conta apenas produtos com validade conhecida.
3. Status nunca é comunicado só por cor. Sempre cor mais ícone mais rótulo.
4. Vermelho, amarelo e verde só comunicam validade. Nunca botão, badge ou decoração.

### 1.5. Status do produto quando tem vários lotes

O produto assume o status do **lote que vence primeiro**. Um produto com um lote vencido e dois no prazo aparece como vencido, porque há algo para resolver nele.

---

## 2. Lotes

- Um produto pode ter vários lotes
- Cada lote tem: código, data de fabricação (opcional), data de validade (obrigatória), quantidade
- A quantidade total do produto é a soma das quantidades dos lotes
- **Validação de frontend:** data de validade não pode ser anterior à data de fabricação
- **Validação de frontend:** ao cadastrar um lote já vencido, a interface avisa mas não impede. Produto vencido no estoque existe e precisa ser registrado para ser descartado

---

## 3. Baixa de estoque

### 3.1. Motivos

Obrigatório escolher um: **venda**, **avaria**, **roubo**, **vencimento**, **consumo interno**.

O motivo é o que permite ao gestor entender onde está a perda, e é a base do argumento comercial do produto.

### 3.2. FEFO: primeiro a vencer, primeiro a sair

Ao dar baixa, o sistema **sugere** o lote que vence primeiro, já pré-selecionado e sinalizado.

Sugere, não obriga. Se o balconista precisa dar baixa em outro lote, ele troca. Interface que força a regra quebra o trabalho real de quem está no balcão.

### 3.3. Registro automático

Toda baixa registra usuário, data e hora, a partir do token. O usuário não escolhe nem edita esses campos.

### 3.4. Validações de frontend

- Quantidade não pode ser maior que a disponível no lote
- Quantidade não pode ser zero ou negativa
- A tela mostra o resultado no estoque antes de confirmar

### 3.5. Correção de movimentação (13/10/2026, issue 073)

O histórico é imutável: nenhuma entrada ou saída é apagada ou editada depois de registrada. Quando uma está errada, **registra-se um AJUSTE** (tipo que o banco já tem) com:

- a diferença entre o que foi registrado e o que aconteceu (saída de 6 que eram 2: o ajuste devolve 4 ao lote; entrada de 30 que eram 24: o ajuste tira 6);
- justificativa obrigatória;
- o vínculo com a movimentação corrigida, que passa a aparecer como "Corrigida".

Cada entrada ou saída se corrige uma vez, e um ajuste não se corrige. Quem corrige: Farmacêutico e Administrador (o banco diz que o nível 2 autoriza ajustes). O ajuste não deixa o lote negativo.

O "Desfazer" logo depois de registrar uma saída (issue 072) é o mesmo princípio, mais curto: o servidor grava um estorno.

---

## 4. Multi-tenant

- Uma conta representa uma empresa
- Uma conta pode ter vários usuários
- **Um usuário nunca acessa dado de outra conta**
- O tenant é inferido do token, **nunca enviado pelo cliente**

Isso é isolamento de dados, implementado e garantido pelo backend. O frontend não tem e não deve ter mecanismo para escolher conta.

---

## 5. Permissões por cargo

Três cargos, conforme a tabela `perfil_acesso` do banco (07/10/2026), em ordem de nível: Balconista, Farmacêutico, Administrador. Substituem os antigos Operador e Administrador.

| Ação | Balconista | Farmacêutico | Administrador |
| --- | --- | --- | --- |
| Ver dashboard e estoque | Sim | Sim | Sim |
| Cadastrar produto | Sim | Sim | Sim |
| Registrar baixa (venda, roubo, consumo interno) | Sim | Sim | Sim |
| Informar lote e validade | Sim | Sim | Sim |
| **Descartar por vencimento ou avaria** | **Não** | Sim | Sim |
| **Corrigir uma movimentação (ajuste)** | **Não** | Sim | Sim |
| Importar catálogo | Não | Não | Sim |
| Gerenciar pastas | Não | Não | Sim |
| Gerenciar usuários | Não | Não | Sim |
| Configurações da empresa | Não | Não | Sim |

A regra do descarte vem do banco. O resto da coluna Farmacêutico é proposta do frontend, pelo menor privilégio: o Farmacêutico recebe o que o Balconista tem mais o descarte, e o que era só do administrador continua só dele. **A confirmar com o Pedro.**

Quem sai da farmácia tem o acesso **bloqueado**, nunca apagado (`usuarios.ativo`). O histórico de movimentação continua apontando para a pessoa.

**Regra:** a interface **esconde** o que o cargo não pode fazer, o servidor **bloqueia**. Esconder sem bloquear não é segurança, é aparência de segurança.

Quando o usuário chegar em uma rota sem permissão, a tela explica que o cargo atual não tem acesso, sem deixar ele em beco sem saída.

---

## 6. Entrada de dados

Decidido em 16/09/2026. Estratégia completa em `01-references/import-strategy.md`.

- O caminho principal é **importar o catálogo** do sistema que a farmácia já usa
- **Duas origens no piloto**, um fluxo só: arquivo (CSV ou XLSX) e cadastro manual. A integração por API com o sistema da farmácia saiu do escopo em 17/09 e volta como projeto futuro
- **A importação traz o catálogo, não a validade.** O cliente informa lote e validade depois
- Produto importado sem lote nasce no estado "sem validade"
- Reimportação decide entre criar e atualizar por identificador externo, código de barras, ou SKU (ordem a confirmar com o backend)

---

## 7. Estoque mínimo

- Cada produto tem um estoque mínimo configurável
- Quando a quantidade total chega nesse número, o sistema gera notificação
- O alerta de estoque mínimo é **independente** do status de validade. São dois problemas diferentes e não se misturam visualmente

---

## 8. Valores monetários

- Sempre em **centavos, número inteiro**, no contrato e no estado da aplicação
- A formatação para exibição acontece só na camada de apresentação, com `Intl.NumberFormat('pt-BR')`
- Preço de venda deve ser maior que o custo de compra (aviso de frontend, não bloqueio)

### Valor em risco

Soma do custo de aquisição dos produtos com status **vencido** mais **a vencer**.

**Não inclui produto sem validade**, porque não se sabe se está em risco. Produtos sem validade têm seu próprio indicador de valor parado.

---

## 9. Pastas de classificação

- Um produto pertence a no máximo uma pasta
- Produto pode ficar sem pasta
- Pasta com produtos só é excluída dizendo para onde eles vão: outra pasta ou "Sem pasta" (13/10/2026, issue 076, item 110). Sem destino, o servidor recusa
- Pastas não são hierárquicas nesta versão

### 9.1. Pasta ativa e desativada (13/10/2026, issue 076, item 65)

- Toda pasta nasce ativa. Só o Administrador desativa e ativa de novo
- Pasta desativada não aparece como escolha: cadastro e edição de produto, mover de pasta, filtro do Estoque, destino ao excluir outra pasta
- Os produtos continuam nela e aparecem normalmente em todo lugar. Quem edita um produto que está numa pasta desativada a vê escolhida, marcada "(desativada)", e pode deixá-lo lá
- O selo "Desativada" é neutro: verde e vermelho são de validade

---

## 10. Fora do escopo desta versão

Sem tela e sem regra implementada. Se alguém pedir, estão no backlog como posteriores.

- Cobrança e assinatura (billing)
- Gestão de múltiplas filiais
- Leitor de QR Code
- Contagem rápida de estoque
- Acesso master a todos os módulos
- Relatórios financeiros avançados
- Integração com nota fiscal, meios de pagamento e maquininha
