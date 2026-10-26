# CenaLivre — protótipo estático
Abra `index.html` diretamente ou execute `docker compose up -d --build` na raiz do repositório.
Os SVG em `assets/` são usados sem serviço externo. O player só funciona após adicionar um ID real do YouTube a um episódio liberado.
O conteúdo é fictício e o Studio não possui autenticação real. Os dados salvos usam localStorage.
Testes locais: `node --check prototype/app.js && node tests/static-smoke.cjs`.
## Limitações atuais
Esta é a baseline simplificada do GitHub, **não** a importação integral da versão ZIP com 24 imagens e CMS mais completo. Essa integração permanece na issue #1 antes da homologação visual.
