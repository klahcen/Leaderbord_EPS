#!/bin/sh
set -e

cd /app

if [ -z "$DATABASE_URL" ]; then
  echo "FATAL: DATABASE_URL is not set."
  echo "Railway: open Leaderbord_EPS → Variables → add DATABASE_URL = \${{Postgres.DATABASE_URL}}"
  exit 1
fi

apply_schema() {
  i=1
  while [ "$i" -le 60 ]; do
    echo "Applying database schema (attempt $i/60)..."
    if npx prisma db push --skip-generate; then
      echo "Database schema is ready."
      return 0
    fi
    sleep 5
    i=$((i + 1))
  done
  echo "WARNING: Could not sync schema after 60 attempts. Check Postgres is linked and online."
  return 1
}

apply_schema &

echo "Starting Next.js on 0.0.0.0:${PORT:-3000}..."
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
