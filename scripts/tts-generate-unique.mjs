#!/usr/bin/env node
/**
 * Batch Gemini TTS: one API call per unique prompt text per scene, not per locale.
 *
 * - Matches getSceneAudio(): output dir is `public/audio/{lang}/` where
 *   `lang = locale.split("-")[0]` (en-US → en, ar → ar).
 * - Locales whose prompt files are byte-identical share one generation; WAV is
 *   written once, then copied to any other target paths in the same group (rare).
 * - If two locales map to the SAME audio path but prompts DIFFER (e.g. pt-BR vs pt-PT),
 *   the script exits with an error — fix audio routing or translations first.
 *
 * Prereq: `npm run tts:prompts`
 *
 * Usage (from learn.ai.video):
 *   node scripts/tts-generate-unique.mjs --dry-run
 *   node scripts/tts-generate-unique.mjs
 *   node scripts/tts-generate-unique.mjs --scene scene1
 *
 * Skips Gemini calls and copies when the target .wav already exists (size > 0).
 * Reuses an existing file in the same text-hash group as the source for other paths
 * (e.g. en/scene_5.wav exists → no API; only missing locales get copied from it).
 * Override: --force regenerates and overwrites everything.
 *
 * If two locales share the same audio folder (e.g. fr-FR + fr-CA → fr/) but prompts
 * differ, exit with error unless you pick one variant:
 *   --canonical-over=fr:fr-FR
 * (repeat flag for pt:pt-BR, etc.)
 *
 * Only scan certain language folders (audio subdir = part before "-"):
 *   --only-prefix=en,de,ru,uk
 *
 * Requires GEMINI_API_KEY; runs `go run ./cmd/tts-filegen` from ../api-service.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROMPTS = path.join(ROOT, "output/tts-prompts");
const API_SERVICE = path.resolve(ROOT, "..", "api-service");

/** Same as getSceneAudio / Go audioSubdir */
function audioSubdir(locale) {
  const i = locale.indexOf("-");
  return i > 0 ? locale.slice(0, i).toLowerCase() : locale.toLowerCase();
}

function sceneWavName(sceneId) {
  const rest = sceneId.replace(/^scene/i, "");
  return `scene_${rest}.wav`;
}

