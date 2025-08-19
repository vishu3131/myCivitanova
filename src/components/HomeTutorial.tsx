"use client";

import React, { useState } from "react";
import Link from "next/link";
import { slides } from '@/data/tutorialSlides'; // Import slides from the new file

export interface HomeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_KEY = "homeTutorialHiddenV1";

export default function HomeTutorial({ isOpen, onClose }: HomeTutorialProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleStartTutorial = () => {
    if (dontShowAgain) {
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
    }
    onClose(); // Close the modal/widget
    // Open the first slide in a new tab
    window.open(`/tutorial/${slides[0].id}`, '_blank');
  };

  const handleClose = () => {
    if (dontShowAgain) {
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-6 overflow-y-auto"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      <div className="relative w-full sm:max-w-lg group">
        {/* Animated gradient glow border */}
        <div className="absolute -inset-[2px] rounded-2xl modern-glow pointer-events-none"></div>

        {/* Card */}
        <div className="relative z-10 bg-gray-900/90 backdrop-blur-2xl rounded-2xl border border-white/15 overflow-hidden shadow-2xl text-white p-6 sm:p-8 text-center modern-float">
          {/* Top-right Close */}
          <button
            onClick={handleClose}
            aria-label="Chiudi"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-lg backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 modern-title">
            Benvenuto a MyCivitanova! ✨
          </h2>
          <p className="text-white/80 mb-6">
            Scopri tutte le funzionalità della tua nuova app preferita per Civitanova Marche.
            Il tutorial si aprirà in una nuova scheda del browser.
          </p>

          {/* Actions */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-4">
            <button
              onClick={handleStartTutorial}
              className="flex-1 px-6 py-3 text-lg rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold transition-all shadow-[0_8px_30px_rgba(168,85,247,0.25)] ring-1 ring-white/10"
            >
              Inizia il Tutorial! 🚀
            </button>

            <button
              disabled
              aria-disabled="true"
              className="sm:flex-none px-5 py-2.5 text-base rounded-xl border border-white/20 bg-white/10 text-white/80 backdrop-blur-md shadow-inner opacity-85 hover:opacity-90 hover:text-white transition-all cursor-not-allowed"
              title="In arrivo"
            >
              Coming Soon
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 text-xs text-white/70 mb-4">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-violet-500"
            />
            Non mostrare più questo messaggio
          </label>

          {/* Bottom Close - larger and more visible */}
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-white font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Chiudi
          </button>
        </div>

        <style jsx>{`
          .modern-glow {
            background: conic-gradient(from 0deg at 50% 50%, rgba(34,211,238,0.35), rgba(167,139,250,0.35), rgba(244,114,182,0.35), rgba(34,211,238,0.35));
            filter: blur(14px);
            animation: glowRotate 12s linear infinite;
            opacity: 0.5;
          }
          .modern-float {
            animation: floatY 6s ease-in-out infinite;
          }
          .modern-title {
            background: linear-gradient(90deg, #67e8f9, #ffffff, #f0abfc);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 0 24px rgba(103,232,249,0.25);
          }
          @keyframes glowRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes floatY {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    </div>
  );
}

// Helper per controllare se il tutorial è nascosto
export function isHomeTutorialHidden(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return false;
  }
}
