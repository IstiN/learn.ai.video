import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { getSceneAudio } from "../audio";
import { VideoProps } from "../types";
import { videoFontFamily as fontFamily } from "../fonts/videoFonts";
import { themes } from "../themes";
import { t } from "../i18n/translations";
import { AppLogoIcon } from "../components/AppLogoIcon";
import { CornerBrandLockup, FamilyLearnBrandMark } from "../components/FamilyLearnBrandMark";
import { ProfileIcon, UserAvatarIcon } from "../components/AppIcons";
import { MusicTrack } from "../components/MusicTrack";
import {
  BRAND_SCENE1_END_SCALE,
  brandCornerCenterX,
  brandCornerCenterY,
} from "../config/brandCornerLayout";
import {
  scene1CornerLockupOpacity,
  scene1FlyingLogoOpacityMultiplier,
  scene1MoveToCornerEndFrames,
  scene1MoveToCornerStartFrames,
} from "../config/scene1BrandMotion";

const RTL_LOCALES = new Set(["ar", "he"]);

// ─── Animated helpers ─────────────────────────────────────────────────────────

const Orb: React.FC<{ size: number; color: string; x: number; y: number; delay: number; opacity?: number }> = ({
  size, color, x, y, delay, opacity = 0.25,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const floatY = interpolate(frame, [delay, delay + 2 * fps, delay + 4 * fps], [0, -18, 0], { extrapolateRight: "extend", extrapolateLeft: "clamp" });
  const fadeIn = interpolate(frame, [delay, delay + 0.5 * fps], [0, opacity], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return <div style={{ position: "absolute", left: x, top: y + floatY, width: size, height: size, borderRadius: "50%", background: color, opacity: fadeIn, filter: `blur(${size * 0.3}px)` }} />;
};

const QuestionMark: React.FC<{ x: number; y: number; size: number; delay: number; rotation?: number; color: string }> = ({
  x, y, size, delay, rotation = 0, color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 180 } });
  const scale = interpolate(progress, [0, 1], [0.3, 1]);
  const opacity = interpolate(frame, [delay, delay + 0.5 * fps], [0, 0.65], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const fadeOut = interpolate(frame, [6 * fps - 0.8 * fps, 6 * fps - 0.2 * fps], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, fontSize: size, fontFamily, fontWeight: 800, color, opacity: opacity * fadeOut, transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: "center", textShadow: `0 0 ${size * 0.5}px ${color}` }}>
      ?
    </div>
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const Scene1ColdOpen: React.FC<VideoProps> = ({
  theme,
  locale,
  includeBackgroundMusic = true,
}) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene1");
  const { fps, width, height } = useVideoConfig();
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";

  // ── Timings ──
  const LINE1_START  = 0;
  const LINE2_START  = 1.8 * fps;
  const MAYA_START   = 3.8 * fps;
  const LOGO_START   = 5.2 * fps;
  const MOVE_TO_CORNER_START = scene1MoveToCornerStartFrames(fps);
  const MOVE_TO_CORNER_END = scene1MoveToCornerEndFrames(fps);

  // ── Animation helpers ──
  const entry = (start: number) =>
    spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 200 } });

  const fadeIn = (start: number) =>
    interpolate(frame, [start, start + 0.4 * fps], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const fadeOut = (start: number) =>
    interpolate(frame, [start - 0.3 * fps, start + 0.2 * fps], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const line1Opacity  = fadeIn(LINE1_START) * fadeOut(LINE2_START);
  const line2Opacity  = fadeIn(LINE2_START) * fadeOut(MAYA_START);
  const mayaOpacity   = fadeIn(MAYA_START)  * fadeOut(LOGO_START);

  const logoScale    = spring({ frame: frame - LOGO_START, fps, config: { damping: 200 } });
  const logoOpacity  = interpolate(frame, [LOGO_START, LOGO_START + 0.5 * fps], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const taglineOpacity = interpolate(frame, [LOGO_START + 0.6 * fps, LOGO_START + 1.2 * fps], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const taglineY       = interpolate(frame, [LOGO_START + 0.6 * fps, LOGO_START + 1.2 * fps], [20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const startCX = width / 2;
  const startCY = height / 2;
  const endCX = brandCornerCenterX(width, isRtl);
  const endCY = brandCornerCenterY();
  const brandCenterX = interpolate(frame, [MOVE_TO_CORNER_START, MOVE_TO_CORNER_END], [startCX, endCX], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brandCenterY = interpolate(frame, [MOVE_TO_CORNER_START, MOVE_TO_CORNER_END], [startCY, endCY], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blockScaleToCorner = interpolate(frame, [MOVE_TO_CORNER_START, MOVE_TO_CORNER_END], [1, BRAND_SCENE1_END_SCALE], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineDuringMove = interpolate(
    frame,
    [MOVE_TO_CORNER_START, MOVE_TO_CORNER_START + 0.2 * fps],
    [1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  const brandScale = logoScale * blockScaleToCorner;

  const flyingLogoOpacity =
    logoOpacity * scene1FlyingLogoOpacityMultiplier(frame, fps);

  const cornerLockupOpacity = scene1CornerLockupOpacity(frame, fps);

  // ── Bubble style ──
  const bubble = (
    scale: number,
    opacity: number,
    align: "left" | "right",
    bg: string,
    fontSize = 36
  ): React.CSSProperties => ({
    transform: `scale(${scale})`,
    transformOrigin: align === "left" ? "bottom left" : "bottom right",
    opacity,
    maxWidth: 600,
    padding: "20px 28px",
    borderRadius: align === "left" ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
    fontFamily,
    fontSize,
    fontWeight: 600,
    lineHeight: 1.45,
    color: colors.textMain,
    background: bg,
    backdropFilter: "blur(10px)",
    border: `1px solid ${colors.brand}33`,
    direction: dir,
    boxSizing: "border-box" as const,
  });

  const bgStyle: React.CSSProperties = theme === "dark"
    ? { background: "linear-gradient(135deg, #1e2240 0%, #2d3352 60%, #3a2d5c 100%)" }
    : { background: `linear-gradient(135deg, #eef1ff 0%, ${colors.bg} 60%, #f0ebff 100%)` };

  // Layout constants — all measured from top to avoid bottom-clip issues
  const AVATAR_SIZE = 68;
  const ALEX_LEFT = isRtl ? undefined : 60;
  const ALEX_RIGHT = isRtl ? 60 : undefined;
  const MAYA_RIGHT = isRtl ? undefined : 60;
  const MAYA_LEFT  = isRtl ? 60 : undefined;

  // Lines positioned from TOP so nothing clips at the bottom
  const LINE1_TOP = height * 0.52;  // ~56% down
  const LINE2_TOP = height * 0.68;  // ~68% down  ← was too close to bottom before
  const MAYA_TOP  = height * 0.58;  // right side, middle

  return (
    <AbsoluteFill style={{ ...bgStyle, overflow: "hidden" }}>
      {/* Background music at 20% */}
      {includeBackgroundMusic && (
        <MusicTrack offsetFrames={0} volume={0.3} />
      )}
      {/* Voiceover – full volume */}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1} />}
      {/* Glow orbs */}
      <Orb size={500} color={colors.glow1} x={-100}       y={80}           delay={0}  opacity={theme === "dark" ? 0.18 : 0.10} />
      <Orb size={300} color={colors.glow2} x={width - 180} y={height - 280} delay={10} opacity={theme === "dark" ? 0.12 : 0.07} />
      <Orb size={200} color="#3B82F6"       x={width * 0.5} y={30}           delay={5}  opacity={theme === "dark" ? 0.09 : 0.05} />

      {/* Question marks */}
      <QuestionMark x={110}           y={70}           size={86}  delay={4}  rotation={-15} color={colors.brand} />
      <QuestionMark x={width - 190}   y={55}           size={110} delay={8}  rotation={12}  color={colors.brand} />
      <QuestionMark x={180}           y={height - 190} size={66}  delay={12} rotation={-8}  color={colors.brandDark} />
      <QuestionMark x={width - 260}   y={height - 220} size={76}  delay={6}  rotation={20}  color={colors.brandDark} />
      <QuestionMark x={width * 0.44}  y={25}           size={56}  delay={15} rotation={-5}  color={colors.brand} />

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${colors.brand}08 1px, transparent 1px), linear-gradient(90deg, ${colors.brand}08 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />

      {/* ── Alex Line 1 ── */}
      <div style={{ position: "absolute", top: LINE1_TOP, left: ALEX_LEFT, right: ALEX_RIGHT, display: "flex", alignItems: "flex-start", gap: 14, flexDirection: isRtl ? "row-reverse" : "row" }}>
        {/* White circle bg so the stroke avatar is visible */}
        <div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: "50%", background: "white", border: `3px solid ${theme === "dark" ? "#e9631a" : "#f39c12"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: line1Opacity }}>
          <UserAvatarIcon size={38} color={theme === "dark" ? "#e9631a" : "#f39c12"} />
        </div>
        <div style={bubble(entry(LINE1_START), line1Opacity, isRtl ? "right" : "left", colors.bubbleAlex)}>
          {t(locale, "s1_alex1")}
        </div>
      </div>

      {/* ── Alex Line 2 ── */}
      <div style={{ position: "absolute", top: LINE2_TOP, left: ALEX_LEFT ? ALEX_LEFT + AVATAR_SIZE + 14 : undefined, right: ALEX_RIGHT ? ALEX_RIGHT + AVATAR_SIZE + 14 : undefined }}>
        <div style={bubble(entry(LINE2_START), line2Opacity, isRtl ? "right" : "left", colors.bubbleAlex, 34)}>
          {t(locale, "s1_alex2")}
        </div>
      </div>

      {/* ── Maya ── */}
      <div style={{ position: "absolute", top: MAYA_TOP, right: MAYA_RIGHT, left: MAYA_LEFT, display: "flex", alignItems: "flex-start", gap: 14, flexDirection: isRtl ? "row" : "row-reverse" }}>
        {/* App orbital logo on brand gradient bg */}
        <div style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: mayaOpacity }}>
          <AppLogoIcon size={42} animated={false} />
        </div>
        <div style={bubble(entry(MAYA_START), mayaOpacity, isRtl ? "left" : "right", colors.bubbleMaya)}>
          {t(locale, "s1_maya1")}
        </div>
      </div>

      {/* ── Logo: flying hero; corner lockup is `GlobalBrandLogoOverlay` in FullVideo ── */}
      <div
        style={{
          position: "absolute",
          left: brandCenterX,
          top: brandCenterY,
          transform: `translate(-50%, -50%) scale(${brandScale})`,
          opacity: flyingLogoOpacity,
          filter: "drop-shadow(0 2px 14px rgba(0,0,0,0.12))",
        }}
      >
        <FamilyLearnBrandMark
          theme={theme}
          locale={locale}
          mode="hero"
          animatedIcon
          taglineOpacity={taglineOpacity * taglineDuringMove}
          taglineTranslateY={taglineY}
        />
      </div>

      {/* Same timeline as flying hero; global overlay stays hidden until Scene 1 ends. */}
      <CornerBrandLockup
        theme={theme}
        locale={locale}
        opacity={cornerLockupOpacity}
        zIndex={200}
      />
    </AbsoluteFill>
  );
};
