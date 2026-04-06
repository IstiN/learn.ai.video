"use strict";

const fs = require("fs");
const path = require("path");

/** Video locale → store folder when names differ. */
const VIDEO_TO_ANDROID = {
  "en-GB": "en-US",
  "en-AU": "en-US",
  "en-CA": "en-US",
  "pt-PT": "pt-BR",
};

function metadataRoot(repoRoot) {
  return path.join(repoRoot, "flutter_app", "fastlane", "metadata");
}

function androidDir(metaRoot, loc) {
  return path.join(metaRoot, "android", loc);
}

function iosDir(metaRoot, loc) {
  return path.join(metaRoot, "ios", loc);
}

function tryAndroid(metaRoot, loc) {
  const d = androidDir(metaRoot, loc);
  const titleF = path.join(d, "title.txt");
  const descF = path.join(d, "full_description.txt");
  if (fs.existsSync(titleF) && fs.existsSync(descF)) {
    return { platform: "android", locale: loc, titleFile: titleF, descriptionFile: descF };
  }
  return null;
}

function tryIos(metaRoot, loc) {
  const d = iosDir(metaRoot, loc);
  const titleF = path.join(d, "name.txt");
  const descF = path.join(d, "description.txt");
  if (fs.existsSync(titleF) && fs.existsSync(descF)) {
    return { platform: "ios", locale: loc, titleFile: titleF, descriptionFile: descF };
  }
  return null;
}

/**
 * Resolve Fastlane bundle for a Remotion video locale.
 * For each candidate locale (video locale → alias → en-US): try Android, then iOS.
 * Important: do not scan all Android before iOS — locales like `ca`/`cs` often exist only on iOS;
 * the old "all Android first" order picked `en-US` Android and produced English descriptions wrongly.
 * @param {string} repoRoot - monorepo root (parent of flutter_app)
 * @param {string} videoLocale - e.g. en-US, el, pt-PT
 */
function resolveStoreBundle(repoRoot, videoLocale) {
  const metaRoot = metadataRoot(repoRoot);
  if (!fs.existsSync(metaRoot)) {
    return null;
  }

  const chain = [videoLocale];
  const alias = VIDEO_TO_ANDROID[videoLocale];
  if (alias && !chain.includes(alias)) chain.push(alias);
  if (!chain.includes("en-US")) chain.push("en-US");

  for (const loc of chain) {
    const a = tryAndroid(metaRoot, loc);
    if (a) return a;
    const i = tryIos(metaRoot, loc);
    if (i) return i;
  }
  return null;
}

function readText(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim();
}

/**
 * @returns {{ title: string, description: string, storeLocale: string, platform: string } | null}
 */
function getStoreListingForYoutube(repoRoot, videoLocale) {
  const bundle = resolveStoreBundle(repoRoot, videoLocale);
  if (!bundle) return null;
  return {
    title: readText(bundle.titleFile).replace(/\s+/g, " "),
    description: readText(bundle.descriptionFile),
    storeLocale: bundle.locale,
    platform: bundle.platform,
  };
}

function youtubeTitleFromStore(storeTitle, theme) {
  const suffix = theme.toLowerCase() === "dark" ? " · Dark" : " · Light";
  const max = 100;
  const budget = max - suffix.length;
  const base = storeTitle.length > budget ? storeTitle.slice(0, budget - 1).trimEnd() + "…" : storeTitle;
  return `${base}${suffix}`;
}

module.exports = {
  resolveStoreBundle,
  getStoreListingForYoutube,
  youtubeTitleFromStore,
  metadataRoot,
};