function hashContent(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function wavExists(absPath) {
  try {
    const s = fs.statSync(absPath);
    return s.isFile() && s.size > 0;
  } catch {
    return false;
  }
}

function normPath(p) {
  return path.resolve(p);
}

function listLocalesWithPrompts() {
  if (!fs.existsSync(PROMPTS)) return [];
  return fs
    .readdirSync(PROMPTS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  let sceneFilter = null;
  const i = argv.indexOf("--scene");
  if (i >= 0 && argv[i + 1]) sceneFilter = argv[i + 1];

  /** e.g. fr -> fr-FR when fr-FR and fr-CA disagree */
  const canonicalOver = new Map();
  for (const a of argv) {
    if (a.startsWith("--canonical-over=")) {
      const rest = a.slice("--canonical-over=".length);
      const [prefix, loc] = rest.split(":");
      if (prefix && loc) canonicalOver.set(prefix.toLowerCase(), loc);
    }
  }

  let onlyPrefix = null;
  const op = argv.find((x) => x.startsWith("--only-prefix="));
  if (op) {
    onlyPrefix = new Set(
      op
        .slice("--only-prefix=".length)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
  }

  return { dryRun, force, sceneFilter, canonicalOver, onlyPrefix };
}

/** When regional variants share one audio folder but differ, keep one VO source (override via CLI). */
const DEFAULT_CANONICAL_OVER = new Map([
  ["en", "en-US"],
  ["es", "es-ES"],
  ["fr", "fr-FR"],
  ["pt", "pt-BR"],
  ["zh", "zh-CN"],
]);

function resolveCanonicalOver(cliMap) {
  const m = new Map(DEFAULT_CANONICAL_OVER);
  for (const [k, v] of cliMap) m.set(k, v);
  return m;
}

const SCENE_IDS = [
  "scene1",
  "scene2",
  "scene3",
  "scene4",
  "scene5",
  "scene6",
  "scene7",
  "scene8",
  "scene9",
  "scene10",
];

function sleepMs(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function runTts(promptPath, outPath) {
  const absPrompt = path.resolve(promptPath);
  const absOut = path.resolve(outPath);
  fs.mkdirSync(path.dirname(absOut), { recursive: true });
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = spawnSync(
      "go",
      [
        "run",
        "./cmd/tts-filegen",
        "-prompt",
        absPrompt,
        "-out",
        absOut,
      ],
      {
        cwd: API_SERVICE,
        stdio: "inherit",
        env: process.env,
      }
    );
    if (r.error) throw r.error;
    if (r.status === 0) return;
    if (attempt < maxAttempts) {
      const wait = 4000 * attempt;
      console.warn(
        `TTS failed (exit ${r.status}), retry ${attempt + 1}/${maxAttempts} in ${wait}ms…`
      );
      sleepMs(wait);
    } else {
      process.exit(r.status ?? 1);
    }
  }
}

const { dryRun, force, sceneFilter, canonicalOver: canonicalCli, onlyPrefix } =
  parseArgs();
const canonicalOver = resolveCanonicalOver(canonicalCli);
let locales = listLocalesWithPrompts();
if (locales.length === 0) {
  console.error("No locales under output/tts-prompts/. Run: npm run tts:prompts");
  process.exit(1);
}

if (onlyPrefix) {
  locales = locales.filter((loc) => onlyPrefix.has(audioSubdir(loc)));
  console.log(`--only-prefix: ${locales.length} locale dir(s) to scan`);
}

let totalCalls = 0;
let totalCopies = 0;
let totalSkippedGen = 0;
let totalSkippedCopy = 0;

for (const sceneId of SCENE_IDS) {
  if (sceneFilter && sceneId !== sceneFilter) continue;

  const rows = [];
  for (const locale of locales) {
    const promptPath = path.join(PROMPTS, locale, `${sceneId}.txt`);
    if (!fs.existsSync(promptPath)) continue;
    const body = fs.readFileSync(promptPath);
    const h = hashContent(body);
    const sub = audioSubdir(locale);
    const outPath = path.join(ROOT, "public", "audio", sub, sceneWavName(sceneId));
    rows.push({ locale, sub, h, promptPath, outPath });
  }

  const byOut = new Map();
  for (const r of rows) {
    if (!byOut.has(r.outPath)) byOut.set(r.outPath, []);
    byOut.get(r.outPath).push(r);
  }

  const kept = [];
  for (const [outPath, list] of byOut) {
    const hashes = new Set(list.map((x) => x.h));
    if (hashes.size <= 1) {
      kept.push(...list);
      continue;
    }
    const sub = list[0].sub;
    const pick = canonicalOver.get(sub);
    if (!pick) {
      const locs = [...new Set(list.map((x) => x.locale))].join(", ");
      console.error(
        `\nConflict for ${outPath} (${sceneId}): locales ${locs} disagree but share folder "${sub}/" ` +
          `(getSceneAudio). Use --canonical-over=${sub}:<locale> to keep one variant, or align translations.\n`
      );
      process.exit(1);
    }
    const chosen = list.filter((r) => r.locale === pick);
    if (chosen.length === 0) {
      console.error(`--canonical-over=${sub}:${pick} but no prompt for ${pick} (${sceneId})`);
      process.exit(1);
    }
    const ch = chosen[0].h;
    if (chosen.some((r) => r.h !== ch)) {
      console.error(`Internal: canonical ${pick} has inconsistent hashes for ${sceneId}`);
      process.exit(1);
    }
    kept.push(...chosen);
    for (const r of list) {
      if (r.locale !== pick) {
        console.warn(
          `  skip ${r.locale} for ${sceneId} (--canonical-over=${sub}:${pick})`
        );
      }
    }
  }

  /** hash -> { repPrompt, outPaths: Set } */
  const hashToGroup = new Map();
  for (const r of kept) {
    if (!hashToGroup.has(r.h)) {
      hashToGroup.set(r.h, { repPrompt: r.promptPath, outPaths: new Set() });
    }
    hashToGroup.get(r.h).outPaths.add(r.outPath);
  }

  const nGroups = hashToGroup.size;
  const assigned = rows.length;

  console.log(
    `\n${sceneId}: ${assigned} locale prompt(s) → ${kept.length} after folder dedupe → ${nGroups} unique text group(s)` +
      (force ? " (--force: overwrite)" : " (existing .wav skipped)")
  );

  for (const [h, { repPrompt, outPaths }] of hashToGroup) {
    const targets = [...outPaths].sort((a, b) => a.localeCompare(b));
    const existing = force ? [] : targets.filter((p) => wavExists(p));
    const skipGenerate = existing.length > 0;
    const source = skipGenerate ? existing[0] : targets[0];

    if (dryRun) {
      if (!skipGenerate) {
        console.log(
          `  [dry-run] hash ${h.slice(0, 8)}… → would generate → ${path.relative(ROOT, source)}`
        );
        totalCalls += 1;
      } else {
        console.log(
          `  [dry-run] hash ${h.slice(0, 8)}… → skip generate (reuse ${path.relative(ROOT, source)})`
        );
        totalSkippedGen += 1;
      }
      for (const dest of targets) {
        if (normPath(dest) === normPath(source)) continue;
        if (!force && wavExists(dest)) {
          console.log(`  [dry-run] skip copy (exists) ${path.relative(ROOT, dest)}`);
          totalSkippedCopy += 1;
          continue;
        }
        console.log(`  [dry-run] would copy → ${path.relative(ROOT, dest)}`);
        totalCopies += 1;
      }
      continue;
    }

    if (!skipGenerate) {
      runTts(repPrompt, source);
      totalCalls += 1;
    } else {
      console.log(`  skip generate (reuse): ${path.relative(ROOT, source)}`);
      totalSkippedGen += 1;
    }

    for (const dest of targets) {
      if (normPath(dest) === normPath(source)) continue;
      if (!force && wavExists(dest)) {
        console.log(`  skip copy (exists): ${path.relative(ROOT, dest)}`);
        totalSkippedCopy += 1;
        continue;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(source, dest);
      totalCopies += 1;
      console.log(`  copied → ${path.relative(ROOT, dest)}`);
    }
  }
}

console.log(
  dryRun
    ? `\nDry-run: ${totalCalls} would-call TTS, ${totalCopies} would-copy, skipped ${totalSkippedGen} gen + ${totalSkippedCopy} copy (existing files).`
    : `\nDone: ${totalCalls} TTS call(s), ${totalCopies} copy/copies; skipped ${totalSkippedGen} gen + ${totalSkippedCopy} copy (reuse / existing). Use --force to overwrite.`
);
