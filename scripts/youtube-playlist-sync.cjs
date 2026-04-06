#!/usr/bin/env node
/**
 * Create or reuse a playlist and add every row from youtube-videos.json that has video.youtube_video_id.
 * Skips videos already in the playlist.
 *
 * Requires OAuth scopes including youtube.force-ssl (see scripts/lib/youtube-oauth.cjs).
 * After changing scopes: npm run youtube:oauth -- --force
 *
 * Usage:
 *   node scripts/youtube-playlist-sync.cjs --dry-run
 *   node scripts/youtube-playlist-sync.cjs --title "FamilyLearn.AI — demos"
 *   node scripts/youtube-playlist-sync.cjs --playlist-id PLxxxx   (use existing, do not create)
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

const DEFAULT_TITLE = "FamilyLearn.AI — FullVideo (all uploads)";

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  let privacy = "unlisted";
  const pi = argv.indexOf("--privacy");
  if (pi >= 0 && argv[pi + 1]) privacy = argv[pi + 1];
  if (!["private", "unlisted", "public"].includes(privacy)) {
    console.error('--privacy must be "private", "unlisted", or "public"');
    process.exit(1);
  }
  let title = DEFAULT_TITLE;
  const ti = argv.indexOf("--title");
  if (ti >= 0 && argv[ti + 1]) title = argv[ti + 1].trim();
  let playlistIdArg = null;
  const pli = argv.indexOf("--playlist-id");
  if (pli >= 0 && argv[pli + 1]) playlistIdArg = argv[pli + 1].trim();
  let configPath = process.env.YOUTUBE_VIDEOS_JSON || DEFAULT_CONFIG;
  const ci = argv.indexOf("--config");
  if (ci >= 0 && argv[ci + 1]) {
    configPath = path.isAbsolute(argv[ci + 1])
      ? argv[ci + 1]
      : path.resolve(ROOT, argv[ci + 1]);
  }
  return { dryRun, privacy, title, playlistIdArg, configPath };
}

function writeConfig(configPath, doc) {
  fs.writeFileSync(configPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const la = a.locale.localeCompare(b.locale, "en");
    if (la !== 0) return la;
    if (a.theme === b.theme) return 0;
    return a.theme.localeCompare(b.theme, "en");
  });
}

async function listPlaylistVideoIds(youtube, playlistId) {
  const ids = new Set();
  let pageToken;
  do {
    const res = await youtube.playlistItems.list({
      playlistId,
      part: ["contentDetails"],
      maxResults: 50,
      pageToken: pageToken || undefined,
    });
    for (const it of res.data.items || []) {
      const vid = it.contentDetails?.videoId;
      if (vid) ids.add(vid);
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return ids;
}

async function main() {
  const { dryRun, privacy, title, playlistIdArg, configPath } = parseArgs();

  if (!fs.existsSync(configPath)) {
    console.error(`Missing ${configPath}`);
    process.exit(1);
  }

  const doc = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!Array.isArray(doc.videos)) {
    console.error("youtube-videos.json must have a videos[] array.");
    process.exit(1);
  }

  const withVideo = sortEntries(
    doc.videos.filter((e) => e.video && e.video.youtube_video_id)
  ).map((e) => ({
    locale: e.locale,
    theme: e.theme,
    videoId: e.video.youtube_video_id,
    url: e.video.url,
  }));

  console.log(`Config: ${path.relative(ROOT, configPath)}`);
  console.log(`Rows with youtube_video_id: ${withVideo.length}`);

  if (withVideo.length === 0) {
    console.log("Nothing to add. Upload videos first.");
    return;
  }

  let playlistId = playlistIdArg || doc.youtube_playlist_id || null;

  if (dryRun) {
    console.log(`[dry-run] playlist: ${playlistId || `(would create: ${title})`}`);
    for (const row of withVideo) {
      console.log(`  ${row.locale} / ${row.theme} → ${row.videoId}`);
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

  if (!playlistId) {
    const res = await youtube.playlists.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title.slice(0, 150),
          description:
            "FamilyLearn.AI FullVideo exports (synced from repo). " +
            new Date().toISOString().slice(0, 10),
        },
        status: {
          privacyStatus: privacy,
        },
      },
    });
    playlistId = res.data.id;
    doc.youtube_playlist_id = playlistId;
    doc.youtube_playlist_url = `https://www.youtube.com/playlist?list=${playlistId}`;
    doc.youtube_playlist_title = title;
    doc.youtube_playlist_updated_at = new Date().toISOString();
    writeConfig(configPath, doc);
    console.log(`Created playlist: ${doc.youtube_playlist_url}`);
  } else {
    console.log(`Using playlist: https://www.youtube.com/playlist?list=${playlistId}`);
    if (playlistIdArg && !doc.youtube_playlist_id) {
      doc.youtube_playlist_id = playlistId;
      doc.youtube_playlist_url = `https://www.youtube.com/playlist?list=${playlistId}`;
      writeConfig(configPath, doc);
    }
  }

  const existing = await listPlaylistVideoIds(youtube, playlistId);
  let added = 0;
  let skipped = 0;

  for (const row of withVideo) {
    if (existing.has(row.videoId)) {
      skipped += 1;
      continue;
    }
    try {
      await youtube.playlistItems.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: row.videoId,
            },
          },
        },
      });
      existing.add(row.videoId);
      added += 1;
      console.log(`  + ${row.locale} / ${row.theme} (${row.videoId})`);
    } catch (e) {
      console.warn(`  ⚠ skip ${row.locale}/${row.theme} (${row.videoId}): ${e.message}`);
    }
  }

  doc.youtube_playlist_updated_at = new Date().toISOString();
  writeConfig(configPath, doc);

  console.log(`\nDone. Added: ${added}, already in playlist: ${skipped}`);
  console.log(`Playlist: https://www.youtube.com/playlist?list=${playlistId}`);
}

main().catch((e) => {
  const details = e.response?.data?.error?.details;
  const scopeInsufficient = Array.isArray(details) && details.some((d) => d.reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT");
  if (scopeInsufficient || String(e.message || "").includes("insufficient authentication scopes")) {
    console.error("\nSaved token is missing playlist scope. Re-consent once:\n  npm run youtube:oauth -- --force\nThen: npm run youtube:playlist:sync\n");
  } else {
    console.error(e);
    if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
  }
  process.exit(1);
});
