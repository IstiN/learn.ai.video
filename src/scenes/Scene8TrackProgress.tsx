/**
 * Scene 8 — Track Progress (10s)
 *
 * Story: Maya leads → celebrates streaks, wins, growth analytics.
 * NOTE: Maya speaks FIRST in this scene (different order from Scenes 5-7).
 * Audio: scene9 in audio-config (voice-scripts id "scene9" — Track Every Win).
 *
 * Left:  Phone + tablet — real test_taking goldens (unanswered → checked + LP chip), same timing on both,
 *        then crossfade to Learn Points feed; icons from flutter_app via AppIcons.
 * Right: Narrow chat column (capped width) — Maya → Alex → streak widget → Maya; bubbles sized to column.
 * Badge: Streaks · Growth · Wins
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { VideoProps } from "../types";
import { themes } from "../themes";
import { t } from "../i18n/translations";
import {
  BoltIcon,
  DashboardIconFilled,
  HomeworkIcon,
  SubjectMathIcon,
  SubjectMusicIcon,
  SummaryIconFilled,
  UserAvatarIcon,
} from "../components/AppIcons";
import { AppLogoIcon } from "../components/AppLogoIcon";
import { MusicTrack } from "../components/MusicTrack";
import { Audio } from "@remotion/media";
import { getSceneAudio } from "../audio";
import { scene8TestGoldenPath } from "../config/scene-assets";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const RTL_LOCALES = new Set(["ar", "he"]);

// Scene 8 starts at 9+16+14+14+14+10+12 = 89s
const SCENE_OFFSET_S = 135;

const T = {
  BANNER_IN:    0,
  PHONE_IN:     Math.round(0.5 * 30),
  TABLET_IN:    Math.round(1.05 * 30),
  // Maya first!
  DIALOG_MAYA1: Math.round(1.2 * 30),
  DIALOG_ALEX1: Math.round(3.5 * 30),
  WIDGET_IN:    Math.round(5.0 * 30),
  DIALOG_MAYA2: Math.round(7.0 * 30),
  BADGE_IN:     Math.round(9.0 * 30),
};

const Bubble: React.FC<{
  text: string; align: "left" | "right";
  color: string; bg: string; borderColor: string;
  startFrame: number; fontSize?: number; dir?: "ltr" | "rtl";
  maxBubbleWidth?: number;
}> = ({ text, align, color, bg, borderColor, startFrame, fontSize = 23, dir = "ltr", maxBubbleWidth = 520 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 160 } });
  const scale = interpolate(progress, [0, 1], [0.85, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [startFrame, startFrame + 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: align === "left" ? "top left" : "top right",
      opacity, maxWidth: maxBubbleWidth, padding: "16px 22px",
      borderRadius: align === "left" ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
      fontFamily, fontSize, fontWeight: 600, lineHeight: 1.45,
      color, background: bg, border: `1px solid ${borderColor}`,
      direction: dir, boxSizing: "border-box" as const,
    }}>
      {text}
    </div>
  );
};

const Avatar: React.FC<{
  gradient: string; startFrame: number; size: number; children: React.ReactNode;
}> = ({ gradient, startFrame, size, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [startFrame, startFrame + 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: gradient, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center", opacity,
    }}>
      {children}
    </div>
  );
};

// Streak + stats mini-widget
const StreakWidget: React.FC<{
  startFrame: number; colors: typeof themes["light"]; theme: "dark" | "light"; locale: string;
}> = ({ startFrame, colors, theme, locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [startFrame, startFrame + 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const rowBg = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
  const rowBorder = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(120,80,220,0.18)";

  const stats: {
    label: string;
    value: string;
    color: string;
    StatIcon: React.FC<{ size: number; color: string }>;
  }[] = [
    { label: t(locale, "s8_stat1"), value: "12", color: "#F59E0B", StatIcon: BoltIcon },
    { label: t(locale, "s8_stat2"), value: "24", color: "#10B981", StatIcon: SummaryIconFilled },
    { label: t(locale, "s8_stat3"), value: "+3", color: colors.brand, StatIcon: DashboardIconFilled },
  ];

  return (
    <div style={{
      opacity: containerOpacity,
      background: rowBg, border: `1px solid ${rowBorder}`,
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    }}>
      <div style={{
        padding: "10px 14px 4px",
        fontFamily, fontSize: 12, fontWeight: 700, color: colors.brand,
      }}>
        {t(locale, "s8_stats_header")}
      </div>
      <div style={{ display: "flex" }}>
        {stats.map((s, i) => {
          const StatIcon = s.StatIcon;
          const itemStart = startFrame + (i + 1) * 0.35 * fps;
          const itemOpacity = interpolate(frame, [itemStart, itemStart + 0.3 * fps], [0, 1], {
            extrapolateRight: "clamp", extrapolateLeft: "clamp",
          });
          const itemY = interpolate(frame, [itemStart, itemStart + 0.3 * fps], [8, 0], {
            extrapolateRight: "clamp", extrapolateLeft: "clamp",
          });
          return (
            <div key={i} style={{
              flex: 1, padding: "8px 10px",
              borderLeft: i > 0 ? `1px solid ${rowBorder}` : "none",
              opacity: itemOpacity, transform: `translateY(${itemY}px)`,
              display: "flex", flexDirection: "column", gap: 3, alignItems: "center",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontFamily,
                fontSize: 14,
                fontWeight: 700,
                color: s.color,
              }}>
                <span>{s.value}</span>
                <StatIcon size={16} color={s.color} />
              </div>
              <div style={{ fontFamily, fontSize: 10, fontWeight: 500, color: colors.textMain, opacity: 0.7, textAlign: "center" }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Badge: React.FC<{
  icon: React.ReactNode; label: string;
  color: string; bg: string; border: string; startFrame: number;
}> = ({ icon, label, color, bg, border, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 12, stiffness: 200 } });
  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(frame, [startFrame, startFrame + 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "9px 18px", borderRadius: 40,
      background: bg, border: `1.5px solid ${border}`,
      transform: `scale(${scale})`, opacity, transformOrigin: "center",
    }}>
      {icon}
      <span style={{ fontFamily, fontWeight: 700, fontSize: 20, color }}>{label}</span>
    </div>
  );
};

const Arrow: React.FC<{ color: string; startFrame: number }> = ({ color, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [startFrame, startFrame + 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ opacity, flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
};

const S8_TEST_LP = 20;

type S8RowIcon = React.FC<{ size: number; color?: string }>;

const S8_LP_ROWS: readonly {
  labelKey: "s8_points_row_test" | "s8_points_row_podcast" | "s8_points_row_homework";
  subjectKey: "s8_sim_subject_math" | "s8_sim_subject_history" | "s8_sim_subject_science";
  pts: number;
  Icon: S8RowIcon;
}[] = [
  { labelKey: "s8_points_row_test", subjectKey: "s8_sim_subject_math", pts: 20, Icon: SubjectMathIcon },
  { labelKey: "s8_points_row_podcast", subjectKey: "s8_sim_subject_history", pts: 15, Icon: SubjectMusicIcon },
  { labelKey: "s8_points_row_homework", subjectKey: "s8_sim_subject_science", pts: 25, Icon: HomeworkIcon },
];

const LearnPointsDevicePanel: React.FC<{
  variant: "phone" | "tablet";
  cardWidth: number;
  cardHeight: number;
  colors: typeof themes["light"];
  theme: "dark" | "light";
  locale: string;
  frameBorder: string;
  frameBg: string;
  row1Start: number;
  row2Start: number;
  row3Start: number;
}> = ({
  variant,
  cardWidth,
  cardHeight,
  colors,
  theme,
  locale,
  frameBorder,
  frameBg,
  row1Start,
  row2Start,
  row3Start,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rowStarts = [row1Start, row2Start, row3Start];
  const scoreRamp = Math.round(0.4 * fps);
  const feedSwap = T.DIALOG_ALEX1 + Math.round(0.14 * fps);
  const swapFade = Math.round(0.26 * fps);

  const testLayerOpacity = interpolate(frame, [feedSwap - swapFade, feedSwap], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const feedLayerOpacity = interpolate(frame, [feedSwap - swapFade, feedSwap], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pickStart = T.DIALOG_MAYA1 + Math.round(0.1 * fps);
  const correctStart = pickStart + Math.round(0.52 * fps);
  const lpStart = correctStart + Math.round(0.28 * fps);
  const goldenFade = 0.28 * fps;
  const unansGoldenOpacity = interpolate(
    frame,
    [correctStart - goldenFade, correctStart + goldenFade],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const checkedGoldenOpacity = interpolate(
    frame,
    [correctStart - goldenFade, correctStart + goldenFade],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const lpChipOpacity = interpolate(frame, [lpStart, lpStart + 0.35 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lpChipScale = spring({
    frame: frame - lpStart,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const lpS = interpolate(lpChipScale, [0, 1], [0.88, 1], { extrapolateRight: "clamp" });

  const goldenPlatform = variant === "phone" ? "ios" : "tablet";
  const srcTestUnanswered = staticFile(scene8TestGoldenPath("unanswered", goldenPlatform, theme, locale));
  const srcTestChecked = staticFile(scene8TestGoldenPath("checked", goldenPlatform, theme, locale));

  const isPhone = variant === "phone";
  const outerRadius = isPhone ? 28 : 18;
  const outerShadow = isPhone
    ? "0 24px 64px rgba(0,0,0,0.38)"
    : "0 20px 56px rgba(0,0,0,0.36)";
  const contentTop = isPhone ? 24 : 0;

  const rowBg = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.72)";
  const rowBorder = theme === "dark" ? "rgba(255,255,255,0.11)" : "rgba(120,80,220,0.14)";

  const easeSeg = (f: number, start: number, dur: number, peak: number) =>
    interpolate(f, [start, start + dur], [0, peak], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const totalPts =
    easeSeg(frame, rowStarts[0] + 3, scoreRamp, S8_LP_ROWS[0].pts) +
    easeSeg(frame, rowStarts[1] + 3, scoreRamp, S8_LP_ROWS[1].pts) +
    easeSeg(frame, rowStarts[2] + 3, scoreRamp, S8_LP_ROWS[2].pts);

  return (
    <div style={{
      width: cardWidth,
      height: cardHeight,
      borderRadius: outerRadius,
      overflow: "hidden",
      border: `2px solid ${frameBorder}`,
      background: frameBg,
      flexShrink: 0,
      boxShadow: outerShadow,
      position: "relative",
    }}>
      {isPhone ? (
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 90,
          height: 24,
          background: frameBg,
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
          zIndex: 4,
        }} />
      ) : null}
      <div style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: contentTop,
        bottom: 0,
        boxSizing: "border-box",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          boxSizing: "border-box",
          opacity: testLayerOpacity,
          pointerEvents: "none",
          zIndex: 2,
        }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Img
              src={srcTestUnanswered}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
                opacity: unansGoldenOpacity,
              }}
            />
            <Img
              src={srcTestChecked}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
                opacity: checkedGoldenOpacity,
              }}
            />
          </div>
          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 14,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              opacity: lpChipOpacity,
              transform: `scale(${lpS})`,
              transformOrigin: "bottom center",
              padding: "10px 20px",
              borderRadius: 999,
              background: theme === "dark" ? `${colors.brand}28` : `${colors.brand}18`,
              border: `1px solid ${colors.brand}55`,
            }}>
              <span style={{
                fontFamily,
                fontWeight: 800,
                fontSize: 16,
                color: colors.brand,
              }}>
                +{S8_TEST_LP} LP
              </span>
            </div>
          </div>
        </div>
        <div style={{
          position: "absolute",
          inset: 0,
          padding: "12px 14px 14px",
          boxSizing: "border-box",
          opacity: feedLayerOpacity,
          pointerEvents: "none",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <SummaryIconFilled size={22} color={colors.brand} />
            </span>
            <span style={{
              fontFamily,
              fontWeight: 800,
              fontSize: 16,
              color: colors.brandDark,
              letterSpacing: "0.02em",
            }}>
              {t(locale, "s8_points_title")}
            </span>
          </div>

          {S8_LP_ROWS.map((row, i) => {
            const RowIcon = row.Icon;
            const rs = rowStarts[i];
            const rowIn = spring({ frame: frame - rs, fps, config: { damping: 16, stiffness: 140 } });
            const rowY = interpolate(rowIn, [0, 1], [14, 0], { extrapolateRight: "clamp" });
            const rowOpRaw = interpolate(frame, [rs, rs + 0.35 * fps], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            const rowOp = rowOpRaw * feedLayerOpacity;
            const ptsVal = easeSeg(frame, rs + 3, scoreRamp, row.pts);
            const ptsPulse = spring({
              frame: frame - (rs + 3 + scoreRamp * 0.35),
              fps,
              config: { damping: 10, stiffness: 220 },
            });
            const ptsScale = interpolate(ptsPulse, [0, 1], [0.82, 1], { extrapolateRight: "clamp" });

            return (
              <div
                key={row.labelKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 11px",
                  borderRadius: 14,
                  background: rowBg,
                  border: `1px solid ${rowBorder}`,
                  transform: `translateY(${rowY}px)`,
                  opacity: rowOp,
                }}
              >
                <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                  <RowIcon size={22} color={colors.brandDark} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily,
                    fontSize: 12,
                    fontWeight: 700,
                    color: colors.textMain,
                    lineHeight: 1.35,
                  }}>
                    {t(locale, row.labelKey)}
                  </div>
                  <div style={{
                    fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors.textMuted,
                    marginTop: 2,
                  }}>
                    {t(locale, row.subjectKey)}
                  </div>
                </div>
                <div style={{
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 14,
                  color: colors.brand,
                  transform: `scale(${ptsScale})`,
                  flexShrink: 0,
                }}>
                  +{Math.round(ptsVal)} LP
                </div>
              </div>
            );
          })}

          <div style={{ flex: 1, minHeight: 4 }} />
          <div style={{
            padding: "12px 12px",
            borderRadius: 16,
            background: theme === "dark" ? `${colors.brand}18` : `${colors.brand}14`,
            border: `1px solid ${theme === "dark" ? `${colors.brand}40` : `${colors.brand}35`}`,
          }}>
            <div style={{
              fontFamily,
              fontSize: 10,
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}>
              {t(locale, "s8_points_total")}
            </div>
            <div style={{
              fontFamily,
              fontWeight: 800,
              fontSize: 24,
              color: colors.brandDark,
              fontVariantNumeric: "tabular-nums",
            }}>
              {Math.round(totalPts)} LP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Scene8TrackProgress: React.FC<VideoProps> = ({
  theme,
  locale,
  includeBackgroundMusic = true,
}) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene9");
  const { fps, width, height } = useVideoConfig();
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";

  const TABLET_ASPECT = 2732 / 2048;
  const IOS_ASPECT = 1284 / 2778;
  const DEV_GAP = 28;
  const LEFT_PAD_SCENE8 = 36;

  let rowH = Math.round(height * 0.68);
  let phoneH = rowH;
  let phoneW = Math.round(phoneH * IOS_ASPECT);
  let tabletH = rowH;
  let tabletW = Math.round(tabletH * TABLET_ASPECT);
  let rowW = phoneW + DEV_GAP + tabletW;
  const maxRowW = Math.round(width * 0.52);
  if (rowW > maxRowW) {
    const s = maxRowW / rowW;
    rowH = Math.round(rowH * s);
    phoneH = rowH;
    phoneW = Math.round(phoneH * IOS_ASPECT);
    tabletH = rowH;
    tabletW = Math.round(tabletH * TABLET_ASPECT);
    rowW = phoneW + DEV_GAP + tabletW;
  }

  const EDGE_X = 24;
  const COL_GAP = 48;
  const LEFT_W = rowW + LEFT_PAD_SCENE8;
  const RIGHT_COL_CAP = Math.min(400, Math.round(width * 0.32));

  const leftStart = isRtl ? width - LEFT_W - EDGE_X : EDGE_X;
  const rightStart = EDGE_X + LEFT_W + COL_GAP;
  const RIGHT_W = Math.min(width - EDGE_X - rightStart, RIGHT_COL_CAP);

  const bannerOpacity = interpolate(frame, [T.BANNER_IN, T.BANNER_IN + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const lpRow1 = T.DIALOG_MAYA1 + Math.round(0.22 * fps);
  const lpRow2 = T.DIALOG_ALEX1 + Math.round(0.18 * fps);
  const lpRow3 = T.WIDGET_IN + Math.round(0.12 * fps);

  const phoneSpring = spring({ frame: frame - T.PHONE_IN, fps, config: { damping: 16, stiffness: 110 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [120, 0]);
  const phoneOpacity = interpolate(frame, [T.PHONE_IN, T.PHONE_IN + 0.7 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const tabletSpring = spring({ frame: frame - T.TABLET_IN, fps, config: { damping: 16, stiffness: 110 } });
  const tabletX = interpolate(tabletSpring, [0, 1], [isRtl ? -52 : 52, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const tabletOpacity = interpolate(frame, [T.TABLET_IN, T.TABLET_IN + 0.65 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const bgStyle: React.CSSProperties = theme === "dark"
    ? { background: "linear-gradient(140deg, #1c1a34 0%, #2a2550 50%, #1a1c40 100%)" }
    : { background: "linear-gradient(140deg, #f4f0ff 0%, #f8f6ff 50%, #eef2ff 100%)" };

  const frameBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(120,80,220,0.22)";
  const frameBg = theme === "dark" ? "#1c1a34" : "#ffffff";
  const avatarGradientAlex = "linear-gradient(135deg, #e9631a, #c0392b)";
  const avatarGradientMaya = `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`;
  const avatarSize = 52;
  const bubbleMax = Math.max(260, RIGHT_W - avatarSize - 28);

  return (
    <AbsoluteFill style={{ ...bgStyle, overflow: "hidden" }}>
      {includeBackgroundMusic && (
        <MusicTrack offsetFrames={SCENE_OFFSET_S * 30} volume={0.3} />
      )}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1} />}

      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.brand}07 1px, transparent 1px), linear-gradient(90deg, ${colors.brand}07 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      <div style={{
        position: "absolute",
        left: isRtl ? "auto" : -40, right: isRtl ? -40 : "auto",
        top: height * 0.1, width: LEFT_W + 80, height: height * 0.8,
        borderRadius: "50%", background: colors.brand,
        opacity: theme === "dark" ? 0.05 : 0.03, filter: "blur(80px)",
      }} />

      {/* Left: phone + tablet — Flutter test_taking goldens → Learn Points feed */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : leftStart,
        right: isRtl ? width - leftStart - LEFT_W : undefined,
        top: 0, width: LEFT_W, height,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          display: "flex",
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          gap: DEV_GAP,
          flexShrink: 0,
        }}>
          <div style={{ transform: `translateY(${phoneY}px)`, opacity: phoneOpacity }}>
            <LearnPointsDevicePanel
              variant="phone"
              cardWidth={phoneW}
              cardHeight={phoneH}
              colors={colors}
              theme={theme}
              locale={locale}
              frameBorder={frameBorder}
              frameBg={frameBg}
              row1Start={lpRow1}
              row2Start={lpRow2}
              row3Start={lpRow3}
            />
          </div>
          <div style={{ transform: `translateX(${tabletX}px)`, opacity: tabletOpacity }}>
            <LearnPointsDevicePanel
              variant="tablet"
              cardWidth={tabletW}
              cardHeight={tabletH}
              colors={colors}
              theme={theme}
              locale={locale}
              frameBorder={frameBorder}
              frameBg={frameBg}
              row1Start={lpRow1}
              row2Start={lpRow2}
              row3Start={lpRow3}
            />
          </div>
        </div>
      </div>

      {/* Right: dialog (Maya speaks first!) */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : rightStart,
        right: isRtl ? width - EDGE_X - RIGHT_W : undefined,
        top: 0, width: RIGHT_W, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 16, padding: "0 20px",
      }}>
        {/* Scene label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, opacity: bannerOpacity,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          <SummaryIconFilled size={26} color={colors.brand} />
          <span style={{ fontFamily, fontWeight: 700, fontSize: 18, color: colors.brand, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {t(locale, "s8_widget_title")}
          </span>
        </div>

        {/* Maya line 1 — FIRST */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA1} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "s8_maya1")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA1} dir={dir} maxBubbleWidth={bubbleMax} />
        </div>

        {/* Alex line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX1} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble text={t(locale, "s8_alex1")} align={isRtl ? "left" : "right"}
            color={colors.textMain} bg={colors.bubbleAlex} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX1} dir={dir} maxBubbleWidth={bubbleMax} />
        </div>

        {/* Streak widget */}
        <div style={{ paddingLeft: isRtl ? 0 : avatarSize + 10, paddingRight: isRtl ? avatarSize + 10 : 0 }}>
          <StreakWidget startFrame={T.WIDGET_IN} colors={colors} theme={theme} locale={locale} />
        </div>

        {/* Maya line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA2} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "s8_maya2")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA2} dir={dir} maxBubbleWidth={bubbleMax} />
        </div>

        {/* Badges */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          {[
            { icon: <BoltIcon size={18} color="#F59E0B" />, color: "#F59E0B", bg: theme === "dark" ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)", border: "#F59E0B55" },
            { icon: <SummaryIconFilled size={18} color="#10B981" />, color: colors.textMain, bg: theme === "dark" ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)", border: "#10B98155" },
            { icon: <DashboardIconFilled size={18} color={colors.brand} />, color: colors.brand, bg: theme === "dark" ? `${colors.brand}20` : `${colors.brand}12`, border: `${colors.brand}55` },
          ].map((item, i) => {
            const labels = t(locale, "s8_badge").split(" · ");
            return (
              <React.Fragment key={i}>
                {i > 0 && <Arrow color={colors.brandDark} startFrame={T.BADGE_IN + Math.round((i * 0.2 - 0.05) * fps)} />}
                <Badge
                  icon={item.icon} label={labels[i] ?? ""}
                  color={item.color} bg={item.bg} border={item.border}
                  startFrame={T.BADGE_IN + Math.round(i * 0.2 * fps)}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
