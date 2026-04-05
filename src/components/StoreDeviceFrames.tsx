import React from "react";
import { Img } from "remotion";

export const StorePhoneFrame: React.FC<{
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
      borderBottomLeftRadius: 14, borderBottomRightRadius: 14, zIndex: 3,
    }} />
    <Img src={imgSrc} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
  </div>
);

export const StoreTabletFrame: React.FC<{
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
