import React from "react";
import { useVideoConfig } from "remotion";
import { VideoProps } from "../types";
import { globalBrandLogoOverlayOpacity } from "../config/scene1BrandMotion";
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
  const { fps } = useVideoConfig();
  const opacity = globalBrandLogoOverlayOpacity(compositionFrame, fps);

  return <CornerBrandLockup theme={theme} locale={locale} opacity={opacity} />;
};
