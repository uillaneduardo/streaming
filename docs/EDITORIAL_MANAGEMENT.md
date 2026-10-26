# Gestão editorial do CenaLivre — CMS, banners e agenda

## Interface
As telas CMS da página inicial e Calendário editorial seguem o mesmo padrão de gerenciamento de Séries, Temporadas e Episódios. Disponibilizam busca, filtros, checkbox por linha e seleção de todos os resultados filtrados, ação em lote e confirmação.

### Banners e campanhas
- Buscar por título ou série, filtrar por destino e estado (no ar, programado, encerrado e inativo).
- Criar, editar, excluir individualmente, ativar/desativar ou excluir vários.
- Datas de início e término continuam determinando automaticamente quando a campanha fica visível; desativação remove do portal imediatamente.
- A exclusão de uma campanha não exclui sua série.

### Seções do portal
- Buscar por título/tipo e filtrar pela visibilidade.
- Criar, editar nome/tipo, alternar visibilidade, excluir e alterar ordem com setas.
- Ativar/desativar ou excluir vários itens de uma vez. A API guarda a ordem.
- Tipos disponíveis: Destaque, Últimos lançamentos, Próximas estreias e Todas as séries.

### Agenda editorial
- Filtrar episódios por série, estado editorial e data (anteriores, futuros, sem data).
- Criar ou editar um episódio, incluindo datas.
- Seleção múltipla para rascunho, agendado, publicado, suspenso e exclusão.
- Reagendar vários episódios para a mesma estreia e término opcionais, preservando o estado editorial atual.
- A API continua impedindo publicação sem data de estreia e aplicando todas as permissões por série.

## Integridade
- Banners e seções: somente administrador global. Escritas exigem sessão e CSRF.
- Mudanças em lote transacionais com auditoria de cada item; erro em um item desfaz toda a operação.
- Reagendamento exige edição autorizada e, para episódio publicado, também publicação autorizada.
- Formulários usam colunas flexíveis, altura mínima, espaçamento adequado e texto de etiquetas com quebra de linha.

## Atualização
```bash
cd ~/homelab/apps/streaming
git checkout main && git pull --ff-only origin main
bash scripts/deploy-verify.sh
```
