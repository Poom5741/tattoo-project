#!/usr/bin/env bash
# Symlink all non-deprecated skills from the locally cloned
# mattpocock/skills repo into pi's global skill directory.
# Re-run after `git pull` to refresh the links.
set -euo pipefail

REPO="${MATTPOCOCK_SKILLS_REPO:-$HOME/.local/share/mattpocock-skills}"
DEST="$HOME/.pi/agent/skills"

if [ ! -d "$REPO" ]; then
  echo "error: repo not found at $REPO" >&2
  exit 1
fi

mkdir -p "$DEST"

count=0
while IFS= read -r -d '' skill_md; do
  src="$(dirname "$skill_md")"
  name="$(basename "$src")"
  target="$DEST/$name"

  if [ -e "$target" ] && [ ! -L "$target" ]; then
    rm -rf "$target"
  fi
  ln -sfn "$src" "$target"
  count=$((count + 1))
  echo "linked $name -> $src"
done < <(find "$REPO/skills" -name SKILL.md -not -path '*/deprecated/*' -print0)

echo ""
echo "Done. Linked $count skills into $DEST"
