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
import { Audio } from "@remotion/media";
import { getSceneAudio } from "../audio";
import { VideoProps } from "../types";
import { videoFontFamily as fontFamily } from "../fonts/videoFonts";
import { themes } from "../themes";
import { t } from "../i18n/translations";
import { AppLogoIcon } from "../components/AppLogoIcon";
import { UserAvatarIcon } from "../components/AppIcons";
import { MusicTrack } from "../components/MusicTrack";
import { scene2MultidevicePath } from "../config/scene-assets";
import { useSplitPanels } from "../layout/useSplitPanels";

const RTL_LOCALES = new Set(["ar", "he"]);

// ─── Locale → web_output folder mapping ──────────────────────────────────────
const AVAILABLE_WEB_LANGS = new Set(["de", "en", "es", "fr", "ru"]);

function webOutputLang(locale: string): string {
  const prefix = locale.split("-")[0];
  if (prefix === "ru" || prefix === "uk") return "ru";
  if (prefix === "de") return "de";
  if (prefix === "es") return "es";
  if (prefix === "fr") return "fr";
  if (AVAILABLE_WEB_LANGS.has(prefix)) return prefix;
  return "en";
}

// ─── SVG Icons for badges ────────────────────────────────────────────────────

const ClockIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <polyline points="12 6 12 12 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GlobeIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth="2" />
  </svg>
);

const DevicesIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Phone */}
    <rect x="1" y="5" width="7" height="12" rx="1.5" stroke={color} strokeWidth="2" />
    <line x1="4.5" y1="15" x2="4.5" y2="15.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Tablet */}
    <rect x="10" y="3" width="9" height="14" rx="1.5" stroke={color} strokeWidth="2" />
    <line x1="14.5" y1="15" x2="14.5" y2="15.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Keyboard hint */}
    <line x1="10" y1="20" x2="19" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Badge pill ──────────────────────────────────────────────────────────────

const Badge: React.FC<{
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  delay: number;
}> = ({ label, icon, color, bgColor, borderColor, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 220 },
  });

  const scale = interpolate(progress, [0, 1], [0.6, 1]);
  const opacity = interpolate(
    frame,
    [delay, delay + 0.3 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 22px",
        borderRadius: 50,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        backdropFilter: "blur(8px)",
        flexShrink: 0,
      }}
    >
      {icon}
      <span
        style={{
          fontFamily,
          fontWeight: 700,
          fontSize: 28,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Speech bubble ───────────────────────────────────────────────────────────

const Bubble: React.FC<{
  text: string;
  align: "left" | "right";
  color: string;
  bg: string;
  borderColor: string;
  startFrame: number;
  endFrame: number;
  fontSize?: number;
  dir: "ltr" | "rtl";
  maxWidth?: number;
}> = ({ text, align, color, bg, borderColor, startFrame, endFrame, fontSize = 34, dir, maxWidth = 560 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 200 },
  });

  const opacity =
    interpolate(frame, [startFrame, startFrame + 0.4 * fps], [0, 1], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }) *
    interpolate(frame, [endFrame - 0.3 * fps, endFrame], [1, 0], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    });

  return (
    <div
      style={{
        transform: `scale(${scaleProgress})`,
        transformOrigin: align === "left" ? "bottom left" : "bottom right",
        opacity,
        maxWidth,
        padding: "18px 26px",
        borderRadius:
          align === "left" ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
        fontFamily,
        fontSize,
        fontWeight: 600,
        lineHeight: 1.45,
        color,
        background: bg,
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(10px)",
        direction: dir,
        boxSizing: "border-box",
      }}
    >
      {text}
    </div>
  );
};

// ─── Avatar ──────────────────────────────────────────────────────────────────

const Avatar: React.FC<{
  gradient: string;
  startFrame: number;
  size: number;
  children: React.ReactNode;
}> = ({ gradient, startFrame, size, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 0.4 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: gradient,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {children}
    </div>
  );
};

