# Deploy no homelab (fase de separação)
O PR desta fase ainda precisa ser mergeado. Após merge, no Ubuntu Server:
```bash
cd ~/homelab/apps/streaming
git pull --ff-only origin main
cp -n .env.example .env
# Edite .env e substitua as senhas de desenvolvimento por valores fortes e distintos
sudo docker compose config --quiet
sudo docker compose up -d --build
sudo docker compose ps
curl -fsS http://127.0.0.1:8088/api/v1/health
curl -fsS http://127.0.0.1:8088/api/v1/public/bootstrap
```
O portal: `http://IP-DO-HOMELAB:8088`.
Os vídeos são incorporados via YouTube; não são hospedados localmente.
O Studio por enquanto apenas simula operações com `localStorage` e **não possui autenticação**. Evite disponibilizá-lo externamente até a próxima fase. A API é somente leitura.

Atualizações posteriores: `git pull --ff-only origin main && sudo docker compose up -d --build`. Execute migrações versionadas antes de novas releases.

## Criar o primeiro administrador (M1.1)
Após subir os serviços, o portal continua público e gratuito. O Studio exige uma conta administrativa.
Execute no shell do homelab (não há senha padrão; os valores são apenas temporários na sessão):
```bash
read -rp "E-mail do administrador: " BOOTSTRAP_EMAIL
read -rp "Nome de exibição: " BOOTSTRAP_NAME
read -rsp "Senha (mínimo 12 caracteres): " BOOTSTRAP_PASSWORD; echo
export BOOTSTRAP_EMAIL BOOTSTRAP_NAME BOOTSTRAP_PASSWORD

sudo --preserve-env=BOOTSTRAP_EMAIL,BOOTSTRAP_NAME,BOOTSTRAP_PASSWORD \
  docker compose exec -T \
  -e BOOTSTRAP_EMAIL -e BOOTSTRAP_NAME -e BOOTSTRAP_PASSWORD \
  api node dist/bootstrap.js

unset BOOTSTRAP_EMAIL BOOTSTRAP_NAME BOOTSTRAP_PASSWORD
```
Bootstrap só funciona antes da criação do primeiro administrador; não sobrescreve credenciais existentes.

Para sessão com HTTPS por Cloudflare Tunnel defina `COOKIE_SECURE=true` no `.env` e recrie o container API. Acesso com cookie Secure não funcionará em HTTP comum. Nunca exponha o login externamente sem HTTPS.

As credenciais não devem entrar no GitHub, no arquivo `.env` versionado nem nos logs do terminal. O Studio aceita login/logout, exibe somente as produções autorizadas e persiste **edição de séries**. Demais editores permanecem bloqueados até a implementação específica.
