# Plano do site de casamento: Vicenzo & Flaviana

Ideias, decisões e próximos passos do projeto. A lista de presentes já está no ar em
https://casandinhos.vercel.app. Este documento organiza o resto.

---

## 1. Decisão de arquitetura: um site só, com várias seções

**Recomendação: um único site (um projeto na Vercel, um banco no Neon, um domínio), com uma
seção para cada funcionalidade.** Não um site para cada item.

Por quê:

| | Um site com seções | Um site por funcionalidade |
|---|---|---|
| Login do convidado | Um acesso serve para tudo (presentes, RSVP, fotos, quiz) | Um login por site, ou integração complicada entre eles |
| Dados | O RSVP alimenta a lista do buffet, o quiz e o mural usam a lista de convidados | Dados espalhados e duplicados |
| Variáveis de ambiente e deploy | Um lugar para configurar | N lugares (já vimos como uma variável faltando derruba o site) |
| Link para os convidados | Um só: `casandinhos.vercel.app` | Vários links para enviar e lembrar |
| Plano grátis | Cabe com folga | Multiplica uso de banco e de builds |

Organização sugerida das rotas (o app ainda não tem rotas: será preciso adicionar o `react-router`):

```
/                 Site principal: história, data, local, mapa, contagem regressiva
/presentes        Lista de presentes e cotas (já existe)
/confirmar        Confirmação de presença (RSVP)
/programacao      Cronograma do dia
/mural            Recados e votos
/musicas          Pedidos de música
/quiz             Quiz sobre o casal + ranking
/fotos            Álbum colaborativo (hub de fotos)
/padrinhos        Área restrita para padrinhos e madrinhas
/painel           Área dos noivos: presentes, convidados, RSVP, planejamento, checklist
```

**Seções liga/desliga por fase:** cada seção tem uma chave no painel (ou variável de ambiente) para
aparecer só quando fizer sentido. Exemplos: "fotos" só abre no dia; "RSVP" fecha no prazo; "programação"
aparece um mês antes.

**Exceção possível:** o planejamento financeiro dos noivos pode ficar fora do site (Notion ou
Google Sheets), se não valer o esforço de construir. Ver seção 6.

---

## 2. O essencial

### 2.1 Site principal
- História do casal (texto + fotos), data, horário, local com **mapa** (Google Maps embed, grátis) e
  botão "Como chegar" (link do Google Maps / Waze).
- **Contagem regressiva** até a cerimônia.
- Botão "Adicionar ao calendário" (arquivo `.ics`, gerado no próprio site).
- Prévia bonita ao compartilhar no WhatsApp (meta tags Open Graph com foto do casal).
- Domínio próprio é opcional (`.com.br` custa por volta de R$ 40/ano); o `.vercel.app` funciona.

### 2.2 Confirmação de presença (RSVP)
- O convite pode ser por **família/grupo**: cada convite tem um número máximo de pessoas, o que
  evita "+1" surpresa.
- Campos: vai / não vai, nomes dos acompanhantes, restrições alimentares, observações.
- Prazo de confirmação; depois disso o formulário fecha sozinho.
- Painel dos noivos: totais (confirmados, recusados, pendentes), filtro por restrição alimentar,
  exportar CSV para o buffet, botão "lembrar no WhatsApp" para quem não respondeu.
- **Ideia de acesso:** usar um **link pessoal** por convite (ex.: `/c/abc123`) em vez de email +
  senha. A pessoa abre o link e já está identificada. Funciona melhor com convidados mais velhos e
  pode valer para todas as seções. (A senha atual pode continuar como alternativa.)

### 2.3 Lista de presentes (já no ar)
Funcionando hoje: lista pública, carrinho, conflito "alguém escolheu antes", login só para
confirmar, "Meus presentes", links de inspiração, gestão de convidados.

---

## 3. Ideia guardada: cotas e Pix

**Cotas** são presentes "em dinheiro com propósito": lua de mel, jantar romântico, passeio,
eletrodoméstico grande dividido.

Modelo sugerido:
- Uma cota tem **valor por parte** e **número de partes**. Ex.: "Jantar em Paris": 10 cotas de
  R$ 100. Mostra barra de progresso ("6 de 10").
- Diferente dos itens físicos, uma cota **aceita várias pessoas** (a regra
  `MULTIPLOS_PRESENTEADORES=false` vale só para itens físicos).
