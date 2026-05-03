#!/usr/bin/env node
/**
 * Build or merge data/youtube-videos.json: one row per (locale × theme) with
 * composition_id, title, description (edit descriptions per language before upload).
 *
 * Usage:
 *   node scripts/sync-youtube-videos-config.cjs
 *   node scripts/sync-youtube-videos-config.cjs --themes light
 *   node scripts/sync-youtube-videos-config.cjs --only-new   (do not overwrite title/description of existing rows)
 *
 * Titles/descriptions default from flutter_app/fastlane/metadata (Play + iOS fallback), same copy as store listings.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { readFullVideoLocales } = require("./lib/read-supported-locales.cjs");
const {
  getStoreListingForYoutube,
  youtubeTitleFromStore,
  youtubeTitleBaseFromListing,
} = require("./lib/store-metadata-for-youtube.cjs");

const ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(ROOT, "..");
const OUT = path.join(ROOT, "data", "youtube-videos.json");

const THEMES_DEFAULT = ["light", "dark"];

/** When Fastlane metadata is missing (should be rare). */
const FALLBACK_DESCRIPTION = `FamilyLearn.AI — your personal AI learning companion.

https://familylearn.ai
Google Play: https://play.google.com/store/apps/details?id=pro.ainative.learn
App Store: https://apps.apple.com/app/id6756234872`;

function themeSuffix(theme) {
  return theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase();
}

function fallbackTitle(locale, theme) {
  return `FamilyLearn.AI — ${locale} (${theme})`.slice(0, 100);
}

function storeBackedTitleAndDescription(locale, theme) {
  const listing = getStoreListingForYoutube(REPO_ROOT, locale);
  if (!listing) {
    return {
      title: fallbackTitle(locale, theme),
      description: FALLBACK_DESCRIPTION,
    };
  }
  const titleBase = youtubeTitleBaseFromListing(listing);
  const title = youtubeTitleFromStore(titleBase, theme);
  const description = listing.description.slice(0, 5000);
  return { title, description };
}

function compositionId(locale, theme) {
  return `FullVideo-${locale}-${themeSuffix(theme)}`;
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let themes = THEMES_DEFAULT;
  const ti = argv.indexOf("--themes");
  if (ti >= 0 && argv[ti + 1]) {
    themes = argv[ti + 1]
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  const onlyNew = argv.includes("--only-new");
  return { themes, onlyNew };
}

function entryKey(locale, theme) {
  return `${locale}\n${theme}`;
}

function main() {
  const { themes, onlyNew } = parseArgs();
  const locales = readFullVideoLocales(ROOT);

  let prev = { schema_version: 2, videos: [] };
  if (fs.existsSync(OUT)) {
    prev = JSON.parse(fs.readFileSync(OUT, "utf8"));
  }
  const prevMap = new Map();
  for (const v of prev.videos || []) {
    prevMap.set(entryKey(v.locale, v.theme), v);
  }

  const videos = [];
  for (const locale of locales) {
    for (const theme of themes) {
      const key = entryKey(locale, theme);
      const old = prevMap.get(key);
      if (old) {
        if (onlyNew) {
          videos.push({
            ...old,
            composition_id: compositionId(locale, theme),
          });
        } else {
          const fresh = storeBackedTitleAndDescription(locale, theme);
          videos.push({
            locale,
            theme,
            composition_id: compositionId(locale, theme),
            title: fresh.title,
            description: fresh.description,
            video: old.video ?? null,
          });
        }
      } else {
        const fresh = storeBackedTitleAndDescription(locale, theme);
        videos.push({
          locale,
          theme,
          composition_id: compositionId(locale, theme),
          title: fresh.title,
          description: fresh.description,
          video: null,
        });
      }
    }
  }

  const doc = {
    schema_version: 2,
    _comment:
      "Each row: locale + theme + YouTube metadata. Render: out/FullVideo/{theme}/{locale_safe}.mp4. Fill video after youtube-upload.cjs. title/description sync from fastlane/store via sync script.",
    render_path_pattern: "out/FullVideo/{theme}/{locale_safe}.mp4",
    youtube_thumbnail_file:
      prev.youtube_thumbnail_file || "assets/youtube/promo-thumbnail.jpg",
    _youtube_thumbnail_comment:
      "Per row: assets/youtube/thumbnails/{locale_safe}_{theme}.png from npm run youtube:thumbnail:all. Fallback: youtube_thumbnail_file.",
    last_config_sync: new Date().toISOString(),
    videos,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT} (${videos.length} videos = ${locales.length} locales × ${themes.length} themes)`);
}

main();
