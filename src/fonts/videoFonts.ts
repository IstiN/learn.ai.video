import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlusJakarta } from "@remotion/google-fonts/PlusJakartaSans";

/**
 * Plus Jakarta Sans has no `cyrillic` slice in Google’s static WOFF2 splits — only
 * `cyrillic-ext` (historic letters), so Russian/Ukrainian used a system fallback.
 * Inter provides Cyrillic; the browser picks glyphs per codepoint from the stack.
 */
const { fontFamily: plusJakarta } = loadPlusJakarta("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

const { fontFamily: interCyrillic } = loadInter("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["cyrillic", "cyrillic-ext"],
});

export const videoFontFamily = `${plusJakarta}, ${interCyrillic}, sans-serif`;