// ─── Student SVG (same as Scene 1) ───────────────────────────────────────────

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const Scene2DeviceMockup: React.FC<VideoProps> = ({
  theme,
  locale,
  includeBackgroundMusic = true,
}) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene2");
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const lastFrame = durationInFrames - 1;
  const exitFadeFrames = 0.55 * fps;
  const sceneEndFade = interpolate(
    frame,
    [lastFrame - exitFadeFrames, lastFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";
  const lang = webOutputLang(locale);
  const panels = useSplitPanels(isRtl);
  const v = panels.visual;
  const c = panels.copy;
  const isPortrait = panels.aspect === "portrait";

  // ── Timings — spread across full 16s to match voiceover ─────────────────
  const MOCKUP_START  = 0;
  const MAYA1_START   = 1.0 * fps;
  const BADGE1_START  = 3.0 * fps;
  const BADGE2_START  = 4.2 * fps;
  const BADGE3_START  = 5.4 * fps;
  const ALEX_START    = 7.5 * fps;
  const MAYA2_START   = 11.0 * fps;
  const SCENE_FRAMES  = 16 * fps; // dialogue pacing vs ~16s VO (composition may be longer)

  // ── Mockup animation ─────────────────────────────────────────────────────
  const mockupSpring = spring({
    frame: frame - MOCKUP_START,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const mockupY = interpolate(mockupSpring, [0, 1], [120, 0]);
  const mockupOpacity = interpolate(
    frame,
    [MOCKUP_START, MOCKUP_START + 0.8 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // ── Background ───────────────────────────────────────────────────────────
  const bgStyle: React.CSSProperties =
    theme === "dark"
      ? { background: "linear-gradient(140deg, #1a1d35 0%, #2d3352 50%, #2a2550 100%)" }
      : { background: "linear-gradient(140deg, #f0f4ff 0%, #f6f8ff 50%, #ede8ff 100%)" };

  // Layout: landscape — image left, dialog right (RTL flip). Portrait — visual top / copy bottom.
  const IMG_ASPECT = 2560 / 1440;
  const TITLE_BAR_H = 42;
  let CHROME_W: number;
  let SCREENSHOT_H: number;
  let CHROME_H: number;
  let IMAGE_W: number;
  let DIALOG_W: number;
  let imageLeft: number;
  let dialogLeft: number;

  if (isPortrait) {
    CHROME_W = Math.round(Math.min(v.width - 48, v.width * 0.94));
    SCREENSHOT_H = Math.round(CHROME_W / IMG_ASPECT);
    CHROME_H = SCREENSHOT_H + TITLE_BAR_H;
    const maxChromeH = Math.round(v.height * 0.88);
    if (CHROME_H > maxChromeH) {
      const s = maxChromeH / CHROME_H;
      CHROME_W = Math.max(280, Math.round(CHROME_W * s));
      SCREENSHOT_H = Math.round(CHROME_W / IMG_ASPECT);
      CHROME_H = SCREENSHOT_H + TITLE_BAR_H;
    }
    IMAGE_W = v.width;
    DIALOG_W = c.width;
    imageLeft = v.left;
    dialogLeft = c.left;
  } else {
    CHROME_W = Math.round(width * 0.44);
    SCREENSHOT_H = Math.round(CHROME_W / IMG_ASPECT);
    CHROME_H = SCREENSHOT_H + TITLE_BAR_H;
    IMAGE_W = CHROME_W + 80;
    DIALOG_W = width - IMAGE_W - 60;
    imageLeft = isRtl ? width - IMAGE_W + 10 : 20;
    dialogLeft = isRtl ? 30 : IMAGE_W + 60;
  }

  const avatarSize = 62;
  const bubbleMax = Math.max(220, Math.min(560, DIALOG_W - 24 - avatarSize));
  const dialogGap = isPortrait ? 12 : 24;
  const dialogPad = isPortrait ? "4px 12px 0" : "0 20px";
  const dialogJustify = isPortrait ? "flex-start" : "center";
  const avatarGradientAlex = "linear-gradient(135deg, #e9631a, #c0392b)";
  const avatarGradientMaya = `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`;

  return (
    <AbsoluteFill style={{ ...bgStyle, overflow: "hidden" }}>
      {/* Voiceover – full volume (not affected by scene exit fade) */}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1} />}

      {/* Foreground only — gradient stays on AbsoluteFill so the backdrop does not black out */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: sceneEndFade,
        }}
      >
      {/* Background music — offset to 9s (Scene 1 duration) for standalone preview */}
      {includeBackgroundMusic && (
        <MusicTrack offsetFrames={9 * 30} volume={0.3} />
      )}

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${colors.brand}07 1px, transparent 1px), linear-gradient(90deg, ${colors.brand}07 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Glow behind mockup */}
      <div
        style={{
          position: "absolute",
          ...(isPortrait
            ? {
                left: v.left - 24,
                top: v.top + v.height * 0.05,
                width: v.width + 48,
                height: v.height * 0.9,
              }
            : {
                left: isRtl ? width * 0.3 : -60,
                top: height * 0.1,
                width: IMAGE_W + 120,
                height: height * 0.9,
              }),
          borderRadius: "50%",
          background: colors.brand,
          opacity: theme === "dark" ? 0.07 : 0.05,
          filter: "blur(80px)",
        }}
      />

      {/* ── Dashboard Screenshot (browser chrome frame) ── */}
      <div
        style={{
          position: "absolute",
          left: isPortrait ? v.left : imageLeft,
          top: isPortrait ? v.top : 0,
          width: isPortrait ? v.width : IMAGE_W,
          height: isPortrait ? v.height : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${mockupY}px)`,
          opacity: mockupOpacity,
          paddingLeft: isPortrait ? 0 : 40,
          boxSizing: "border-box",
        }}
      >
        {/* Outer glow ring sized to the chrome frame */}
        <div
          style={{
            position: "absolute",
            width: CHROME_W + 24,
            height: CHROME_H + 24,
            borderRadius: 28,
            boxShadow: `0 0 80px ${colors.brand}55, 0 0 160px ${colors.brand}22, 0 32px 80px rgba(0,0,0,0.45)`,
            pointerEvents: "none",
          }}
        />

        {/* Browser chrome — sized exactly to image aspect ratio */}
        <div
          style={{
            width: CHROME_W,
            height: CHROME_H,
            borderRadius: 16,
            overflow: "hidden",
            border: `1.5px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(120,80,220,0.25)"}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            background: theme === "dark" ? "#1e2140" : "#ffffff",
          }}
        >
          {/* Title bar */}
          <div
            style={{
              height: TITLE_BAR_H,
              flexShrink: 0,
              background: theme === "dark"
                ? "linear-gradient(90deg, #252a48 0%, #2a2f50 100%)"
                : "linear-gradient(90deg, #f0f2ff 0%, #ebe8ff 100%)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 8,
              borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(120,80,220,0.12)"}`,
            }}
          >
            {/* Traffic lights */}
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", flexShrink: 0 }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
            {/* URL bar */}
            <div
              style={{
                flex: 1,
                margin: "0 14px",
                height: 26,
                borderRadius: 6,
                background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
              }}
            >
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ marginRight: 6, opacity: 0.5 }}>
                <rect x="1" y="5" width="9" height="7" rx="1.5" stroke={theme === "dark" ? "#fff" : "#333"} strokeWidth="1.2" fill="none"/>
                <path d="M3 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke={theme === "dark" ? "#fff" : "#333"} strokeWidth="1.2" fill="none"/>
              </svg>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: theme === "dark" ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", letterSpacing: "0.2px" }}>
                FamilyLearn.AI
              </span>
            </div>
          </div>

          {/* Screenshot — fills the exact remaining space, no cropping */}
          <div style={{ width: CHROME_W, height: SCREENSHOT_H, flexShrink: 0, position: "relative" }}>
            <Img
              src={staticFile(scene2MultidevicePath(theme))}
              style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
            />
            {/* Right-edge fade so dialog panel overlaps cleanly */}
            <div
              style={{
                position: "absolute",
                top: 0, right: 0, bottom: 0,
                width: "14%",
                background: theme === "dark"
                  ? "linear-gradient(to right, transparent, #1e2140)"
                  : "linear-gradient(to right, transparent, #f6f8ff)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Right dialog panel ── */}
      <div
        style={{
          position: "absolute",
          left: dialogLeft,
          top: isPortrait ? c.top : 0,
          width: DIALOG_W,
          height: isPortrait ? c.height : height,
          display: "flex",
          flexDirection: "column",
          justifyContent: dialogJustify,
          gap: dialogGap,
          padding: dialogPad,
          overflow: isPortrait ? "hidden" : undefined,
          boxSizing: "border-box",
        }}
      >
        {/* Logo lockup — top of panel */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4, flexDirection: isRtl ? "row-reverse" : "row", opacity: mockupOpacity }}>
          <AppLogoIcon size={52} animated />
          <span style={{ fontFamily, fontWeight: 800, fontSize: isPortrait ? 28 : 36, color: colors.brandDark, letterSpacing: "-0.5px" }}>
            FamilyLearn.AI
          </span>
        </div>

        {/* Maya — line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={MAYA1_START} size={avatarSize}>
            <AppLogoIcon size={34} animated={false} />
          </Avatar>
          <Bubble
            text={t(locale, "s2_maya1")}
            align={isRtl ? "right" : "left"}
            color={colors.textMain}
            bg={colors.bubbleMaya}
            borderColor={`${colors.brand}33`}
            startFrame={MAYA1_START}
            endFrame={lastFrame}
            fontSize={isPortrait ? 22 : 28}
            dir={dir}
            maxWidth={bubbleMax}
          />
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            paddingLeft: isRtl ? 0 : avatarSize + 12,
            paddingRight: isRtl ? avatarSize + 12 : 0,
            justifyContent: isRtl ? "flex-end" : "flex-start",
          }}
        >
          <Badge
            label={t(locale, "s2_badge_247")}
            icon={<ClockIcon size={22} color={colors.brand} />}
            color={colors.textMain}
            bgColor={theme === "dark" ? "rgba(168,130,240,0.15)" : "rgba(124,58,237,0.08)"}
            borderColor={`${colors.brand}44`}
            delay={BADGE1_START}
          />
          <Badge
            label={t(locale, "s2_badge_langs")}
            icon={<GlobeIcon size={22} color={colors.brand} />}
            color={colors.textMain}
            bgColor={theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)"}
            borderColor={"#3B82F644"}
            delay={BADGE2_START}
          />
          <Badge
            label={t(locale, "s2_badge_devices")}
            icon={<DevicesIcon size={22} color={colors.brand} />}
            color={colors.textMain}
            bgColor={theme === "dark" ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)"}
            borderColor={"#10B98144"}
            delay={BADGE3_START}
          />
        </div>

        {/* Alex */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={ALEX_START} size={avatarSize}>
            <UserAvatarIcon size={34} color="white" />
          </Avatar>
          <Bubble
            text={t(locale, "s2_alex1")}
            align={isRtl ? "right" : "left"}
            color={colors.textMain}
            bg={colors.bubbleAlex}
            borderColor={`${colors.brand}33`}
            startFrame={ALEX_START}
            endFrame={lastFrame}
            fontSize={isPortrait ? 22 : 28}
            dir={dir}
            maxWidth={bubbleMax}
          />
        </div>

        {/* Maya — line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={MAYA2_START} size={avatarSize}>
            <AppLogoIcon size={34} animated={false} />
          </Avatar>
          <Bubble
            text={t(locale, "s2_maya2")}
            align={isRtl ? "right" : "left"}
            color={colors.textMain}
            bg={colors.bubbleMaya}
            borderColor={`${colors.brand}33`}
            startFrame={MAYA2_START}
            endFrame={lastFrame}
            fontSize={isPortrait ? 22 : 28}
            dir={dir}
            maxWidth={bubbleMax}
          />
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};
