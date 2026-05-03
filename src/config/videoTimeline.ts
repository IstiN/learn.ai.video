/** Scene lengths in frames — single source for FullVideo, Root, and global overlays. */
export const VIDEO_FPS = 30;

export const SCENE1_FRAMES = 9 * VIDEO_FPS;
export const SCENE2_FRAMES = 17 * VIDEO_FPS;
export const SCENE3_FRAMES = 16 * VIDEO_FPS;
export const SCENE4_FRAMES = 22 * VIDEO_FPS;
export const SCENE5_FRAMES = 18 * VIDEO_FPS;
export const SCENE6_FRAMES = 16 * VIDEO_FPS;
export const SCENE7_FRAMES = 16 * VIDEO_FPS;
export const SCENE_LL_FRAMES = 21 * VIDEO_FPS;
export const SCENE8_FRAMES = 11 * VIDEO_FPS;
export const SCENE9_FRAMES = 15 * VIDEO_FPS;

export const FULL_VIDEO_TOTAL_FRAMES =
  SCENE1_FRAMES +
  SCENE2_FRAMES +
  SCENE3_FRAMES +
  SCENE4_FRAMES +
  SCENE5_FRAMES +
  SCENE6_FRAMES +
  SCENE7_FRAMES +
  SCENE_LL_FRAMES +
  SCENE8_FRAMES +
  SCENE9_FRAMES;

/** First frame index of Scene 9 inside `FullVideo` (for overlay / sync). */
export const FULL_VIDEO_SCENE9_START_FRAME =
  SCENE1_FRAMES +
  SCENE2_FRAMES +
  SCENE3_FRAMES +
  SCENE4_FRAMES +
  SCENE5_FRAMES +
  SCENE6_FRAMES +
  SCENE7_FRAMES +
  SCENE_LL_FRAMES +
  SCENE8_FRAMES;
