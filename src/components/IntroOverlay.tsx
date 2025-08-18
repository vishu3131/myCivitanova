"use client";

import { useEffect, useRef, useState } from "react";

export default function IntroOverlay() {
  // Mostra l'intro in modo non bloccante e solo quando ha senso.
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startedRef = useRef(false);
  const startWatchdogRef = useRef<number | null>(null);
  const waitingTimeoutRef = useRef<number | null>(null);

  const cleanupTimers = () => {
    if (startWatchdogRef.current) {
      window.clearTimeout(startWatchdogRef.current);
      startWatchdogRef.current = null;
    }
    if (waitingTimeoutRef.current) {
      window.clearTimeout(waitingTimeoutRef.current);
      waitingTimeoutRef.current = null;
    }
  };

  const handleSkip = () => {
    cleanupTimers();
    try {
      videoRef.current?.pause();
    } catch {}
    try {
      sessionStorage.setItem("introSeen", "1");
    } catch {}
    setVisible(false);
  };

  const handleEnded = () => handleSkip();

  // Decidi se mostrare l'intro: evita di farla comparire in condizioni di rete scarsa o per preferenze utente
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("introSeen") === "1";
      const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const saveData = (navigator as any)?.connection?.saveData === true;

      // Se già vista in questa sessione, o l'utente preferisce meno motion, o ha attivo il risparmio dati, non mostrare
      if (seen || prefersReduced || saveData) {
        return;
      }

      setVisible(true);
    } catch {
      // In caso di errore sugli storage o matchMedia, mostrare comunque e affidarsi ai watchdog
      setVisible(true);
    }
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

  // Gestione play non bloccante con watchdog e fallback
  useEffect(() => {
    if (!visible) return;
    const v = videoRef.current;
    if (!v) return;

    const onPlaying = () => {
      startedRef.current = true;
      if (waitingTimeoutRef.current) {
        window.clearTimeout(waitingTimeoutRef.current);
        waitingTimeoutRef.current = null;
      }
    };

    const onWaiting = () => {
      // Se va in buffering, non tenere bloccato: dai 2s, poi salta
      if (waitingTimeoutRef.current) window.clearTimeout(waitingTimeoutRef.current);
      waitingTimeoutRef.current = window.setTimeout(() => {
        handleSkip();
      }, 2000);
    };

    const onError = () => handleSkip();

    v.addEventListener("playing", onPlaying);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("stalled", onError);
    v.addEventListener("error", onError);
    v.addEventListener("abort", onError);
    v.addEventListener("suspend", onError);
    v.addEventListener("emptied", onError);

    // Watchdog di avvio: se non parte entro 2s, salta automaticamente
    startWatchdogRef.current = window.setTimeout(() => {
      if (!startedRef.current) {
        handleSkip();
      }
    }, 2000);

    // Prova a partire manualmente per intercettare errori di autoplay
    const playPromise = v.play();
    if (playPromise && typeof (playPromise as any).catch === "function") {
      (playPromise as Promise<void>).catch(() => {
        // Autoplay bloccato o errore: non bloccare l'utente
        window.setTimeout(() => handleSkip(), 300);
      });
    }

    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("stalled", onError);
      v.removeEventListener("error", onError);
      v.removeEventListener("abort", onError);
      v.removeEventListener("suspend", onError);
      v.removeEventListener("emptied", onError);
      cleanupTimers();
    };
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
          src="/intro/Video senza titolo - Realizzato con Clipchamp (9).mp4"
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
