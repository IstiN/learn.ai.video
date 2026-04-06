#!/usr/bin/env node
/**
 * Upload rendered FullVideo MP4s using data/youtube-videos.json (locale, theme,
 * title, description per row). Fills each row's `video` after a successful upload.
 *
 * Auth: OAuth 2.0 (Desktop app). An API key alone CANNOT upload to your channel.
 * First-time auth: npm run youtube:oauth (or this script will open the browser when uploading).
 *
 * Setup: see docs/youtube-upload.md
 *
 * Usage:
 *   node scripts/youtube-upload.cjs --dry-run
 *   node scripts/youtube-upload.cjs --privacy unlisted
 *   node scripts/youtube-upload.cjs --only ar,ru-RU --themes light
 *   node scripts/youtube-upload.cjs --force   (re-upload even if video.id is set)
 *
 * Env:
 *   YOUTUBE_CLIENT_SECRET_FILE  (default: secrets/youtube-oauth-client.json)
 *   YOUTUBE_TOKEN_FILE          (default: .youtube-token.json)
 *   YOUTUBE_VIDEOS_JSON              (default: data/youtube-videos.json)
 *   YOUTUBE_OAUTH_REDIRECT_PORT      (default: 8765; must match Google Cloud redirect URI)
 *   YOUTUBE_THUMBNAIL_FILE           (optional; overrides youtube_thumbnail_file in JSON)
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const { safeLocaleFileName } = require("./lib/read-supported-locales.cjs");
const { resolveThumbnailPathForEntry } = require("./lib/youtube-thumbnail-path.cjs");
const {
  setYoutubeThumbnail,
  isThumbnailPermissionError,
  logThumbnailPermissionHint,
} = require("./lib/youtube-set-thumbnail.cjs");
const { loadClientSecrets, authorizeYouTube, getRedirectUri } = require("./lib/youtube-oauth.cjs");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SECRET = path.join(ROOT, "secrets", "youtube-oauth-client.json");
const DEFAULT_TOKEN = path.join(ROOT, ".youtube-token.json");
const DEFAULT_CONFIG = path.join(ROOT, "data", "youtube-videos.json");

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  let privacy = "unlisted";
  const pi = argv.indexOf("--privacy");
  if (pi >= 0 && argv[pi + 1]) privacy = argv[pi + 1];
  if (!["private", "unlisted", "public"].includes(privacy)) {
    console.error('--privacy must be "private", "unlisted", or "public"');
    process.exit(1);
  }
  let onlyLocales = null;
  const oi = argv.indexOf("--only");
  if (oi >= 0 && argv[oi + 1]) {
    onlyLocales = new Set(
      argv[oi + 1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  let onlyThemes = null;
  const thi = argv.indexOf("--themes");
  if (thi >= 0 && argv[thi + 1]) {
    onlyThemes = new Set(
      argv[thi + 1]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
  }
  let configPath = process.env.YOUTUBE_VIDEOS_JSON || DEFAULT_CONFIG;
  const ci = argv.indexOf("--config");
  if (ci >= 0 && argv[ci + 1]) {
    configPath = path.isAbsolute(argv[ci + 1])
      ? argv[ci + 1]
      : path.resolve(ROOT, argv[ci + 1]);
  }
  return { dryRun, force, privacy, onlyLocales, onlyThemes, configPath };
}

function resolveRenderedPath(entry) {
  const safe = safeLocaleFileName(entry.locale);
  return path.join(ROOT, "out", "FullVideo", entry.theme, `${safe}.mp4`);
}

function audioLang(locale) {
  const p = locale.split("-")[0];
  if (p === "zh") return locale.toLowerCase();
  return p;
}

function writeConfig(configPath, doc) {
  fs.writeFileSync(configPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
}

async function uploadOne(youtube, filePath, entry, privacy) {
  const title = (entry.title || `FamilyLearn.AI — ${entry.locale}`).slice(0, 100);
  const description =
    entry.description?.trim() ||
    `FamilyLearn.AI — ${entry.locale} (${entry.theme}).`;

  const snippet = {
    title,
    description: description.slice(0, 5000),
    categoryId: "27",
    defaultLanguage: "en",
    defaultAudioLanguage: audioLang(entry.locale),
  };

  const size = fs.statSync(filePath).size;
  console.log(`Uploading ${path.basename(filePath)} (${(size / 1e6).toFixed(1)} MB)…`);

  const res = await youtube.videos.insert(
    {
      part: ["snippet", "status"],
      requestBody: {
        snippet,
        status: {
          privacyStatus: privacy,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(filePath),
      },
    },
    { maxContentLength: Infinity, maxBodyLength: Infinity }
  );

  const id = res.data.id;
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  return {
    youtube_video_id: id,
    url: watchUrl,
    uploaded_at: new Date().toISOString(),
    local_file: filePath,
  };
}

function matchesFilters(entry, onlyLocales, onlyThemes) {
  if (onlyLocales && !onlyLocales.has(entry.locale)) return false;
  if (onlyThemes && !onlyThemes.has(entry.theme)) return false;
  return true;
}

/** Stop batch to avoid burning quota on doomed retries (daily upload cap / API quota). */
function shouldAbortYoutubeUploadBatch(err) {
  const errors = err?.response?.data?.error?.errors;
  if (!Array.isArray(errors)) return false;
  return errors.some((x) => ["uploadLimitExceeded", "quotaExceeded"].includes(x.reason));
}

