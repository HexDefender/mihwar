#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "↪ Mihwar: applying database schema (prisma db push)..."
  ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss=false || {
    echo "Prisma db push failed. Trying migrate deploy as fallback..."
    ./node_modules/.bin/prisma migrate deploy || true
  }

  if [ "$RUN_SEED" = "true" ] || [ "$RUN_SEED" = "1" ]; then
    echo "↪ Mihwar: seeding database..."
    ./node_modules/.bin/tsx prisma/seed.ts || echo "Seed failed (non-fatal)."
  fi
fi

echo "↪ Mihwar: starting Next.js server on :${PORT:-3000}..."
exec "$@"
