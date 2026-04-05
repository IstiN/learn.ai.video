#!/usr/bin/env node
/**
 * generate-locale-scripts.mjs
 *
 * Reads src/audio/voice-scripts.json (base English scripts) and
 * src/i18n/translations.ts (all locale strings) and outputs one JSON file
 * per locale into output/locale-scripts/{locale}.json.
 *
 * Each output file contains the full script for that locale, ready to be
 * sent to a TTS service (ElevenLabs, etc.) for audio generation.
 *
 * Usage:
 *   node scripts/generate-locale-scripts.mjs
 *   node scripts/generate-locale-scripts.mjs --locale ru
 *   node scripts/generate-locale-scripts.mjs --format tts   (flat text per scene)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Load voice-scripts.json ──────────────────────────────────────────────────
const voiceScripts = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/audio/voice-scripts.json"), "utf8")
);

// ── Extract translations from translations.ts ─────────────────────────────
// We parse the TypeScript file as text and extract locale blocks
const translationsRaw = fs.readFileSync(
  path.join(ROOT, "src/i18n/translations.ts"),
  "utf8"
);

/**
 * Extracts all key-value pairs from a single locale block.
 * Returns a Record<string, string>.
 */
function parseLocaleBlock(block) {
  const result = {};
  // Match: key: "value", (handles escaped quotes)
  const re = /\b(\w+):\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    result[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  }
  return result;
}

/**
 * Extracts all locale blocks from translations.ts.
 * Returns Record<locale, Record<key, value>>.
 */
function extractAllLocales(src) {
  const locales = {};
  // Match "locale": { ... }
  const localeRe = /"([a-z]{2}(?:-[A-Z]{2})?)":\s*\{/g;
  let m;
  while ((m = localeRe.exec(src)) !== null) {
    const locale = m[1];
    const start = m.index + m[0].length;
    // Find matching closing brace
    let depth = 1;
    let i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
      i++;
    }
    const block = src.slice(start, i - 1);
    locales[locale] = parseLocaleBlock(block);
  }
  return locales;
}

const allLocales = extractAllLocales(translationsRaw);
const enStrings = allLocales["en-US"] ?? {};

console.log(`Found ${Object.keys(allLocales).length} locales in translations.ts`);

/** Resolve a short code like "ru" → "ru-RU" if full code not found */
function resolveLocale(input) {
  if (allLocales[input]) return input;
  const prefix = input.split("-")[0];
  return Object.keys(allLocales).find((k) => k.startsWith(prefix + "-")) ?? input;
}

// ── Argument parsing ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const localeFilter = args.includes("--locale")
  ? resolveLocale(args[args.indexOf("--locale") + 1])
  : null;
const format = args.includes("--format")
  ? args[args.indexOf("--format") + 1]
  : "json"; // "json" | "tts"

// ── Output directory ──────────────────────────────────────────────────────
const outDir = path.join(ROOT, "output/locale-scripts");
fs.mkdirSync(outDir, { recursive: true });

// ── Build output per locale ───────────────────────────────────────────────
const targetLocales = localeFilter
  ? [localeFilter]
  : Object.keys(allLocales);

for (const locale of targetLocales) {
  const strings = allLocales[locale] ?? {};

  // Helper: resolve a key → locale value → fallback en-US → fallback raw "en" text
  function resolve(key, enFallback) {
    return strings[key] ?? enStrings[key] ?? enFallback ?? `[${key}]`;
  }

  if (format === "tts") {
    // ── Flat TTS format: one text block per scene ─────────────────────────
    let output = `# FamilyLearn.AI — TTS Script [${locale}]\n\n`;
    for (const scene of voiceScripts.scenes) {
      output += `## Scene ${scene.index} — ${scene.title}\n`;
      output += `Tone: ${scene.tone}\n\n`;
      for (const line of scene.lines) {
        const speaker = line.speaker === "alex" ? "Speaker 1 (Alex)" : "Speaker 2 (Maya)";
        const text = resolve(line.key, line.en);
        output += `${speaker}: ${text}\n`;
      }
      output += "\n---\n\n";
    }
    const outFile = path.join(outDir, `${locale}.md`);
    fs.writeFileSync(outFile, output);
    console.log(`  ✓ ${locale}.md`);
  } else {
    // ── JSON format: structured data ──────────────────────────────────────
    const output = {
      locale,
      generated_at: new Date().toISOString(),
      speakers: voiceScripts.speakers,
      scenes: voiceScripts.scenes.map((scene) => ({
        ...scene,
        lines: scene.lines.map((line) => ({
          ...line,
          text: resolve(line.key, line.en),
        })),
      })),
    };
    const outFile = path.join(outDir, `${locale}.json`);
    fs.writeFileSync(outFile, JSON.stringify(output, null, 2));
    console.log(`  ✓ ${locale}.json`);
  }
}

console.log(`\nDone. Output in: output/locale-scripts/`);
console.log(`\nTo generate TTS-ready markdown files, run:`);
console.log(`  node scripts/generate-locale-scripts.mjs --format tts`);
console.log(`To generate for a single locale:`);
console.log(`  node scripts/generate-locale-scripts.mjs --locale ru --format tts`);
