#!/bin/bash
# Deploys the whole stack on the VPS (run from the repo root, called by .github/workflows/deploy.yml).
# With APP_DOMAIN in .env, production mode: HTTPS through Caddy, internal ports closed (docker-compose.prod.yml).
set -e

COMPOSE="docker compose"
if grep -qE '^APP_DOMAIN=.+' .env 2>/dev/null; then
  COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
  echo "=== Production mode (HTTPS on $(grep -E '^APP_DOMAIN=' .env | cut -d= -f2)) ==="
fi

echo "=== [1/4] Pulling latest WrapFit code from Git ==="
git pull origin main

echo "=== [2/4] Building images ==="
$COMPOSE build

echo "=== [3/4] Starting containers (migrations run in the backend container) ==="
$COMPOSE up -d --remove-orphans

echo "=== [4/4] Cleaning up unused Docker images ==="
docker image prune -f

echo "=== WrapFit Container Status ==="
$COMPOSE ps

echo "=== WrapFit Full-Stack deployed successfully! ==="
