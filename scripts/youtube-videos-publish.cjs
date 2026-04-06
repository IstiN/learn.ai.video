#!/usr/bin/env node
/**
 * Set privacyStatus for videos already in youtube-videos.json (no re-upload).
 *
 *   node scripts/youtube-videos-publish.cjs --privacy public
 *   node scripts/youtube-videos-publish.cjs --privacy public --only en-US --themes light
 *   node scripts/youtube-videos-publish.cjs --dry-run
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const { loadClientSecrets, authorizeYouTube, getRedirectUri } = require("./lib/youtube-oauth.cjs");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SECRET = path.join(ROOT, "secrets", "youtube-oauth-client.json");
const DEFAULT_TOKEN = path.join(ROOT, ".youtube-token.json");
const DEFAULT_CONFIG = path.join(ROOT, "data", "youtube-videos.json");

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  let privacy = "public";
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
        .map((s) => s.trim())
        .toLowerCase()
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
  return { dryRun, privacy, onlyLocales, onlyThemes, configPath };
}

function matchesFilters(entry, onlyLocales, onlyThemes) {
  if (onlyLocales && !onlyLocales.has(entry.locale)) return false;
  if (onlyThemes && !onlyThemes.has(entry.theme)) return false;
  return true;
}

async function main() {
  const { dryRun, privacy, onlyLocales, onlyThemes, configPath } = parseArgs();

  if (!fs.existsSync(configPath)) {
    console.error(`Missing ${configPath}`);
    process.exit(1);
  }

  const doc = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!Array.isArray(doc.videos)) {
    console.error("youtube-videos.json must have a videos[] array.");
    process.exit(1);
  }

  const rows = doc.videos.filter(
    (e) => e.video?.youtube_video_id && matchesFilters(e, onlyLocales, onlyThemes)
  );

  console.log(`Config: ${path.relative(ROOT, configPath)}`);
  console.log(`Rows to update: ${rows.length} → privacy "${privacy}"`);

  if (rows.length === 0) {
    console.log("No uploaded videos match filters.");
    return;
  }

  if (dryRun) {
    for (const e of rows) {
      console.log(`  [dry-run] ${e.locale} / ${e.theme} → ${e.video.youtube_video_id}`);
    }
    return;
  }

  const secretFile = process.env.YOUTUBE_CLIENT_SECRET_FILE || DEFAULT_SECRET;
  const tokenPath = process.env.YOUTUBE_TOKEN_FILE || DEFAULT_TOKEN;
  if (!fs.existsSync(secretFile)) {
    console.error(`Missing OAuth client file: ${secretFile}`);
    process.exit(1);
  }

  const { clientId, clientSecret } = loadClientSecrets(secretFile);
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());
  await authorizeYouTube(oAuth2Client, tokenPath);
  const youtube = google.youtube({ version: "v3", auth: oAuth2Client });

  for (const e of rows) {
    const id = e.video.youtube_video_id;
    try {
      await youtube.videos.update({
        part: ["status"],
        requestBody: {
          id,
          status: {
            privacyStatus: privacy,
            selfDeclaredMadeForKids: false,
          },
        },
      });
      console.log(`  ✅ ${e.locale} / ${e.theme} → ${id} (${privacy})`);
    } catch (err) {
      console.warn(`  ⚠ ${e.locale} / ${e.theme} (${id}): ${err.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
  process.exit(1);
});
