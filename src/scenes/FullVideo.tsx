/**
 * Full video — all scenes sequenced back-to-back with a single music track.
 * Uses explicit Sequence offsets instead of Series to avoid a null-props bug
 * in Remotion 4.0.443's stack-trace instrumentation.
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { VideoProps } from "../types";
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

const FPS = 30;
export const SCENE1_FRAMES = 9 * FPS;   //  9s — Cold Open       (audio: 8.81s)
export const SCENE2_FRAMES = 17 * FPS;  // 17s — Meet FamilyLearn (audio: 16.09s)
export const SCENE3_FRAMES = 16 * FPS;  // 16s — Smart Setup      (audio: 15.21s)
export const SCENE4_FRAMES = 22 * FPS;  // 22s — Scan & Solve     (audio: 21.13s)
export const SCENE5_FRAMES = 18 * FPS;  // 18s — AI Chat          (audio: 17.85s)
export const SCENE6_FRAMES = 16 * FPS;  // 16s — Verification     (audio: 15.89s)
export const SCENE7_FRAMES = 16 * FPS;  // 16s — Family Hub       (audio: 15.13s)
export const SCENE_LL_FRAMES = 21 * FPS; // 21s — Listen & Learn  (audio: 20.89s)
export const SCENE8_FRAMES = 11 * FPS;  // 11s — Track Progress   (audio: 10.89s)
export const SCENE9_FRAMES = 15 * FPS;  // 15s — CTA              (audio: 14.01s)

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
  return (
    <AbsoluteFill>
      {/* Continuous music across all scenes */}
      <MusicTrack offsetFrames={0} volume={0.35} loop />

      <Sequence from={S1} durationInFrames={SCENE1_FRAMES}>
        <Scene1ColdOpen theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S2} durationInFrames={SCENE2_FRAMES}>
        <Scene2DeviceMockup theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S3} durationInFrames={SCENE3_FRAMES}>
        <Scene3SmartSetup theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S4} durationInFrames={SCENE4_FRAMES}>
        <Scene4ScanSolve theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S5} durationInFrames={SCENE5_FRAMES}>
        <Scene5AiChat theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S6} durationInFrames={SCENE6_FRAMES}>
        <Scene6Verification theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S7} durationInFrames={SCENE7_FRAMES}>
        <Scene7FamilyHub theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={SLL} durationInFrames={SCENE_LL_FRAMES}>
        <SceneListenLearn theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S8} durationInFrames={SCENE8_FRAMES}>
        <Scene8TrackProgress theme={theme} locale={locale} />
      </Sequence>

      <Sequence from={S9} durationInFrames={SCENE9_FRAMES}>
        <Scene9CTA theme={theme} locale={locale} />
      </Sequence>
    </AbsoluteFill>
  );
};
