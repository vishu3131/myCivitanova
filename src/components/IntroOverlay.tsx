"use client";

import { useEffect, useRef, useState } from "react";

export default function IntroOverlay() {
  // Mostra l'intro in modo non bloccante e solo quando ha senso.
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);



  const handleSkip = () => {
    try {
      videoRef.current?.pause();
    } catch {}
    setVisible(false);
  };

  const handleEnded = () => handleSkip();

  // Decidi se mostrare l'intro: evita di farla comparire in condizioni di rete scarsa o per preferenze utente
  useEffect(() => {
    // Mostra sempre l'intro al caricamento della pagina
    setVisible(true);
  }, []);

  // Evita lo scroll del body mentre l'intro è visibile
  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow || "";
    };
  }, [visible]);

  // Avvia il video quando l'intro è visibile, senza watchdog né skip automatici
  useEffect(() => {
    if (!visible) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Se l'autoplay è bloccato, l'utente può premere play manualmente
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        // Niente autoPlay: lo avviamo via JS per gestire il fallback
        playsInline
        muted
        preload="metadata"
        onEnded={handleEnded}
      >
        <source
          src="/intro/tutorial-video.mp4"
          type="video/mp4"
        />
        Il tuo browser non supporta il video HTML5.
      </video>

      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm"
        aria-label="Salta introduzione"
      >
        Salta
      </button>
    </div>
  );
}
