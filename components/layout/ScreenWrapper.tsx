"use client";

import type { ReactNode } from "react";

interface ScreenWrapperProps {
  children: ReactNode;
  direction?: "forward" | "back" | "fade";
  className?: string;
}

export function ScreenWrapper({
  children,
  direction = "fade",
  className = "",
}: ScreenWrapperProps) {
  const animationClass =
    direction === "forward"
      ? "screen-transition-forward"
      : direction === "back"
        ? "screen-transition-back"
        : "screen-transition";

  return (
    <div className={`${animationClass} ${className}`}>{children}</div>
  );
}
