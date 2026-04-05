/**
 * Single source of truth for the top-left brand lockup (LTR).
 * FullVideo draws it via `GlobalBrandLogoOverlay`; Scene 1 only flies the hero into that spot.
 */
export const BRAND_CORNER_TOP = 64;
/** Distance from frame edge to the lockup box (left LTR / right RTL). */
export const BRAND_CORNER_INSET = 80;

/**
 * Flying hero (Scene 1): interpolate toward the corner lockup’s visual center so the
 * motion aims at the real asset; exact placement is `CornerBrandLockup` after handoff.
 */
export const BRAND_CORNER_PILL_HALF_W = 156;
export const BRAND_CORNER_PILL_HALF_H = 39;

/** Hero pill → corner pill (uniform scale) during flight only. */
export const BRAND_SCENE1_END_SCALE = 0.555;

export function brandCornerCenterX(frameWidth: number, isRtl: boolean): number {
  return isRtl
    ? frameWidth - BRAND_CORNER_INSET - BRAND_CORNER_PILL_HALF_W
    : BRAND_CORNER_INSET + BRAND_CORNER_PILL_HALF_W;
}

export function brandCornerCenterY(): number {
  return BRAND_CORNER_TOP + BRAND_CORNER_PILL_HALF_H;
}
