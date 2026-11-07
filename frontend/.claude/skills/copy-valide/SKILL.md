---
name: copy-valide
description: Escreve ou revisa texto de interface do Valide em português do Brasil. Use ao nomear botão, escrever mensagem de erro, preencher estado vazio, redigir confirmação, rótulo de campo, tooltip ou texto de notificação.
---

# Escrever copy de interface do Valide

Quem usa o Valide é balconista de farmácia e dono de comércio pequeno, não usuário de produto de tecnologia. O texto precisa ser direto, concreto e sem jargão.

## Regras que não se negociam

1. **Nunca use travessão (em-dash).** Use vírgula, dois pontos, parênteses ou ponto final.
2. **Nada de tom robótico ou fofinho de startup.** Sem "Ops!", sem "Uhul!", sem "Algo deu errado", sem exclamação desnecessária.
3. **Sem jargão técnico.** Nada de "tenant", "endpoint", "payload", "token", "sincronizar", "instância". O usuário não sabe o que é isso.
4. **Voz ativa, sujeito claro.** "Não foi possível salvar o produto", não "O produto não pôde ser salvo".
5. **Frase curta.** Se passou de duas linhas, corte.
6. **Sem emoji na interface**, exceto os ícones do sistema de design.

## Padrões por tipo de texto

### Botões

Verbo no infinitivo, direto ao ponto. O botão diz o que acontece, não "OK".

| Ruim | Bom |
| --- | --- |
| OK | Salvar produto |
| Confirmar | Registrar saída |
| Enviar | Cadastrar empresa |
| Cancelar (em ação destrutiva) | Voltar sem salvar |

### Mensagens de erro

Três partes: o que aconteceu, por quê (se souber), o que fazer.

- "Não foi possível salvar o produto. Verifique a conexão e tente de novo."
- "Este SKU já está cadastrado. Use outro código ou edite o produto existente."
- "A data de validade não pode ser anterior à data de fabricação."
- "E-mail ou senha incorretos." (nunca revele se o e-mail existe)

Nunca mostre código de erro para o usuário. Nunca culpe o usuário.

### Estados vazios

Uma frase que explica, e o botão da ação que resolve.

- "Nenhum produto cadastrado ainda." com botão "Adicionar produto"
- "Nenhum produto vencido. Seu estoque está em dia." (este é bom notícia, o texto reconhece isso)
- "Nenhum resultado para essa busca. Tente outro termo ou limpe os filtros."
- "Sem notificações no momento."

### Confirmações de ação destrutiva

Diga o que vai acontecer e o que não tem volta.

- Título: "Excluir o produto Dipirona 500mg?"
- Corpo: "Os lotes e o histórico de movimentação também serão removidos. Não é possível desfazer."
- Botões: "Excluir produto" e "Voltar sem excluir"

### Rótulos de campo

Termo que o usuário usa no balcão, não o nome do campo no banco.

| Campo técnico | Rótulo na tela |
| --- | --- |
| `sku` | Código interno (SKU) |
| `barcode` | Código de barras |
| `minStock` | Estoque mínimo |
| `acquisitionCost` | Custo de compra |
| `expiresAt` | Data de validade |
| `folderId` | Pasta |

Texto de apoio abaixo do campo quando a regra não for óbvia: "Você recebe um alerta quando o estoque chegar nesse número."

### Status de validade

Sempre esses três termos, em toda a aplicação, sem sinônimo:

- **Vencido**
- **A vencer**
- **No prazo**

Nunca "expirado", "próximo do vencimento", "em dia", "regular". Consistência de vocabulário é o que faz o usuário confiar no painel.

### Notificações

Quem, o quê, quando. Sem rodeio.

- "O estoque de Dipirona 500mg chegou ao mínimo (5 unidades)."
- "Ana registrou a saída de 12 unidades de Amoxicilina 500mg."
- "3 lotes vencem nos próximos 7 dias."

### Números e datas

- Moeda: `R$ 4.280,00`
- Data: `30/11/2026`
- Data relativa quando ajuda: "vence em 4 dias", "venceu há 12 dias"
- Quantidade sempre com a unidade: "14 un", "2,5 kg", "3 cx"

## Ao revisar copy existente

Procure por: travessão, jargão técnico, "Ops", exclamação desnecessária, botão genérico ("OK", "Confirmar"), erro que não diz o que fazer, estado vazio mudo, e sinônimo de status fora do padrão.

Entregue a correção lado a lado, texto atual e texto proposto.
