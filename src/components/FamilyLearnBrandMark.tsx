import React from "react";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { Theme, ThemeColors, themes } from "../themes";
import { t } from "../i18n/translations";
import { AppLogoIcon } from "./AppLogoIcon";
import {
  BRAND_CORNER_INSET,
  BRAND_CORNER_TOP,
} from "../config/brandCornerLayout";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const RTL_LOCALES = new Set(["ar", "he"]);

export type FamilyLearnBrandMarkProps = {
  theme: Theme;
  locale: string;
  /** Hero = cold open center; corner = top lockup for scenes 2+. */
  mode: "hero" | "corner";
  /** Orbital animation (Scene 1 hero only). */
  animatedIcon?: boolean;
  /** Multiplier for tagline opacity (Scene 1 move-to-corner fade). */
  taglineOpacity?: number;
  /** Vertical offset for tagline (Scene 1 intro motion). */
  taglineTranslateY?: number;
};

/**
 * In-app brand lockup: gradient squircle + FamilyLearn.AI + localized tagline (`s1_tagline`).
 * Same building blocks as Scene 1 — no raster logo file.
 */
export const FamilyLearnBrandMark: React.FC<FamilyLearnBrandMarkProps> = ({
  theme,
  locale,
  mode,
  animatedIcon = false,
  taglineOpacity = 1,
  taglineTranslateY = 0,
}) => {
  const colors: ThemeColors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";
  const tagOp = Math.max(0, Math.min(1, taglineOpacity));

  const pillShadow =
    mode === "hero"
      ? `0 0 60px ${colors.brand}88, 0 0 120px ${colors.brand}44`
      : `0 4px 24px ${colors.brand}55, 0 2px 12px rgba(0,0,0,0.15)`;

  if (mode === "corner") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          gap: 14,
          background: `linear-gradient(135deg, ${colors.brandDark}, #4F46E5)`,
          padding: "12px 20px",
          borderRadius: 20,
          boxShadow: pillShadow,
        }}
      >
        <AppLogoIcon size={54} animated />
        <span
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 28,
            color: "#ffffff",
            letterSpacing: "-0.4px",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          FamilyLearn.AI
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          background: `linear-gradient(135deg, ${colors.brandDark}, #4F46E5)`,
          padding: "18px 48px 18px 28px",
          borderRadius: 28,
          boxShadow: pillShadow,
        }}
      >
        <AppLogoIcon size={80} animated={animatedIcon} />
        <span
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 64,
            color: "#ffffff",
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          FamilyLearn.AI
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          marginTop: 20,
          transform: `translateX(-50%) translateY(${taglineTranslateY}px)`,
          fontFamily,
          fontWeight: 400,
          fontSize: 30,
          color: colors.textMuted,
          letterSpacing: "0.4px",
          direction: dir,
          textAlign: "center",
          maxWidth: 860,
          padding: "0 40px",
          opacity: tagOp,
          boxSizing: "border-box",
        }}
      >
        {t(locale, "s1_tagline")}
      </div>
    </div>
  );
};

type CornerBrandLockupProps = {
  theme: Theme;
  locale: string;
  top?: number;
  inset?: number;
  /** For Scene 1 crossfade into the same lockup as other scenes. */
  opacity?: number;
  /** Raise for global overlay so scenes never paint on top. */
  zIndex?: number;
};

/** Fixed top-corner placement; mirrors for RTL. */
export const CornerBrandLockup: React.FC<CornerBrandLockupProps> = ({
  theme,
  locale,
  top = BRAND_CORNER_TOP,
  inset = BRAND_CORNER_INSET,
  opacity = 1,
  zIndex = 100,
}) => {
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  return (
    <div
      style={{
        position: "absolute",
        top,
        zIndex,
        pointerEvents: "none",
        opacity,
        ...(isRtl ? { right: inset, left: "auto" } : { left: inset }),
        filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.14))",
      }}
    >
      <FamilyLearnBrandMark theme={theme} locale={locale} mode="corner" />
    </div>
  );
};
