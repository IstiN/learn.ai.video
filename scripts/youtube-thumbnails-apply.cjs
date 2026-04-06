#!/usr/bin/env node
/**
 * Apply custom thumbnails to videos that are already in data/youtube-videos.json
 * (after channel gains custom-thumbnail eligibility, without re-uploading).
 *
 * Usage:
 *   node scripts/youtube-thumbnails-apply.cjs --dry-run
 *   node scripts/youtube-thumbnails-apply.cjs --only en-US --themes light
 *
 * Env: same as youtube-upload (YOUTUBE_CLIENT_SECRET_FILE, YOUTUBE_TOKEN_FILE, YOUTUBE_VIDEOS_JSON, YOUTUBE_THUMBNAIL_FILE).
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

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
  return { dryRun, onlyLocales, onlyThemes, configPath };
}

function matchesFilters(entry, onlyLocales, onlyThemes) {
  if (onlyLocales && !onlyLocales.has(entry.locale)) return false;
  if (onlyThemes && !onlyThemes.has(entry.theme)) return false;
  return true;
}

async function main() {
  const { dryRun, onlyLocales, onlyThemes, configPath } = parseArgs();

  if (!fs.existsSync(configPath)) {
    console.error(`Missing ${configPath}`);
    process.exit(1);
  }

  const doc = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!Array.isArray(doc.videos)) {
    console.error("youtube-videos.json must have a videos[] array.");
    process.exit(1);
  }

  const thumbFromEnv = process.env.YOUTUBE_THUMBNAIL_FILE;
  const secretFile = process.env.YOUTUBE_CLIENT_SECRET_FILE || DEFAULT_SECRET;
  const tokenPath = process.env.YOUTUBE_TOKEN_FILE || DEFAULT_TOKEN;

  const candidates = [];
  for (const entry of doc.videos) {
    if (!matchesFilters(entry, onlyLocales, onlyThemes)) continue;
    const id = entry.video?.youtube_video_id;
    if (!id) continue;
    const thumbPath = resolveThumbnailPathForEntry(entry, doc, ROOT, thumbFromEnv);
    candidates.push({ entry, id, thumbPath });
  }

  console.log(`Config: ${path.relative(ROOT, configPath)}`);
  console.log(`Rows with video id (after filters): ${candidates.length}`);

  if (candidates.length === 0) {
    console.log("Nothing to do. Upload videos first, or widen --only / --themes.");
    return;
  }

  if (dryRun) {
    for (const c of candidates) {
      const rel = c.thumbPath ? path.relative(ROOT, c.thumbPath) : "(no file)";
      console.log(`  [dry-run] ${c.entry.locale} / ${c.entry.theme} → ${c.id} ← ${rel}`);
    }
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

  for (const c of candidates) {
    console.log(`\n── ${c.entry.locale} / ${c.entry.theme} (${c.id}) ──`);
    if (!c.thumbPath) {
      console.warn("  ⚠ No thumbnail file resolved; skip.");
      continue;
    }
    try {
      await setYoutubeThumbnail(youtube, c.id, c.thumbPath);
      console.log(`  🖼 ${path.relative(ROOT, c.thumbPath)}`);
    } catch (e) {
      console.warn(`  ⚠ ${e.message}`);
      if (isThumbnailPermissionError(e)) logThumbnailPermissionHint();
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
