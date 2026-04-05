import { interpolate } from "remotion";
import { SCENE1_FRAMES } from "./videoTimeline";

/** Crossfade length: flying hero out, global corner lockup in (seconds). */
export const SCENE1_CORNER_HANDOFF_SEC = 0.12;

export function scene1MoveToCornerStartFrames(fps: number): number {
  return 6.75 * fps;
}

export function scene1MoveToCornerEndFrames(fps: number): number {
  return 7.15 * fps;
}

export function scene1HandoffStartFrames(fps: number): number {
  return scene1MoveToCornerEndFrames(fps) - SCENE1_CORNER_HANDOFF_SEC * fps;
}

/** Scene 1 local frame: multiplier for flying hero opacity (1 → 0 during handoff). */
export function scene1FlyingLogoOpacityMultiplier(frame: number, fps: number): number {
  const moveEnd = scene1MoveToCornerEndFrames(fps);
  const handoffStart = scene1HandoffStartFrames(fps);
  const reveal = interpolate(frame, [handoffStart, moveEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < handoffStart) {
    return 1;
  }
  if (frame >= moveEnd) {
    return 0;
  }
  return 1 - reveal;
}

/**
 * Corner pill during Scene 1 only — must use Scene 1 **sequence-local** `useCurrentFrame()`
 * (same clock as the flying hero). The global overlay sits outside that sequence and cannot
 * rely on the same frame index during Scene 1 in FullVideo.
 */
export function scene1CornerLockupOpacity(localFrame: number, fps: number): number {
  const moveEnd = scene1MoveToCornerEndFrames(fps);
  const handoffStart = scene1HandoffStartFrames(fps);
  if (localFrame < handoffStart) return 0;
  if (localFrame >= moveEnd) return 1;
  return interpolate(localFrame, [handoffStart, moveEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Global corner overlay after Scene 1. While Scene 1 plays, opacity stays 0 — the lockup
 * is rendered inside Scene1ColdOpen via `scene1CornerLockupOpacity`.
 */
export function globalBrandLogoOverlayOpacity(frame: number, _fps: number): number {
  if (frame < SCENE1_FRAMES) return 0;
  return 1;
}