- Entra no mesmo carrinho: o convidado pode levar um item físico e 2 cotas de uma vez.

**Pix sem custo (recomendado):**
- O site gera o **Pix "copia e cola" e o QR Code** da chave de vocês com o valor já preenchido
  (padrão BR Code do Banco Central, gerado no próprio navegador, sem banco intermediário e sem
  taxa).
- Limitação: Pix estático **não avisa o site** que o pagamento caiu. Fluxo: o convidado paga, clica
  em "Já fiz o Pix", e vocês confirmam no painel olhando o extrato.

**Pix automático (alternativa paga):** Mercado Pago, Efí etc. geram cobrança com aviso automático
(webhook), mas cobram taxa por transação e exigem cadastro. Só vale se o volume for grande.

---

## 4. Para os convidados

### 4.1 Cronograma do dia
- Cerimônia, coquetel, jantar, primeira dança, bolo, festa.
- No dia, destaca **"agora"** e **"a seguir"** pelo horário.
- Editável no painel (horários mudam).

---

## 5. Interativos e divertidos

### 5.1 Quiz "O quanto você conhece o casal?"
- Perguntas cadastradas no painel; cada convidado responde uma vez; ranking.
- **Modo telão:** uma página para projetar na festa com o ranking ao vivo e o prêmio para o
  vencedor.

### 5.2 Mural de recados
- Mensagens e votos; vocês aprovam antes de aparecer (moderação).
- **Modo telão:** slideshow dos recados durante a festa.
- Depois do casamento, exportar tudo como lembrança (PDF).

### 5.3 Pedidos de música
- Cada convidado sugere até 3 músicas; os outros votam.
- Página para o DJ com o ranking. Montar a playlist no Spotify é manual (copiar a lista).

### 5.4 Hub de fotos (álbum colaborativo)
**Objetivo:** durante e depois do evento, os convidados enviam as fotos que tiraram, todo mundo
consegue ver, e as fotos ficam guardadas.

Como fica no dia:
- **QR Code espalhado pelo salão** (mesas, bar, entrada) leva direto para `/fotos`, com envio de várias fotos de uma vez pelo
  celular. Sem cadastro: o QR já traz um código do evento, e a pessoa só digita o nome.
- Galeria com miniaturas, filtro por "quem enviou", e vocês podem esconder fotos (moderação).
- **Modo telão** com as fotos chegando ao vivo.
- Depois: baixar tudo em lote para guardar.

**Onde guardar as fotos (grátis):** o Neon guarda só os dados das fotos (quem enviou, quando,
link), nunca a imagem.

| Opção | Grátis | Prós | Contras |
|---|---|---|---|
| **Cloudflare R2** (recomendado) | 10 GB, sem custo de download | Barato de escalar, envio direto do celular | Gerar miniaturas é por nossa conta |
| Cloudinary | Cota mensal de "créditos" | Miniaturas e compressão automáticas, widget de upload | Cota acaba rápido com muitas fotos |
| Vercel Blob | Pouco espaço no plano grátis | Integra fácil com a Vercel | Enche rápido |
| Álbum compartilhado do Google Fotos | 15 GB por conta Google | Zero código: só um QR Code para o álbum | Fora do site, sem moderação nem telão |

Conta de espaço: 150 convidados × 20 fotos × 3 MB ≈ 9 GB. Por isso:
- **Comprimir no celular antes de enviar** (ex.: lado maior com 2560 px, cerca de 1 MB por foto)
  reduz para cerca de 3 GB.
- **Vídeos** pesam muito: limitar duração e tamanho, ou aceitar só fotos.
- Plano B sem esforço: pôr também o QR Code de um álbum do Google Fotos.

---

## 6. Para vocês dois (organização)

### 6.1 Painel de planejamento
- Orçamento (previsto × gasto), fornecedores (contato, contrato, status), pagamentos com
  vencimento e alerta do que vence na semana.
- **Honestidade:** é a parte com menos retorno para construir do zero. Um modelo pronto no
  Notion ou no Google Sheets resolve hoje. Construir só se quiserem tudo num lugar.

### 6.2 Checklist do casamento
- Tarefas por mês até a data (modelo pronto: 12 meses antes, 6 meses, 3 meses, 1 mês, semana,
  dia), com responsável (Vicenzo / Flaviana / os dois) e progresso.

