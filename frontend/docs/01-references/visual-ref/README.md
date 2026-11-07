# Referência visual: MT, dashboard de cripto

Estudo de caso publicado pela designer Liliia ("MT, your financial hub"). Escolhido pelo Marcus em 07/10/2026 como base da linguagem visual do Valide. **É referência de web design, não de produto:** o MT mostra saldo e cotação, o Valide mostra validade de remédio na prateleira. Tudo o que vem daqui é traduzido para esse contexto.

As imagens ficam aqui só para consulta da equipe. Não vão para a interface, não vão para o deploy e não são nossas.

## As imagens

| Arquivo | O que mostra | Por que importa |
| --- | --- | --- |
| `crypto-dashboard-08.png` | **Home desktop, de frente.** A imagem principal | Trilho, herói, blocos, pilha de abas, recorte de canto |
| `crypto-dashboard-12.png` | Tela de ativos, desktop | Listas em faixa, card de resumo com botão claro |
| `crypto-dashboard-01.png` | Home em perspectiva | Confirma o gradiente dos cards |
| `crypto-dashboard-06.png` | Tela de ativos em perspectiva | Idem |
| `crypto-dashboard-10.png` | Paleta e tipografia (Mona Sans) | Os sete tons e a fonte |
| `crypto-dashboard-03.png`, `-13.png` | Celular | Card de saldo com três ações, barra inferior escura |
| `crypto-dashboard-02.png` | Wireframe a lápis | Mostra a grade por trás do visual |
| `crypto-dashboard-04.png`, `-05.png`, `-07.png`, `-09.png`, `-11.png` | Páginas do estudo de caso (persona, processo, cronograma) | Ícones de traço fino em círculo. O resto é apresentação, não interface |

> **Revista em 08/10/2026.** Um feedback de design apontou informação demais e cara de interface gerada, e parte do que veio daqui era decoração: vidro azul, pilha de abas, recorte de canto, ícone em quadrado, caixa alta pequena, centavos esmaecidos. Saíram. Ficaram o matiz único, o trilho lateral e o número herói, que serviam à hierarquia. Lição registrada: estudo de caso de portfólio é feito para ser visto uma vez; ferramenta de balcão é usada oito horas por dia. Leve a estrutura, não o enfeite. Ver `../design-system.md` seção 14.

## O que levamos

1. **Trilho lateral de ícones**, estreito e escuro, com rótulo curto embaixo de cada ícone. Tira a navegação do topo e deixa o conteúdo começar na primeira linha da tela. No Valide ele é escuro nos dois temas: é a âncora da marca.
2. **Um matiz só.** O MT inteiro é azul-ardósia, do quase preto ao céu claro, com um único acento luminoso (`#81BDFA`). Para o Valide isso vale mais do que para o MT: **se a interface é monocromática, as cores de validade são as únicas cores da tela**, e vermelho, amarelo e verde saltam sem precisar gritar. A nossa Ardósia já era quase este matiz, então a mudança é de temperatura, não de identidade.
3. **Número herói com centavos esmaecidos** e um rótulo pequeno em caixa alta em cima. "TOTAL BALANCE $28,200.00" vira "VALOR EM RISCO R$ 8.572,67".
4. **Blocos de mesmo formato lado a lado**, logo abaixo do herói, cada um com ícone em quadrado escuro, número e um indicador. Os quatro ativos do MT viram os quatro estados de validade.
5. **Pilha de abas**, com uma aberta mostrando o número grande. A sobreposição em perspectiva do MT ficou de fora: numa tela plana, os cantos arredondados de uma aba apareciam ao lado dos da seguinte e as laterais pareciam tortas. No Valide é um bloco único, arredondado por fora, com as abas separadas por linha fina. No MT são Cash, Investment e Crypto. No Valide são as três filas de trabalho do dia: retirar o vencido, vender primeiro o que vence, informar a validade que falta.
6. **Recorte de canto** com um botão circular de expandir encaixado na mordida do card. Usado uma vez por tela, no máximo, para não virar enfeite.
7. **Cards em vidro azul**: gradiente diagonal do tom mais claro para o mais escuro do mesmo matiz. Reservado para a pilha de abas, que é o elemento de assinatura.
8. **Botão principal claro no tema escuro** (céu pálido com texto escuro), como o "Buy" do MT.
9. **Listas em faixa**: linhas largas, ícone em círculo, valor à direita, linha em foco destacada por uma faixa mais clara.
10. **Mona Sans** no lugar da Inter. Mais larga e com mais caráter nos números, sem perder leitura.

## O que descartamos, e por quê

- **Verde menta como acento.** No MT é a cor de marca. No Valide, verde é "No prazo" e só isso.
- **Selos de variação verde e vermelho** ("+3,14%"). Vermelho é "Vencido". Usar vermelho para queda de valor ensinaria o usuário a ignorar o vermelho.
- **Minigráficos de cotação nos blocos.** Não temos série histórica por estado de validade, e desenhar uma linha sem dado por trás é inventar informação. No lugar entra uma barra de proporção, que é dado real.
- **Texto de 7 a 9px cinza sobre vidro.** Fica bonito no mockup e reprova contraste AA. Nada abaixo de 11px, e todo texto sobre vidro é conferido.
- **Botões com borda verde e vermelha** ("Buy", "Send"). Mesma razão das cores de status.
- **Cena 3D, notebook, pedras, luminária.** Apresentação do estudo de caso, não interface.

## Onde isso foi parar

Tokens e regras em `../design-system.md`, seção 12. Decisão registrada em `../../07-decisions/ux-decisions.md`, 07/10/2026.
