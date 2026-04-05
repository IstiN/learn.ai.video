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
 * - Scene 5: same store_solution_chat as Scene 4 (sync:scene4)
 * - Scene 6 verification: assets/scene6/.../s6_exams.png, s6_topics.png, s6_test.png (sync:scene6, Flutter store goldens)
 * - Scene 7 family: assets/scene7/.../store_family.png (sync:scene7)
 * - Scene 8 test strip: assets/scene8/.../ios|tablet/<theme>/s8_test_*.png (sync:scene8)
 * - Listen & Learn: assets/scene_listen/.../store_player_*.png, store_playlists.png (sync:scene_listen)
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

/** Scene 5 — same Flutter golden as Scene 4 (`npm run sync:scene4`). */
export function scene56SolutionChatPath(
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  return scene4SolutionChatPath(platform, theme, locale);
}

/** Scene 6 — subject exams → topic tickets → test-taking (crossfade; `npm run sync:scene6`). */
export type Scene6VerificationStep = "exams" | "topics" | "test";

const SCENE6_STEP_FILES: Record<Scene6VerificationStep, string> = {
  exams: "s6_exams.png",
  topics: "s6_topics.png",
  test: "s6_test.png",
};

export function scene6VerificationStorePath(
  step: Scene6VerificationStep,
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  const file = SCENE6_STEP_FILES[step];
  return `${PUBLIC_ASSETS_BASE}/scene6/${lang}/${platform}/${theme}/${file}`;
}

/** Scene 7 — `npm run sync:scene7`. */
export function scene7FamilyStorePath(
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  return `${PUBLIC_ASSETS_BASE}/scene7/${lang}/${platform}/${theme}/store_family.png`;
}

/** Scene 8 — test UI from Flutter `test_taking` goldens (`npm run sync:scene8`). */
export type Scene8TestGoldenVariant = "unanswered" | "checked";

export function scene8TestGoldenPath(
  variant: Scene8TestGoldenVariant,
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  const file = variant === "unanswered" ? "s8_test_unanswered.png" : "s8_test_checked.png";
  return `${PUBLIC_ASSETS_BASE}/scene8/${lang}/${platform}/${theme}/${file}`;
}

export type SceneListenStoreFile =
  | "store_player_main.png"
  | "store_player_transcript.png"
  | "store_player_playlist.png"
  | "store_playlists.png";

/** Listen & Learn — `npm run sync:scene_listen`. */
export function sceneListenStorePath(
  file: SceneListenStoreFile,
  platform: "ios" | "tablet",
  theme: "dark" | "light",
  locale: string,
): string {
  const lang = goldenLocaleDir(locale);
  return `${PUBLIC_ASSETS_BASE}/scene_listen/${lang}/${platform}/${theme}/${file}`;
}
