"use client";

import React, { useEffect, useState } from "react";

export interface TreasureHuntTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onStart?: () => void;
}

const TUTORIAL_KEY = "treasureHuntTutorialHiddenV1";

const slides = [
  {
    title: "Benvenuto nella Caccia al Tesoro",
    emoji: "🧭",
    text: "Esplora Civitanova, segui gli indizi e completa tutte le tappe per vincere ricompense!",
    bg: "from-emerald-500/10 to-cyan-500/10",
  },
  {
    title: "Permessi di Posizione",
    emoji: "📍",
    text: "Attiva la geolocalizzazione per verificare quando sei vicino a una tappa. I tuoi dati restano sul dispositivo.",
    bg: "from-blue-500/10 to-indigo-500/10",
  },
  {
    title: "Indizi e Suggerimenti",
    emoji: "🕵️",
    text: "Ogni tappa ha un indizio e un suggerimento opzionale. Raggiungi il luogo indicato e cerca i dettagli.",
    bg: "from-rose-500/10 to-orange-500/10",
  },
  {
    title: "Verifica Posizione",
    emoji: "✅",
    text: "Quando sei sul posto, tocca 'Verifica posizione'. Se sei entro il raggio, completi la tappa!",
    bg: "from-amber-500/10 to-yellow-500/10",
  },
  {
    title: "Ricompense",
    emoji: "🏆",
    text: "Completa tutte le tappe per ottenere XP e, se previsto, un badge speciale. Puoi anche rigiocare!",
    bg: "from-emerald-500/10 to-lime-500/10",
  },
];

export default function TreasureHuntTutorial({ isOpen, onClose, onStart }: TreasureHuntTutorialProps) {
  const [index, setIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!isOpen) setIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const slide = slides[index];
  const last = index === slides.length - 1;

  const handleClose = () => {
    if (dontShowAgain) {
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
    }
    onClose();
  };

  const handleStart = () => {
    if (dontShowAgain) {
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
    }
    onStart?.();
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm flex items-start justify-center p-0 sm:p-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
      <div className="w-full sm:max-w-md bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-white/80 text-sm font-semibold">Tutorial</div>
          <button onClick={handleClose} className="text-white/60 hover:text-white text-sm">Chiudi</button>
        </div>

        {/* Slide */}
        <div className={`px-5 py-6 bg-gradient-to-br ${slide.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl">
              {slide.emoji}
            </div>
            <div className="text-white font-bold">{slide.title}</div>
          </div>
          <div className="text-white/80 text-sm leading-relaxed">
            {slide.text}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {slides.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-emerald-400' : 'bg-white/20'}`} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 mr-2 text-xs text-white/70">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="accent-emerald-500"
              />
              Non mostrare più
            </label>
            {index > 0 && (
              <button onClick={() => setIndex((i) => Math.max(0, i - 1))} className="px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/15">
                Indietro
              </button>
            )}
            {!last ? (
              <button onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))} className="px-3 py-2 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                Avanti
              </button>
            ) : (
              <button onClick={handleStart} className="px-3 py-2 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                Inizia la Caccia
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper per leggere la preferenza al di fuori del componente
export function isTutorialHidden(): boolean {
  try { return localStorage.getItem(TUTORIAL_KEY) === '1'; } catch { return false; }
}
