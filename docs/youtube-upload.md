# YouTube: config, render, upload

## API key vs OAuth

- **API key**: only for public reads (e.g. listing public videos). **Cannot** upload to your channel.
- **OAuth 2.0 (Desktop app)**: required for `videos.insert`. You sign in once in the browser; the script stores a **refresh token** in `.youtube-token.json` (gitignored).

## One-time Google Cloud setup

1. [Google Cloud Console](https://console.cloud.google.com/) → project → **APIs & Services** → **Library** → enable **YouTube Data API v3**.
2. **Credentials** → **Create credentials** → **OAuth client ID** → Application type **Desktop app** → Create → **Download JSON**.
3. Save the file as `learn.ai.video/secrets/youtube-oauth-client.json` (folder is gitignored).
4. Open the OAuth client in the console → **Authorized redirect URIs** → add exactly:
   - `http://127.0.0.1:8765/oauth2callback`
5. If the consent screen is in **Testing**, add your Google account as a **Test user** (the exact Gmail you use in the browser). Otherwise Google shows **403: access_denied** (“has not completed verification”).

Quota: each upload costs about **1600 units** (default daily quota 10 000). Batch uploads may need a quota increase in Google Cloud.

## OAuth only (no renders required)

Starts the local callback server and opens the browser so `.youtube-token.json` is created. Run this once before uploads (or use `--force` to replace the token):

```bash
cd learn.ai.video
npm run youtube:oauth
```

- **`npm run youtube:oauth -- --force`** — delete existing token and sign in again.

## Config: `data/youtube-videos.json`

Single committed file: **locale × theme** rows with **title**, **description**, and optional **`video`** (filled after upload).

Generate or refresh rows from supported locales:

```bash
cd learn.ai.video
npm run youtube:config:sync
```

Options (see `scripts/sync-youtube-videos-config.cjs`):

- `--themes light,dark` (default: both)
- `--only-new` — keep existing `title`, `description`, and `video`; only append missing locale/theme rows

### English locales (single asset)

`en-GB`, `en-CA`, and `en-AU` share the same VO and copy as **`en-US`**. FullVideo **render**, **YouTube JSON**, and **thumbnail `--all`** only include **`en-US`** for English (see `readFullVideoLocales` in `scripts/lib/read-supported-locales.cjs`). Studio still lists all locale compositions for previews.

### Store-aligned copy (default)

On a full sync (without `--only-new`), each row’s **title** and **description** are filled from **`flutter_app/fastlane/metadata`**: Android `title.txt` + `full_description.txt` when present, otherwise iOS `name.txt` + `description.txt`, with fallbacks (`en-US`, locale aliases such as `en-GB` → `en-US`). **Title** adds a theme suffix (` · Light` / ` · Dark`, max 100 characters). **Description** is truncated to YouTube’s **5000** character limit.

Edit the Fastlane store files, then run `npm run youtube:config:sync` again to refresh YouTube JSON. For locales with no store folder, the script uses `en-US` Android copy.

### Custom thumbnail (localized)

YouTube does **not** auto-use a frame from your landing page. After each upload, the script calls **`thumbnails.set`** if a **PNG/JPEG** exists under `assets/youtube/thumbnails/`.

**Copy** lives in **`data/youtube-thumbnail-strings.json`**: per language, four **`line` + `accent`** pairs (e.g. «УЧЕБА БЕЗ СЛЁЗ» with accent «БЕЗ СЛЁЗ») plus a localized **subline** (e.g. «Обзор FamilyLearn.ai»). Hook index = **`hash(locale:theme) % 4`**. Override with **`--variant 0`** … **`3`**.

**Bases** (your art): **`assets/youtube/source-thumbnail-light.jpg`** and **`source-thumbnail-dark.jpg`**. Overlay: Montserrat ExtraBold (embedded), white text + dark stroke, accent in **gold (#FFD700)** or **cyan (#00E5FF)**, ~−3.5° tilt, soft glow, vignette, URL **familylearn.ai** bottom-left (YouTube timecode safe zone).

1. Generate **1280×720** **PNG** (JPEG fallback if &gt;2MB):

   ```bash
   npm run youtube:thumbnail              # en-US, light + dark → thumbnails/en_US_light.png, en_US_dark.png
   npm run youtube:thumbnail:all          # 38 locales × 2 themes
   ```

   Replace bases:

   ```bash
   node scripts/generate-youtube-thumbnail.cjs --input-light ./my-light.jpg --input-dark ./my-dark.jpg --all
   node scripts/generate-youtube-thumbnail.cjs --locale ru-RU --theme light --variant 0
   ```

2. **Upload** uses **`assets/youtube/thumbnails/{locale_safe}_{theme}.png`** (or `.jpg`), then legacy **`{locale_safe}.jpg`**, then **`youtube_thumbnail_file`**. Env **`YOUTUBE_THUMBNAIL_FILE`** forces one file for every upload.

Schema (v2):

```json
{
  "schema_version": 2,
  "render_path_pattern": "out/FullVideo/{theme}/{locale_safe}.mp4",
  "youtube_thumbnail_file": "assets/youtube/promo-thumbnail.jpg",
  "videos": [
    {
      "locale": "en-US",
      "theme": "light",
      "composition_id": "FullVideo-en-US-Light",
      "title": "…",
      "description": "…",
      "video": null
    }
  ]
}
```

After a successful upload, `video` is set to something like:

```json
{
  "youtube_video_id": "…",
  "url": "https://www.youtube.com/watch?v=…",
  "uploaded_at": "2026-04-05T12:00:00.000Z",
  "local_file": "/absolute/path/to/out/FullVideo/light/en-US.mp4"
}
```

`local_file` is machine-specific; you may strip it from commits if you prefer.

## Why did only one row upload?

`youtube-upload.cjs` uploads **only** rows whose file exists: `out/FullVideo/{theme}/{locale_safe}.mp4`. If you only rendered **en-US · light**, only that row can upload until you run **`render-fullvideo-all`** for the rest (35 locales × 2 themes ≈ 70 files, minus skipped).

After a full render, upload **all pending** (no `--force` unless replacing every `video` id):

```bash
npm run youtube:upload -- --privacy public
```

Or render + upload in one go (resume renders with `--skip-existing`):

```bash
npm run render:fullvideo:all:upload:public
# same as: node scripts/render-fullvideo-all.cjs --theme both --skip-existing --then-upload --upload-privacy public
```

## Render FullVideo (light / dark)

Writes MP4s under `out/FullVideo/light/` and `out/FullVideo/dark/` (gitignored) and `out/FullVideo/manifest.json`:

```bash
cd learn.ai.video
npm run render:fullvideo:all
# or:
node scripts/render-fullvideo-all.cjs --theme both
# partial locales:
node scripts/render-fullvideo-all.cjs --only ar,ru-RU,en-US
# skip files that already exist:
node scripts/render-fullvideo-all.cjs --skip-existing
# one theme only:
node scripts/render-fullvideo-all.cjs --theme light
```

## Upload to YouTube

Dry run (no OAuth; reads config and checks files exist):

```bash
npm run youtube:upload:dry
```

Real upload (opens browser on first run):

```bash
npm run youtube:upload -- --privacy unlisted
```

Publish **already uploaded** videos (sets `privacyStatus` via API; no file re-upload):

```bash
npm run youtube:publish -- --privacy public
npm run youtube:publish -- --privacy public --only en-US --themes light
```

### Descriptions wrong language (English on localized videos)

Store sync used to prefer **any** Android folder in the fallback chain before **iOS**, so locales with metadata only under `fastlane/metadata/ios/<locale>/` (e.g. `ca`, `cs`, `da`) incorrectly got **en-US** Android text. **Fixed** in `scripts/lib/store-metadata-for-youtube.cjs` (per locale: Android then iOS, then next fallback).

1. Regenerate JSON: `npm run youtube:config:sync` (omit `--only-new` so titles/descriptions refresh).
2. Push text to existing uploads: `npm run youtube:metadata:sync` (or `--dry-run` / `--only ca,cs`).

New uploads already use the corrected JSON from `youtube-upload.cjs`.

Options:

- `--config path/to/youtube-videos.json` (default: `data/youtube-videos.json`)
- `--only ar,ru-RU`
- `--themes light` or `--themes light,dark`
- `--privacy private|unlisted|public` (default: `unlisted`)
- `--force` — upload again even if `video.youtube_video_id` is already set
- `--dry-run`

Environment overrides:

- `YOUTUBE_CLIENT_SECRET_FILE` — OAuth client JSON (default: `secrets/youtube-oauth-client.json`)
- `YOUTUBE_TOKEN_FILE` — saved tokens (default: `.youtube-token.json`)
- `YOUTUBE_VIDEOS_JSON` — config path (default: `data/youtube-videos.json`)
- `YOUTUBE_OAUTH_REDIRECT_PORT` — local OAuth callback port (default: `8765`; must match redirect URI in Google Cloud)
- `YOUTUBE_THUMBNAIL_FILE` — optional absolute or repo-relative JPEG for `thumbnails.set` after upload

## Upload limit & daily API quota

YouTube may return **`uploadLimitExceeded`** (channel daily upload cap, often stricter on new/unverified channels) or **`quotaExceeded`** (Google Cloud **YouTube Data API v3** daily units, default **10 000** — a single `videos.insert` costs ~**1 600** units, so a large batch needs multiple days or a **quota increase** in Google Cloud Console).

`youtube-upload.cjs` **stops the batch** after the first `uploadLimitExceeded` or `quotaExceeded` so the script does not burn the rest of the quota on failed retries. `youtube:metadata:sync` also stops on `quotaExceeded`.

After reset (quota typically resets at **midnight Pacific**; upload limits are per channel policy), run again:

```bash
npm run youtube:upload -- --privacy public
npm run youtube:metadata:sync
```

## Playlist (all uploaded videos)

OAuth includes **`youtube.force-ssl`** so the app can call **`playlists.insert`** and **`playlistItems.insert`**. If you authorized **before** that scope was added, run **`npm run youtube:oauth -- --force`** once, then:

```bash
npm run youtube:playlist:sync -- --privacy unlisted
npm run youtube:playlist:sync -- --dry-run
npm run youtube:playlist:sync -- --title "My playlist" --playlist-id PLxxxx
```

Creates a playlist (or reuses **`youtube_playlist_id`** stored in `youtube-videos.json`) and adds every row that has **`video.youtube_video_id`** (skips duplicates). Only **uploaded** videos are included—render more FullVideos first if the playlist should grow.

## Custom thumbnail not applied (auto frame instead)

If the video uploads but Studio still shows an **auto-generated** thumbnail, the Data API often returned **403** / *“doesn't have permissions to upload and set custom video thumbnails”*. That is usually **channel eligibility**, not a wrong file path: enable custom thumbnails in **YouTube Studio → Settings → Channel → Feature eligibility** (phone verification / good standing).

After eligibility is fixed, **do not re-upload** unless you want a new video:

```bash
npm run youtube:thumbnails:apply -- --only en-US --themes light
npm run youtube:thumbnails:apply -- --dry-run
```

Or set the image manually in Studio (**Content** → video → **Thumbnail** → upload `assets/youtube/thumbnails/{locale_safe}_{theme}.png`).

## Workflow summary

1. `npm run youtube:config:sync` — rows + **store-backed** titles/descriptions (or `--only-new` to preserve manual edits).
2. (Optional) Edit Fastlane store text, re-sync; or edit `data/youtube-videos.json` directly.
3. `npm run youtube:thumbnail:all` (or `youtube:thumbnail`) — localized JPEGs (optional).
4. `npm run render:fullvideo:all` (or partial `--only` / `--skip-existing`).
5. `npm run youtube:upload` — config is updated in place with `video` per row; custom thumbnail if file exists (or `npm run youtube:thumbnails:apply` later if API rejected thumbnails until eligibility).
6. `npm run youtube:playlist:sync` — optional; after `youtube:oauth -- --force` if scopes were upgraded (see Playlist section).

## OAuth: `127.0.0.1 refused to connect` (ERR_CONNECTION_REFUSED)

The browser is returning to the **local callback URL** while **nothing is listening** on that port. Typical causes:

1. **Terminal closed or script exited** before you finished Google sign-in — start again with `npm run youtube:upload` and leave the terminal open until you see **YouTube auth OK** in the browser.
2. **Opened an old bookmark** to the Google auth page from a previous run — always use the URL printed **after** `OAuth listener:` (or let the script open the browser).
3. **Nothing to upload** — if the script prints `Nothing to upload` and exits, it never starts the listener; use `--force` or ensure at least one rendered file matches a config row, or run a tiny test with `--only` + a rendered locale.
4. **Port already in use (`EADDRINUSE`)** — usually an old `node` still listening from a previous OAuth attempt. macOS/Linux: `lsof -nP -iTCP:8765 -sTCP:LISTEN`, then `kill <PID>`. Or use a different port via `YOUTUBE_OAUTH_REDIRECT_PORT` and register `http://127.0.0.1:<port>/oauth2callback` in Google Cloud.

Google Cloud **Authorized redirect URIs** must include exactly:

`http://127.0.0.1:8765/oauth2callback`

(if you change the port, update both the env var and this URI).
