/**
 * Paths relative to learn.ai.video/public/ (pass to staticFile()).
 *
 * Before Studio/render: `npm run sync:scene3` and `npm run sync:scene4` (Flutter store goldens).
 *
 * Sync sources (repo root):
 * - Scene 2 multidevice: flutter_app/test/goldens/store/en/multidevice_{dark,light}.png
 * - Scene 3 chat (full phone): .../store_chat.png
 * - Scene 3 subjects: .../store_subjects.png
 * - Scene 3 homework (tablet split): .../store_homework.png
 * - Scene 4 solution chat (phone + tablet): assets/scene4/.../store_solution_chat.png
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

/** Full-screen Learn AI chat golden (schedule → subjects story). */
export function scene3StoreChatPath(
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  return `${PUBLIC_ASSETS_BASE}/scene3/${lang}/${platform}/${theme}/store_chat.png`;
}

/** Homework tab golden — used on tablet (split with subjects) in Scene 3. */
export function scene3HomeworkStorePath(
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  return `${PUBLIC_ASSETS_BASE}/scene3/${lang}/${platform}/${theme}/store_homework.png`;
}

export const scene2Multidevice = {
  dark: `${PUBLIC_ASSETS_BASE}/multidevice_dark.png`,
  light: `${PUBLIC_ASSETS_BASE}/multidevice_light.png`,
} as const;

export function scene2MultidevicePath(theme: "dark" | "light"): string {
  return theme === "dark" ? scene2Multidevice.dark : scene2Multidevice.light;
}

/** Scene 4 — homework solution chat golden (same asset as Flutter store_solution_chat). */
export function scene4SolutionChatPath(
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  return `${PUBLIC_ASSETS_BASE}/scene4/${lang}/${platform}/${theme}/store_solution_chat.png`;
}
