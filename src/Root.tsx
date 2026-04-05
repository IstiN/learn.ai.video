import React from "react";
import { Composition, Folder } from "remotion";
import { Scene1ColdOpen } from "./scenes/Scene1ColdOpen";
import { Scene2DeviceMockup } from "./scenes/Scene2DeviceMockup";
import { Scene3SmartSetup } from "./scenes/Scene3SmartSetup";
import { Scene4ScanSolve } from "./scenes/Scene4ScanSolve";
import { Scene5AiChat } from "./scenes/Scene5AiChat";
import { Scene6Verification } from "./scenes/Scene6Verification";
import { Scene7FamilyHub } from "./scenes/Scene7FamilyHub";
import { SceneListenLearn } from "./scenes/SceneListenLearn";
import { Scene8TrackProgress } from "./scenes/Scene8TrackProgress";
import { Scene9CTA } from "./scenes/Scene9CTA";
import {
  FullVideo,
  SCENE1_FRAMES, SCENE2_FRAMES, SCENE3_FRAMES, SCENE4_FRAMES,
  SCENE5_FRAMES, SCENE6_FRAMES, SCENE7_FRAMES, SCENE_LL_FRAMES,
  SCENE8_FRAMES, SCENE9_FRAMES,
} from "./scenes/FullVideo";
import { SUPPORTED_LOCALES } from "./i18n/translations";
import { VideoProps } from "./types";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const TOTAL_FRAMES =
  SCENE1_FRAMES + SCENE2_FRAMES + SCENE3_FRAMES + SCENE4_FRAMES +
  SCENE5_FRAMES + SCENE6_FRAMES + SCENE7_FRAMES + SCENE_LL_FRAMES +
  SCENE8_FRAMES + SCENE9_FRAMES;

/** Default props — English, light theme */
const defaultVideoProps: VideoProps = {
  theme: "light",
  locale: "en-US",
};

/**
 * Every locale from `translations` — keeps FullVideo-Locales-Light and Locales-Preview
 * in sync when new languages are added (en-US first, then alphabetical).
 */
const PREVIEW_LOCALES = [...SUPPORTED_LOCALES].sort((a, b) => {
  if (a === "en-US") return -1;
  if (b === "en-US") return 1;
  return a.localeCompare(b, "en");
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Full video (all scenes + music) ── */}
      <Composition
        id="FullVideo"
        component={FullVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultVideoProps satisfies VideoProps}
      />

      <Folder name="FullVideo-Locales-Light">
        {PREVIEW_LOCALES.map((locale) => (
          <Composition
            key={`full-${locale}`}
            id={`FullVideo-${locale}-Light`}
            component={FullVideo}
            durationInFrames={TOTAL_FRAMES}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{ theme: "light", locale } satisfies VideoProps}
          />
        ))}
      </Folder>

      {/* ── Individual scenes (for editing / preview) ── */}
      <Folder name="Scenes">
        <Composition
          id="Scene1"
          component={Scene1ColdOpen}
          durationInFrames={SCENE1_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene2"
          component={Scene2DeviceMockup}
          durationInFrames={SCENE2_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene3"
          component={Scene3SmartSetup}
          durationInFrames={SCENE3_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene4"
          component={Scene4ScanSolve}
          durationInFrames={SCENE4_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene5"
          component={Scene5AiChat}
          durationInFrames={SCENE5_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene6"
          component={Scene6Verification}
          durationInFrames={SCENE6_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene7"
          component={Scene7FamilyHub}
          durationInFrames={SCENE7_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="SceneListenLearn"
          component={SceneListenLearn}
          durationInFrames={SCENE_LL_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene8"
          component={Scene8TrackProgress}
          durationInFrames={SCENE8_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
        <Composition
          id="Scene9"
          component={Scene9CTA}
          durationInFrames={SCENE9_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT}
          defaultProps={defaultVideoProps satisfies VideoProps}
        />
      </Folder>

      <Folder name="Themes">
        <Composition id="Scene1-Dark" component={Scene1ColdOpen} durationInFrames={SCENE1_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene1-Light" component={Scene1ColdOpen} durationInFrames={SCENE1_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene2-Dark" component={Scene2DeviceMockup} durationInFrames={SCENE2_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene2-Light" component={Scene2DeviceMockup} durationInFrames={SCENE2_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene3-Dark" component={Scene3SmartSetup} durationInFrames={SCENE3_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene3-Light" component={Scene3SmartSetup} durationInFrames={SCENE3_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene4-Dark" component={Scene4ScanSolve} durationInFrames={SCENE4_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene4-Light" component={Scene4ScanSolve} durationInFrames={SCENE4_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene5-Dark" component={Scene5AiChat} durationInFrames={SCENE5_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene5-Light" component={Scene5AiChat} durationInFrames={SCENE5_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene6-Dark" component={Scene6Verification} durationInFrames={SCENE6_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene6-Light" component={Scene6Verification} durationInFrames={SCENE6_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene7-Dark" component={Scene7FamilyHub} durationInFrames={SCENE7_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene7-Light" component={Scene7FamilyHub} durationInFrames={SCENE7_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="SceneListenLearn-Dark" component={SceneListenLearn} durationInFrames={SCENE_LL_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="SceneListenLearn-Light" component={SceneListenLearn} durationInFrames={SCENE_LL_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene8-Dark" component={Scene8TrackProgress} durationInFrames={SCENE8_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene8-Light" component={Scene8TrackProgress} durationInFrames={SCENE8_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene9-Dark" component={Scene9CTA} durationInFrames={SCENE9_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "dark", locale: "en-US" } satisfies VideoProps} />
        <Composition id="Scene9-Light" component={Scene9CTA} durationInFrames={SCENE9_FRAMES}
          fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ theme: "light", locale: "en-US" } satisfies VideoProps} />
      </Folder>

      <Folder name="Locales-Preview">
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s2-${locale}`} id={`Scene2-${locale}`} component={Scene2DeviceMockup}
            durationInFrames={SCENE2_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s3-${locale}`} id={`Scene3-${locale}`} component={Scene3SmartSetup}
            durationInFrames={SCENE3_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s4-${locale}`} id={`Scene4-${locale}`} component={Scene4ScanSolve}
            durationInFrames={SCENE4_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s5-${locale}`} id={`Scene5-${locale}`} component={Scene5AiChat}
            durationInFrames={SCENE5_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s6-${locale}`} id={`Scene6-${locale}`} component={Scene6Verification}
            durationInFrames={SCENE6_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s7-${locale}`} id={`Scene7-${locale}`} component={Scene7FamilyHub}
            durationInFrames={SCENE7_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s8-${locale}`} id={`Scene8-${locale}`} component={Scene8TrackProgress}
            durationInFrames={SCENE8_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
        {PREVIEW_LOCALES.map((locale) => (
          <Composition key={`s9-${locale}`} id={`Scene9-${locale}`} component={Scene9CTA}
            durationInFrames={SCENE9_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}
            defaultProps={{ theme: "dark", locale } satisfies VideoProps} />
        ))}
      </Folder>
    </>
  );
};