### 6.3 Área dos padrinhos
- Um perfil "padrinho/madrinha" no mesmo login.
- Paleta de cores, roupas, horários de chegada, funções de cada um, ordem da entrada, grupo do
  WhatsApp.

---

## 7. Infraestrutura grátis

| Serviço | Para quê | Plano grátis |
|---|---|---|
| Vercel (Hobby) | Site + API | Suficiente para uso pessoal, não comercial |
| Neon (Free) | Banco: convidados, RSVP, presentes, recados, quiz | 0,5 GB por projeto: sobra muito para texto |
| Cloudflare R2 | Fotos | 10 GB |
| Google Maps (embed) | Mapa do local | Grátis para incorporar |
| Pix estático | Cotas | Sem taxa |

Cuidados:
- **Variáveis de ambiente:** `JWT_SECRET`, `DATABASE_URL` e afins sempre marcadas em Production.
- **Banco de desenvolvimento separado:** o `.env` local aponta para um banco Neon diferente do de
  produção. Bom manter assim (testes não mexem em dados reais), mas rodar as migrations nos dois.
- **Backup:** exportar o banco antes de cada migration (já feito na migração da lista pública).

---

## 8. Ordem sugerida (por fase do casamento)

1. **Agora:** site principal, RSVP, cotas com Pix.
2. **Cerca de 1 mês antes:** cronograma e área dos padrinhos.
3. **No dia:** hub de fotos, mural, pedidos de música, quiz, com páginas de telão.
4. **Depois:** álbum final, exportar recados, página de agradecimento com fotos.

Base técnica antes da fase 1: adicionar rotas (`react-router`), um "liga/desliga" de seções no
painel, e decidir se o acesso dos convidados passa a ser por link pessoal.

---

## 9. Pendências anotadas (26/11/2026)

### 9.1 Aguenta 150 acessos simultâneos? Verificado em 26/11/2026: sim
- **Banco:** produção usa a URL com pooling do Neon (`-pooler`) e o `PrismaClient` é único e
  reaproveitado. É o ponto que mais importava, e está certo.
- **Limites de taxa:** os das rotas da festa (recados, músicas, quiz, fotos) já são folgados,
  pensando em muita gente no mesmo Wi-Fi (mesmo IP).
- **Fotos:** vão direto do celular ao R2, sem passar pela função.
- **Teste de carga:** 150 conexões disparando sem parar (cerca de 1.000 req/s, de um único IP) fizeram a
  **proteção anti-DDoS da Vercel** (`X-Vercel-Mitigated: challenge`) bloquear o IP por alguns
  minutos. O servidor respondeu rápido até o bloqueio (mediana de cerca de 110 ms). 150 pessoas de verdade geram
  bem menos que isso (algumas req/s cada ao abrir uma página), então não deve disparar.
- **Atenção, risco real no dia:** na festa todos podem sair pelo **mesmo IP** (Wi-Fi do sítio). Se
  algo fizer requisições em excesso (ex.: telão atualizando muito rápido), o firewall pode
  desafiar o IP inteiro. Manter a atualização do telão em intervalos de alguns segundos ou mais
  e, se preciso, ajustar o Attack Challenge Mode / Firewall no painel da Vercel.
- Melhoria opcional: imagens de `/assets/brand` são servidas pela função sem cache longo; dá
  para mover os arquivos estáticos para a CDN da Vercel (rewrites só para `/api`).

### 9.2 Ideia da Flaviana: galhinhos contínuos na tela do convite
Na área perto de "abrir convite", ao rolar aparece uma linha/corte. Ideia: estender os galhinhos
decorativos da frente também para a parte de baixo, formando um **ramo contínuo e uniforme**, sem a
linha visível (gerar a arte com IA ou espelhar/continuar a ilustração existente).

### 9.3 Enxoval / presentes (feito em 26/11/2026, falta a migration em produção)
- **Preferência de cor** dos itens na tela do enxoval (ex.: uma das cores é **off-white**). Mostrar
  a cor preferida em cada item.
- **Opção de dar dinheiro via Pix** no enxoval (ver seção 3, cotas e Pix).
- **Mudar a frase do presente** para algo leve, no tom de: "Não precisa, mas se você quiser…".
