#!/usr/bin/env bash
# Copy store_solution_chat.png goldens for Remotion Scene 4 (phone + tablet).
# Run: cd learn.ai.video && npm run sync:scene4

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VIDEO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$VIDEO_ROOT/.." && pwd)"
GOLDENS="$REPO_ROOT/flutter_app/test/goldens"
DEST="$VIDEO_ROOT/public/assets/scene4"

if [[ ! -d "$GOLDENS" ]]; then
  echo "ERROR: Flutter goldens not found: $GOLDENS" >&2
  exit 1
fi

FILES=(store_solution_chat.png)
PLATFORMS=(ios tablet)
THEMES=(dark light)

count=0
for lang_dir in "$GOLDENS"/*; do
  [[ -d "$lang_dir" ]] || continue
  lang="$(basename "$lang_dir")"
  for platform in "${PLATFORMS[@]}"; do
    for theme in "${THEMES[@]}"; do
      src_base="$lang_dir/$platform/$theme"
      [[ -d "$src_base" ]] || continue
      out="$DEST/$lang/$platform/$theme"
      mkdir -p "$out"
      for f in "${FILES[@]}"; do
        if [[ -f "$src_base/$f" ]]; then
          cp -f "$src_base/$f" "$out/$f"
          count=$((count + 1))
        fi
      done
    done
  done
done

echo "Synced $count files → $DEST"
