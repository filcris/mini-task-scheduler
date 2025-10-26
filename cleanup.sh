#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Cleaning generated and unnecessary files (safe for git repos)"
# Root-level common junk
rm -rf node_modules dist coverage build out .cache   .DS_Store Thumbs.db .idea .vscode   npm-debug.log* yarn-error.log* pnpm-debug.log* || true

# Backend
if [ -d "backend" ]; then
  (cd backend && rm -rf node_modules dist coverage     npm-debug.log* yarn-error.log* pnpm-debug.log*     prisma/dev.db prisma/*.sqlite .DS_Store .idea .vscode || true)
fi

# Frontend
if [ -d "frontend" ]; then
  (cd frontend && rm -rf node_modules dist build coverage     npm-debug.log* yarn-error.log* pnpm-debug.log*     .DS_Store .idea .vscode || true)
fi

echo "✅ Done."
echo "Tip: make sure only ONE lockfile is committed per workspace (e.g., package-lock.json for npm)."
