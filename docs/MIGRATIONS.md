# Migrações seguras, catálogo sem dados fictícios

## Causa corrigida
Até o PR deste ajuste, `scripts/deploy-verify.sh` executava `docker compose run --rm migrate`; o serviço `migrate` percorria **todos** os arquivos SQL em cada atualização. O `001_initial.sql` continha 36 comandos `INSERT IGNORE` de equipes, séries, temporadas, episódios, banners e seções. Quando um usuário removia algum desses registros, o próximo deploy o criava novamente.

O frontend também mantinha um catálogo demonstrativo no `initial()` usado como fallback no ambiente hospedado. Esse fallback está desativado sob HTTP/HTTPS. A demo offline continua funcionando ao abrir o arquivo HTML diretamente.

## Funcionamento atual
- `001_initial.sql` contém exclusivamente o esquema de dados, sem inserção de conteúdo.
- A demonstração foi movida para `tests/fixtures/demo-catalog.sql`. **Somente CI/testes** carregam essa fixture explicitamente.
- `migrate` usa `scripts/migrate.sh`: tabela persistente `schema_migrations`, aplicação uma única vez, checksums para rejeitar alterações em migrações já aplicadas.
- Para bancos pré-existentes sem histórico, o migrador detecta as tabelas antigas e registra o baseline `001_initial.sql` sem refazer o carregamento de exemplos.
- Arquivos `002-006` continuam idempotentes e são registrados uma vez; futuras migrações devem ser novos arquivos numerados e nunca editar migrações registradas.
- Se um arquivo SQL falhar, **não recebe marca de aplicado** e o deploy para. DDL MariaDB não oferece rollback transacional completo: toda migração futura deve ser segura para retomada.
- O deploy alerta/bloqueia quando detecta volume CenaLivre anterior, mas a configuração Compose atual aponta para outro volume. Os volumes `cenalivre_db` e `cenalivre_media` permanecem persistentes e não devem ser apagados.
- A versão hospedada usa **somente** respostas reais da API; nenhum array de demonstração volta quando o servidor retorna lista vazia ou falha.

## Atualização
```bash
cd ~/homelab/apps/streaming
git checkout main
git pull --ff-only origin main
bash scripts/deploy-verify.sh
```

Não execute `docker compose down -v`, não altere o nome do projeto Compose ou o caminho dos volumes sem planejar migração dos dados.

Para ver o histórico das migrações, após a atualização:

```bash
sudo docker compose exec -T db sh -c 'MYSQL_PWD="$MARIADB_PASSWORD" mariadb -u "$MARIADB_USER" "$MARIADB_DATABASE" -e "SELECT name,legacy_baseline,applied_at FROM schema_migrations ORDER BY name"'
```

A migração **não exclui registros de demonstração já existentes**: alguns podem ter sido editados ou vinculados a conteúdo real. Para limpar o catálogo, use o Studio (com exclusão segura respeitando séries, temporadas, episódios e dependências) depois de revisar os registros.

## Proteção contra regressões
A CI verifica: instalação nova sem conteúdo; importação de fixture somente em teste; contas, API e editor funcionando; simulação de banco antigo com registros editados/excluídos; dois deploys consecutivos que **não** recriam as séries, temporadas, equipes ou seções removidas.
