"use client";

import React, { useEffect, useRef } from 'react';

interface TutorialIntroVideoProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Fullscreen modal that shows a short intro video before starting the tutorial.
 * - Calls onComplete when the video ends or the user presses the primary action button.
 * - Calls onSkip when the user closes the modal, presses ESC, clicks the backdrop, or clicks Skip.
 */
export default function TutorialIntroVideo({ isVisible, onComplete, onSkip }: TutorialIntroVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Basic keyboard handling for accessibility
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
      if (e.key === 'Enter') {
        // Allow Enter to activate the primary action (Continue)
        e.preventDefault();
        onComplete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Try to focus the container when opened
    const t = setTimeout(() => {
      containerRef.current?.focus();
    }, 0);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onComplete, onSkip]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Video introduttivo del tutorial"
      onClick={onSkip}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="relative w-[90vw] max-w-3xl mx-auto bg-[#0b0b0b] rounded-2xl border border-white/10 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">🎬</div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">Benvenuto</h2>
              <p className="text-white/70 text-xs">Breve introduzione al tutorial</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Salta introduzione"
            onClick={onSkip}
            className="text-white/70 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Video area */}
        <div className="bg-black aspect-video w-full">
          <video
            ref={videoRef}
            className="w-full h-full"
            preload="metadata"
            controls
            onEnded={onComplete}
          >
            {/* Assicurati di aver inserito il tuo video nella cartella `public/videos/` */}
            <source src="/videos/tutorial-intro.mp4" type="video/mp4" />
            {/* La riga sottostante che usava un video di esempio è stata rimossa. */}
            {/* <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" /> */}
            Il tuo browser non supporta il tag video.
          </video>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-transparent to-white/5">
          <div className="text-white/60 text-xs">
            Puoi saltare questo video e iniziare direttamente il tutorial.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Salta
            </button>
            <button
              type="button"
              onClick={onComplete}
              className="px-4 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 border border-violet-400/30 transition-colors"
            >
              Continua
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
