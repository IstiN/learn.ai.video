/**
 * Scene 4 — Scan & Solve (14s)
 * Shows the camera-scan feature: feature banner + phone screenshot slide in,
 * animated scan line, then Alex/Maya dialog explaining photo-to-homework flow.
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
import { UserAvatarIcon, HomeworkIcon } from "../components/AppIcons";
import { AppLogoIcon } from "../components/AppLogoIcon";
import { MusicTrack } from "../components/MusicTrack";
import { Audio } from "@remotion/media";
import { getSceneAudio } from "../audio";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const RTL_LOCALES = new Set(["ar", "he"]);

// ─── Timing constants ─────────────────────────────────────────────────────────
const SCENE_OFFSET_S = 42;

// ─── Reusable bubble ─────────────────────────────────────────────────────────
const Bubble: React.FC<{
  text: string;
  align: "left" | "right";
  color: string;
  bg: string;
  borderColor: string;
  startFrame: number;
  fontSize?: number;
  dir?: "ltr" | "rtl";
}> = ({ text, align, color, bg, borderColor, startFrame, fontSize = 26, dir = "ltr" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 14, stiffness: 160 } });
  const scale = interpolate(progress, [0, 1], [0.85, 1]);
  const opacity = interpolate(frame, [startFrame, startFrame + 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: align === "left" ? "top left" : "top right",
      opacity,
      maxWidth: 560,
      padding: "18px 24px",
      borderRadius: align === "left" ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
      fontFamily, fontSize, fontWeight: 600, lineHeight: 1.45,
      color, background: bg, border: `1px solid ${borderColor}`,
      direction: dir, boxSizing: "border-box" as const,
    }}>
      {text}
    </div>
  );
};

// ─── Avatar circle ────────────────────────────────────────────────────────────
const Avatar: React.FC<{
  gradient: string;
  startFrame: number;
  size: number;
  children: React.ReactNode;
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
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity,
    }}>
      {children}
    </div>
  );
};

// ─── Phone frame wrapper ──────────────────────────────────────────────────────
const PhoneFrame: React.FC<{
  imgSrc: string;
  width: number;
  height: number;
  borderColor: string;
  bgColor: string;
  children?: React.ReactNode;
}> = ({ imgSrc, width, height, borderColor, bgColor, children }) => (
  <div style={{
    width, height, borderRadius: 28, overflow: "hidden",
    border: `2px solid ${borderColor}`,
    background: bgColor, position: "relative", flexShrink: 0,
    boxShadow: "0 24px 64px rgba(0,0,0,0.38)",
  }}>
    {/* Notch */}
    <div style={{
      position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
      width: 90, height: 24, background: bgColor,
      borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
      zIndex: 3,
    }} />
    <Img src={imgSrc} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
    {children}
  </div>
);

// ─── Scan line animation ──────────────────────────────────────────────────────
const ScanLine: React.FC<{ phoneHeight: number; startFrame: number; color: string }> = ({
  phoneHeight, startFrame, color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [startFrame, startFrame + 2 * fps], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [0, phoneHeight]);
  const opacity = interpolate(frame, [startFrame, startFrame + 0.2 * fps, startFrame + 1.8 * fps, startFrame + 2 * fps], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: y, height: 3, zIndex: 4,
      opacity,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      boxShadow: `0 0 12px ${color}`,
    }} />
  );
};

// ─── Step badge ───────────────────────────────────────────────────────────────
const StepBadge: React.FC<{
  label: string; icon: React.ReactNode;
  color: string; bg: string; border: string;
  startFrame: number;
}> = ({ label, icon, color, bg, border, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 12, stiffness: 200 } });
  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(frame, [startFrame, startFrame + 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 20px", borderRadius: 40,
      background: bg, border: `1.5px solid ${border}`,
      transform: `scale(${scale})`, opacity, transformOrigin: "center",
    }}>
      {icon}
      <span style={{ fontFamily, fontWeight: 700, fontSize: 22, color }}>{label}</span>
    </div>
  );
};

