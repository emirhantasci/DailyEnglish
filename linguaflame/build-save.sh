#!/bin/bash
# ──────────────────────────────────────────────────────────────
# LinguaFlame — Build & Export Images
# Bu scripti MAC'inde çalıştır. İmajları build edip .tar olarak
# dışa aktarır. Sonra VPS'e scp ile atabilirsin.
# ──────────────────────────────────────────────────────────────
set -e

cd "$(dirname "$0")"

echo "🔨 Building web image..."
docker build -t linguaflame-web:latest -f Dockerfile .

echo "🔨 Building api image..."
docker build -t linguaflame-api:latest -f api/Dockerfile .

echo "📦 Exporting images to .tar files..."
docker save -o linguaflame-web.tar linguaflame-web:latest
docker save -o linguaflame-api.tar linguaflame-api:latest

echo ""
echo "✅ Done! Files ready:"
ls -lh linguaflame-web.tar linguaflame-api.tar
echo ""
echo "🚀 Next: Copy these to your VPS and run load-images.sh there:"
echo "   scp linguaflame-web.tar linguaflame-api.tar docker-compose.yml .env user@VPS_IP:~/linguaflame/"
