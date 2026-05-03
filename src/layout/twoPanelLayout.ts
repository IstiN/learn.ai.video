import type { VideoAspect } from "../types";

export type LayoutRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type TwoPanelLayout = {
  visual: LayoutRect;
  copy: LayoutRect;
  aspect: VideoAspect;
};

/** Margins reserved for platform UI (TikTok / Reels / Shorts on iPhone 9:16). */
export type SocialSafeInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export const LANDSCAPE_WIDTH = 1920;
export const LANDSCAPE_HEIGHT = 1080;
export const PORTRAIT_WIDTH = 1080;
export const PORTRAIT_HEIGHT = 1920;

const FRAME_INSET = 20;
/** Horizontal gap between visual and copy columns (landscape), matches prior ~60px rhythm */
const LANDSCAPE_COLUMN_GAP = 60;
/** Share of frame width for the device/mockup band in landscape */
const LANDSCAPE_VISUAL_WIDTH_FRAC = 0.5;

/**
 * Reference safe zones @ 1080×1920 — status + TikTok top chrome, bottom caption/actions/home,
 * side margins so content does not hug the bezel. Scales with actual composition size.
 */
const PORTRAIT_SAFE_REF_TOP = 176;
const PORTRAIT_SAFE_REF_BOTTOM = 304;
/** Side insets @ 1080px width — wider than min safe so copy/mockups don’t hug the bezel on TikTok. */
const PORTRAIT_SAFE_REF_HORIZONTAL = 72;

/** Gap between mockup band and copy band inside the safe content rect */
const PORTRAIT_VISUAL_COPY_GAP = 14;
/** Share of *inner* (safe) height for the visual band — balanced for TikTok vertical frame */
const PORTRAIT_INNER_VISUAL_HEIGHT_FRAC = 0.48;

/**
 * Safe insets for vertical social video (9:16). Use for corner brand, Scene1 flight target, etc.
 */
export function getPortraitSocialSafeInsets(width: number, height: number): SocialSafeInsets {
  const sx = width / PORTRAIT_WIDTH;
  const sy = height / PORTRAIT_HEIGHT;
  const h = Math.round(PORTRAIT_SAFE_REF_HORIZONTAL * sx);
  return {
    top: Math.round(PORTRAIT_SAFE_REF_TOP * sy),
    bottom: Math.round(PORTRAIT_SAFE_REF_BOTTOM * sy),
    left: h,
    right: h,
  };
}

/** @ 1920px ref height — corner pill sits this many px above content safe-top */
const PORTRAIT_BRAND_LOCKUP_LIFT_REF = 44;

/**
 * Y position for `CornerBrandLockup` / global overlay in portrait — higher than main content inset.
 */
export function getPortraitBrandLockupTop(width: number, height: number): number {
  const safe = getPortraitSocialSafeInsets(width, height);
  const lift = Math.round(PORTRAIT_BRAND_LOCKUP_LIFT_REF * (height / PORTRAIT_HEIGHT));
  return Math.max(16, safe.top - lift);
}

/**
 * Outer regions for the device column vs dialog/copy column.
 * Scenes scale phones/tablets to fit inside `visual`; bubbles/titles go in `copy`.
 */
export function getTwoPanelLayout(opts: {
  width: number;
  height: number;
  aspect: VideoAspect;
  isRtl: boolean;
}): TwoPanelLayout {
  const { width, height, aspect, isRtl } = opts;

  if (aspect === "landscape") {
    const visualW = Math.round(width * LANDSCAPE_VISUAL_WIDTH_FRAC);
    const copyW = width - FRAME_INSET * 2 - visualW - LANDSCAPE_COLUMN_GAP;
    if (isRtl) {
      const visualLeft = width - FRAME_INSET - visualW;
      return {
        aspect,
        visual: { left: visualLeft, top: 0, width: visualW, height },
        copy: { left: FRAME_INSET, top: 0, width: copyW, height },
      };
    }
    return {
      aspect,
      visual: { left: FRAME_INSET, top: 0, width: visualW, height },
      copy: {
        left: FRAME_INSET + visualW + LANDSCAPE_COLUMN_GAP,
        top: 0,
        width: copyW,
        height,
      },
    };
  }

  const safe = getPortraitSocialSafeInsets(width, height);
  const innerLeft = safe.left;
  const innerTop = safe.top;
  const innerW = Math.max(200, width - safe.left - safe.right);
  const innerH = Math.max(280, height - safe.top - safe.bottom);

  const visualH = Math.round(innerH * PORTRAIT_INNER_VISUAL_HEIGHT_FRAC);
  const copyTop = innerTop + visualH + PORTRAIT_VISUAL_COPY_GAP;
  const copyH = Math.max(120, innerTop + innerH - copyTop);

  return {
    aspect,
    visual: { left: innerLeft, top: innerTop, width: innerW, height: visualH },
    copy: { left: innerLeft, top: copyTop, width: innerW, height: copyH },
  };
}
