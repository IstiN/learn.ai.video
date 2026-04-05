/**
 * Official Learn.AI app icons extracted from the app's asset system.
 */
import React from "react";

/** Winking user avatar – the actual student avatar used in the app (flutter_app/assets/logo/user_avatar.svg) */
export const UserAvatarIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    {/* Face outline */}
    <circle cx="12" cy="12" r="9" />
    {/* Left Eye (Open) */}
    <circle cx="8.5" cy="10" r="1.5" fill={color} stroke="none" />
    {/* Right Eye (Winking) */}
    <path d="M14 10.5 Q 15.5 8.5 17 10.5" />
    {/* Smile */}
    <path d="M8 15 Q 12 18 16 13.5" />
  </svg>
);

/** Single person / profile – navigation profile tab icon (flutter_app/assets/navigation/profile-icon-filled.svg) */
export const ProfileIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill={color}
      d="M12 5.75A3.25 3.25 0 1 1 8.75 9 3.25 3.25 0 0 1 12 5.75Zm0 7A5.75 5.75 0 0 1 17.74 18.08a.92.92 0 0 1-.92.92H7.18a.92.92 0 0 1-.92-.92A5.75 5.75 0 0 1 12 12.75Z"
    />
  </svg>
);

/** Two parents + child – family navigation icon (flutter_app/assets/navigation/family-icon-filled.svg) */
export const FamilyIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill={color}>
      <circle cx="7" cy="8.5" r="2.5" />
      <path d="M4 18v-3.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V18H4z" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M14 18v-3.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V18h-4z" />
      <circle cx="12" cy="5.5" r="1.75" />
      <path d="M10 14v-2.5a.8.8 0 0 1 .8-.8h2.4a.8.8 0 0 1 .8.8V14h-4z" />
    </g>
  </svg>
);

/** Document / homework – homework navigation icon */
export const HomeworkIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill={color}
      d="M9.25 3.5h5.5A2.25 2.25 0 0 1 17 5.75v12A2.25 2.25 0 0 1 14.75 20h-5.5A2.25 2.25 0 0 1 7 17.75v-12A2.25 2.25 0 0 1 9.25 3.5Zm.75 4a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5Zm0 3a.75.75 0 0 0 0 1.5H13a.75.75 0 0 0 0-1.5Zm0 3a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5Z"
    />
  </svg>
);
