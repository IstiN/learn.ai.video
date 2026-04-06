#!/usr/bin/env node
/**
 * One-time (or --force) YouTube OAuth: writes .youtube-token.json only.
 * Does not require rendered videos or youtube-videos.json rows.
 *
 * Usage:
 *   npm run youtube:oauth
 *   node scripts/youtube-oauth-init.cjs --force   (re-consent, new tokens)
 *
 * Env: same as youtube-upload.cjs (YOUTUBE_CLIENT_SECRET_FILE, YOUTUBE_TOKEN_FILE, YOUTUBE_OAUTH_REDIRECT_PORT)
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { loadClientSecrets, authorizeYouTube, getRedirectUri } = require("./lib/youtube-oauth.cjs");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SECRET = path.join(ROOT, "secrets", "youtube-oauth-client.json");
const DEFAULT_TOKEN = path.join(ROOT, ".youtube-token.json");

async function main() {
  const force = process.argv.includes("--force");
  const secretFile = process.env.YOUTUBE_CLIENT_SECRET_FILE || DEFAULT_SECRET;
  const tokenPath = process.env.YOUTUBE_TOKEN_FILE || DEFAULT_TOKEN;

  if (!fs.existsSync(secretFile)) {
    console.error(`Missing OAuth client file: ${secretFile}`);
    process.exit(1);
  }

  if (!force && fs.existsSync(tokenPath)) {
    const t = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    if (t.refresh_token || t.access_token) {
      console.log(`Already authorized: ${path.relative(ROOT, tokenPath)}`);
      console.log("Use --force to sign in again and replace the token.\n");
      return;
    }
  }

  if (force && fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
    console.log("Removed existing token (--force). Starting browser flow…\n");
  }

  const { clientId, clientSecret } = loadClientSecrets(secretFile);
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());

  await authorizeYouTube(oAuth2Client, tokenPath, { force: false });

  console.log(`\nOAuth finished. Token saved: ${path.relative(ROOT, tokenPath)}`);
  console.log("Next: render FullVideo, then npm run youtube:upload.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
