import { useMemo } from "react";
import { useVideoConfig } from "remotion";
import { useVideoAspect } from "../context/VideoAspectContext";
import { getTwoPanelLayout, type TwoPanelLayout } from "./twoPanelLayout";

export function useSplitPanels(isRtl: boolean): TwoPanelLayout {
  const { width, height } = useVideoConfig();
  const aspect = useVideoAspect();
  return useMemo(
    () => getTwoPanelLayout({ width, height, aspect, isRtl }),
    [width, height, aspect, isRtl]
  );
}
