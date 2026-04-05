/**
 * Shared background music track for all scenes.
 * - Fades in over the first second.
 * - Fades out over the last 2 seconds.
 * - `offsetFrames`: how many frames into the music track this scene starts
 *   (e.g. Scene 2 starts after Scene 1's 8s, so offsetFrames = 8 * fps).
 * - `volume`: master volume multiplier (default 0.35 — subtle under dialog).
 */
import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

interface MusicTrackProps {
  /** Frame in the full track where this scene begins (for trimBefore) */
  offsetFrames?: number;
  /** 0–1 master volume, default 0.35 */
  volume?: number;
  /** Loop the track (for the full video composition) */
  loop?: boolean;
}

export const MusicTrack: React.FC<MusicTrackProps> = ({
  offsetFrames = 0,
  volume: masterVolume = 0.35,
  loop = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const FADE_IN_FRAMES = fps * 1.5;
  const FADE_OUT_FRAMES = fps * 2.5;

  return (
    <Audio
      src={staticFile("assets/music.mp3")}
      loop={loop}
      trimBefore={offsetFrames}
      volume={(f) => {
        // f is relative to audio play start, so we map it to composition frame
        const compFrame = f + offsetFrames;
        const fadeIn = interpolate(compFrame - offsetFrames, [0, FADE_IN_FRAMES], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fadeOut = interpolate(
          compFrame - offsetFrames,
          [durationInFrames - FADE_OUT_FRAMES, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return masterVolume * Math.min(fadeIn, fadeOut);
      }}
    />
  );
};
