#!/usr/bin/env node
/**
 * Rebuilds src/audio/audio-config.json from existing WAVs under public/audio/{lang}/.
 * Each language must have scene_1.wav … scene_10.wav to be included.
 *
 * Usage (from learn.ai.video): node scripts/audio-config-sync.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const AUDIO_PUBLIC = path.join(ROOT, "public", "audio");
const OUT = path.join(ROOT, "src", "audio", "audio-config.json");

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

function sceneWavName(sceneId) {
  const rest = sceneId.replace(/^scene/i, "");
  return `scene_${rest}.wav`;
}

function langComplete(langDir) {
  for (const id of SCENE_IDS) {
    const f = path.join(AUDIO_PUBLIC, langDir, sceneWavName(id));
    if (!fs.existsSync(f)) return false;
  }
  return true;
}

function main() {
  if (!fs.existsSync(AUDIO_PUBLIC)) {
    console.error(`Missing ${path.relative(ROOT, AUDIO_PUBLIC)}`);
    process.exit(1);
  }

  const langs = fs
    .readdirSync(AUDIO_PUBLIC, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => langComplete(name))
    .sort();

  if (langs.length === 0) {
    console.error("No language folder with all 10 scene WAVs.");
    process.exit(1);
  }

  const config = {
    _readme:
      "Maps locale codes to scene audio files. Falls back to 'en' if the locale is not available. Keys match scene IDs from voice-scripts.json. If a scene should keep English VO (dialogue still in English for that locale), set its path to audio/en/scene_N.wav for that locale — no separate 'English UI' track; UI-only English strings are not voiced.",
    _naming:
      "Audio files go in public/audio/{lang}/{scene_id}.wav  e.g. public/audio/ru/scene_1.wav",
    default_locale: langs.includes("en") ? "en" : langs[0],
  };

  for (const lang of langs) {
    config[lang] = {};
    for (const id of SCENE_IDS) {
      config[lang][id] = `audio/${lang}/${sceneWavName(id)}`;
    }
  }

  fs.writeFileSync(OUT, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${OUT} — ${langs.length} language(s): ${langs.join(", ")}`
  );
}

main();
