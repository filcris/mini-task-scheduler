#!/usr/bin/env sh
set -e

echo "⏳ A aguardar por PostgreSQL em db:5432..."
for i in $(seq 1 60); do
  nc -z db 5432 && break
  sleep 1
done

echo "🔧 Prisma generate & push"
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push --schema=prisma/schema.prisma

echo "🚀 Arrancar Nest"
node dist/main.js
