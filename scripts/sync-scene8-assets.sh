#!/usr/bin/env bash
# Copy Flutter test_taking goldens for Remotion Scene 8 (phone + tablet: test → LP feed).
# Source: flutter_app/test/goldens/store/<lang>/test_taking/{phone|tablet}_<light|dark>/
# Dest:   learn.ai.video/public/assets/scene8/<lang>/{ios|tablet}/<light|dark>/s8_test_{unanswered,checked}.png
# Run: cd learn.ai.video && npm run sync:scene8

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VIDEO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$VIDEO_ROOT/.." && pwd)"
GOLDENS_STORE="$REPO_ROOT/flutter_app/test/goldens/store"
DEST="$VIDEO_ROOT/public/assets/scene8"
FALLBACK_LANG="en"

if [[ ! -d "$GOLDENS_STORE" ]]; then
  echo "ERROR: Flutter store goldens not found: $GOLDENS_STORE" >&2
  exit 1
fi

count=0
fallbacks=0

copy_step() {
  local src="$1" alt="$2" dest="$3"
  local pick="$src"
  if [[ ! -f "$pick" ]]; then
    pick="$alt"
    if [[ -f "$pick" ]]; then
      fallbacks=$((fallbacks + 1))
    fi
  fi
  if [[ -f "$pick" ]]; then
    mkdir -p "$(dirname "$dest")"
    cp -f "$pick" "$dest"
    count=$((count + 1))
  else
    echo "ERROR: missing $src and $alt → $dest" >&2
    exit 1
  fi
}

FB_ROOT="$GOLDENS_STORE/$FALLBACK_LANG"

for lang_dir in "$GOLDENS_STORE"/*; do
  [[ -d "$lang_dir" ]] || continue
  lang="$(basename "$lang_dir")"
  for theme in light dark; do
    for platform_key in phone tablet; do
      if [[ "$platform_key" == "phone" ]]; then
        out_platform="ios"
      else
        out_platform="tablet"
      fi
      combo="${platform_key}_${theme}"
      base_test="$lang_dir/test_taking/$combo"
      fb_test="$FB_ROOT/test_taking/$combo"
      out="$DEST/$lang/$out_platform/$theme"
      copy_step "$base_test/taking_unanswered.png" "$fb_test/taking_unanswered.png" "$out/s8_test_unanswered.png"
      copy_step "$base_test/taking_checked.png" "$fb_test/taking_checked.png" "$out/s8_test_checked.png"
    done
  done
done

echo "Synced $count files → $DEST (en fallbacks used: $fallbacks)"
echo "Remotion: scene8TestGoldenPath(unanswered|checked, ios|tablet, light|dark, locale)"
