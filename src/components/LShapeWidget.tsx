"use client";

import React from "react";

// Irregular "L" inverted widget per specifica
// - clip-path to carve the silhouette
// - glassmorphism background consistent with the app
// - two content zones: top-left horizontal, and right vertical

export type LShapeWidgetProps = {
  className?: string;
  topContent?: React.ReactNode;
  sideContent?: React.ReactNode;
  title?: string;
  ariaLabel?: string;
};

export default function LShapeWidget({
  className = "",
  topContent,
  sideContent,
  title,
  ariaLabel,
}: LShapeWidgetProps) {
  return (
    <div
      className={`relative w-full h-[200px] md:h-[240px] ${className}`}
      role={ariaLabel ? "button" : undefined}
      aria-label={ariaLabel}
    >
      {/* Background shape */}
      <div
        className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/10 [clip-path:polygon(100%_0%, 100%_100%, 0%_100%, 0%_40%, 70%_40%, 70%_0%)]"
      />

      {/* Optional title badge inside main vertical segment (top-right) */}
      {title && (
        <div className="absolute right-3 top-2 z-10 text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/80">
          {title}
        </div>
      )}

      {/* Main vertical content area (right side) */}
      <div className="absolute right-0 top-0 w-[30%] h-full p-3 overflow-hidden">
        {topContent ?? (
          <div className="text-white/80 text-xs leading-snug">
            <div className="font-semibold text-white text-sm mb-1">Area Principale</div>
            <p className="opacity-80">
              Contenuto informativo o CTA posizionato nella fascia verticale destra.
            </p>
          </div>
        )}
      </div>

      {/* Horizontal content area (bottom-left) */}
      <div className="absolute left-0 bottom-0 w-[70%] h-[60%] p-3 overflow-hidden">
        {sideContent ?? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm">★</div>
            <div className="text-[10px] text-white/70 text-center leading-tight">Azioni rapide</div>
          </div>
        )}
      </div>
    </div>
  );
}
