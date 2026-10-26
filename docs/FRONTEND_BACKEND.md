# Frontend oficial e API independente

## Decisão
A interface aprovada em HTML/CSS/JavaScript é a interface oficial, sem redesign. Foi importada exatamente do último protótipo para `apps/web/`, separando CSS e JS, com as 24 artes SVG originais em `apps/web/assets/`.

## Arquitetura (primeiro corte)
- `apps/web`: Nginx + HTML/CSS/JS puro. Porta externa 8088. O proxy encaminha `/api/` ao serviço interno `api`.
- `apps/api`: Fastify + TypeScript + mysql2. Endpoints públicos de consulta e política de disponibilidade executada no servidor.
- `db`: MariaDB 11.4 com volume Docker.
- `migrate`: migração SQL idempotente + dados fictícios iniciais.

O Studio possui autenticação e operações editoriais selecionadas com persistência no servidor. A abertura offline do HTML continua apenas como demonstração. Qualquer operação hospedada não implementada permanece bloqueada, sem persistência fictícia.

## Endpoints funcionais
- `GET /api/v1/health`
- `GET /api/v1/public/bootstrap`
- `GET /api/v1/public/series/:slug`
- `GET /api/v1/public/episodes/:id`

O backend filtra rascunhos e suspensos, calcula janela disponível/futura/encerrada e **não retorna ID do YouTube** para capítulos que ainda não podem ser reproduzidos.

## Próxima etapa
Continuar com convites por e-mail, upload de imagens, gerenciamento de banners/CMS e permissões editoriais mais detalhadas.

## Atenção YouTube
YouTube não listado não garante sigilo pré-estreia: o link pode circular fora da plataforma.


## M1.1 — Identidade e autorização
- Sem cadastro público. Criação inicial do administrador ocorre por comando local no container, com credenciais fornecidas em variáveis de ambiente temporárias.
- Sessão armazenada no MariaDB, cookie HttpOnly, SameSite=Strict, token aleatório e sessões revogáveis. CSRF exigido nas operações autenticadas de escrita.
- Escopo de séries imposto na API por equipe e grants. Usuário/editor sem grant não edita série de outra equipe.
- Endpoints autenticados: `/api/v1/auth/login`, `/api/v1/auth/session`, `/api/v1/auth/logout`, `/api/v1/studio/bootstrap`, `/api/v1/studio/users`, `/api/v1/studio/teams/:teamId/members`, `/api/v1/studio/series/:id/grants`, `PUT /api/v1/studio/series/:id`, `POST /api/v1/studio/series/:id/visibility`.
- **M1.2:** criar/editar equipes, criar integrantes com senha inicial, editar membros, criar/editar séries, temporadas e episódios YouTube. Configurações globais persistidas por migration `003_settings.sql`. Operações hospedadas não implementadas (banners/CMS e upload) permanecem bloqueadas.
- Mantenha `COOKIE_SECURE=true` se usar HTTPS externo. Para acesso de teste via HTTP local use `false`, mas nunca disponibilize a autenticação em HTTP público.

## Contratos de gerenciamento M1.2
- `POST/PUT /api/v1/studio/teams[/:id]`: equipe (criação admin, edição admin/gestor).
- `POST/PUT /api/v1/studio/members[/:id]`: integrante e credencial inicial (admin). Conta existente deve ser vinculada via `PUT /api/v1/studio/teams/:teamId/members`.
- `POST /api/v1/studio/series`: produção com equipe(s) e estado inicial.
- `POST/PUT /api/v1/studio/seasons[/:id]`: temporadas autorizadas.
- `POST/PUT /api/v1/studio/episodes[/:id]`: episódio, datas UTC, ID/URL YouTube oficial.
- `GET/PUT /api/v1/studio/settings`: nome, descrição, contato e reprodução automática (admin).

Todas as escritas exigem sessão e CSRF; a API valida o escopo e deixa rastro na auditoria. O link não listado do YouTube não é DRM. A interface principal mantém sua identidade visual, mas as superfícies de login e modal são explicitamente claras para garantir contraste.
