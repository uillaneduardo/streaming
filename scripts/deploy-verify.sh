#!/usr/bin/env bash
# CenaLivre: deploy from main, rebuild assets, and verify origin vs Cloudflare.
set -Eeuo pipefail
cd "$(dirname "$0")/.."
if [[ ! -f .env ]]; then
  echo "Arquivo .env não encontrado. Configure as variáveis antes do deploy." >&2
  exit 1
fi
git checkout main
git pull --ff-only origin main
echo "Commit local: $(git rev-parse --short HEAD)"
sudo docker compose config --quiet
# Guard against deploying into a fresh empty database volume after a directory or
# Compose project-name change. A different volume would look like "lost" content.
if command -v python3 >/dev/null 2>&1; then
  expected_db_volume="$(sudo docker compose config --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["volumes"]["cenalivre_db"]["name"])')"
  previous_db_volumes="$(sudo docker volume ls --filter label=com.docker.compose.volume=cenalivre_db --format '{{.Name}}')"
  if [[ -n "$previous_db_volumes" ]] && ! grep -Fxq "$expected_db_volume" <<< "$previous_db_volumes"; then
    echo "ERRO: há outro volume persistente do banco CenaLivre, mas este Compose usaria $expected_db_volume." >&2
    echo "Volumes existentes: $previous_db_volumes" >&2
    echo "Confira o diretório/COMPOSE_PROJECT_NAME antes de atualizar. Nada foi recriado." >&2
    exit 1
  fi
fi
# Rebuild containers from scratch so stale local image layers cannot mask changes.
sudo docker compose build --no-cache web api
sudo docker compose up -d db
sudo docker compose run --rm migrate
sudo docker compose up -d --wait --no-deps --force-recreate api web
sudo docker compose ps -a
# Read the actual version file inside the running image.
expected="$(sudo docker compose exec -T web cat /usr/share/nginx/html/version.json | tr -d '\r\n')"
port="$(sudo docker compose port web 80 | sed -E 's/.*:([0-9]+)$/\1/' | tail -1)"
: "${port:=8088}"
local_url="http://127.0.0.1:${port}"
local_version="$(curl -fsS --max-time 15 "${local_url}/version.json" | tr -d '\r\n')"
if [[ "${local_version}" != "${expected}" ]]; then
  echo "ERRO: Nginx local está servindo versão diferente do container!" >&2
  echo "Container: ${expected}" >&2
  echo "Local: ${local_version}" >&2
  exit 1
fi
echo "Versão local verificada: ${expected}"
echo "Saúde da API:"
curl -fsS --max-time 15 "${local_url}/api/v1/health"; echo
domain="https://cenalivre.ulln.com.br"
if public_version="$(curl -fsS --max-time 20 -H 'Cache-Control: no-cache' "${domain}/version.json" | tr -d '\r\n')"; then
  if [[ "${public_version}" != "${expected}" ]]; then
    echo "ATENÇÃO: o domínio público entrega outra versão!" >&2
    echo "Domínio: ${public_version}" >&2
    echo "Container: ${expected}" >&2
    echo "Verifique o tunnel, rota de origem e Cache Rules/Purge Cache na Cloudflare." >&2
    exit 2
  fi
  echo "Versão publicada confirmada em ${domain}: ${public_version}"
else
  echo "ATENÇÃO: não foi possível verificar o domínio público; confira o túnel Cloudflare." >&2
  exit 3
fi
