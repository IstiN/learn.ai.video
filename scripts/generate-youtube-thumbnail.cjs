#!/usr/bin/env node
/**
 * YouTube thumbnails from theme bases + localized hook / subline (Montserrat ExtraBold).
 *
 * Bases: assets/youtube/source-thumbnail-light.jpg | source-thumbnail-dark.jpg
 *
 *   npm run youtube:thumbnail -- --theme light
 *   npm run youtube:thumbnail:all
 *   node scripts/generate-youtube-thumbnail.cjs --input-light ./x.jpg --input-dark ./y.jpg --all
 *
 * Output: assets/youtube/thumbnails/{locale_safe}_{theme}.png (prefers PNG; JPEG if >2MB)
 * Copy: data/youtube-thumbnail-strings.json
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const STRINGS_PATH = path.join(ROOT, "data", "youtube-thumbnail-strings.json");
const THUMB_DIR = path.join(ROOT, "assets", "youtube", "thumbnails");
const FONT_PATH = path.join(ROOT, "assets", "fonts", "Montserrat-ExtraBold.ttf");
const DEFAULT_LIGHT = path.join(ROOT, "assets", "youtube", "source-thumbnail-light.jpg");
const DEFAULT_DARK = path.join(ROOT, "assets", "youtube", "source-thumbnail-dark.jpg");
const OUT_W = 1280;
const OUT_H = 720;
const MAX_BYTES = 2 * 1024 * 1024;

const { readFullVideoLocales, safeLocaleFileName } = require("./lib/read-supported-locales.cjs");

const GOLD = "#FFD700";
const CYAN = "#00E5FF";

function parseArgs() {
  const argv = process.argv.slice(2);
  /** One theme, or both when omitted (non-`--all` runs). */
  let themes = ["light", "dark"];
  let allLocales = argv.includes("--all");
  let locale = "en-US";
  let variant = null;
  let inputLight = null;
  let inputDark = null;
  let out = null;

  const ti = argv.indexOf("--theme");
  if (ti >= 0 && argv[ti + 1]) {
    const t = argv[ti + 1].trim().toLowerCase();
    themes = t === "both" ? ["light", "dark"] : [t];
  }
  const li = argv.indexOf("--locale");
  if (li >= 0 && argv[li + 1]) locale = argv[li + 1].trim();
  const vi = argv.indexOf("--variant");
  if (vi >= 0 && argv[vi + 1]) {
    variant = Number(argv[vi + 1]);
    if (Number.isNaN(variant) || variant < 0 || variant > 3) {
      console.error("--variant must be 0–3");
      process.exit(1);
    }
  }
  const il = argv.indexOf("--input-light");
  if (il >= 0 && argv[il + 1]) inputLight = path.resolve(ROOT, argv[il + 1]);
  const id = argv.indexOf("--input-dark");
  if (id >= 0 && argv[id + 1]) inputDark = path.resolve(ROOT, argv[id + 1]);
  const oi = argv.indexOf("--out");
  if (oi >= 0 && argv[oi + 1]) out = path.resolve(ROOT, argv[oi + 1]);

  return { themes, allLocales, locale, variant, inputLight, inputDark, out };
}

function loadStrings() {
  const raw = JSON.parse(fs.readFileSync(STRINGS_PATH, "utf8"));
  return { hooks: raw.hooks || {}, subline: raw.subline || {} };
}

function pickHooksArray(hooks, locale) {
  if (locale === "zh-TW" && hooks["zh-TW"]) return hooks["zh-TW"];
  if (locale.startsWith("zh") && hooks["zh-CN"]) return hooks["zh-CN"];
  const base = locale.split("-")[0];
  if (hooks[base]) return hooks[base];
  return hooks.en || [{ line: "LEARNING WITHOUT TEARS", accent: "WITHOUT TEARS" }];
}

function pickSubline(sublineMap, locale) {
  if (locale === "zh-TW" && sublineMap["zh-TW"]) return sublineMap["zh-TW"];
  if (locale.startsWith("zh") && sublineMap["zh-CN"]) return sublineMap["zh-CN"];
  const base = locale.split("-")[0];
  if (sublineMap[base]) return sublineMap[base];
  return sublineMap.en || "FamilyLearn.ai overview";
}

