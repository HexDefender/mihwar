#!/bin/sh
set -e

echo "↪ Mihwar entrypoint starting..."
echo "   NODE_ENV=${NODE_ENV:-unset}"
echo "   PORT=${PORT:-unset}"
echo "   DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo NO)"
echo "   AUTH_SECRET set:  $([ -n "$AUTH_SECRET" ] && echo yes || echo NO)"
echo "   AUTH_URL=${AUTH_URL:-unset}"
echo "   RUN_SEED=${RUN_SEED:-unset}"

if [ -z "$DATABASE_URL" ]; then
  echo "FATAL: DATABASE_URL is not set. Container will exit."
  exit 1
fi

PRISMA="./node_modules/.bin/prisma"
TSX="./node_modules/.bin/tsx"

if [ ! -x "$PRISMA" ]; then
  echo "FATAL: prisma CLI not found at $PRISMA"
  ls -la ./node_modules/.bin/ | head -20 || true
  exit 1
fi

echo "↪ Mihwar: regenerating Prisma client (idempotent)..."
$PRISMA generate || {
  echo "ERROR: prisma generate failed"
  exit 1
}

echo "↪ Mihwar: applying database schema (prisma db push)..."
if $PRISMA db push --skip-generate; then
  echo "✓ Schema applied successfully."
else
  echo "ERROR: prisma db push failed. Container will exit so Coolify shows it failed."
  exit 1
fi

if [ "$RUN_SEED" = "true" ] || [ "$RUN_SEED" = "1" ]; then
  echo "↪ Mihwar: seeding database..."
  if $TSX prisma/seed.ts; then
    echo "✓ Seed complete."
  else
    echo "WARN: seed failed (non-fatal — container will keep running)."
  fi
else
  echo "↪ Mihwar: skipping seed (RUN_SEED is not 'true')."
fi

echo "↪ Mihwar: starting Next.js server on :${PORT:-3000}..."
exec "$@"
