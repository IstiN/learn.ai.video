# YouTube thumbnail sources

- **`source-thumbnail-light.jpg`** — base frame for **light** FullVideo uploads.
- **`source-thumbnail-dark.jpg`** — base frame for **dark** uploads.

Replace these files, then run `npm run youtube:thumbnail:all` (or `node scripts/generate-youtube-thumbnail.cjs --input-light … --input-dark … --all`).

Outputs: **`thumbnails/{locale_safe}_{light|dark}.png`**.
