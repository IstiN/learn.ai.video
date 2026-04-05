export type Theme = "dark" | "light";

export type ThemeColors = {
  /** Page / video background */
  bg: string;
  /** Soft secondary background (cards, bubbles) */
  bgSecondary: string;
  /** Primary brand color */
  brand: string;
  /** Darker brand shade (headings, accents) */
  brandDark: string;
  /** Deepest brand shade (backgrounds, fills) */
  brandDeep: string;
  /** Main body text */
  textMain: string;
  /** Muted / secondary text */
  textMuted: string;
  /** White-equivalent (inverted against bg) */
  textInverse: string;
  /** Alex bubble background */
  bubbleAlex: string;
  /** Maya bubble background */
  bubbleMaya: string;
  /** Orb / glow color 1 */
  glow1: string;
  /** Orb / glow color 2 */
  glow2: string;
};

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    bg: "#2d3352",
    bgSecondary: "#1e2240",
    brand: "#a882f0",
    brandDark: "#8b5fd6",
    brandDeep: "#5c4a82",
    textMain: "#f0ecff",
    textMuted: "rgba(240,236,255,0.6)",
    textInverse: "#1a1f2e",
    bubbleAlex: "rgba(99,102,241,0.35)",
    bubbleMaya: "rgba(124,58,237,0.45)",
    glow1: "#a882f0",
    glow2: "#FBBF24",
  },
  light: {
    bg: "#f6f8ff",
    bgSecondary: "#eef1ff",
    brand: "#9b7dd4",
    brandDark: "#6f44b6",
    brandDeep: "#f0ebff",
    textMain: "#1a2340",
    textMuted: "rgba(26,35,64,0.55)",
    textInverse: "#ffffff",
    bubbleAlex: "rgba(159,122,234,0.18)",
    bubbleMaya: "rgba(111,68,182,0.15)",
    glow1: "#9b7dd4",
    glow2: "#F59E0B",
  },
};
