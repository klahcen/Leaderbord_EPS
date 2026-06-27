#!/bin/sh
set -e

cd /app

if [ -z "$DATABASE_URL" ]; then
  echo "FATAL: DATABASE_URL is not set on the Railway app service."
  echo "Railway → Leaderbord_EPS (web app) → Variables → DATABASE_URL = \${{Postgres.DATABASE_URL}}"
  exit 1
fi

apply_schema() {
  i=1
  while [ "$i" -le 30 ]; do
    echo "Applying database schema (attempt $i/30)..."
    if npx prisma generate && npx prisma db push --skip-generate; then
      echo "Database schema is ready."
      return 0
    fi
    sleep 3
    i=$((i + 1))
  done
  echo "FATAL: Could not sync schema. Check Postgres is linked to the app service."
  return 1
}

run_seed() {
  if [ "${RUN_DB_SEED:-true}" = "false" ]; then
    echo "Skipping database seed (RUN_DB_SEED=false)."
    return 0
  fi

  i=1
  while [ "$i" -le 5 ]; do
    echo "Seeding students (attempt $i/5)..."
    if npx prisma db seed; then
      echo "Database seed completed."
      return 0
    fi
    sleep 3
    i=$((i + 1))
  done

  echo "WARNING: Startup seed failed. /api/health will retry automatically."
}

apply_schema
run_seed

echo "Starting Next.js on 0.0.0.0:${PORT:-3000}..."
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