function variantIndex(locale, theme, forced) {
  if (forced !== null && forced !== undefined) return forced;
  const s = `${locale}:${theme}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 4;
}

function accentColor(vi) {
  return vi % 2 === 0 ? GOLD : CYAN;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function accentParts(line, accent) {
  if (!accent) return [{ text: line, accent: false }];
  const i = line.indexOf(accent);
  if (i < 0) return [{ text: line, accent: false }];
  const out = [];
  if (i > 0) out.push({ text: line.slice(0, i), accent: false });
  out.push({ text: accent, accent: true });
  if (i + accent.length < line.length) out.push({ text: line.slice(i + accent.length), accent: false });
  return out;
}

function hookFontSize(line) {
  const n = line.length;
  if (n <= 18) return 48;
  if (n <= 28) return 40;
  if (n <= 40) return 34;
  if (n <= 52) return 28;
  return 24;
}

function buildHookTspans(line, accent, accentFill) {
  const parts = accentParts(line, accent);
  return parts
    .map((p) => {
      const fill = p.accent ? accentFill : "#FFFFFF";
      const stroke = p.accent ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.55)";
      const sw = p.accent ? 2.2 : 3;
      return `<tspan fill="${fill}" stroke="${stroke}" stroke-width="${sw}" paint-order="stroke fill">${escapeXml(
        p.text
      )}</tspan>`;
    })
    .join("");
}

function isRtlLocale(locale) {
  const b = locale.split("-")[0];
  return b === "ar" || b === "he";
}

function fontFaceBlock() {
  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`Missing font: ${FONT_PATH} (add Montserrat ExtraBold TTF)`);
  }
  const b64 = fs.readFileSync(FONT_PATH).toString("base64");
  return `<style type="text/css"><![CDATA[
@font-face {
  font-family: 'MontserratThumb';
  src: url('data:font/truetype;charset=utf-8;base64,${b64}') format('truetype');
  font-weight: 800;
  font-style: normal;
}
]]></style>`;
}

function buildOverlaySvg({ locale, theme, hookObj, sublineText, variantIdx }) {
  const accentFill = accentColor(variantIdx);
  const fsHook = hookFontSize(hookObj.line);
  const rtl = isRtlLocale(locale);
  const dir = rtl ? 'direction: rtl; unicode-bidi: plaintext;' : "";

  const hookInner = buildHookTspans(hookObj.line, hookObj.accent, accentFill);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OUT_W}" height="${OUT_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${fontFaceBlock()}
    <radialGradient id="vignette" cx="50%" cy="48%" r="68%">
      <stop offset="35%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="${theme === "dark" ? "0.5" : "0.38"}"/>
    </radialGradient>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>
  <rect width="${OUT_W}" height="${OUT_H}" fill="url(#vignette)"/>
  <g opacity="0.92">
    <rect x="718" y="46" width="522" height="198" rx="22" fill="rgba(6,4,20,0.42)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  </g>
  <g transform="translate(1228, 108) rotate(-3.5)" filter="url(#textShadow)">
    <text
      x="0"
      y="0"
      text-anchor="end"
      font-family="MontserratThumb, Arial Black, sans-serif"
      font-weight="800"
      font-size="${fsHook}"
      letter-spacing="0.02em"
      filter="url(#softGlow)"
      style="${dir}"
    >${hookInner}</text>
    <text
      x="0"
      y="${Math.round(fsHook * 1.05 + 18)}"
      text-anchor="end"
      font-family="MontserratThumb, Arial Black, sans-serif"
      font-weight="800"
      font-size="21"
      fill="#F0ECFF"
      stroke="rgba(0,0,0,0.45)"
      stroke-width="1.5"
      paint-order="stroke fill"
      letter-spacing="0.04em"
      style="${dir}"
    >${escapeXml(sublineText)}</text>
  </g>
  <text x="36" y="${OUT_H - 28}" font-family="MontserratThumb, Arial Black, sans-serif" font-weight="800"
    font-size="17" fill="#FFFFFF" stroke="rgba(0,0,0,0.5)" stroke-width="1.2" paint-order="stroke fill" opacity="0.92">familylearn.ai</text>
</svg>`;
}

async function renderBuffer(sharp, rawBuffer, svgString) {
  const bg = await sharp(rawBuffer)
    .resize(OUT_W, OUT_H, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const composite = { input: Buffer.from(svgString, "utf8"), top: 0, left: 0 };
  let buf = await sharp(bg).composite([composite]).png({ compressionLevel: 9 }).toBuffer();
  if (buf.length > MAX_BYTES) {
    buf = await sharp(bg).composite([composite]).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    return { buf, ext: ".jpg" };
  }
  return { buf, ext: ".png" };
}

async function main() {
  const sharp = require("sharp");
  const { themes, allLocales, locale, variant, inputLight, inputDark, out } = parseArgs();

  const lightPath = inputLight && fs.existsSync(inputLight) ? inputLight : DEFAULT_LIGHT;
  const darkPath = inputDark && fs.existsSync(inputDark) ? inputDark : DEFAULT_DARK;

  if (!fs.existsSync(lightPath)) {
    console.error(`Missing light base image: ${lightPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(darkPath)) {
    console.error(`Missing dark base image: ${darkPath}`);
    process.exit(1);
  }

  const { hooks, subline: sublineMap } = loadStrings();

  async function one(localeStr, th, explicitOut) {
    const baseFile = th === "dark" ? darkPath : lightPath;
    const raw = fs.readFileSync(baseFile);
    const hooksArr = pickHooksArray(hooks, localeStr);
    const vi = variantIndex(localeStr, th, variant);
    const hookObj = hooksArr[vi] || hooksArr[0];
    const sub = pickSubline(sublineMap, localeStr);
    const svg = buildOverlaySvg({
      locale: localeStr,
      theme: th,
      hookObj,
      sublineText: sub,
      variantIdx: vi,
    });
    const { buf, ext } = await renderBuffer(sharp, raw, svg);
    const safe = safeLocaleFileName(localeStr);
    const dest =
      explicitOut ||
      path.join(THUMB_DIR, `${safe}_${th}${ext}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    const st = fs.statSync(dest);
    console.log(
      `Wrote ${path.relative(ROOT, dest)} (${(st.size / 1024).toFixed(0)} KB) ${localeStr} ${th} hook#${vi} accent=${accentColor(vi)}`
    );
    if (st.size > MAX_BYTES) {
      console.warn(`  >2MB — YouTube may reject; compress manually.`);
    }
  }

  if (allLocales) {
    const locales = readFullVideoLocales(ROOT);
    fs.mkdirSync(THUMB_DIR, { recursive: true });
    for (const loc of locales) {
      for (const th of ["light", "dark"]) {
        await one(loc, th, null);
      }
    }
    console.log(`\nDone: ${locales.length * 2} files → ${path.relative(ROOT, THUMB_DIR)}/`);
    return;
  }

  if (out) {
    if (themes.length !== 1) {
      console.error("With --out, specify exactly one --theme (light or dark).");
      process.exit(1);
    }
    await one(locale, themes[0] === "dark" ? "dark" : "light", out);
    return;
  }

  for (const thRaw of themes) {
    const th = thRaw === "dark" ? "dark" : "light";
    await one(locale, th, null);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
