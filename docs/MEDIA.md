# Biblioteca de Mídia — M1.3

## Operações
- Enviar até 10 imagens por vez, arrastar/soltar ou selecionar; PNG, JPEG, WebP e GIF.
- Organizar por categoria (pôster/banner/thumbnail/ícone/logo/outros), nome e tags; pesquisar, visualizar, editar, baixar, substituir mantendo URL e excluir.
- Escolher mídia existente nos campos de séries, episódios, banners, logotipo e favicon.
- Configurações → Uploads: limite 1–20 MB, até 2000 imagens e formatos permitidos.

## Segurança
- Autenticação e CSRF obrigatórios para escritas. Assinaturas de imagem verificadas pelo backend; SVG enviado é bloqueado.
- Acesso por equipe. Itens usados em conteúdo público/branding são acessíveis pelo portal; demais exigem acesso autorizado.
- Exclusão bloqueada se uma referência ativa existir em série, episódio, banner ou branding.

## Persistência
- Volume Docker 'cenalivre_media' guarda os arquivos; MariaDB guarda metadados no volume 'cenalivre_db'.
- Faça backup dos dois volumes conjuntamente. Não use 'docker compose down -v' durante atualização.
- Migrações '004_media.sql' e '005_branding.sql' aplicadas pelo Compose.
- SVGs de demonstração são estáticos na pasta 'apps/web/assets' e não gerenciáveis pela biblioteca.
- Sem transcodificação, edição gráfica, integração S3 ou antivírus nesta fase.

## Deploy
cd ~/homelab/apps/streaming
git checkout main && git pull --ff-only origin main
sudo docker compose config --quiet
sudo docker compose up -d --build
sudo docker compose ps -a
curl -fsS https://cenalivre.ulln.com.br/api/v1/health

## Interface M1.4
- Campos de pôster, banner, thumbnail, logo e ícone possuem prévia, escolha na Biblioteca e envio no próprio campo com progresso de bytes do navegador.
- O arquivo só é vinculado ao formulário após a confirmação HTTP do servidor; erros aparecem no campo e não apagam o restante do formulário.
- A galeria exibe ✎ para editar e × para excluir sobre as miniaturas ao passar o mouse ou focar pelo teclado.
- Configurações do Studio estão agrupadas em Identidade, Marca, Reprodução, Uploads e Segurança.
- O Nginx suporta até 21 MB de corpo por requisição para acomodar o limite máximo de 20 MB da API; o CI valida um PNG real de mais de 1 MB pelo proxy.
