/**
 * Scene: Listen & Learn — Audio Study Mode + Learn Points (12s)
 *
 * Story: Alex discovers audio playlists for commuting →
 *        Maya explains earning Learn Points → gamified progress unlocked.
 *
 * Left:  5_listen___learn_podcasts.png banner + en_store_summary_6_7.png phone
 * Right: Alex asks → Maya explains → mini playlist widget → points badge
 * Badge: Listen · Points · Level Up
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

// Offset: S1(9)+S2(16)+S3(14)+S4(14)+S5(14)+S6(10)+S7(12) = 89s
// This scene is inserted between Scene7FamilyHub and Scene8TrackProgress
const SCENE_OFFSET_S = 114;

const T = {
  BANNER_IN:    0,
  PHONE_IN:     Math.round(0.5 * 30),
  DIALOG_ALEX1: Math.round(1.2 * 30),
  DIALOG_MAYA1: Math.round(3.5 * 30),
  PLAYLIST_IN:  Math.round(5.2 * 30),
  DIALOG_ALEX2: Math.round(6.5 * 30),
  DIALOG_MAYA2: Math.round(9.0 * 30),
  BADGE_IN:     Math.round(10.5 * 30),
};

const Bubble: React.FC<{
  text: string; align: "left" | "right";
  color: string; bg: string; borderColor: string;
  startFrame: number; fontSize?: number; dir?: "ltr" | "rtl";
}> = ({ text, align, color, bg, borderColor, startFrame, fontSize = 23, dir = "ltr" }) => {
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
      opacity, maxWidth: 520, padding: "16px 22px",
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

// Animated mini audio playlist widget
const PlaylistWidget: React.FC<{
  startFrame: number; colors: typeof themes["light"]; theme: "dark" | "light";
}> = ({ startFrame, colors, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [startFrame, startFrame + 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const tracks = [
    { title: "Physics — Chapter 4", duration: "8 min", points: "+12 pts" },
    { title: "Math — Quadratic Equations", duration: "11 min", points: "+18 pts" },
    { title: "History — WWII Summary", duration: "6 min", points: "+10 pts" },
  ];

  const rowBg = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
  const rowBorder = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(120,80,220,0.18)";
  const activeBg = theme === "dark" ? `${colors.brand}25` : `${colors.brand}10`;

  // Waveform pulse animation for the playing track
  const waveScale = 0.8 + Math.sin(frame * 0.25) * 0.2;

  return (
    <div style={{
      opacity: containerOpacity,
      background: rowBg, border: `1px solid ${rowBorder}`,
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    }}>
      <div style={{
        padding: "8px 14px 4px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l12-2v13" stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="6" cy="18" r="3" stroke={colors.brand} strokeWidth="2"/>
          <circle cx="18" cy="16" r="3" stroke={colors.brand} strokeWidth="2"/>
        </svg>
        <span style={{ fontFamily, fontSize: 12, fontWeight: 700, color: colors.brand }}>Study Playlist</span>
        <span style={{ fontFamily, fontSize: 10, fontWeight: 500, color: colors.textMain, opacity: 0.5, marginLeft: "auto" }}>
          3 tracks
        </span>
      </div>
      {tracks.map((track, i) => {
        const itemStart = startFrame + (i + 1) * 0.3 * fps;
        const itemOpacity = interpolate(frame, [itemStart, itemStart + 0.3 * fps], [0, 1], {
          extrapolateRight: "clamp", extrapolateLeft: "clamp",
        });
        const isPlaying = i === 0;
        return (
          <div key={i} style={{
            opacity: itemOpacity,
            padding: "7px 14px",
            borderTop: `1px solid ${rowBorder}`,
            background: isPlaying ? activeBg : "transparent",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {/* Play/wave indicator */}
            <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {isPlaying ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16 }}>
                  {[1, 1.5, 0.7].map((h, wi) => (
                    <div key={wi} style={{
                      width: 3, borderRadius: 2, background: colors.brand,
                      height: `${h * waveScale * 10}px`,
                    }} />
                  ))}
                </div>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polygon points="5 3 19 12 5 21 5 3" stroke={colors.textMain} strokeWidth="2" strokeLinejoin="round" fill="none" opacity={0.4}/>
                </svg>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily, fontSize: 12, fontWeight: isPlaying ? 700 : 600, color: colors.textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {track.title}
              </div>
              <div style={{ fontFamily, fontSize: 10, fontWeight: 500, color: colors.textMain, opacity: 0.5 }}>
                {track.duration}
              </div>
            </div>
            <span style={{ fontFamily, fontSize: 11, fontWeight: 700, color: "#10B981", flexShrink: 0 }}>
              {track.points}
            </span>
          </div>
        );
      })}
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

