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

A API expõe catálogo, equipes, temporadas, episódios, mídia e CMS com autenticação, permissões e persistência no MariaDB. O portal hospedado consulta apenas a API e **não exibe dados fictícios como fallback**. A demonstração local pode ser aberta sem servidor via HTML. Os uploads são mantidos em volume Docker persistente.

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

**Instalação nova não cria séries ou equipes de demonstração.** Dados de exemplo estão isolados em `tests/fixtures/demo-catalog.sql` e só são carregados explicitamente nos testes. O serviço `migrate` registra as versões aplicadas para não repetir inserções ou estrutura do passado em deploys futuros. Em instalações antigas, os dados existentes são preservados e o baseline é registrado sem reinserir exemplos excluídos. Consulte [Migrações seguras](docs/MIGRATIONS.md).

Consulte [docs/FRONTEND_BACKEND.md](docs/FRONTEND_BACKEND.md) e [docs/DEPLOY.md](docs/DEPLOY.md).


## Deploy verificável (versão e cache)
A versão do frontend é calculada no build a partir dos arquivos reais e exposta no rodapé, no Studio e em `/version.json`. Cada build modifica os URLs de CSS e JS, e Nginx desabilita cache dos recursos de entrada.

Para reconstruir de forma limpa e comparar o container em execução com o domínio Cloudflare:

```bash
cd ~/homelab/apps/streaming
git checkout main && git pull --ff-only origin main
bash scripts/deploy-verify.sh
```

Se o script apontar diferença entre origem e domínio, verifique o endereço de destino no Cloudflare Tunnel e regras de cache; o deploy não altera nenhuma dessas configurações externas. Nunca execute `docker compose down -v` para atualizar.

### Player
Usa o YouTube IFrame Player API com botão Play/Pause no CenaLivre e controles nativos do YouTube para qualidade, faixas de áudio e legendas **quando disponíveis**. A escolha dessas faixas não é oferecida pela API pública do IFrame; o próximo episódio é comandado exclusivamente na navegação do CenaLivre.
