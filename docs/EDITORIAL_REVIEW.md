# M2/M3 — Categorias e revisão editorial

## Categorias dinâmicas
- Studio → Configurações → Categorias: criar, renomear e excluir categorias sem séries vinculadas.
- Na criação/edição de séries, selecionar uma categoria existente ou criar uma nova diretamente no formulário (administradores).
- Categorias usadas por séries existentes são importadas **uma única vez** pela migração 008, sem conteúdo fictício.
- Renomear uma categoria também atualiza as séries vinculadas na mesma transação; histórico das séries preserva o valor antigo.
- A API preserva compatibilidade com séries legadas que guardam `category` como texto. A interface favorece o seletor de categorias.

## Histórico imutável
A migração 009 cria `editorial_versions`. Triggers do MariaDB registram automaticamente snapshots completos quando uma série, temporada, episódio ou banner é criado, atualizado ou excluído — incluindo ações em lote. Os snapshots são escritos na **mesma transação do dado alterado** e não dependem do navegador.
- Studio → Série/Temporada/Episódio/Banner → **Histórico**: versões, data, campos alterados e detalhes.
- Recuperação de uma versão anterior: restaura **somente metadados**, preservando status de publicação, vínculos e permissões atuais; a recuperação também gera uma nova versão e auditoria.
- O histórico de itens excluídos continua disponível para auditoria administrativa via API.
- Os snapshots não são editáveis manualmente nem armazenam senhas/tokens.

## Revisão e aprovação
- Um integrante com permissão de edição pode **Solicitar revisão**, vinculando o pedido à última versão registrada.
- Um usuário com permissão de publicação pode **Aprovar e publicar** ou **Rejeitar** com observação; membros comuns não podem aprovar seu próprio pedido. Administradores globais podem fazê-lo.
- Uma edição posterior torna a solicitação antiga inválida (**desatualizada**) e impede que se publique uma versão diferente da analisada.
- Aprovação de episódio exige data de estreia. Aprovação de série torna a série pública, aprovação de temporada publica a temporada, e aprovação de banner ativa a campanha.
- O fluxo é uma opção de revisão editorial **não obrigatória** para mudanças diretas autorizadas já existentes. Não substitui RBAC: as ações normais de publicação continuam exigindo permissão no backend.
- A trilha de aprovações/rejeições registra responsáveis e observações, separada do histórico imutável de conteúdos.

## Endpoints
- `GET/POST /api/v1/studio/categories`
- `PUT/DELETE /api/v1/studio/categories/:id`
- `GET /api/v1/studio/editorial/:kind/:id/history`
- `POST /api/v1/studio/editorial/:kind/:id/submit`
- `POST /api/v1/studio/editorial/:kind/:id/restore`
- `POST /api/v1/studio/editorial/reviews/:id/decision`

`kind`: `series`, `season`, `episode`, `banner`. A API exige sessão, CSRF nas escritas e permissões por série ou administração global para banners.

## Deploy no homelab

```bash
cd ~/homelab/apps/streaming
git checkout main
git pull --ff-only origin main
bash scripts/deploy-verify.sh
```

As migrações 008/009 preservam os conteúdos existentes e não recriam catálogos demonstrativos. Não use `docker compose down -v`. Os backups devem contemplar o banco para preservar todo o histórico.
