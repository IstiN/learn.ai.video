/**
 * AppLogoIcon — Faithful React/Remotion port of the FamilyLearn.AI app icon.
 *
 * Source: story/index.html #feature-logo-svg + final_icon_animated.svg
 *
 * All animations are driven by useCurrentFrame() — no CSS/SVG animate tags,
 * which would not render correctly in Remotion.
 */
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  size: number;
  /** Animate orbital subjects. Pass false for a static render. Default true. */
  animated?: boolean;
};

export const AppLogoIcon: React.FC<Props> = ({ size, animated = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow continuous orbit rotation (one full orbit every 8s)
  const orbitAngle = animated
    ? interpolate(frame, [0, 8 * fps], [0, 360], { extrapolateRight: "extend" })
    : 0;

  // Pulsing opacity for the outer ring (0.3 → 0.55 → 0.3 over 3s)
  const outerRingOpacity = animated
    ? interpolate(
        (frame % (3 * fps)) / (3 * fps),
        [0, 0.5, 1],
        [0.3, 0.55, 0.3]
      )
    : 0.35;

  // Inner ring pulse (0.7 → 0.95 → 0.7 over 3s)
  const innerRingOpacity = animated
    ? interpolate(
        (frame % (3 * fps)) / (3 * fps),
        [0, 0.5, 1],
        [0.7, 0.95, 0.7]
      )
    : 0.7;

  // Center core pulse
  const corePulse = animated
    ? interpolate(
        (frame % (2 * fps)) / (2 * fps),
        [0, 0.5, 1],
        [1, 0.75, 1]
      )
    : 1;

  // Individual subject scale pulses (staggered by 0.6s each)
  const subjectScale = (offsetSecs: number) => {
    if (!animated) return 1;
    const period = 2.5 * fps;
    const offset = offsetSecs * fps;
    const t = ((frame + period - offset) % period) / period;
    return interpolate(t, [0, 0.5, 1], [1, 1.15, 1]);
  };
  const s1Scale = subjectScale(0);
  const s2Scale = subjectScale(0.6);
  const s3Scale = subjectScale(1.2);
  const s4Scale = subjectScale(1.8);

  const gradId = `logoGrad_${size}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-15 -15 130 130"
      width={size}
      height={size}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd93d" />
          <stop offset="100%" stopColor="#ff6b6b" />
        </radialGradient>
      </defs>

      {/* Outer dashed orbit ring */}
      <circle
        cx="50" cy="50" r="40"
        fill="none"
        stroke="#dbe4ff"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity={outerRingOpacity}
      />

      {/* Inner orbit ring */}
      <circle
        cx="50" cy="50" r="24"
        fill="none"
        stroke="#ffc800"
        strokeWidth="2"
        opacity={innerRingOpacity}
      />

      {/* Rotating group — all orbital subjects spin together */}
      <g transform={`rotate(${orbitAngle}, 50, 50)`}>

        {/* Subject 1 — Σ (math) at ~left */}
        <g transform={`translate(10, 50) scale(${s1Scale})`} style={{ transformOrigin: "0 0" }}>
          <circle r="13" fill="#fff" stroke="#ffc800" strokeWidth="2.5" />
          {/* Σ symbol */}
          <path
            d="M-5,6 L-5,-6 L5,-6 M-5,0 L3,0 M-5,6 L5,6"
            stroke="#ffc800" strokeWidth="1.8" strokeLinecap="round" fill="none"
          />
        </g>

        {/* Subject 2 — chat bubble (AI) at ~top-right */}
        <g transform={`translate(80, 26) scale(${s2Scale})`} style={{ transformOrigin: "0 0" }}>
          <circle r="11" fill="#fff" stroke="#1cb0f6" strokeWidth="2.5" />
          <circle r="3.5" fill="#ff6b6b" />
        </g>

        {/* Subject 3 — book/check at ~bottom-right */}
        <g transform={`translate(68, 86) scale(${s3Scale})`} style={{ transformOrigin: "0 0" }}>
          <circle r="12" fill="#fff" stroke="#58cc02" strokeWidth="2.5" />
          <rect x="-4.5" y="-5" width="9" height="10" fill="#58cc02" rx="1.5" />
        </g>

        {/* Subject 4 — pencil/edit at ~top */}
        <g transform={`translate(50, 8) scale(${s4Scale})`} style={{ transformOrigin: "0 0" }}>
          <circle r="10" fill="#fff" stroke="#8b5fd6" strokeWidth="2.5" />
          {/* Pencil mark */}
          <path d="M-3,3 L3,-3 M3,3 L-3,-3" stroke="#8b5fd6" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </g>

      {/* Core gradient sphere */}
      <circle cx="50" cy="50" r="14" fill={`url(#${gradId})`} />

      {/* Center white dot with pulse */}
      <circle cx="50" cy="50" r="5" fill="#ffffff" opacity={corePulse} />
    </svg>
  );
};