async function main() {
  const {
    dryRun,
    force,
    privacy,
    onlyLocales,
    onlyThemes,
    configPath,
  } = parseArgs();

  if (!fs.existsSync(configPath)) {
    console.error(`Missing ${configPath}`);
    console.error("Run: node scripts/sync-youtube-videos-config.cjs");
    process.exit(1);
  }

  const doc = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!Array.isArray(doc.videos)) {
    console.error("youtube-videos.json must have a videos[] array (schema_version 2).");
    process.exit(1);
  }

  const thumbFromEnv = process.env.YOUTUBE_THUMBNAIL_FILE;

  const secretFile = process.env.YOUTUBE_CLIENT_SECRET_FILE || DEFAULT_SECRET;
  const tokenPath = process.env.YOUTUBE_TOKEN_FILE || DEFAULT_TOKEN;

  const workList = [];
  for (const entry of doc.videos) {
    if (!matchesFilters(entry, onlyLocales, onlyThemes)) continue;
    const filePath = resolveRenderedPath(entry);
    const hasFile = fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
    const hasVideo = entry.video && entry.video.youtube_video_id;
    if (hasVideo && !force) {
      workList.push({ entry, filePath, skip: "already uploaded" });
      continue;
    }
    if (!hasFile) {
      workList.push({ entry, filePath, skip: "missing file" });
      continue;
    }
    workList.push({ entry, filePath, skip: null });
  }

  const toUpload = workList.filter((w) => !w.skip);
  const skipped = workList.filter((w) => w.skip);

  console.log(`Config: ${path.relative(ROOT, configPath)}`);
  console.log(`Rows: ${doc.videos.length}, to upload: ${toUpload.length}, skipped: ${skipped.length}`);

  if (dryRun) {
    for (const w of workList) {
      const tag = w.skip ? `[${w.skip}]` : "[would upload]";
      console.log(
        `  ${tag} ${w.entry.locale} / ${w.entry.theme} → ${path.relative(ROOT, w.filePath)}`
      );
    }
    console.log("\nDry-run done.");
    return;
  }

  if (toUpload.length === 0) {
    console.log("Nothing to upload. Use --force to re-upload, or render missing files.");
    console.log("To authorize without uploading: npm run youtube:oauth");
    return;
  }

  if (!fs.existsSync(secretFile)) {
    console.error(`Missing OAuth client file: ${secretFile}`);
    process.exit(1);
  }

  const { clientId, clientSecret } = loadClientSecrets(secretFile);
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());

  await authorizeYouTube(oAuth2Client, tokenPath);
  const youtube = google.youtube({ version: "v3", auth: oAuth2Client });

  uploadLoop: for (const w of toUpload) {
    console.log(`\n── ${w.entry.locale} / ${w.entry.theme} ──`);
    try {
      const videoMeta = await uploadOne(youtube, w.filePath, w.entry, privacy);
      w.entry.video = videoMeta;
      doc.last_upload_batch = new Date().toISOString();
      writeConfig(configPath, doc);
      console.log(`  ✅ ${videoMeta.url}`);
      const thumbPath = resolveThumbnailPathForEntry(w.entry, doc, ROOT, thumbFromEnv);
      if (thumbPath) {
        try {
          const ok = await setYoutubeThumbnail(youtube, videoMeta.youtube_video_id, thumbPath);
          if (ok) {
            console.log(`  🖼 Thumbnail: ${path.relative(ROOT, thumbPath)}`);
          }
        } catch (te) {
          console.warn(`  ⚠ Thumbnail upload failed: ${te.message}`);
          if (isThumbnailPermissionError(te)) logThumbnailPermissionHint();
        }
      }
    } catch (e) {
      console.error(`  ❌ ${e.message}`);
      if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
      if (shouldAbortYoutubeUploadBatch(e)) {
        console.error(
          "\nStopping batch: channel upload limit or YouTube Data API daily quota. Retry after reset, or request a higher quota in Google Cloud Console."
        );
        break uploadLoop;
      }
    }
  }

  doc.last_upload_batch = new Date().toISOString();
  writeConfig(configPath, doc);
  console.log(`\nUpdated: ${path.relative(ROOT, configPath)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
