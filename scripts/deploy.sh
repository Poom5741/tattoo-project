#!/bin/bash
# Deploy to Cloudflare Pages
# Usage: bash scripts/deploy.sh

set -e

# Load token from .env.deploy
if [ -f .env.deploy ]; then
  export $(grep -v '^#' .env.deploy | xargs)
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN not found. Add it to .env.deploy"
  exit 1
fi

echo "🔨 Building..."
npx astro build

echo "🚀 Deploying to Cloudflare Pages..."
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN npx wrangler pages deploy dist --project-name=inknoir --branch=main

echo "✅ Done!"
