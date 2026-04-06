"use strict";

const fs = require("fs");
const path = require("path");

/**
 * English variants that share the same VO/copy as en-US — only one FullVideo + YouTube row (en-US).
 */
const ENGLISH_VIDEO_DEDUPE_SKIP = new Set(["en-GB", "en-CA", "en-AU"]);

/**
 * Locale keys from `translations` in translations.ts (same pattern as voice-prompts).
 */
function readSupportedLocales(videoRoot) {
  const p = path.join(videoRoot, "src", "i18n", "translations.ts");
  const src = fs.readFileSync(p, "utf8");
  const seen = new Set();
  const locales = [];
  const re = /"([a-z]{2}(?:-[A-Z]{2})?)":\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const loc = m[1];
    if (seen.has(loc)) continue;
    seen.add(loc);
    locales.push(loc);
  }
  return locales.sort((a, b) => {
    if (a === "en-US") return -1;
    if (b === "en-US") return 1;
    return a.localeCompare(b, "en");
  });
}

/**
 * Locales for FullVideo render, YouTube config, and thumbnail batch (no duplicate English).
 */
function readFullVideoLocales(videoRoot) {
  return readSupportedLocales(videoRoot).filter((l) => !ENGLISH_VIDEO_DEDUPE_SKIP.has(l));
}

function safeLocaleFileName(locale) {
  return locale.replace(/[^a-zA-Z0-9]/g, "_");
}

module.exports = { readSupportedLocales, readFullVideoLocales, safeLocaleFileName };
