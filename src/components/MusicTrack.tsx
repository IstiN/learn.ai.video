/**
 * Shared background music track for all scenes.
 * - Fade in ~1.5s from segment start; fade out over last ~2.5s of composition.
 * - `offsetFrames`: trim start of file + align envelope for per-scene sequences.
 * - `volume`: linear gain 0–1 (default **0.3** = 30%).
 * - `loop` + `loopVolumeCurveBehavior="extend"`: file repeats without resetting
 *   the volume envelope each loop (Remotion default "repeat" would).
 */
import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";

interface MusicTrackProps {
  /** Frame in the full track where this scene begins (for trimBefore) */
  offsetFrames?: number;
  /** 0–1 master volume, default 0.3 (30%) */
  volume?: number;
  /** Loop the track (for the full video composition) */
  loop?: boolean;
}

export const MusicTrack: React.FC<MusicTrackProps> = ({
  offsetFrames = 0,
  volume: masterVolume = 0.3,
  loop = false,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const FADE_IN_FRAMES = fps * 1.5;
  const FADE_OUT_FRAMES = fps * 2.5;

  return (
    <Audio
      src={staticFile("assets/music.mp3")}
      loop={loop}
      loopVolumeCurveBehavior={loop ? "extend" : undefined}
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
