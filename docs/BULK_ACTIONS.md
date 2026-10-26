# Ações em lote no Studio — M1.5

## Operação
Nas telas Séries, Temporadas e Episódios, selecione um ou mais itens com as caixas na primeira coluna. Use o checkbox do cabeçalho para selecionar **todos os resultados filtrados**. A seleção continua ativa se mudar os filtros; o contador mostra o total selecionado. Para remover a seleção, clique em "Limpar seleção".

Na barra "Ação em lote" é possível marcar os selecionados como rascunho, publicados ou suspensos. Episódios também permitem "Agendado". O estado "Publicado" de séries corresponde internamente à visibilidade "public".

Antes de aplicar, uma modal informa a quantidade de itens e a operação. O processamento é **atômico**: se um item não puder ser alterado, a operação inteira será cancelada, sem alterações parciais. Máximo 100 itens por operação.

## Publicação por nível
- Série: rascunho, publicada, suspensa.
- Temporada: rascunho, publicada, suspensa. Temporadas existentes mantêm o status publicado durante a migração; novas temporadas são rascunhos por padrão.
- Episódio: rascunho, agendado, publicado, suspenso. Agendar/publicar exige uma data de estreia previamente configurada.
- Só aparecem no portal episódios de temporadas publicadas pertencentes a séries públicas. As janelas de estreia e expiração dos episódios continuam válidas.
- Publicar ou retirar conteúdo publicado exige autorização de publicação por série. Edições não autorizadas são rejeitadas pela API.

## Exclusão
Ações de remoção solicitam confirmação e não apagam dependências silenciosamente. Séries com temporadas ou banners e temporadas com episódios não podem ser excluídas. Para apagar uma produção completa, remova os episódios, depois as temporadas e só então a série.

## API
`POST /api/v1/studio/bulk`

Corpo:
```json
{"resource":"episodes","action":"set_status","status":"draft","ids":["<id-1>","<id-2>"]}
```

Outras operações: `action: "delete"`, sem `status`. `resource` admite `series`, `seasons`, `episodes`. A API valida sessão, CSRF, IDs únicos, RBAC, referências, datas e estados, e gera auditoria por item. Operações usam transação MariaDB para evitar atualizações parciais.

## Deploy
As alterações dependem da migração SQL `006_season_status.sql`, aplicada pelo Compose automaticamente, sem apagar temporadas existentes.

```bash
cd ~/homelab/apps/streaming
git checkout main && git pull --ff-only origin main
bash scripts/deploy-verify.sh
```
