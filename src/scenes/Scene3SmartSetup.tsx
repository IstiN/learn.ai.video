/**
 * Scene 3 — Smart Schedule Setup (14s)
 *
 * Story: User snaps a photo of their class schedule →
 *        FamilyLearn.AI chat reads it → subjects are created automatically.
 *
 * Left panel:  "4_organize_your_study.png" story banner (slides in from left)
 *              + en_store_subjects_6_7.png phone (slides up, reveals after chat)
 * Right panel: Alex/Maya dialog bubbles + animated chat UI typing effect
 * Bottom:      "Snap · Chat · Subjects" badge row
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

// Scene 3 starts at 9s (Scene1) + 16s (Scene2) = 25s into the full video
const SCENE_OFFSET_S = 26;

// ─── Timing constants (frames @ 30fps) ────────────────────────────────────────
// Narrative order: Alex asks → Maya explains → chat demo → Alex reacts → Maya confirms
const T = {
  BANNER_IN:    0,
  DIALOG_ALEX1: Math.round(1.2 * 30),  // Alex: "But how does it know my subjects?"
  DIALOG_MAYA1: Math.round(3.8 * 30),  // Maya: "Just snap a photo..."
  CHAT_FLASH:   Math.round(6.0 * 30),  // Chat widget appears (demo)
  PHONE_IN:     Math.round(6.2 * 30),  // Subjects phone slides up
  DIALOG_ALEX2: Math.round(9.5 * 30),  // Alex: "My whole semester in seconds?"
  DIALOG_MAYA2: Math.round(11.2 * 30), // Maya: "One scan, you're all set."
  BADGE_IN:     Math.round(12.5 * 30),
};

// ─── Speech bubble ────────────────────────────────────────────────────────────
const Bubble: React.FC<{
  text: string;
  align: "left" | "right";
  color: string;
  bg: string;
  borderColor: string;
  startFrame: number;
  fontSize?: number;
  dir?: "ltr" | "rtl";
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
      opacity,
      maxWidth: 520,
      padding: "16px 22px",
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

// ─── Animated chat window (shows AI "typing" then subjects appearing) ─────────
const ChatWidget: React.FC<{
  startFrame: number;
  theme: "dark" | "light";
  colors: ThemeColors;
  locale: string;
}> = ({ startFrame, theme, colors, locale }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth container slide-in (no spring/bounce)
  const containerOpacity = interpolate(frame, [startFrame, startFrame + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const containerY = interpolate(frame, [startFrame, startFrame + 0.6 * fps], [16, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Step 1: user sends photo.jpg (appears first)
  const photoAppear = startFrame + 0.2 * fps;
  const userBubbleOpacity = interpolate(frame, [photoAppear, photoAppear + 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // Step 2: AI scanning/typing dots (starts after photo is visible)
  const typingStart = startFrame + 1.4 * fps;
  const typingEnd   = startFrame + 3.2 * fps;

  // AI bubble container only appears once typing starts
  const aiBubbleOpacity = interpolate(frame, [typingStart, typingStart + 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const showTyping = frame >= typingStart && frame < typingEnd;

  // Three dots pulse
  const dot1 = Math.sin(((frame - typingStart) / fps) * Math.PI * 4) * 0.5 + 0.5;
  const dot2 = Math.sin(((frame - typingStart) / fps) * Math.PI * 4 - 0.8) * 0.5 + 0.5;
  const dot3 = Math.sin(((frame - typingStart) / fps) * Math.PI * 4 - 1.6) * 0.5 + 0.5;

  // Step 3: subjects appear one by one after typing ends
  const subj1Frame = Math.round(typingEnd);
  const subj2Frame = subj1Frame + Math.round(0.35 * fps);
  const subj3Frame = subj2Frame + Math.round(0.35 * fps);
  const subj4Frame = subj3Frame + Math.round(0.35 * fps);

  const subjects = ["Mathematics", "Physics", "English", "History"];
  const subjectColors = [colors.brand, "#3B82F6", "#10B981", "#F59E0B"];
  const subjectFrames = [subj1Frame, subj2Frame, subj3Frame, subj4Frame];

  const chatBg = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
  const chatBorder = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(120,80,220,0.18)";
  const headerBg = theme === "dark" ? `${colors.brand}20` : `${colors.brand}15`;
  const userBubbleBg = `${colors.brand}30`;
  const aiBubbleBg = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(240,235,255,0.9)";

  return (
    <div style={{
      opacity: containerOpacity,
      transform: `translateY(${containerY}px)`,
      background: chatBg,
      border: `1px solid ${chatBorder}`,
      borderRadius: 20,
      overflow: "hidden",
      width: "100%",
      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
    }}>
      {/* Header */}
      <div style={{
        background: headerBg,
        padding: "12px 16px",
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
          <div style={{ fontFamily, fontSize: 11, color: colors.brand, fontWeight: 600 }}>
            online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Step 1 — user sends photo */}
        <div style={{
          opacity: userBubbleOpacity,
          alignSelf: "flex-end",
          background: userBubbleBg,
          border: `1px solid ${colors.brand}44`,
          borderRadius: "14px 14px 4px 14px",
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              stroke={colors.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="13" r="4" stroke={colors.brand} strokeWidth="2"/>
          </svg>
          <span style={{ fontFamily, fontSize: 13, fontWeight: 600, color: colors.textMain }}>
            Schedule photo.jpg
          </span>
        </div>

        {/* Step 2 & 3 — AI bubble with FIXED height: both states are position:absolute so height never changes */}
        <div style={{
          alignSelf: "flex-start",
          background: aiBubbleBg,
          border: `1px solid ${chatBorder}`,
          borderRadius: "14px 14px 14px 4px",
          width: "100%",
          opacity: aiBubbleOpacity,
          // Strictly fixed height — no content can ever change this
          height: 158,
          position: "relative",
          boxSizing: "border-box" as const,
          overflow: "hidden",
        }}>
          {/* Scanning dots — absolutely positioned, reserved slot */}
          <div style={{
            position: "absolute", top: 14, left: 14, right: 14,
            display: "flex", gap: 6, alignItems: "center",
            opacity: showTyping ? 1 : 0,
          }}>
            {[dot1, dot2, dot3].map((dotOpacity, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: colors.brand, opacity: dotOpacity,
              }} />
            ))}
          </div>

          {/* Subjects list — absolutely positioned, same slot, items fade in one by one */}
          <div style={{
            position: "absolute", top: 10, left: 14, right: 14, bottom: 10,
            display: "flex", flexDirection: "column", gap: 6,
            opacity: showTyping ? 0 : 1,
          }}>
            <div style={{ fontFamily, fontSize: 12, fontWeight: 700, color: colors.brand, marginBottom: 2 }}>
              Subjects created:
            </div>
            {subjects.map((subj, i) => {
              const subjOpacity = interpolate(frame, [subjectFrames[i], subjectFrames[i] + 0.25 * fps], [0, 1], {
                extrapolateRight: "clamp", extrapolateLeft: "clamp",
              });
              const subjX = interpolate(frame, [subjectFrames[i], subjectFrames[i] + 0.3 * fps], [-8, 0], {
                extrapolateRight: "clamp", extrapolateLeft: "clamp",
              });
              return (
                <div key={subj} style={{
                  opacity: subjOpacity,
                  transform: `translateX(${subjX}px)`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: subjectColors[i], flexShrink: 0 }} />
                  <span style={{ fontFamily, fontSize: 13, fontWeight: 600, color: colors.textMain }}>{subj}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto" }}>
                    <path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Badge pill ───────────────────────────────────────────────────────────────
const Badge: React.FC<{
  icon: React.ReactNode; label: string;
  color: string; bg: string; border: string;
  startFrame: number;
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

// ─── Camera flash overlay ─────────────────────────────────────────────────────
const CameraFlash: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 3, startFrame + 10, startFrame + 18], [0, 1, 0.6, 0], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, background: "white",
      opacity, zIndex: 10, pointerEvents: "none",
    }} />
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────
export const Scene3SmartSetup: React.FC<VideoProps> = ({ theme, locale }) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene3");
  const { fps, width, height } = useVideoConfig();
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";

  // ── Phone sizing (portrait 1242×2688 ~0.462 aspect) ──────────────────────
  const PHONE_H = Math.round(height * 0.70);
  const PHONE_W = Math.round(PHONE_H * (1242 / 2688));

  // ── Schedule illustration sizing (2048×2048 square) ──────────────────────
  // Show top ~75% of the image (the hexagonal illustration, skip text below)
  const SCHED_SIDE = Math.round(height * 0.62);   // square container width
  const SCHED_CROP = Math.round(SCHED_SIDE * 0.78); // height shows ~78% of square

  // ── Layout ─────────────────────────────────────────────────────────────────
  const LEFT_GAP = 28;
  const LEFT_W = SCHED_SIDE + PHONE_W + LEFT_GAP;
  const RIGHT_W = width - LEFT_W - 80;

  const leftStart = isRtl ? width - LEFT_W - 20 : 20;
  const rightStart = isRtl ? 20 : LEFT_W + 60;

  // ── Banner slide-in ────────────────────────────────────────────────────────
  const bannerSpring = spring({ frame: frame - T.BANNER_IN, fps, config: { damping: 18, stiffness: 100 } });
  const bannerX = interpolate(bannerSpring, [0, 1], [isRtl ? 140 : -140, 0]);
  const bannerOpacity = interpolate(frame, [T.BANNER_IN, T.BANNER_IN + 0.6 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // ── Phone slide-up ────────────────────────────────────────────────────────
  const phoneSpring = spring({ frame: frame - T.PHONE_IN, fps, config: { damping: 16, stiffness: 110 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [120, 0]);
  const phoneOpacity = interpolate(frame, [T.PHONE_IN, T.PHONE_IN + 0.7 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  // ── Background ────────────────────────────────────────────────────────────
  const bgStyle: React.CSSProperties = theme === "dark"
    ? { background: "linear-gradient(140deg, #1a1c34 0%, #2a2d4a 50%, #1e2040 100%)" }
    : { background: "linear-gradient(140deg, #f0f4ff 0%, #f6f8ff 50%, #ede8ff 100%)" };

  const phoneFrameBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(120,80,220,0.22)";
  const phoneBg = theme === "dark" ? "#1a1c34" : "#ffffff";

  const avatarGradientAlex = "linear-gradient(135deg, #e9631a, #c0392b)";
  const avatarGradientMaya = `linear-gradient(135deg, ${colors.brandDark}, #3B82F6)`;
  const avatarSize = 52;

  return (
    <AbsoluteFill style={{ ...bgStyle, overflow: "hidden" }}>
      {/* Camera flash at banner entry */}
      <CameraFlash startFrame={T.BANNER_IN + 4} />

      {/* Background music — offset past Scene 1 + 2 */}
      <MusicTrack offsetFrames={SCENE_OFFSET_S * 30} volume={0.35} />
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1} />}

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.brand}07 1px, transparent 1px), linear-gradient(90deg, ${colors.brand}07 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      {/* Ambient glow left */}
      <div style={{
        position: "absolute",
        left: isRtl ? "auto" : -40, right: isRtl ? -40 : "auto",
        top: height * 0.1, width: LEFT_W + 80, height: height * 0.8,
        borderRadius: "50%", background: colors.brand,
        opacity: theme === "dark" ? 0.06 : 0.04, filter: "blur(80px)",
      }} />

      {/* ── Left panel: banner + phone ── */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : leftStart,
        right: isRtl ? width - leftStart - LEFT_W : undefined,
        top: 0, width: LEFT_W, height,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: LEFT_GAP,
        flexDirection: isRtl ? "row-reverse" : "row",
      }}>
        {/* Onboarding schedule illustration — masked card */}
        <div style={{
          transform: `translateX(${bannerX}px)`,
          opacity: bannerOpacity,
          flexShrink: 0,
          position: "relative",
          width: SCHED_SIDE,
          height: SCHED_CROP,
          borderRadius: 32,
          overflow: "hidden",
          border: `2px solid ${theme === "dark" ? "rgba(120,80,220,0.35)" : "rgba(120,80,220,0.28)"}`,
          boxShadow: `0 0 60px ${colors.brand}33, 0 24px 64px rgba(0,0,0,0.30)`,
        }}>
          <Img
            src={staticFile("store_artefacts/onboarding_schedule.jpg")}
            style={{
              width: SCHED_SIDE,
              height: SCHED_SIDE,
              objectFit: "cover",
              objectPosition: "top center",
              display: "block",
            }}
          />
          {/* Bottom fade — hides the text below the illustration */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "32%",
            background: theme === "dark"
              ? "linear-gradient(to bottom, transparent, #1a1c34)"
              : "linear-gradient(to bottom, transparent, #f0f4ff)",
            pointerEvents: "none",
          }} />
          {/* Right edge fade — blends with the rest of the scene */}
          <div style={{
            position: "absolute",
            top: 0, right: 0, bottom: 0,
            width: "18%",
            background: theme === "dark"
              ? "linear-gradient(to right, transparent, #1a1c34)"
              : "linear-gradient(to right, transparent, #f0f4ff)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Phone: subjects screen */}
        <div style={{
          transform: `translateY(${phoneY}px)`,
          opacity: phoneOpacity,
          borderRadius: 28, overflow: "hidden",
          border: `2px solid ${phoneFrameBorder}`,
          background: phoneBg, flexShrink: 0,
          boxShadow: "0 24px 64px rgba(0,0,0,0.38)",
          position: "relative",
        }}>
          {/* Notch */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 90, height: 24, background: phoneBg,
            borderBottomLeftRadius: 14, borderBottomRightRadius: 14, zIndex: 3,
          }} />
          <Img
            src={staticFile("store_artefacts/ios/screenshots/en/en_store_subjects_6_7.png")}
            style={{ width: PHONE_W, height: PHONE_H, objectFit: "cover", objectPosition: "top", display: "block" }}
          />
        </div>
      </div>

      {/* ── Right panel: dialog + chat widget ── */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : rightStart,
        right: isRtl ? width - rightStart - RIGHT_W : undefined,
        top: 0, width: RIGHT_W, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 14,
        padding: "0 28px",
      }}>
        {/* Scene label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          opacity: bannerOpacity,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M3 17v2a2 2 0 0 0 2 2h2M17 3h2a2 2 0 0 1 2 2v2M17 21h2a2 2 0 0 0 2-2v-2M7 12h10"
              stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily, fontWeight: 700, fontSize: 18, color: colors.brand, letterSpacing: "0.5px", textTransform: "uppercase" }}>
            {t(locale, "s3_widget_title")}
          </span>
        </div>

        {/* Alex line 1 — asks first */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX1} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble
            text={t(locale, "s3_alex1")}
            align={isRtl ? "left" : "right"}
            color={colors.textMain}
            bg={colors.bubbleAlex}
            borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX1}
            dir={dir}
          />
        </div>

        {/* Maya line 1 — explains */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA1} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble
            text={t(locale, "s3_maya1")}
            align={isRtl ? "right" : "left"}
            color={colors.textMain}
            bg={colors.bubbleMaya}
            borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA1}
            dir={dir}
          />
        </div>

        {/* Animated chat widget — demo appears after Maya explains */}
        <div style={{
          paddingLeft: isRtl ? 0 : avatarSize + 10,
          paddingRight: isRtl ? avatarSize + 10 : 0,
        }}>
          <ChatWidget
            startFrame={T.CHAT_FLASH}
            theme={theme}
            colors={colors}
            locale={locale}
          />
        </div>

        {/* Alex line 2 — impressed */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Avatar gradient={avatarGradientAlex} startFrame={T.DIALOG_ALEX2} size={avatarSize}>
            <UserAvatarIcon size={26} color="white" />
          </Avatar>
          <Bubble
            text={t(locale, "s3_alex2")}
            align={isRtl ? "left" : "right"}
            color={colors.textMain}
            bg={colors.bubbleAlex}
            borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_ALEX2}
            dir={dir}
          />
        </div>

        {/* Maya line 2 — confirms */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" }}>
          <Avatar gradient={avatarGradientMaya} startFrame={T.DIALOG_MAYA2} size={avatarSize}>
            <AppLogoIcon size={28} animated={false} />
          </Avatar>
          <Bubble
            text={t(locale, "s3_maya2")}
            align={isRtl ? "right" : "left"}
            color={colors.textMain}
            bg={colors.bubbleMaya}
            borderColor={`${colors.brand}33`}
            startFrame={T.DIALOG_MAYA2}
            dir={dir}
          />
        </div>

        {/* Step badges: Snap → Chat → Subjects */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          flexWrap: "wrap", marginTop: 4,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}>
          <Badge
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                  stroke={colors.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke={colors.brand} strokeWidth="2"/>
              </svg>
            }
            label="Snap"
            color={colors.textMain}
            bg={theme === "dark" ? `${colors.brand}20` : `${colors.brand}12`}
            border={`${colors.brand}55`}
            startFrame={T.BADGE_IN}
          />
          <Arrow color={colors.brandDark} startFrame={T.BADGE_IN + Math.round(0.15 * fps)} />
          <Badge
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            label="Chat"
            color={colors.textMain}
            bg={theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)"}
            border="#3B82F655"
            startFrame={T.BADGE_IN + Math.round(0.3 * fps)}
          />
          <Arrow color={colors.brandDark} startFrame={T.BADGE_IN + Math.round(0.45 * fps)} />
          <Badge
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            label="Subjects"
            color={colors.textMain}
            bg={theme === "dark" ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)"}
            border="#10B98155"
            startFrame={T.BADGE_IN + Math.round(0.6 * fps)}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
