#!/usr/bin/env node
/**
 * Renders FullVideo-{locale}-{Light|Dark} into out/FullVideo/{theme}/{safeLocale}.mp4
 * Locales: readFullVideoLocales (en-GB / en-CA / en-AU skipped — same as en-US).
 * and writes out/FullVideo/manifest.json listing locale, theme, file.
 *
 * Usage:
 *   node scripts/render-fullvideo-all.cjs --theme light
 *   node scripts/render-fullvideo-all.cjs --theme both
 *   node scripts/render-fullvideo-all.cjs --theme dark --only en-US,ar
 *   node scripts/render-fullvideo-all.cjs --skip-existing
 *   node scripts/render-fullvideo-all.cjs --theme both --then-upload --upload-privacy public
 */

"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const {
  readFullVideoLocales,
  safeLocaleFileName,
} = require("./lib/read-supported-locales.cjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_ROOT = path.join(ROOT, "out", "FullVideo");

function themeSuffix(theme) {
  return theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase();
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let themeArg = "light";
  const ti = argv.indexOf("--theme");
  if (ti >= 0 && argv[ti + 1]) themeArg = argv[ti + 1].toLowerCase();
  const themes =
    themeArg === "both" ? ["light", "dark"] : [themeArg];
  for (const t of themes) {
    if (!["light", "dark"].includes(t)) {
      console.error('--theme must be "light", "dark", or "both"');
      process.exit(1);
    }
  }

  let only = null;
  const oi = argv.indexOf("--only");
  if (oi >= 0 && argv[oi + 1]) {
    only = new Set(
      argv[oi + 1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  const skipExisting = argv.includes("--skip-existing");
  const thenUpload = argv.includes("--then-upload");
  let uploadPrivacy = "public";
  const upi = argv.indexOf("--upload-privacy");
  if (upi >= 0 && argv[upi + 1]) uploadPrivacy = argv[upi + 1];
  if (!["private", "unlisted", "public"].includes(uploadPrivacy)) {
    console.error('--upload-privacy must be "private", "unlisted", or "public"');
    process.exit(1);
  }
  return { themes, only, skipExisting, thenUpload, uploadPrivacy };
}

function main() {
  const { themes, only, skipExisting, thenUpload, uploadPrivacy } = parseArgs();
  let locales = readFullVideoLocales(ROOT);
  if (only) {
    locales = locales.filter((l) => only.has(l));
  }
  if (locales.length === 0) {
    console.error("No locales to render.");
    process.exit(1);
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    items: [],
  };

  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (const theme of themes) {
    const suffix = themeSuffix(theme);
    const outDir = path.join(OUT_ROOT, theme);
    fs.mkdirSync(outDir, { recursive: true });

    for (const locale of locales) {
      const compId = `FullVideo-${locale}-${suffix}`;
      const safe = safeLocaleFileName(locale);
      const outFile = path.join(outDir, `${safe}.mp4`);

      if (skipExisting && fs.existsSync(outFile)) {
        const st = fs.statSync(outFile);
        if (st.size > 0) {
          console.log(`⏭ skip (exists): ${compId}`);
          manifest.items.push({
            locale,
            theme,
            composition_id: compId,
            file: outFile,
          });
          skipped++;
          continue;
        }
      }

      console.log(`\n▶ ${compId} → ${path.relative(ROOT, outFile)}`);
      try {
        execFileSync(
          "npx",
          ["remotion", "render", compId, outFile],
          { cwd: ROOT, stdio: "inherit", env: process.env }
        );
        manifest.items.push({
          locale,
          theme,
          composition_id: compId,
          file: outFile,
        });
        ok++;
      } catch {
        failed++;
      }
    }
  }

  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const manifestPath = path.join(OUT_ROOT, "manifest.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`\n═══════════════════════════════════`);
  console.log(`Manifest: ${path.relative(ROOT, manifestPath)}`);
  console.log(`Done: ${ok} rendered, ${skipped} skipped, ${failed} failed`);
  if (failed) process.exit(1);

  if (thenUpload) {
    console.log(`\n▶ youtube-upload.cjs --privacy ${uploadPrivacy}`);
    execFileSync(
      process.execPath,
      [path.join(__dirname, "youtube-upload.cjs"), "--privacy", uploadPrivacy],
      { cwd: ROOT, stdio: "inherit", env: process.env }
    );
  }
}

main();
