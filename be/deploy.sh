#!/bin/bash
set -e

echo "=== [1/4] Pulling latest WrapFit code from Git ==="
git pull origin main

echo "=== [2/4] Shutting down current containers ==="
docker compose down

echo "=== [3/4] Rebuilding and starting WrapFit containers ==="
docker compose up --build -d

echo "=== [4/4] Cleaning up unused Docker images ==="
docker image prune -f

echo "=== WrapFit Container Status ==="
docker compose ps

echo "=== WrapFit Full-Stack deployed successfully! ==="
