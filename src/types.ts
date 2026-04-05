export type Theme = "dark" | "light";
export type Locale = string;

/** Props shared by every scene composition */
export type VideoProps = {
  theme: Theme;
  locale: Locale;
};
