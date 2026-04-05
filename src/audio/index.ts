import audioConfigRaw from "./audio-config.json";

type AudioConfig = Record<string, Record<string, string>>;
const audioConfig = audioConfigRaw as unknown as AudioConfig;

const defaultLocale: string = (audioConfigRaw as { default_locale: string }).default_locale ?? "en";

/**
 * Returns the staticFile-ready path for a scene's audio in the given locale.
 * Uses the language prefix (`en-US` → `en`, `ar` → `ar`), so regional variants
 * share one folder. `npm run tts:generate-unique` generates one WAV per distinct
 * prompt and copies to all matching prefixes; when variants differ it keeps a
 * canonical locale (defaults: en-US, fr-FR, pt-BR, zh-CN). Then falls back to
 * `default_locale` from audio-config if the key is missing.
 */
export function getSceneAudio(locale: string, sceneId: string): string | null {
  const lang = locale.split("-")[0];
  return (
    audioConfig[lang]?.[sceneId] ??
    audioConfig[defaultLocale]?.[sceneId] ??
    null
  );
}
