#!/usr/bin/env bash
set -euo pipefail
URL="${1:-https://suknid.pages.dev}"
echo "smoke: $URL"
curl -sf "$URL/api/health" | jq -e '.ok and .d1=="ok" and .chain=="ok"' > /dev/null && echo "✓ health"
test "$(curl -sf "$URL/api/designs" | jq 'length')" = "15" && echo "✓ 15 designs"
curl -sf "$URL/api/metadata/1" | jq -e '.name and .image and .attributes' > /dev/null && echo "✓ metadata"
curl -sfo /dev/null "$URL" && echo "✓ root 200"
