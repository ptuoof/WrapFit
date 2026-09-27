#!/bin/sh
set -e

echo "[WrapFit Docker] Applying database schema migrations..."
npx prisma db push --schema=be/prisma/schema.prisma --skip-generate

echo "[WrapFit Docker] Seeding default templates and demo user..."
npx tsx be/prisma/seed.ts || true

echo "[WrapFit Docker] Starting WrapFit Backend on port ${PORT:-5000}..."
exec node be/dist/index.js
