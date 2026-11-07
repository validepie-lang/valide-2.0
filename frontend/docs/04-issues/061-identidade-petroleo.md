# Issue 061: Identidade Petróleo

**Origem:** pedido do Marcus em 11/10/2026: "faça uma pesquisa direcionada novamente. Quero tirar esse visual genérico e entregar um design de qualidade... analise no Behance referência de cores, paleta, tipografia... compare com o nosso. Veja nossos pontos fracos e trabalhe neles."
**Status:** executada e validada na branch `visual/identidade-petroleo`. **Não está em produção:** muda a cara de todas as telas e revê duas decisões gravadas (16/09 e 07/10), então espera o Marcus olhar.

## Pesquisa

Busca no Behance ordenada por apreciações, sem limite de data, em 11 termos. Projetos abertos e analisados tela a tela:

| Projeto | Curtidas | Tipo | O que se leva |
| --- | --- | --- | --- |
| [Health Dashboard, Desktop App](https://www.behance.net/gallery/116700003/Health-Dashboard-Desktop-App-UIUX-Design) | 4.604 | painel de saúde | Um cartão cheio e escuro entre cartões brancos; título de saudação grande; uma família (Gilroy) |
| [Farmaxpress](https://www.behance.net/gallery/45754831/Farmaxpress) | 3.359 | marca de farmácia | Água sobre tinta escura: cor da categoria sem cruz nem símbolo |
| [Centrico Pharmacy](https://www.behance.net/gallery/127385565/Centrico-Pharmacy-Subscription) | 2.366 | marca de farmácia | Verde-azulado como cor de base |
| [Farmacia Panata](https://www.behance.net/gallery/62740621/Farmacia-Panata-_-Brand-identity) | 1.403 | marca de farmácia | Água com azul profundo |
| [BetterData, ERP de estoque](https://www.behance.net/gallery/223697459/BetterData-SaaS-Web-App-B2B-ERP-AI-Logistics-Dashboard) | 874 | estoque, tem a tela "Expiring products" | Monocromático, cor só no status; uma família (Inter) em 11 estilos; título em dois tons; barra empilhada de vencidos |
| [Pharmacy CRM Software](https://www.behance.net/gallery/225132705/Pharmacy-CRM-Software-UIUX-Design) | 715 | painel de farmácia | Tinta pinho `#002F34`, fundo de papel menta, botão escuro com texto claro, item ativo do menu cheio; uma família (General Sans) |
| [Smart Pharmacy CRM](https://www.behance.net/gallery/235517675/Smart-Pharmacy-CRM-Dashboard-UXUI-Design) | 734 | painel de farmácia | Descartado: escuro com azul elétrico, vitrine de marca |
| Aetna CRM (3.239), Sigma (1.674), Veri (3.094), Luna (2.273), Holo AI (2.102) | | saúde e SaaS | Descartados: lima neon, preto, foto e 3D. São vitrine de marca, não tela de trabalho |

Também medidas com fontTools: General Sans, Inter, Instrument Sans, Onest, Schibsted Grotesk, Geist, Bricolage Grotesque, Figtree, Urbanist e Manrope (algarismo tabular e desenho do zero). Comparação no nosso conteúdo em `06-validations/telas-novas/061/fontes-comparadas.png`.

## O que os mais bem avaliados têm e o Valide não tinha

| Ponto | Referências | Valide até 10/10 |
| --- | --- | --- |
| Cor ligada ao assunto | Saúde e farmácia: verde-petróleo, água, menta com tinta escura | Azul-ardósia com cinza frio, escolhido por ser neutro: a cara padrão de painel SaaS |
| Fundo | Papel com leve tom da marca | Cinza-azulado frio, o `slate` do Tailwind |
| Tipografia | Uma família, hierarquia por peso e tamanho | Duas (Inter e Mona Sans); Inter é a fonte padrão de interface gerada |
| Marca | Símbolo com cor própria, repetido no menu | Visto preto em quadrado branco |
| Cartões | Conteúdo enche o cartão | Quatro cartões de estado esticados até a altura do cartão principal, meio vazios; faixa colorida no topo, de modelo pronto |
| Título | Dois tons para guiar a leitura (BetterData, Pharmacy CRM) | Um tom só |

## Faz

- Paleta Petróleo nos dois temas (tokens em `design-system.md` seção 16, contraste conferido)
- Instrument Sans no lugar de Inter e Mona Sans
- Menta (`--mint`) só sobre superfície escura: logo e item ativo do trilho, botão do cartão cheio, segunda metade do título do login
- Logo: visto em menta sobre petróleo; no escuro, o inverso
- Cartões de estado sem a faixa no topo; na Home, 2 por 2 ao lado do cartão cheio, linhas da mesma altura
- Sombra com o matiz da marca

## Não faz

- Não muda as cores de status (regra 1 do CLAUDE.md)
- Não troca o logo de verdade: continua placeholder até a equipe decidir
- Não mexe na barra no topo do aviso do produto e na barra à esquerda das linhas: são o padrão de status da direção A, que continua
