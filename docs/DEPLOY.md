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
