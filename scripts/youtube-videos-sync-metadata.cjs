#!/usr/bin/env node
/**
 * Push title + description from youtube-videos.json to YouTube (videos.update snippet).
 * Use after `npm run youtube:config:sync` fixes store copy, or manual JSON edits.
 *
 *   node scripts/youtube-videos-sync-metadata.cjs --dry-run
 *   node scripts/youtube-videos-sync-metadata.cjs --only ca,cs,da
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

function audioLang(locale) {
  const p = locale.split("-")[0];
  if (p === "zh") return locale.toLowerCase();
  return p;
}

function buildSnippet(entry) {
  const title = (entry.title || `FamilyLearn.AI — ${entry.locale}`).slice(0, 100);
  const description = (
    entry.description?.trim() || `FamilyLearn.AI — ${entry.locale} (${entry.theme}).`
  ).slice(0, 5000);
  return {
    title,
    description,
    categoryId: "27",
    defaultLanguage: "en",
    defaultAudioLanguage: audioLang(entry.locale),
  };
}

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

  const rows = doc.videos.filter(
    (e) => e.video?.youtube_video_id && matchesFilters(e, onlyLocales, onlyThemes)
  );

  console.log(`Config: ${path.relative(ROOT, configPath)}`);
  console.log(`Rows to update (have video id): ${rows.length}`);

  if (rows.length === 0) return;

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

  function isQuotaExceeded(err) {
    const errors = err?.response?.data?.error?.errors;
    return Array.isArray(errors) && errors.some((x) => x.reason === "quotaExceeded");
  }

  metaLoop: for (const e of rows) {
    const id = e.video.youtube_video_id;
    try {
      const cur = await youtube.videos.list({ id: [id], part: ["snippet"] });
      const prev = cur.data.items?.[0]?.snippet;
      const next = buildSnippet(e);
      const snippet = {
        ...next,
        tags: prev?.tags,
        categoryId: prev?.categoryId || next.categoryId,
        defaultLanguage: prev?.defaultLanguage || next.defaultLanguage,
      };
      await youtube.videos.update({
        part: ["snippet"],
        requestBody: {
          id,
          snippet,
        },
      });
      console.log(`  ✅ ${e.locale} / ${e.theme} → ${id}`);
    } catch (err) {
      console.warn(`  ⚠ ${e.locale} / ${e.theme} (${id}): ${err.message}`);
      if (isQuotaExceeded(err)) {
        console.error("\nStopping: YouTube Data API daily quota exceeded. Retry after reset (Pacific midnight) or increase quota in Google Cloud.");
        break metaLoop;
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
  process.exit(1);
});