export const SceneListenLearn: React.FC<VideoProps> = ({ theme, locale }) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene8");
  const { fps, width, height } = useVideoConfig();
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";

  const PHONE_H = Math.round(height * 0.78);
  const PHONE_W = Math.round(PHONE_H * (1242 / 2688));
  const BANNER_H = Math.round(height * 0.80);
  const BANNER_W = Math.round(BANNER_H * (388 / 839));

  const LEFT_GAP = 32;
  const LEFT_W = BANNER_W + PHONE_W + LEFT_GAP;
  const RIGHT_W = width - LEFT_W - 80;

  const leftStart = isRtl ? width - LEFT_W - 20 : 20;
  const rightStart = isRtl ? 20 : LEFT_W + 60;

  const bannerSpring = spring({ frame: frame - T.BANNER_IN, fps, config: { damping: 18, stiffness: 100 } });
  const bannerX = interpolate(bannerSpring, [0, 1], [isRtl ? 140 : -140, 0]);
  const bannerOpacity = interpolate(frame, [T.BANNER_IN, T.BANNER_IN + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const phoneSpring = spring({ frame: frame - T.PHONE_IN, fps, config: { damping: 16, stiffness: 110 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [120, 0]);
  const phoneOpacity = interpolate(frame, [T.PHONE_IN, T.PHONE_IN + 0.7 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const bgStyle: React.CSSProperties = theme === "dark"
    ? { background: "linear-gradient(140deg, #1a1e2e 0%, #1e2540 50%, #1a1c34 100%)" }
    : { background: "linear-gradient(140deg, #f0f0ff 0%, #f5f0ff 50%, #edf5ff 100%)" };

  const phoneFrameBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(120,80,220,0.22)";
  const phoneBg = theme === "dark" ? "#1a1e2e" : "#ffffff";
  const avatarGradientAlex = "linear-gradient(135deg, #e9631a, #c0392b)";
  const avatarGradientMaya = `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`;
  const avatarSize = 52;

  return (
    <AbsoluteFill style={{ ...bgStyle, overflow: "hidden" }}>
      <MusicTrack offsetFrames={SCENE_OFFSET_S * 30} volume={0.35} />
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
        borderRadius: "50%", background: "#10B981",
        opacity: theme === "dark" ? 0.05 : 0.03, filter: "blur(80px)",
      }} />

      {/* Left: banner + phone */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : leftStart,
        right: isRtl ? width - leftStart - LEFT_W : undefined,
        top: 0, width: LEFT_W, height,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: LEFT_GAP, flexDirection: isRtl ? "row-reverse" : "row",
      }}>
        <div style={{
          transform: `translateX(${bannerX}px)`, opacity: bannerOpacity,
          borderRadius: 20, overflow: "hidden",
          border: `2px solid ${phoneFrameBorder}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.32)", flexShrink: 0,
        }}>
          <Img
            src={staticFile("store_artefacts/story/output/GooglePlay/5_listen___learn_podcasts.png")}
            style={{ width: BANNER_W, height: BANNER_H, objectFit: "cover", display: "block" }}
          />
        </div>

        <div style={{
          transform: `translateY(${phoneY}px)`, opacity: phoneOpacity,
          borderRadius: 28, overflow: "hidden",
          border: `2px solid ${phoneFrameBorder}`,
          background: phoneBg, flexShrink: 0,
          boxShadow: "0 24px 64px rgba(0,0,0,0.38)", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 90, height: 24, background: phoneBg,
            borderBottomLeftRadius: 14, borderBottomRightRadius: 14, zIndex: 3,
          }} />
          <Img
            src={staticFile("store_artefacts/ios/screenshots/en/en_store_summary_6_7.png")}
            style={{ width: PHONE_W, height: PHONE_H, objectFit: "cover", objectPosition: "top", display: "block" }}
          />
        </div>
      </div>

      {/* Right: dialog */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : rightStart,
        right: isRtl ? width - rightStart - RIGHT_W : undefined,
        top: 0, width: RIGHT_W, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 16, padding: "0 28px",
      }}>
        {/* Scene label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, opacity: bannerOpacity,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/>
            <circle cx="6" cy="18" r="3" stroke={colors.brand} strokeWidth="2"/>
            <circle cx="18" cy="16" r="3" stroke={colors.brand} strokeWidth="2"/>
          </svg>
          <span style={{ fontFamily, fontWeight: 700, fontSize: 18, color: colors.brand, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {t(locale, "sll_widget_title")}
          </span>
        </div>

        {/* Alex line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX1} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble text={t(locale, "sll_alex1")} align={isRtl ? "left" : "right"}
            color={colors.textMain} bg={colors.bubbleAlex} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX1} dir={dir} />
        </div>

        {/* Maya line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA1} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "sll_maya1")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA1} dir={dir} />
        </div>

        {/* Playlist widget */}
        <div style={{ paddingLeft: isRtl ? 0 : avatarSize + 10, paddingRight: isRtl ? avatarSize + 10 : 0 }}>
          <PlaylistWidget startFrame={T.PLAYLIST_IN} colors={colors} theme={theme} />
        </div>

        {/* Alex line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX2} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble text={t(locale, "sll_alex2")} align={isRtl ? "left" : "right"}
            color={colors.textMain} bg={colors.bubbleAlex} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX2} dir={dir} />
        </div>

        {/* Maya line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA2} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "sll_maya2")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA2} dir={dir} />
        </div>

        {/* Badges */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          {[
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13" stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/><circle cx="6" cy="18" r="3" stroke={colors.brand} strokeWidth="2"/><circle cx="18" cy="16" r="3" stroke={colors.brand} strokeWidth="2"/></svg>,
              color: colors.brand, bg: theme === "dark" ? `${colors.brand}20` : `${colors.brand}12`, border: `${colors.brand}55`,
            },
            {
              icon: <span style={{ fontSize: 16 }}>⭐</span>,
              color: "#F59E0B", bg: theme === "dark" ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)", border: "#F59E0B55",
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              color: "#10B981", bg: theme === "dark" ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)", border: "#10B98155",
            },
          ].map((item, i) => {
            const labels = t(locale, "sll_badge").split(" · ");
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
