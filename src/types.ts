export type Theme = "dark" | "light";
export type Locale = string;

/** Props shared by every scene composition */
export type VideoProps = {
  theme: Theme;
  locale: Locale;
  /**
   * When false, the scene does not render `MusicTrack`.
   * `FullVideo` sets this so only the root track plays (avoids double layers and clicks at scene cuts).
   */
  includeBackgroundMusic?: boolean;
};
