/**
 * Scene 5 — AI Chat Assistant (14s)
 *
 * Story: Alex is stuck on a topic → asks FamilyLearn.AI chat →
 *        gets step-by-step explanation, available 24/7.
 *
 * Left:  1_your_personal_ai_tutor.png banner + en_store_chat_6_7.png phone
 * Right: Alex/Maya dialog + animated "typing then answer" chat demo
 * Badge: Ask · Explain · Understand
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
import { themes, ThemeColors } from "../themes";
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

// Scene 5 starts at 9+16+14+14 = 53s
const SCENE_OFFSET_S = 64;

const T = {
  BANNER_IN:    0,
  DIALOG_ALEX1: Math.round(1.0 * 30),
  DIALOG_MAYA1: Math.round(3.5 * 30),
  CHAT_IN:      Math.round(5.5 * 30),
  PHONE_IN:     Math.round(5.8 * 30),
  DIALOG_ALEX2: Math.round(9.0 * 30),
  DIALOG_MAYA2: Math.round(11.0 * 30),
  BADGE_IN:     Math.round(12.5 * 30),
};

// ─── Speech bubble ─────────────────────────────────────────────────────────
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

// ─── Animated chat preview ─────────────────────────────────────────────────
const ChatPreview: React.FC<{
  startFrame: number; theme: "dark" | "light"; colors: ThemeColors;
}> = ({ startFrame, theme, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerOpacity = interpolate(frame, [startFrame, startFrame + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const containerY = interpolate(frame, [startFrame, startFrame + 0.6 * fps], [16, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // User question appears first
  const q1Start = startFrame + 0.3 * fps;
  const q1Opacity = interpolate(frame, [q1Start, q1Start + 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Typing dots
  const typingStart = startFrame + 1.2 * fps;
  const typingEnd   = startFrame + 2.8 * fps;
  const showTyping = frame >= typingStart && frame < typingEnd;
  const dot1 = Math.sin(((frame - typingStart) / fps) * Math.PI * 4) * 0.5 + 0.5;
  const dot2 = Math.sin(((frame - typingStart) / fps) * Math.PI * 4 - 0.8) * 0.5 + 0.5;
  const dot3 = Math.sin(((frame - typingStart) / fps) * Math.PI * 4 - 1.6) * 0.5 + 0.5;

  // AI answer lines appear one by one
  const ans1Start = Math.round(typingEnd);
  const ans2Start = ans1Start + Math.round(0.5 * fps);
  const ans3Start = ans2Start + Math.round(0.5 * fps);

  const answers = [
    "① Identify what's given",
    "② Set up the equation",
    "③ Solve step by step",
  ];

  const chatBg = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
  const chatBorder = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(120,80,220,0.18)";
  const headerBg = theme === "dark" ? `${colors.brand}20` : `${colors.brand}15`;
  const aiBubbleBg = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(240,235,255,0.9)";
  const userBubbleBg = `${colors.brand}30`;
  const ansFrames = [ans1Start, ans2Start, ans3Start];

  return (
    <div style={{
      opacity: containerOpacity,
      transform: `translateY(${containerY}px)`,
      background: chatBg, border: `1px solid ${chatBorder}`,
      borderRadius: 20, overflow: "hidden", width: "100%",
      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
    }}>
      {/* Header */}
      <div style={{
        background: headerBg, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${chatBorder}`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AppLogoIcon size={20} animated={false} />
        </div>
        <div>
          <div style={{ fontFamily, fontWeight: 700, fontSize: 14, color: colors.textMain }}>
            FamilyLearn.AI
          </div>
          <div style={{ fontFamily, fontSize: 11, color: colors.brand, fontWeight: 600 }}>online</div>
        </div>
      </div>

      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* User question */}
        <div style={{
          opacity: q1Opacity, alignSelf: "flex-end",
          background: userBubbleBg, border: `1px solid ${colors.brand}44`,
          borderRadius: "14px 14px 4px 14px", padding: "9px 13px",
          fontFamily, fontSize: 12, fontWeight: 600, color: colors.textMain,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={colors.brand} strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          How do I solve quadratic equations?
        </div>

        {/* AI response bubble — fixed height */}
        <div style={{
          alignSelf: "flex-start", background: aiBubbleBg,
          border: `1px solid ${chatBorder}`, borderRadius: "14px 14px 14px 4px",
          width: "100%", height: 120, position: "relative",
          overflow: "hidden", boxSizing: "border-box" as const,
        }}>
          {/* Typing dots */}
          <div style={{
            position: "absolute", top: 12, left: 14,
            display: "flex", gap: 6, alignItems: "center",
            opacity: showTyping ? 1 : 0,
          }}>
            {[dot1, dot2, dot3].map((o, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: colors.brand, opacity: o }} />
            ))}
          </div>

          {/* Answer steps */}
          <div style={{
            position: "absolute", top: 10, left: 14, right: 14, bottom: 10,
            display: "flex", flexDirection: "column", gap: 5,
            opacity: showTyping ? 0 : 1,
          }}>
            <div style={{ fontFamily, fontSize: 11, fontWeight: 700, color: colors.brand, marginBottom: 2 }}>
              Step-by-step solution:
            </div>
            {answers.map((ans, i) => {
              const aOpacity = interpolate(frame, [ansFrames[i], ansFrames[i] + 0.25 * fps], [0, 1], {
                extrapolateRight: "clamp", extrapolateLeft: "clamp",
              });
              return (
                <div key={i} style={{
                  opacity: aOpacity,
                  fontFamily, fontSize: 12, fontWeight: 600, color: colors.textMain,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.brand, flexShrink: 0 }} />
                  {ans}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Badge ──────────────────────────────────────────────────────────────────
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

// ─── Main Scene ──────────────────────────────────────────────────────────────
export const Scene5AiChat: React.FC<VideoProps> = ({ theme, locale }) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene5");
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

  // Banner
  const bannerSpring = spring({ frame: frame - T.BANNER_IN, fps, config: { damping: 18, stiffness: 100 } });
  const bannerX = interpolate(bannerSpring, [0, 1], [isRtl ? 140 : -140, 0]);
  const bannerOpacity = interpolate(frame, [T.BANNER_IN, T.BANNER_IN + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Phone
  const phoneSpring = spring({ frame: frame - T.PHONE_IN, fps, config: { damping: 16, stiffness: 110 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [120, 0]);
  const phoneOpacity = interpolate(frame, [T.PHONE_IN, T.PHONE_IN + 0.7 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const bgStyle: React.CSSProperties = theme === "dark"
    ? { background: "linear-gradient(140deg, #1a1c34 0%, #2a2d4a 50%, #1e2040 100%)" }
    : { background: "linear-gradient(140deg, #f0f4ff 0%, #f6f8ff 50%, #ede8ff 100%)" };

  const phoneFrameBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(120,80,220,0.22)";
  const phoneBg = theme === "dark" ? "#1a1c34" : "#ffffff";
  const avatarGradientAlex = "linear-gradient(135deg, #e9631a, #c0392b)";
  const avatarGradientMaya = `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`;
  const avatarSize = 52;

  const { fps: FPS } = useVideoConfig();

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

      {/* Glow */}
      <div style={{
        position: "absolute",
        left: isRtl ? "auto" : -40, right: isRtl ? -40 : "auto",
        top: height * 0.1, width: LEFT_W + 80, height: height * 0.8,
        borderRadius: "50%", background: colors.brand,
        opacity: theme === "dark" ? 0.06 : 0.04, filter: "blur(80px)",
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
            src={staticFile("store_artefacts/story/output/GooglePlay/1_your_personal_ai_tutor.png")}
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
            src={staticFile("store_artefacts/ios/screenshots/en/en_store_chat_6_7.png")}
            style={{ width: PHONE_W, height: PHONE_H, objectFit: "cover", objectPosition: "top", display: "block" }}
          />
        </div>
      </div>

      {/* Right: dialog + chat preview */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : rightStart,
        right: isRtl ? width - rightStart - RIGHT_W : undefined,
        top: 0, width: RIGHT_W, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 14, padding: "0 28px",
      }}>
        {/* Scene label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          opacity: bannerOpacity,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke={colors.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily, fontWeight: 700, fontSize: 18, color: colors.brand, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {t(locale, "s5_widget_title")}
          </span>
        </div>

        {/* Alex line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX1} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble text={t(locale, "s5_alex1")} align={isRtl ? "left" : "right"}
            color={colors.textMain} bg={colors.bubbleAlex} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX1} dir={dir} />
        </div>

        {/* Maya line 1 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA1} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "s5_maya1")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA1} dir={dir} />
        </div>

        {/* Chat preview widget */}
        <div style={{ paddingLeft: isRtl ? 0 : avatarSize + 10, paddingRight: isRtl ? avatarSize + 10 : 0 }}>
          <ChatPreview startFrame={T.CHAT_IN} theme={theme} colors={colors} />
        </div>

        {/* Alex line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX2} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble text={t(locale, "s5_alex2")} align={isRtl ? "left" : "right"}
            color={colors.textMain} bg={colors.bubbleAlex} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX2} dir={dir} />
        </div>

        {/* Maya line 2 */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA2} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble text={t(locale, "s5_maya2")} align={isRtl ? "right" : "left"}
            color={colors.textMain} bg={colors.bubbleMaya} borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA2} dir={dir} />
        </div>

        {/* Badges */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          flexWrap: "wrap", marginTop: 4,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={colors.brand} strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/></svg>, key: 0 },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/></svg>, key: 1 },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/></svg>, key: 2 },
          ].map((item, i) => {
            const badgeColors = [colors.brand, "#3B82F6", "#10B981"];
            const badgeBgs = [
              theme === "dark" ? `${colors.brand}20` : `${colors.brand}12`,
              theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)",
              theme === "dark" ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)",
            ];
            const labels = t(locale, "s5_badge").split(" · ");
            const startF = T.BADGE_IN + Math.round(i * 0.2 * fps);
            return (
              <React.Fragment key={item.key}>
                {i > 0 && <Arrow color={colors.brandDark} startFrame={T.BADGE_IN + Math.round((i * 0.2 - 0.05) * fps)} />}
                <Badge
                  icon={item.icon}
                  label={labels[i] ?? ""}
                  color={colors.textMain}
                  bg={badgeBgs[i]}
                  border={`${badgeColors[i]}55`}
                  startFrame={startF}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
