#!/usr/bin/env bash
# Scans staged diff for private key patterns before commit.
# Non-zero exit blocks the commit.

set -euo pipefail

PATTERN='0x[a-fA-F0-9]{64}'

if git diff --cached | grep -Eq "$PATTERN"; then
  echo "ERROR: Staged diff contains what looks like a 64-hex-char private key."
  echo "Remove the secret before committing."
  exit 1
fi

exit 0