// ─── Arrow separator ─────────────────────────────────────────────────────────
const Arrow: React.FC<{ color: string; startFrame: number }> = ({ color, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [startFrame, startFrame + 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" style={{ opacity, flexShrink: 0 }}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────
export const Scene4ScanSolve: React.FC<VideoProps> = ({ theme, locale }) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene4");
  const { fps, width, height } = useVideoConfig();
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";

  // ── Timings ──────────────────────────────────────────────────────────────
  const BANNER_START  = 0;
  const PHONE_START   = 0.4 * fps;
  const SCAN_START    = 1.2 * fps;
  const MAYA1_START   = 3.0 * fps;
  const ALEX1_START   = 6.0 * fps;
  const ALEX2_START   = 9.0 * fps;
  const MAYA2_START   = 11.0 * fps;
  const BADGE_START   = 12.5 * fps;

  // ── Phone sizing (portrait 1242×2688 → ~0.46 aspect) ─────────────────────
  const PHONE_H = Math.round(height * 0.80);
  const PHONE_W = Math.round(PHONE_H * (1242 / 2688));

  // ── Illustration sizing (onboarding 2048×2048 square → cropped card) ─────
  const ILLUS_SIDE = Math.round(height * 0.60);

  // ── Left panel width ──────────────────────────────────────────────────────
  const LEFT_W = ILLUS_SIDE + PHONE_W + 48;
  const RIGHT_W = width - LEFT_W - 40;

  // ── Animations ────────────────────────────────────────────────────────────
  const bannerSpring = spring({ frame: frame - BANNER_START, fps, config: { damping: 18, stiffness: 100 } });
  const bannerX = interpolate(bannerSpring, [0, 1], [isRtl ? 120 : -120, 0]);
  const bannerOpacity = interpolate(frame, [BANNER_START, BANNER_START + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const phoneSpring = spring({ frame: frame - PHONE_START, fps, config: { damping: 16, stiffness: 110 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [100, 0]);
  const phoneOpacity = interpolate(frame, [PHONE_START, PHONE_START + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const bgStyle: React.CSSProperties = theme === "dark"
    ? { background: "linear-gradient(140deg, #1a1c34 0%, #2a2d4a 50%, #221e3e 100%)" }
    : { background: "linear-gradient(140deg, #f0f4ff 0%, #f6f8ff 50%, #ede8ff 100%)" };

  const phoneFrameBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(120,80,220,0.22)";
  const phoneBg = theme === "dark" ? "#1a1c34" : "#ffffff";

  const avatarGradientAlex = "linear-gradient(135deg, #e9631a, #c0392b)";
  const avatarGradientMaya = `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`;
  const avatarSize = 58;

  const leftStart = isRtl ? width - LEFT_W - 20 : 20;
  const rightStart = isRtl ? 20 : LEFT_W + 60;

  return (
    <AbsoluteFill style={{ ...bgStyle, overflow: "hidden" }}>
      {/* Music — offset past Scene 1 + Scene 2 */}
      <MusicTrack offsetFrames={SCENE_OFFSET_S * 30} volume={0.35} />
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1} />}

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.brand}07 1px, transparent 1px), linear-gradient(90deg, ${colors.brand}07 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      {/* Glow behind left panel */}
      <div style={{
        position: "absolute",
        left: isRtl ? width - LEFT_W - 60 : -40, top: height * 0.05,
        width: LEFT_W + 80, height: height * 0.9,
        borderRadius: "50%",
        background: colors.brand,
        opacity: theme === "dark" ? 0.07 : 0.05,
        filter: "blur(80px)",
      }} />

      {/* ── Left panel: Feature banner + phone screenshot ── */}
      <div style={{
        position: "absolute",
        left: leftStart, top: 0,
        width: LEFT_W, height,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 24,
        flexDirection: isRtl ? "row-reverse" : "row",
      }}>
        {/* Onboarding illustration — masked card */}
        <div style={{
          transform: `translateX(${bannerX}px)`,
          opacity: bannerOpacity,
          width: ILLUS_SIDE, height: ILLUS_SIDE,
          borderRadius: 32, overflow: "hidden",
          border: `2px solid ${colors.brand}55`,
          boxShadow: `0 0 40px ${colors.brand}44, 0 20px 60px rgba(0,0,0,0.32)`,
          flexShrink: 0, position: "relative",
        }}>
          <Img
            src={staticFile("store_artefacts/onboarding_learning.jpg")}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          />
          {/* Bottom gradient fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
            background: theme === "dark"
              ? "linear-gradient(to top, #1a1c34ee, transparent)"
              : "linear-gradient(to top, #f0f4ffcc, transparent)",
          }} />
        </div>

        {/* Phone screenshot with scan animation */}
        <div style={{
          transform: `translateY(${phoneY}px)`,
          opacity: phoneOpacity,
          position: "relative", flexShrink: 0,
        }}>
          <PhoneFrame
            imgSrc={staticFile("store_artefacts/ios/screenshots/en/en_store_homework_6_7.png")}
            width={PHONE_W}
            height={PHONE_H}
            borderColor={phoneFrameBorder}
            bgColor={phoneBg}
          >
            <ScanLine phoneHeight={PHONE_H} startFrame={SCAN_START} color={colors.brand} />
          </PhoneFrame>
        </div>
      </div>

      {/* ── Right panel: dialog ── */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : rightStart,
        right: isRtl ? width - rightStart - RIGHT_W : undefined,
        top: 0, width: RIGHT_W, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 20,
        padding: "0 32px",
      }}>
        {/* Scene label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          opacity: bannerOpacity,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          <HomeworkIcon size={28} color={colors.brand} />
          <span style={{ fontFamily, fontWeight: 700, fontSize: 20, color: colors.brand, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {t(locale, "s4_widget_title")}
          </span>
        </div>

        {/* Maya line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={MAYA1_START} size={avatarSize}>
            <AppLogoIcon size={32} animated={false} />
          </Avatar>
          <Bubble
            text={t(locale, "s4_maya1")}
            align={isRtl ? "right" : "left"}
            color={colors.textMain}
            bg={colors.bubbleMaya}
            borderColor={`${colors.brand}33`}
            startFrame={MAYA1_START}
            fontSize={24}
            dir={dir}
          />
        </div>

        {/* Alex line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={ALEX1_START} size={avatarSize}>
            <UserAvatarIcon size={30} color="white" />
          </Avatar>
          <Bubble
            text={t(locale, "s4_alex1")}
            align={isRtl ? "left" : "right"}
            color={colors.textMain}
            bg={colors.bubbleAlex}
            borderColor={`${colors.brand}33`}
            startFrame={ALEX1_START}
            fontSize={24}
            dir={dir}
          />
        </div>

        {/* Alex line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={ALEX2_START} size={avatarSize}>
            <UserAvatarIcon size={30} color="white" />
          </Avatar>
          <Bubble
            text={t(locale, "s4_alex2")}
            align={isRtl ? "left" : "right"}
            color={colors.textMain}
            bg={colors.bubbleAlex}
            borderColor={`${colors.brand}33`}
            startFrame={ALEX2_START}
            fontSize={24}
            dir={dir}
          />
        </div>

        {/* Maya line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={MAYA2_START} size={avatarSize}>
            <AppLogoIcon size={32} animated={false} />
          </Avatar>
          <Bubble
            text={t(locale, "s4_maya2")}
            align={isRtl ? "right" : "left"}
            color={colors.textMain}
            bg={colors.bubbleMaya}
            borderColor={`${colors.brand}33`}
            startFrame={MAYA2_START}
            fontSize={24}
            dir={dir}
          />
        </div>

        {/* Step badges: Scan → Organize → Learn */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          flexWrap: "wrap",
          flexDirection: isRtl ? "row-reverse" : "row",
          marginTop: 8,
        }}>
          <StepBadge
            label="Scan"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7V5a2 2 0 0 1 2-2h2M3 17v2a2 2 0 0 0 2 2h2M17 3h2a2 2 0 0 1 2 2v2M17 21h2a2 2 0 0 0 2-2v-2M7 12h10" stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/></svg>}
            color={colors.textMain}
            bg={theme === "dark" ? `${colors.brand}20` : `${colors.brand}12`}
            border={`${colors.brand}55`}
            startFrame={BADGE_START}
          />
          <Arrow color={colors.brandDark} startFrame={BADGE_START + 0.15 * fps} />
          <StepBadge
            label="Organize"
            icon={<HomeworkIcon size={20} color={colors.brand} />}
            color={colors.textMain}
            bg={theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)"}
            border="#3B82F655"
            startFrame={BADGE_START + 0.3 * fps}
          />
          <Arrow color={colors.brandDark} startFrame={BADGE_START + 0.45 * fps} />
          <StepBadge
            label="Learn"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            color={colors.textMain}
            bg={theme === "dark" ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)"}
            border="#10B98155"
            startFrame={BADGE_START + 0.6 * fps}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
