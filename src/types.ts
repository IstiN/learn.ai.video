export type Theme = "dark" | "light";
export type Locale = string;

/** Composition aspect: landscape 16:9 (default) or portrait 9:16 FullVideo variant */
export type VideoAspect = "landscape" | "portrait";

/** Props shared by every scene composition */
export type VideoProps = {
  theme: Theme;
  locale: Locale;
  /** When set (e.g. portrait FullVideo), scenes stack visual top / copy bottom. Omitted = landscape. */
  aspect?: VideoAspect;
  /**
   * When false, the scene does not render `MusicTrack`.
   * `FullVideo` sets this so only the root track plays (avoids double layers and clicks at scene cuts).
   */
  includeBackgroundMusic?: boolean;
};
