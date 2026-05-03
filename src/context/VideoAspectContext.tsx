import React from "react";
import type { VideoAspect } from "../types";

export const VideoAspectContext = React.createContext<VideoAspect>("landscape");

export function useVideoAspect(): VideoAspect {
  return React.useContext(VideoAspectContext);
}
