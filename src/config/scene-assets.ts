/**
 * Paths relative to learn.ai.video/public/ (pass to staticFile()).
 *
 * Sync sources (repo root):
 * - Scene 2 multidevice: flutter_app/test/goldens/store/en/multidevice_{dark,light}.png
 * - Scene 3 subjects: flutter_app/test/goldens/<lang>/{ios,tablet}/{dark,light}/store_subjects.png
 */
export const PUBLIC_ASSETS_BASE = "assets";

const SCENE3_GOLDEN_LANG_DIRS = new Set([
  "ar",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "fi",
  "fr",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "zh",
]);

/**
 * Maps Remotion locale (e.g. en-US, zh-CN) to flutter_app/test/goldens/<dir>/ folder names.
 */
export function goldenLocaleDir(locale: string): string {
  const norm = locale.toLowerCase().replace("_", "-");
  if (norm.startsWith("zh")) {
    return "zh";
  }
  const two = norm.split("-")[0];
  return SCENE3_GOLDEN_LANG_DIRS.has(two) ? two : "en";
}

export function scene3SubjectsStorePath(
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  return `${PUBLIC_ASSETS_BASE}/scene3/${lang}/${platform}/${theme}/store_subjects.png`;
}

export const scene2Multidevice = {
  dark: `${PUBLIC_ASSETS_BASE}/multidevice_dark.png`,
  light: `${PUBLIC_ASSETS_BASE}/multidevice_light.png`,
} as const;

export function scene2MultidevicePath(theme: "dark" | "light"): string {
  return theme === "dark" ? scene2Multidevice.dark : scene2Multidevice.light;
}
