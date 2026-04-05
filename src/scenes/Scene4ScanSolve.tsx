/**
 * Scene 4 — Scan & Solve
 *
 * Left: browser → Share → sheet (localized) → Save to app → saved toast;
 *       grid: [share | phone] row, tablet row below; device goldens staggered.
 * Right panel, copy, badges, and scene4 audio are unchanged.
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
import { badgeTriple, t } from "../i18n/translations";
import { UserAvatarIcon, HomeworkIcon } from "../components/AppIcons";
import { AppLogoIcon } from "../components/AppLogoIcon";
import { MusicTrack } from "../components/MusicTrack";
import { Audio } from "@remotion/media";
import { getSceneAudio } from "../audio";
import { scene4SolutionChatPath } from "../config/scene-assets";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const RTL_LOCALES = new Set(["ar", "he"]);

const SCENE_OFFSET_S = 42;

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

const PhoneFrame: React.FC<{
  imgSrc: string;
  width: number;
  height: number;
  borderColor: string;
  bgColor: string;
}> = ({ imgSrc, width, height, borderColor, bgColor }) => (
  <div style={{
    width, height, minWidth: width, minHeight: height,
    borderRadius: 28, overflow: "hidden",
    border: `2px solid ${borderColor}`,
    background: bgColor, position: "relative", flexShrink: 0,
    boxShadow: "0 24px 64px rgba(0,0,0,0.38)",
  }}>
    <div style={{
      position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
      width: 90, height: 24, background: bgColor,
      borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
      zIndex: 3,
    }} />
    <Img src={imgSrc} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
  </div>
);

const TabletFrame: React.FC<{
  imgSrc: string;
  width: number;
  height: number;
  borderColor: string;
  bgColor: string;
}> = ({ imgSrc, width, height, borderColor, bgColor }) => (
  <div style={{
    width, height, minWidth: width, minHeight: height,
    borderRadius: 18, overflow: "hidden",
    border: `2px solid ${borderColor}`,
    background: bgColor, position: "relative", flexShrink: 0,
    boxShadow: "0 20px 56px rgba(0,0,0,0.36)",
  }}>
    <Img src={imgSrc} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
  </div>
);

/** Fake browser → toolbar Share tap → sheet → Save to app (localized) → saved toast. */
const BrowserShareMock: React.FC<{
  theme: "dark" | "light";
  colors: ThemeColors;
  locale: string;
  frame: number;
  fps: number;
  shareChromeTapFrame: number;
  shareOpenFrame: number;
  shareTapFrame: number;
  savedShowFrame: number;
  width: number;
  height: number;
}> = ({
  theme,
  colors,
  locale,
  frame,
  fps,
  shareChromeTapFrame,
  shareOpenFrame,
  shareTapFrame,
  savedShowFrame,
  width,
  height,
}) => {
  const sheetH = Math.round(height * 0.36);
  const chromeBg = theme === "dark" ? "#2a2d45" : "#ececf3";
  const pageBg = theme === "dark" ? "#1e2135" : "#fafbff";
  const textMuted = theme === "dark" ? "rgba(230,228,255,0.55)" : "rgba(30,27,60,0.5)";
  const sheetBg = theme === "dark" ? "#2c2e40" : "#f2f2f7";
  const rowText = theme === "dark" ? "#f0ecff" : "#1c1b2e";

  const chromeTapSpring = spring({
    frame: frame - shareChromeTapFrame,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const shareBtnScale = interpolate(chromeTapSpring, [0, 0.22, 1], [1, 0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shareBtnRing = interpolate(
    frame,
    [shareChromeTapFrame - 0.2 * fps, shareChromeTapFrame, shareChromeTapFrame + 0.35 * fps],
    [0, 1, 0.35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const sheetSpring = spring({
    frame: frame - shareOpenFrame,
    fps,
    config: { damping: 19, stiffness: 118 },
  });
  const sheetY = interpolate(sheetSpring, [0, 1], [sheetH + 28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const backdropOp = interpolate(
    frame,
    [shareOpenFrame, shareOpenFrame + 0.22 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  ) * (theme === "dark" ? 0.55 : 0.35);

  const tapPulse = spring({
    frame: frame - shareTapFrame,
    fps,
    config: { damping: 11, stiffness: 220 },
  });
  const flRowGlow = interpolate(tapPulse, [0, 0.35, 1], [0, 1, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const savedSpring = spring({
    frame: frame - savedShowFrame,
    fps,
    config: { damping: 14, stiffness: 130 },
  });
  const savedOp = interpolate(savedSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const savedY = interpolate(savedSpring, [0, 1], [-10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cursorOp = interpolate(
    frame,
    [shareTapFrame - 2, shareTapFrame, shareTapFrame + 0.35 * fps],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 14,
        overflow: "hidden",
        border: `2px solid ${theme === "dark" ? "rgba(255,255,255,0.14)" : `${colors.brand}40`}`,
        boxShadow: `0 16px 48px rgba(0,0,0,0.35), 0 0 32px ${colors.brand}22`,
        position: "relative",
        background: pageBg,
        flexShrink: 0,
      }}
    >
      {/* Chrome */}
      <div
        style={{
          height: 42,
          background: chromeBg,
          display: "flex",
          alignItems: "center",
          padding: "0 10px 0 12px",
          gap: 8,
          borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.9 }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: 28,
            borderRadius: 8,
            background: theme === "dark" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
            fontFamily,
            fontSize: 10,
            fontWeight: 600,
            color: textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          🔒 worksheets.example.com · homework.pdf
        </div>
        <div
          style={{
            flexShrink: 0,
            transform: `scale(${shareBtnScale})`,
            padding: "5px 11px",
            borderRadius: 8,
            fontFamily,
            fontSize: 11,
            fontWeight: 700,
            color: theme === "dark" ? "#e8e6ff" : colors.brandDark,
            background: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(120,80,220,0.12)",
            boxShadow: `0 0 ${10 + shareBtnRing * 14}px ${colors.brand}55`,
            cursor: "default",
          }}
        >
          {t(locale, "s4_share_title")}
        </div>
      </div>

      {/* Page mock */}
      <div style={{ padding: "14px 18px", position: "relative", height: height - 42, zIndex: 1 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: 8,
              borderRadius: 4,
              marginBottom: 10,
              width: `${88 - i * 12}%`,
              background: theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(120,80,220,0.08)",
            }}
          />
        ))}

        {/* Saved toast */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            zIndex: 12,
            opacity: savedOp,
            transform: `translateY(${savedY}px)`,
            padding: "8px 14px",
            borderRadius: 20,
            background: theme === "dark" ? "rgba(16,185,129,0.92)" : "rgba(16,185,129,0.95)",
            color: "#fff",
            fontFamily,
            fontSize: 11,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>✓</span>
          <span style={{ maxWidth: width - 36, lineHeight: 1.25 }}>{t(locale, "s4_saved_confirm")}</span>
        </div>
      </div>

      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          opacity: backdropOp,
          pointerEvents: "none",
          zIndex: 8,
        }}
      />

      {/* Share sheet */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetH,
          zIndex: 10,
          background: sheetBg,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          transform: `translateY(${sheetY}px)`,
          boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
          padding: "10px 14px 16px",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            margin: "0 auto 12px",
          }}
        />
        <div style={{ fontFamily, fontWeight: 700, fontSize: 13, color: rowText, marginBottom: 8, textAlign: "center" }}>
          {t(locale, "s4_share_title")}
        </div>

        {/* FamilyLearn.AI target row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 8px",
            borderRadius: 12,
            background: `rgba(168, 130, 240, ${0.12 + 0.38 * flRowGlow})`,
            outline: frame >= shareTapFrame ? `1.5px solid ${colors.brand}` : "1.5px solid transparent",
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${colors.brand}35` }}>
            <AppLogoIcon size={22} animated={false} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily, fontWeight: 700, fontSize: 14, color: rowText }}>{t(locale, "app_name")}</div>
            <div style={{ fontFamily, fontSize: 11, color: colors.brand, fontWeight: 600 }}>{t(locale, "s4_save_to_app")}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 12 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <div style={{ fontFamily, fontWeight: 600, fontSize: 14, color: rowText }}>Copy</div>
        </div>

        {/* Tap cursor — moves with sheet */}
        <div
          style={{
            position: "absolute",
            right: "26%",
            bottom: 76,
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.95)",
            background: "rgba(0,0,0,0.25)",
            opacity: cursorOp,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

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

export const Scene4ScanSolve: React.FC<VideoProps> = ({ theme, locale }) => {
  const frame = useCurrentFrame();
  const audioSrc = getSceneAudio(locale, "scene4");
  const { fps, width, height } = useVideoConfig();
  const colors = themes[theme];
  const isRtl = RTL_LOCALES.has(locale.split("-")[0]);
  const dir = isRtl ? "rtl" : "ltr";
  const [s4Badge1, s4Badge2, s4Badge3] = badgeTriple(locale, "s4_badge");

  const BANNER_START = 0;
  const MAYA1_START = 3.0 * fps;
  const ALEX1_START = 6.0 * fps;
  const ALEX2_START = 9.0 * fps;
  const MAYA2_START = 11.0 * fps;
  const BADGE_START = 12.5 * fps;

  const SHARE_CHROME_TAP = Math.round(0.42 * fps);
  const SHARE_OPEN = SHARE_CHROME_TAP + Math.round(0.2 * fps);
  const SHARE_TAP = SHARE_OPEN + Math.round(0.95 * fps);
  const SAVED_SHOW = SHARE_TAP + Math.round(0.32 * fps);
  const PHONE_START = SAVED_SHOW + Math.round(0.58 * fps);
  const TABLET_START = PHONE_START + Math.round(0.38 * fps);

  const TABLET_ASPECT = 2732 / 2048;
  const IOS_ASPECT = 1284 / 2778;

  const COL_GAP_BASE = 28;
  const STACK_GAP = 16;
  const maxGridH = Math.round(height * 0.58);

  const baseTopRowH = Math.round(height * 0.28);
  const baseBrowserW = Math.round(Math.min(width * 0.22, 340));
  const basePhoneW = Math.round(baseTopRowH * IOS_ASPECT);
  const baseTopRowW = baseBrowserW + COL_GAP_BASE + basePhoneW;
  const baseTabletH = Math.round(baseTopRowW / TABLET_ASPECT);
  const baseGridH = baseTopRowH + STACK_GAP + baseTabletH;

  const gridScale = baseGridH > maxGridH ? maxGridH / baseGridH : 1;
  const TOP_ROW_H = Math.max(168, Math.round(baseTopRowH * gridScale));
  const BROWSER_W = Math.max(132, Math.round(baseBrowserW * gridScale));
  const COL_GAP = Math.max(18, Math.round(COL_GAP_BASE * gridScale));
  const BROWSER_H = TOP_ROW_H;
  const phoneH = TOP_ROW_H;
  const phoneW = Math.round(phoneH * IOS_ASPECT);
  const gridOuterW = BROWSER_W + COL_GAP + phoneW;
  const tabletW = gridOuterW;
  const tabletH = Math.round(tabletW / TABLET_ASPECT);

  const LEFT_W = gridOuterW + 104;
  const RIGHT_W = width - LEFT_W - 40;

  const browserSpring = spring({ frame: frame - BANNER_START, fps, config: { damping: 18, stiffness: 100 } });
  const browserX = interpolate(browserSpring, [0, 1], [isRtl ? 70 : -70, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const bannerOpacity = interpolate(frame, [BANNER_START, BANNER_START + 0.55 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const phoneSpring = spring({ frame: frame - PHONE_START, fps, config: { damping: 17, stiffness: 112 } });
  const phoneY = interpolate(phoneSpring, [0, 1], [56, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const phoneOpacity = interpolate(frame, [PHONE_START, PHONE_START + 0.52 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const tabletSpring = spring({ frame: frame - TABLET_START, fps, config: { damping: 17, stiffness: 112 } });
  const tabletY = interpolate(tabletSpring, [0, 1], [56, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const tabletOpacity = interpolate(frame, [TABLET_START, TABLET_START + 0.52 * fps], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });

  const iosSolutionSrc = staticFile(scene4SolutionChatPath("ios", theme, locale));
  const tabletSolutionSrc = staticFile(scene4SolutionChatPath("tablet", theme, locale));

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
      <MusicTrack offsetFrames={SCENE_OFFSET_S * 30} volume={0.35} />
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={1} />}

      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${colors.brand}07 1px, transparent 1px), linear-gradient(90deg, ${colors.brand}07 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      <div style={{
        position: "absolute",
        left: isRtl ? width - LEFT_W - 60 : -40, top: height * 0.05,
        width: LEFT_W + 80, height: height * 0.9,
        borderRadius: "50%",
        background: colors.brand,
        opacity: theme === "dark" ? 0.07 : 0.05,
        filter: "blur(80px)",
      }} />

      {/* ── Left: [share | phone] / [tablet]; goldens staggered after save ── */}
      <div style={{
        position: "absolute",
        left: leftStart, top: 0,
        width: LEFT_W, height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: STACK_GAP,
          flexShrink: 0,
          transform: `translateX(${browserX}px)`,
          opacity: bannerOpacity,
          isolation: "isolate",
        }}>
          <div style={{
            display: "flex",
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: COL_GAP,
            width: gridOuterW,
            minWidth: gridOuterW,
            flexShrink: 0,
          }}>
            <BrowserShareMock
              theme={theme}
              colors={colors}
              locale={locale}
              frame={frame}
              fps={fps}
              shareChromeTapFrame={SHARE_CHROME_TAP}
              shareOpenFrame={SHARE_OPEN}
              shareTapFrame={SHARE_TAP}
              savedShowFrame={SAVED_SHOW}
              width={BROWSER_W}
              height={BROWSER_H}
            />
            <div style={{
              transform: `translateY(${phoneY}px)`,
              opacity: phoneOpacity,
              flexShrink: 0,
            }}>
              <PhoneFrame
                imgSrc={iosSolutionSrc}
                width={phoneW}
                height={phoneH}
                borderColor={phoneFrameBorder}
                bgColor={phoneBg}
              />
            </div>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "center",
            width: gridOuterW,
            minWidth: gridOuterW,
            flexShrink: 0,
            transform: `translateY(${tabletY}px)`,
            opacity: tabletOpacity,
          }}>
            <TabletFrame
              imgSrc={tabletSolutionSrc}
              width={tabletW}
              height={tabletH}
              borderColor={phoneFrameBorder}
              bgColor={phoneBg}
            />
          </div>
        </div>
      </div>

      {/* ── Right panel: unchanged ── */}
      <div style={{
        position: "absolute",
        left: isRtl ? undefined : rightStart,
        right: isRtl ? width - rightStart - RIGHT_W : undefined,
        top: 0, width: RIGHT_W, height,
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: 20,
        padding: "0 32px",
      }}>
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

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          flexWrap: "wrap",
          flexDirection: isRtl ? "row-reverse" : "row",
          marginTop: 8,
        }}>
          <StepBadge
            label={s4Badge1}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7V5a2 2 0 0 1 2-2h2M3 17v2a2 2 0 0 0 2 2h2M17 3h2a2 2 0 0 1 2 2v2M17 21h2a2 2 0 0 0 2-2v-2M7 12h10" stroke={colors.brand} strokeWidth="2" strokeLinecap="round"/></svg>}
            color={colors.textMain}
            bg={theme === "dark" ? `${colors.brand}20` : `${colors.brand}12`}
            border={`${colors.brand}55`}
            startFrame={BADGE_START}
          />
          <Arrow color={colors.brandDark} startFrame={BADGE_START + 0.15 * fps} />
          <StepBadge
            label={s4Badge2}
            icon={<HomeworkIcon size={20} color={colors.brand} />}
            color={colors.textMain}
            bg={theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)"}
            border="#3B82F655"
            startFrame={BADGE_START + 0.3 * fps}
          />
          <Arrow color={colors.brandDark} startFrame={BADGE_START + 0.45 * fps} />
          <StepBadge
            label={s4Badge3}
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
