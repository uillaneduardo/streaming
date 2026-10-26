# CenaLivre

Portal gratuito para séries independentes, com temporadas, episódios e CMS colaborativo.

## Estrutura oficial

```text
apps/
  web/                 # Interface HTML/CSS/JavaScript oficial
    assets/            # 24 imagens SVG locais
    index.html
    styles.css
    app.js
    nginx.conf
  api/                 # Fastify/TypeScript + MariaDB
    src/
      domain/release.ts
      server.ts
    sql/001_initial.sql
prototype/             # Protótipo inicial simplificado, legado
docs/                  # Arquitetura, implantação, fluxo, roadmap
compose.yml            # web + api + migrate + db
```

### Progresso
A versão oficial do frontend foi importada do último protótipo aprovado e mantida visualmente inalterada; apenas CSS e JS foram separados do HTML. As imagens estão em `apps/web/assets/` e também funcionam com abertura direta de `apps/web/index.html`.

A API expõe catálogo e disponibilidade com regras de publicação no backend. O portal consulta a API quando servido por HTTP e usa dados fictícios locais como fallback offline. O **Studio ainda é demonstrativo**: suas ações gravam no `localStorage`, não na API. A autenticação, a persistência editorial e o RBAC por equipe serão vinculados nas próximas issues. Não use o Studio atual para gerir conteúdo real.

## Homelab
```bash
git clone https://github.com/uillaneduardo/streaming.git
cd streaming
cp .env.example .env
# Defina DB_PASSWORD e DB_ROOT_PASSWORD com senhas fortes
docker compose up -d --build
```
Acesse `http://IP-DO-HOMELAB:8088`.
```bash
curl -fsS http://localhost:8088/api/v1/health
curl -fsS http://localhost:8088/api/v1/public/bootstrap
```
Somente o serviço `web` publica uma porta no host. `api` e `db` ficam na rede interna do Docker.

Consulte [docs/FRONTEND_BACKEND.md](docs/FRONTEND_BACKEND.md) e [docs/DEPLOY.md](docs/DEPLOY.md).
