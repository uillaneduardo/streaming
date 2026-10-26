# Frontend oficial e API independente

## Decisão
A interface aprovada em HTML/CSS/JavaScript é a interface oficial, sem redesign. Foi importada exatamente do último protótipo para `apps/web/`, separando CSS e JS, com as 24 artes SVG originais em `apps/web/assets/`.

## Arquitetura (primeiro corte)
- `apps/web`: Nginx + HTML/CSS/JS puro. Porta externa 8088. O proxy encaminha `/api/` ao serviço interno `api`.
- `apps/api`: Fastify + TypeScript + mysql2. Endpoints públicos de consulta e política de disponibilidade executada no servidor.
- `db`: MariaDB 11.4 com volume Docker.
- `migrate`: migração SQL idempotente + dados fictícios iniciais.

O Studio existente **permanece demonstrativo**, com CRUD usando localStorage, sem autenticação e sem gravação na API. Não o exponha publicamente para edição real. A API de agora é somente leitura; não existe endpoint de escrita sem autenticação.

## Endpoints funcionais
- `GET /api/v1/health`
- `GET /api/v1/public/bootstrap`
- `GET /api/v1/public/series/:slug`
- `GET /api/v1/public/episodes/:id`

O backend filtra rascunhos e suspensos, calcula janela disponível/futura/encerrada e **não retorna ID do YouTube** para capítulos que ainda não podem ser reproduzidos.

## Próxima etapa
Criar autenticação, convite de equipes, grants por série, CRUD granular e uploads de imagens no backend; só então vincular o Studio a persistência real, tela a tela, sem usar o localStorage como fonte da verdade.

## Atenção YouTube
YouTube não listado não garante sigilo pré-estreia: o link pode circular fora da plataforma.


## M1.1 — Identidade e autorização
- Sem cadastro público. Criação inicial do administrador ocorre por comando local no container, com credenciais fornecidas em variáveis de ambiente temporárias.
- Sessão armazenada no MariaDB, cookie HttpOnly, SameSite=Strict, token aleatório e sessões revogáveis. CSRF exigido nas operações autenticadas de escrita.
- Escopo de séries imposto na API por equipe e grants. Usuário/editor sem grant não edita série de outra equipe.
- Endpoints autenticados: `/api/v1/auth/login`, `/api/v1/auth/session`, `/api/v1/auth/logout`, `/api/v1/studio/bootstrap`, `/api/v1/studio/users`, `/api/v1/studio/teams/:teamId/members`, `/api/v1/studio/series/:id/grants`, `PUT /api/v1/studio/series/:id`, `POST /api/v1/studio/series/:id/visibility`.
- Nesta entrega, edição persistente do Studio é **somente edição de séries**; criação de séries, episódios, banners e equipes por interface ficam bloqueadas até os endpoints corretos.
- Mantenha `COOKIE_SECURE=true` se usar HTTPS externo. Para acesso de teste via HTTP local use `false`, mas nunca disponibilize a autenticação em HTTP público.
