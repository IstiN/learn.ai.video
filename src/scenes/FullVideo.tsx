/**
 * Full video — all scenes sequenced back-to-back with a single music track.
 * Uses explicit Sequence offsets instead of Series to avoid a null-props bug
 * in Remotion 4.0.443's stack-trace instrumentation.
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { VideoProps } from "../types";
import { GlobalBrandLogoOverlay } from "../components/GlobalBrandLogoOverlay";
import { Scene1ColdOpen } from "./Scene1ColdOpen";
import { Scene2DeviceMockup } from "./Scene2DeviceMockup";
import { Scene3SmartSetup } from "./Scene3SmartSetup";
import { Scene4ScanSolve } from "./Scene4ScanSolve";
import { Scene5AiChat } from "./Scene5AiChat";
import { Scene6Verification } from "./Scene6Verification";
import { Scene7FamilyHub } from "./Scene7FamilyHub";
import { SceneListenLearn } from "./SceneListenLearn";
import { Scene8TrackProgress } from "./Scene8TrackProgress";
import { Scene9CTA } from "./Scene9CTA";
import { MusicTrack } from "../components/MusicTrack";
import {
  FULL_VIDEO_TOTAL_FRAMES,
  SCENE1_FRAMES,
  SCENE2_FRAMES,
  SCENE3_FRAMES,
  SCENE4_FRAMES,
  SCENE5_FRAMES,
  SCENE6_FRAMES,
  SCENE7_FRAMES,
  SCENE_LL_FRAMES,
  SCENE8_FRAMES,
  SCENE9_FRAMES,
} from "../config/videoTimeline";

export {
  FULL_VIDEO_TOTAL_FRAMES,
  SCENE1_FRAMES,
  SCENE2_FRAMES,
  SCENE3_FRAMES,
  SCENE4_FRAMES,
  SCENE5_FRAMES,
  SCENE6_FRAMES,
  SCENE7_FRAMES,
  SCENE_LL_FRAMES,
  SCENE8_FRAMES,
  SCENE9_FRAMES,
} from "../config/videoTimeline";

const S1 = 0;
const S2 = S1 + SCENE1_FRAMES;
const S3 = S2 + SCENE2_FRAMES;
const S4 = S3 + SCENE3_FRAMES;
const S5 = S4 + SCENE4_FRAMES;
const S6 = S5 + SCENE5_FRAMES;
const S7 = S6 + SCENE6_FRAMES;
const SLL = S7 + SCENE7_FRAMES;
const S8 = SLL + SCENE_LL_FRAMES;
const S9 = S8 + SCENE8_FRAMES;

export const FullVideo: React.FC<VideoProps> = ({ theme, locale }) => {
  /** Composition timeline at FullVideo root (overlay is 0 during Scene 1 — corner lives in Scene1ColdOpen). */
  const compositionFrame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* Continuous music across all scenes */}
      <MusicTrack offsetFrames={0} volume={0.3} loop />

      <Sequence from={S1} durationInFrames={SCENE1_FRAMES}>
        <Scene1ColdOpen
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S2} durationInFrames={SCENE2_FRAMES}>
        <Scene2DeviceMockup
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S3} durationInFrames={SCENE3_FRAMES}>
        <Scene3SmartSetup
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S4} durationInFrames={SCENE4_FRAMES}>
        <Scene4ScanSolve
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S5} durationInFrames={SCENE5_FRAMES}>
        <Scene5AiChat
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S6} durationInFrames={SCENE6_FRAMES}>
        <Scene6Verification
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S7} durationInFrames={SCENE7_FRAMES}>
        <Scene7FamilyHub
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={SLL} durationInFrames={SCENE_LL_FRAMES}>
        <SceneListenLearn
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S8} durationInFrames={SCENE8_FRAMES}>
        <Scene8TrackProgress
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      <Sequence from={S9} durationInFrames={SCENE9_FRAMES}>
        <Scene9CTA
          theme={theme}
          locale={locale}
          includeBackgroundMusic={false}
        />
      </Sequence>

      {/* Full-frame stacking layer; corner logo uses compositionFrame from root (not nested Sequence). */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 8000,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <GlobalBrandLogoOverlay
          theme={theme}
          locale={locale}
          compositionFrame={compositionFrame}
        />
      </div>
    </AbsoluteFill>
  );
};
