"use strict";

const fs = require("fs");

/** @param {any} youtube google.youtube v3 client */
async function setYoutubeThumbnail(youtube, videoId, thumbnailPath) {
  if (!thumbnailPath || !fs.existsSync(thumbnailPath)) return false;
  await youtube.thumbnails.set({
    videoId,
    media: {
      body: fs.createReadStream(thumbnailPath),
    },
  });
  return true;
}

/**
 * @param {Error & { response?: { data?: unknown } }} err
 */
function isThumbnailPermissionError(err) {
  const msg = String(err?.message || "");
  const body = err?.response?.data;
  const apiMsg =
    body && typeof body === "object" && "error" in body && body.error && typeof body.error === "object"
      ? String((/** @type {{ message?: string }} */ (body.error)).message || "")
      : "";
  const combined = `${msg} ${apiMsg}`.toLowerCase();
  return (
    combined.includes("permission") ||
    combined.includes("forbidden") ||
    combined.includes("403") ||
    combined.includes("doesn't have permissions to upload and set custom video thumbnails")
  );
}

function logThumbnailPermissionHint() {
  console.warn(
    "     → YouTube requires channel eligibility for custom thumbnails (often a verified phone number)."
  );
  console.warn("     → Studio: https://studio.youtube.com/ → Settings → Channel → Feature eligibility.");
  console.warn(
    "     → After eligibility is OK, apply thumbnails without re-upload: npm run youtube:thumbnails:apply -- --only en-US --themes light"
  );
}

module.exports = { setYoutubeThumbnail, isThumbnailPermissionError, logThumbnailPermissionHint };
