import audioConfigRaw from "./audio-config.json";

type AudioConfig = Record<string, Record<string, string>>;
const audioConfig = audioConfigRaw as unknown as AudioConfig;

const defaultLocale: string = (audioConfigRaw as { default_locale: string }).default_locale ?? "en";

/**
 * Returns the staticFile-ready path for a scene's audio in the given locale.
 * Falls back to the default locale (en) if the locale audio isn't available.
 */
export function getSceneAudio(locale: string, sceneId: string): string | null {
  const lang = locale.split("-")[0];
  return (
    audioConfig[lang]?.[sceneId] ??
    audioConfig[defaultLocale]?.[sceneId] ??
    null
  );
}
