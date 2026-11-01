#!/bin/sh
# Builds responsive WebP copies of every photo in docs/img/:
#   img/<name>-640.webp, img/<name>-1280.webp, img/<name>-1920.webp
# (sizes larger than the original are skipped). The original JPEGs stay as the
# fallback and as the social-share images. Re-run after adding a photo.
# Needs: cwebp (brew install webp) and sips (built into macOS).
set -e
cd "$(dirname "$0")/../docs/img"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for src in *.jpg; do
  name=${src%.jpg}
  width=$(sips -g pixelWidth "$src" | awk '/pixelWidth/ {print $2}')
  for w in 640 1280 1920; do
    [ "$w" -gt "$width" ] && continue
    out="$name-$w.webp"
    [ "$out" -nt "$src" ] && continue
    sips --resampleWidth "$w" "$src" --out "$tmp/$name.jpg" >/dev/null
    cwebp -quiet -q 78 -metadata none "$tmp/$name.jpg" -o "$out"
  done
done
