"use client";

import React from "react";

// A generic widget with a glassmorphism background.
// It can be used to wrap any content.

export type CustomShapeWidgetProps = {
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
};

export default function CustomShapeWidget({
  className = "",
  children,
  ariaLabel,
}: CustomShapeWidgetProps) {
  return (
    <div
      className={`relative w-full h-[200px] md:h-[240px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/10 p-3 overflow-hidden ${className}`}
      role={ariaLabel ? "button" : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
