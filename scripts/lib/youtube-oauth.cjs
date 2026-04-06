"use strict";

const fs = require("fs");
const http = require("http");
const open = require("open");

const REDIRECT_PORT = Number(process.env.YOUTUBE_OAUTH_REDIRECT_PORT || 8765) || 8765;
const REDIRECT_PATH = "/oauth2callback";
/** upload + playlists (playlists.insert / playlistItems.insert need force-ssl or youtube scope) */
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

function loadClientSecrets(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const c = raw.installed || raw.web;
  if (!c?.client_id || !c?.client_secret) {
    throw new Error("OAuth JSON must have installed (or web) with client_id and client_secret");
  }
  return {
    clientId: c.client_id,
    clientSecret: c.client_secret,
  };
}

function getRedirectUri() {
  return `http://127.0.0.1:${REDIRECT_PORT}${REDIRECT_PATH}`;
}

/**
 * Ensures a valid OAuth token at tokenPath. Opens browser when needed.
 * @param {*} oAuth2Client google.auth.OAuth2 instance
 * @param {string} tokenPath
 * @param {{ force?: boolean }} [options] force=true ignores existing token and runs browser flow
 */
function authorizeYouTube(oAuth2Client, tokenPath, options = {}) {
  const { force = false } = options;
  return new Promise((resolve, reject) => {
    if (!force && fs.existsSync(tokenPath)) {
      const t = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
      oAuth2Client.setCredentials(t);
      if (t.refresh_token || t.access_token) {
        resolve(oAuth2Client);
        return;
      }
    }

    const redirectUri = getRedirectUri();
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      redirect_uri: redirectUri,
    });

    const server = http.createServer(async (req, res) => {
      if (!req.url || !req.url.startsWith(REDIRECT_PATH)) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not the OAuth callback path. Use the URL printed in the terminal.");
        return;
      }
      try {
        const url = new URL(req.url, `http://127.0.0.1:${REDIRECT_PORT}`);
        const code = url.searchParams.get("code");
        const err = url.searchParams.get("error");
        if (err) {
          res.writeHead(400);
          res.end(`OAuth error: ${err}`);
          server.close();
          reject(new Error(err));
          return;
        }
        if (!code) {
          res.writeHead(400);
          res.end("Missing code");
          server.close();
          reject(new Error("missing code"));
          return;
        }
        const { tokens } = await oAuth2Client.getToken({ code, redirect_uri: redirectUri });
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(tokenPath, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("YouTube auth OK. You can close this tab and return to the terminal.");
        server.close();
        resolve(oAuth2Client);
      } catch (e) {
        try {
          res.writeHead(500);
          res.end(String(e.message));
        } catch (_) {}
        server.close();
        reject(e);
      }
    });

    server.on("error", (e) => {
      if (e.code === "EADDRINUSE") {
        reject(
          new Error(
            `Port ${REDIRECT_PORT} is in use (often a stuck node OAuth server). Free it: lsof -nP -iTCP:${REDIRECT_PORT} -sTCP:LISTEN  then  kill <PID>  Or set YOUTUBE_OAUTH_REDIRECT_PORT and add the matching redirect URI in Google Cloud Console.`
          )
        );
      } else {
        reject(e);
      }
    });

    server.listen(REDIRECT_PORT, "0.0.0.0", async () => {
      console.log(
        `\nOAuth listener: http://127.0.0.1:${REDIRECT_PORT}${REDIRECT_PATH}\n` +
          'Keep this terminal open until the browser shows "YouTube auth OK".\n'
      );
      console.log("Open this URL in your browser (if it did not open automatically):\n", authUrl, "\n");
      try {
        await open(authUrl);
      } catch (_) {
        /* manual */
      }
    });
  });
}

module.exports = {
  loadClientSecrets,
  authorizeYouTube,
  getRedirectUri,
  REDIRECT_PORT,
  REDIRECT_PATH,
  SCOPES,
};
