#!/bin/bash
# ──────────────────────────────────────────────────────────────
# LinguaFlame — Load Images & Start (VPS tarafında çalıştır)
# ──────────────────────────────────────────────────────────────
set -e

cd "$(dirname "$0")"

echo "📥 Loading images from .tar files..."
docker load -i linguaflame-web.tar
docker load -i linguaflame-api.tar

echo "🚀 Starting containers..."
docker compose up -d

echo ""
echo "✅ App is running!"
echo "   Check logs: docker compose logs -f"
