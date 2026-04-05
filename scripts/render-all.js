#!/usr/bin/env node
/**
 * Batch-render all locale × theme combinations.
 * Usage:
 *   node scripts/render-all.js [--scene Scene1] [--theme dark|light|both] [--locale en-US,ru-RU|all]
 *
 * Examples:
 *   node scripts/render-all.js                          # all locales, both themes
 *   node scripts/render-all.js --theme light            # all locales, light only
 *   node scripts/render-all.js --locale en-US,ru-RU     # two locales, both themes
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ALL_LOCALES = [
  "en-US","en-GB","en-AU","en-CA",
  "ru-RU","uk",
  "de-DE",
  "es-ES","es-419",
  "fr-FR","fr-CA",
  "it-IT",
  "pt-BR","pt-PT",
  "nl-NL","no-NO","sv-SE","da","fi",
  "pl-PL","cs","sk","ro","hu","hr",
  "tr-TR","el","he","ar",
  "hi-IN","ja-JP","ko-KR","zh-CN","zh-TW",
  "th","vi","id-ID","ms","ca",
];

const ALL_THEMES = ["dark", "light"];

// --- Parse args ---
const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const sceneId   = get("--scene") || "Scene1";
const themeArg  = get("--theme") || "both";
const localeArg = get("--locale") || "all";

const themes  = themeArg === "both" ? ALL_THEMES : [themeArg];
const locales = localeArg === "all" ? ALL_LOCALES : localeArg.split(",");

const outDir = path.join(__dirname, "..", "out", sceneId);
fs.mkdirSync(outDir, { recursive: true });

let total = 0, failed = 0;

for (const theme of themes) {
  for (const locale of locales) {
    const safeLocale = locale.replace(/[^a-zA-Z0-9]/g, "_");
    const outFile = path.join(outDir, `${sceneId}_${theme}_${safeLocale}.mp4`);
    const props = JSON.stringify({ theme, locale });

    console.log(`\n▶ Rendering ${sceneId} | theme=${theme} | locale=${locale}`);
    try {
      execSync(
        `npx remotion render ${sceneId} "${outFile}" --props='${props}'`,
        { stdio: "inherit", cwd: path.join(__dirname, "..") }
      );
      console.log(`  ✅ Saved → ${outFile}`);
      total++;
    } catch (e) {
      console.error(`  ❌ Failed: ${e.message}`);
      failed++;
    }
  }
}

console.log(`\n═══════════════════════════════════`);
console.log(`Done: ${total} rendered, ${failed} failed`);
console.log(`Output: ${outDir}`);
