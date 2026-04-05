#!/usr/bin/env node
/**
 * voice-prompts-from-json.mjs
 *
 * Builds TTS-ready prompt text from src/audio/voice-scripts.json + src/i18n/translations.ts.
 * Dialogue lines use the same keys as on-screen video copy (translations).
 *
 * Output layout:
 *   output/tts-prompts/{locale}/{scene_id}.txt
 *   output/tts-prompts/manifest.json
 *
 * Prompt shape (per scene file):
 *   Man student — …
 *   ... Woman — … (second cast line, no repeated role label)
 *
 *   Scene direction: …
 *
 *   Speaker 1: …
 *   ... (same speaker continues, no repeated "Speaker N:")
 *   Speaker 2: …
 *
 * Usage:
 *   node scripts/voice-prompts-from-json.mjs
 *   node scripts/voice-prompts-from-json.mjs --all-locales   (one folder per translations key; duplicates API work avoided later by tts-generate-unique)
 *   node scripts/voice-prompts-from-json.mjs --locale ru-RU
 *   node scripts/voice-prompts-from-json.mjs --locale en-US --scene scene1
 *
 * Default: one prompt set per audio folder prefix (en-US only for en-*, zh-CN for zh-*, etc.)
 * so regional variants are not duplicated on disk or in TTS grouping.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const voiceScripts = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/audio/voice-scripts.json"), "utf8")
);

const translationsRaw = fs.readFileSync(
  path.join(ROOT, "src/i18n/translations.ts"),
  "utf8"
);

function parseLocaleBlock(block) {
  const result = {};
  const re = /\b(\w+):\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    result[m[1]] = m[2]
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
  }
  return result;
}

function extractAllLocales(src) {
  const locales = {};
  const localeRe = /"([a-z]{2}(?:-[A-Z]{2})?)":\s*\{/g;
  let m;
  while ((m = localeRe.exec(src)) !== null) {
    const locale = m[1];
    const start = m.index + m[0].length;
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

function resolveLocale(input) {
  if (allLocales[input]) return input;
  const prefix = input.split("-")[0];
  return Object.keys(allLocales).find((k) => k.startsWith(prefix + "-")) ?? input;
}

/** Same folder as `public/audio/{prefix}/` — must match tts-generate-unique.mjs */
function audioSubdir(locale) {
  const i = locale.indexOf("-");
  return i > 0 ? locale.slice(0, i).toLowerCase() : locale.toLowerCase();
}

/**
 * When several translation keys share one audio prefix (en-US, en-GB → en/),
 * only emit prompts for the canonical locale so TTS is not duplicated.
 */
const CANONICAL_LOCALE_BY_PREFIX = new Map([
  ["en", "en-US"],
  ["es", "es-ES"],
  ["fr", "fr-FR"],
  ["pt", "pt-BR"],
  ["zh", "zh-CN"],
]);

function canonicalPromptLocales(allKeys) {
  const byPrefix = new Map();
  for (const loc of allKeys) {
    const sub = audioSubdir(loc);
    if (!byPrefix.has(sub)) byPrefix.set(sub, []);
    byPrefix.get(sub).push(loc);
  }
  const chosen = [];
  for (const [sub, list] of byPrefix) {
    if (list.length === 1) {
      chosen.push(list[0]);
      continue;
    }
    const canonical = CANONICAL_LOCALE_BY_PREFIX.get(sub);
    if (canonical && list.includes(canonical)) {
      chosen.push(canonical);
      continue;
    }
    const sorted = [...list].sort();
    chosen.push(sorted[0]);
    console.warn(
      `voice-prompts: prefix "${sub}" has ${list.length} locales, no canonical — using ${sorted[0]}`
    );
  }
  return [...new Set(chosen)].sort();
}

/** Alex: "Man — …" → "Man student — …" (matches sample prompt style). */
function formatAlexHeader(role, voiceDescription) {
  const parts = voiceDescription.split(/\s*—\s*/);
  if (parts.length >= 2) {
    const lead = parts[0].trim();
    const tail = parts.slice(1).join(" — ").trim();
    return `${lead} ${role.toLowerCase()} — ${tail}`;
  }
  return `${role}: ${voiceDescription}`;
}

