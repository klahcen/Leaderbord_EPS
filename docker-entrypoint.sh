#!/bin/sh
set -e

cd /app

echo "Applying database schema..."
npx prisma db push

echo "Starting Next.js on 0.0.0.0:${PORT:-3000}..."
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
