# M0 — Homologação automatizada do portal oficial

Esta entrega fecha os critérios verificáveis da issue [#1](https://github.com/uillaneduardo/streaming/issues/1), com **testes de navegador real** (Chromium) nas resoluções desktop **1440 × 900** e mobile **390 × 844**.

## Matriz de homologação

| Cenário | HTML local `file://` | Nginx/API HTTP |
|---|---|---|
| Página inicial, banner e artes | Desktop e mobile | Desktop e mobile |
| Grade padrão em todas as seções | Sim | Sim |
| Grade ↔ lista (séries e episódios) | Sim | Sim |
| Catálogo, pesquisa e navegação para série | Sim | Sim |
| Temporadas/episódios e navegação anterior/próximo | Sim | Sim |
| Episódio futuro sem botão de reprodução | Sim | Sim |
| Arquivos SVG carregados no navegador | Sim | Sim |
| Responsividade sem rolagem horizontal global | Sim | Sim |
| Studio (menu e todas as telas oficiais) | Demo local | Login obrigatório |
| Contraste/campos de criação e backdrop modal | Demo local | — |
| Exposição de ID do YouTube antes da estreia | Lógica de acesso da UI | API e testes de integração existentes |

**Não é um teste de reprodução de um vídeo real do YouTube:** essa parte depende do conteúdo, disponibilidade e autorização de incorporação pelo proprietário. A proteção de disponibilidade também possui testes próprios no backend.

## Execução

O GitHub Actions executa `tests/browser-m0.cjs` automaticamente depois de iniciar MariaDB/Nginx e inserir **somente no CI** as fixtures de teste. O script visita o portal e o Studio, simula interações e salva capturas de tela de cada modo e resolução.

As capturas são anexadas ao job como artefato **`m0-browser-acceptance`** (retenção 7 dias). Em caso de falha, uma captura com nome `FAILED-...` é produzida.

Para reproduzir localmente com a pilha de **testes** já provisionada:

```bash
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
CENALIVRE_TEST_BASE_URL=http://127.0.0.1:8088 node tests/browser-m0.cjs
```

**Não importe `tests/fixtures/demo-catalog.sql` em um homelab de produção**: a fixture deve ser usada apenas em banco descartável de testes. Em produção, o banco não recebe dados de exemplo automaticamente.

## Limites do aceite

O teste cobre emulação mobile do Chromium (390px) com eventos touch; **não equivale à homologação manual em aparelhos Android/iOS reais**. A prova automatizada roda antes do merge e novamente na `main`. A conferência final em dispositivos físicos pode ser documentada sem bloquear a entrega técnica.
