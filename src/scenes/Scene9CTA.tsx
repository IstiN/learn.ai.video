/**
 * Scene 9 — CTA (12s)
 *
 * Story: Alex "Okay — I want this." → Maya shows where to get it →
 *        Both celebrate → App store + Google Play buttons
 *
 * Layout: Centered — Logo + ratings image + download badges, no banner+phone panel
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import QRCode from "react-qr-code";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { VideoProps } from "../types";
import { themes } from "../themes";
import { t } from "../i18n/translations";
import { UserAvatarIcon } from "../components/AppIcons";
import { AppLogoIcon } from "../components/AppLogoIcon";
import { MusicTrack } from "../components/MusicTrack";
import { Audio } from "@remotion/media";
import { getSceneAudio } from "../audio";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const RTL_LOCALES = new Set(["ar", "he"]);

// Scene 9 starts at 9+16+14+14+14+10+12+10 = 99s
const SCENE_OFFSET_S = 146;

const T = {
  LOGO_IN:       0,
  DIALOG_ALEX1:  Math.round(0.8 * 30),
  DIALOG_MAYA1:  Math.round(3.0 * 30),
  RATINGS_IN:    Math.round(5.0 * 30),
  DIALOG_ALEX2:  Math.round(6.5 * 30),
  DIALOG_MAYA2:  Math.round(8.5 * 30),
  BADGES_IN:     Math.round(9.5 * 30),
};

const Bubble: React.FC<{
  text: string; align: "left" | "right";
  color: string; bg: string; borderColor: string;
  startFrame: number; fontSize?: number; dir?: "ltr" | "rtl";
  maxWidth?: number;
}> = ({ text, align, color, bg, borderColor, startFrame, fontSize = 22, dir = "ltr", maxWidth = 480 }) => {
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
      opacity, maxWidth, padding: "14px 20px",
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

// Store download badge button
const StoreBadge: React.FC<{
  icon: React.ReactNode;
  topLine: string;
  bottomLine: string;
  startFrame: number;
  colors: typeof themes["light"];
  theme: "dark" | "light";
}> = ({ icon, topLine, bottomLine, startFrame, colors, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 12, stiffness: 180 } });
  const scale = interpolate(progress, [0, 1], [0.6, 1]);
  const opacity = interpolate(frame, [startFrame, startFrame + 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const bg = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.95)";
  const border = theme === "dark" ? "rgba(255,255,255,0.16)" : `${colors.brand}40`;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 24px", borderRadius: 20,
      background: bg, border: `1.5px solid ${border}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      transform: `scale(${scale})`, opacity, transformOrigin: "center",
      minWidth: 220,
    }}>
      {icon}
      <div>
        <div style={{ fontFamily, fontSize: 12, fontWeight: 500, color: colors.textMain, opacity: 0.7 }}>{topLine}</div>
        <div style={{ fontFamily, fontSize: 20, fontWeight: 800, color: colors.textMain }}>{bottomLine}</div>
      </div>
    </div>
  );
};

const GlobeIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.6"/>
    <ellipse cx="12" cy="12" rx="4" ry="10" stroke={color} strokeWidth="1.4"/>
    <path d="M2 12h20" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M4.5 7.5h15M4.5 16.5h15" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const AppleIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const GooglePlayIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3.18 23.5a2 2 0 0 1-1-.28 2 2 0 0 1-1-1.75V2.53a2 2 0 0 1 1-1.75 2 2 0 0 1 2 0l17 9.47a2 2 0 0 1 0 3.5l-17 9.47a2 2 0 0 1-1 .28z" fill="none"/>
    <path d="M2.5 2L13.5 13 2.5 24" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2.5 2l14 7-3 3" stroke="#FBBC04" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2.5 24l14-7-3-3" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16.5 9L21 12l-4.5 3" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// QR code row — website, App Store, Google Play
const QRRow: React.FC<{
  startFrame: number;
  colors: typeof themes["light"];
  theme: "dark" | "light";
}> = ({ startFrame, colors, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardBg = theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.90)";
  const cardBorder = theme === "dark" ? "rgba(255,255,255,0.18)" : `${colors.brand}44`;
  const labelColor = theme === "dark" ? "rgba(255,255,255,0.9)" : colors.textMain;

  const items = [
    {
      url: "https://learn.ai-native.pro/",
      label: "learn.ai-native.pro",
      icon: <GlobeIcon size={28} color={colors.brand} />,
    },
    {
      url: "https://apps.apple.com/rw/app/learn-ai-ai-tutor/id6756234872",
      label: "App Store",
      icon: <AppleIcon size={28} color={theme === "dark" ? "#ffffff" : "#1a1a2e"} />,
    },
    {
      url: "https://play.google.com/store/apps/details?id=pro.ainative.learn",
      label: "Google Play",
      icon: <GooglePlayIcon size={28} />,
    },
  ];

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {items.map(({ url, label, icon }, i) => {
        const sf = startFrame + Math.round(i * 0.3 * fps);
        const progress = spring({ frame: frame - sf, fps, config: { damping: 14, stiffness: 160 } });
        const scale = interpolate(progress, [0, 1], [0.7, 1], { extrapolateRight: "clamp" });
        const opacity = interpolate(frame, [sf, sf + 0.4 * fps], [0, 1], {
          extrapolateRight: "clamp", extrapolateLeft: "clamp",
        });
        return (
          <div key={label} style={{
            transform: `scale(${scale})`, opacity, transformOrigin: "bottom center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "16px 16px 14px",
            background: cardBg, border: `1.5px solid ${cardBorder}`,
            borderRadius: 22,
            boxShadow: theme === "dark"
              ? `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${colors.brand}22`
              : `0 12px 32px rgba(99,82,230,0.16), 0 0 0 1px ${colors.brand}18`,
          }}>
            {/* Platform icon */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              paddingBottom: 6,
              borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : `${colors.brand}22`}`,
              width: "100%", justifyContent: "center",
            }}>
              {icon}
              <span style={{
                fontFamily, fontSize: 15, fontWeight: 700,
                color: labelColor, letterSpacing: "0.01em",
              }}>{label}</span>
            </div>
            {/* QR code */}
            <div style={{
              padding: 10, background: "#ffffff", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
              <QRCode value={url} size={150} bgColor="#ffffff" fgColor="#1a1830" level="M" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Scene9CTA: React.FC<VideoProps> = ({ theme, locale }) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene10");
  const { fps, width, height } = useVideoConfig();
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";

  const logoSpring = spring({ frame: frame - T.LOGO_IN, fps, config: { damping: 16, stiffness: 120 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [T.LOGO_IN, T.LOGO_IN + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const bgStyle: React.CSSProperties = theme === "dark"
    ? { background: "linear-gradient(140deg, #12131e 0%, #1e1f38 50%, #151628 100%)" }
    : { background: "linear-gradient(140deg, #f0eeff 0%, #f6f4ff 50%, #ede8ff 100%)" };

  const avatarGradientAlex = "linear-gradient(135deg, #e9631a, #c0392b)";
  const avatarGradientMaya = `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`;
  const avatarSize = 52;

  const CONTENT_W = Math.min(width * 0.72, 1060);
  const LEFT_X = (width - CONTENT_W) / 2;

  // Glow pulse for CTA section
  const glowPulse = Math.sin(frame * 0.04) * 0.02 + 0.06;

  return (
    <AbsoluteFill style={{ ...bgStyle, overflow: "hidden" }}>
      <MusicTrack offsetFrames={SCENE_OFFSET_S * 30} volume={0.35} />
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1} />}

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.brand}07 1px, transparent 1px), linear-gradient(90deg, ${colors.brand}07 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      {/* Centered ambient glow */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 500, borderRadius: "50%",
        background: colors.brand, opacity: glowPulse, filter: "blur(120px)",
      }} />

      {/* Main content column */}
      <div style={{
        position: "absolute",
        left: LEFT_X, top: 0, width: CONTENT_W, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 18,
        direction: dir,
      }}>
        {/* Logo + app name */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          transform: `scale(${logoScale})`, opacity: logoOpacity,
          transformOrigin: "left center",
          justifyContent: isRtl ? "flex-end" : "flex-start",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: `linear-gradient(135deg, ${colors.brand}, ${colors.brandDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 12px 32px ${colors.brand}66`,
          }}>
            <AppLogoIcon size={46} animated={false} />
          </div>
          <div>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 32, color: colors.textMain, lineHeight: 1.1 }}>
              FamilyLearn.AI
            </div>
            <div style={{ fontFamily, fontWeight: 500, fontSize: 16, color: colors.textMain, opacity: 0.6 }}>
              Your personal AI tutor
            </div>
          </div>
        </div>

        {/* Alex line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX1} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble text={t(locale, "s9_alex1")} align={isRtl ? "left" : "right"}
            color={colors.textMain} bg={colors.bubbleAlex} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX1} dir={dir} />
        </div>

        {/* Maya line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA1} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "s9_maya1")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA1} dir={dir} />
        </div>

        {/* QR codes — website, App Store, Google Play */}
        <div style={{ paddingLeft: isRtl ? 0 : avatarSize + 10, paddingRight: isRtl ? avatarSize + 10 : 0 }}>
          <QRRow startFrame={T.RATINGS_IN} colors={colors} theme={theme} />
        </div>

        {/* Alex line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX2} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble text={t(locale, "s9_alex2")} align={isRtl ? "left" : "right"}
            color={colors.textMain} bg={colors.bubbleAlex} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX2} dir={dir} />
        </div>

        {/* Maya line 2 — closing */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA2} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "s9_maya2")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA2} dir={dir} />
        </div>

        {/* Store download badges */}
        <div style={{
          display: "flex", gap: 16, flexWrap: "wrap",
          flexDirection: isRtl ? "row-reverse" : "row",
          paddingLeft: isRtl ? 0 : avatarSize + 10,
          paddingRight: isRtl ? avatarSize + 10 : 0,
        }}>
          <StoreBadge
            startFrame={T.BADGES_IN}
            colors={colors} theme={theme}
            topLine="Download on the"
            bottomLine="App Store"
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke={colors.brand} strokeWidth="1.5"/>
                <path d="M8 12l3 3 5-5" stroke={colors.brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <StoreBadge
            startFrame={T.BADGES_IN + Math.round(0.25 * fps)}
            colors={colors} theme={theme}
            topLine="Get it on"
            bottomLine="Google Play"
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 3l14 9-14 9V3z" stroke={colors.brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
