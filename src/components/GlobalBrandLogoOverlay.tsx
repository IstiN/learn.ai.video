import React from "react";
import { useVideoConfig } from "remotion";
import { VideoProps } from "../types";
import { useVideoAspect } from "../context/VideoAspectContext";
import { globalBrandLogoOverlayOpacity } from "../config/scene1BrandMotion";
import { getPortraitBrandLockupTop, getPortraitSocialSafeInsets } from "../layout/twoPanelLayout";
import { CornerBrandLockup } from "./FamilyLearnBrandMark";

export type GlobalBrandLogoOverlayProps = VideoProps & {
  /** Absolute composition frame from `FullVideo` root — do not use nested `useCurrentFrame()`. */
  compositionFrame: number;
};

/**
 * Persistent FamilyLearn.AI corner lockup for `FullVideo` only.
 * Renders a single absolutely positioned lockup (no nested AbsoluteFill) so it is not
 * squashed by the root column flex layout; parent should be a full-frame stacking layer.
 */
export const GlobalBrandLogoOverlay: React.FC<GlobalBrandLogoOverlayProps> = ({
  theme,
  locale,
  compositionFrame,
}) => {
  const { fps, width, height } = useVideoConfig();
  const aspect = useVideoAspect();
  const opacity = globalBrandLogoOverlayOpacity(compositionFrame, fps);
  const isPortrait = aspect === "portrait";
  const portraitSafe = isPortrait ? getPortraitSocialSafeInsets(width, height) : null;
  const brandTop = isPortrait ? getPortraitBrandLockupTop(width, height) : undefined;

  return (
    <CornerBrandLockup
      theme={theme}
      locale={locale}
      opacity={opacity}
      top={brandTop}
      inset={portraitSafe ? portraitSafe.left : undefined}
    />
  );
};