function ensureSentenceEnd(s) {
  const t = s.trim();
  if (/[.!?…]$/.test(t)) return t;
  return `${t}.`;
}

function buildSpeakerHeaders(speakers) {
  const alex = speakers.alex;
  const maya = speakers.maya;
  const first = ensureSentenceEnd(
    formatAlexHeader(alex.role, alex.voice_description)
  );
  const second = ensureSentenceEnd(`... ${maya.voice_description.trim()}`);
  return [first, second].join("\n");
}

function speakerLabel(speakerId) {
  return speakerId === "alex" ? "Speaker 1" : "Speaker 2";
}

/** Label for manifest / same rules as prompt line prefix. */
function promptLabelForLine(speakerId, prevSpeakerId) {
  if (prevSpeakerId !== undefined && prevSpeakerId === speakerId) {
    return "...";
  }
  return speakerLabel(speakerId);
}

function buildScenePrompt(scene, strings, enFallback) {
  function resolve(key, enLine) {
    return strings[key] ?? enFallback[key] ?? enLine ?? `[${key}]`;
  }

  const header = buildSpeakerHeaders(voiceScripts.speakers);
  const direction = `Scene direction: ${scene.tone}`;

  const dialogue = scene.lines.map((line, i) => {
    const text = resolve(line.key, line.en);
    const prev = i > 0 ? scene.lines[i - 1].speaker : undefined;
    if (prev === line.speaker) {
      return `... ${text}`;
    }
    return `${speakerLabel(line.speaker)}: ${text}`;
  });

  return [header, "", direction, "", ...dialogue].join("\n");
}

const args = process.argv.slice(2);
const localeArg = args.includes("--locale")
  ? resolveLocale(args[args.indexOf("--locale") + 1])
  : null;
const sceneFilter = args.includes("--scene")
  ? args[args.indexOf("--scene") + 1]
  : null;
const allLocalesFlag = args.includes("--all-locales");

const outRoot = path.join(ROOT, "output/tts-prompts");

if (!localeArg && !sceneFilter) {
  fs.rmSync(outRoot, { recursive: true, force: true });
}
fs.mkdirSync(outRoot, { recursive: true });

let targetLocales;
if (localeArg) {
  targetLocales = [localeArg];
} else if (allLocalesFlag) {
  targetLocales = Object.keys(allLocales).sort();
} else {
  targetLocales = canonicalPromptLocales(Object.keys(allLocales));
}

const manifest = [];

for (const locale of targetLocales) {
  const strings = allLocales[locale] ?? {};
  const localeDir = path.join(outRoot, locale);
  fs.mkdirSync(localeDir, { recursive: true });

  for (const scene of voiceScripts.scenes) {
    if (sceneFilter && scene.id !== sceneFilter) continue;

    const body = buildScenePrompt(scene, strings, enStrings);
    const fileName = `${scene.id}.txt`;
    const filePath = path.join(localeDir, fileName);
    fs.writeFileSync(filePath, `${body}\n`, "utf8");

    manifest.push({
      locale,
      scene_id: scene.id,
      scene_index: scene.index,
      scene_title: scene.title,
      file: path.relative(ROOT, filePath),
      translation_keys: scene.lines.map((l) => l.key),
      line_speakers: scene.lines.map((l, i) => ({
        key: l.key,
        speaker: l.speaker,
        prompt_label: promptLabelForLine(
          l.speaker,
          i > 0 ? scene.lines[i - 1].speaker : undefined
        ),
      })),
    });
  }
}

const manifestPath = path.join(outRoot, "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

const modeHint = localeArg
  ? "(single locale)"
  : allLocalesFlag
    ? "(all translation keys)"
    : "(canonical per audio prefix: en-US, zh-CN, …)";
console.log(
  `Wrote ${manifest.length} prompt file(s) under output/tts-prompts/ + manifest.json ${modeHint}`
);
