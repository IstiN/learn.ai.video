"use strict";

const fs = require("fs");
const path = require("path");
const { safeLocaleFileName } = require("./read-supported-locales.cjs");

/**
 * Resolve custom thumbnail file for a config row (same rules as youtube-upload.cjs).
 */
function resolveThumbnailPathForEntry(entry, doc, root, thumbFromEnv) {
  if (thumbFromEnv) {
    const p = path.isAbsolute(thumbFromEnv) ? thumbFromEnv : path.join(root, thumbFromEnv);
    return fs.existsSync(p) ? p : null;
  }
  const safe = safeLocaleFileName(entry.locale);
  const base = path.join(root, "assets", "youtube", "thumbnails", `${safe}_${entry.theme}`);
  for (const ext of [".png", ".jpg", ".jpeg", ".webp"]) {
    const p = base + ext;
    if (fs.existsSync(p)) return p;
  }
  const legacy = path.join(root, "assets", "youtube", "thumbnails", `${safe}.jpg`);
  if (fs.existsSync(legacy)) return legacy;
  const rel = doc.youtube_thumbnail_file;
  if (!rel) return null;
  const g = path.isAbsolute(rel) ? rel : path.join(root, rel);
  return fs.existsSync(g) ? g : null;
}

module.exports = { resolveThumbnailPathForEntry };
