"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const INTRO_KEY = 'introUnlockedV1';

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true); // Start visible to show intro or password
  const [showPasswordScreen, setShowPasswordScreen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Persist: if already unlocked, don't show overlay again
  useEffect(() => {
    try {
      const unlocked = localStorage.getItem(INTRO_KEY) === '1';
      if (unlocked) {
        setVisible(false);
      }
    } catch {}
  }, []);

  const handleSkip = () => {
    try {
      videoRef.current?.pause();
    } catch {}
    setShowPasswordScreen(true); // Transition to password screen after video
  };

  const handleEnded = () => handleSkip();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "1131") {
      setVisible(false);
      setError("");
      try { localStorage.setItem(INTRO_KEY, '1'); } catch {}
    } else {
      setError("Password errata. Riprova.");
    }
  };

  // Evita lo scroll del body mentre l'intro o la schermata password sono visibili
  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow || "";
    };
  }, [visible]);

  // Avvia il video quando l'intro è visibile
  useEffect(() => {
    if (visible && !showPasswordScreen) {
      const v = videoRef.current;
      if (v) {
        v.play().catch(() => {
          // Autoplay bloccato, l'utente può premere play manualmente o saltare
        });
      }
    }
  }, [visible, showPasswordScreen]);

  if (!visible) return null;

  if (showPasswordScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black pb-16">
        <Image
          src="/intro/sfondo password.jpg"
          alt="Sfondo Password"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="absolute inset-0 z-0"
        />
        <div className="relative z-10 p-8 bg-black/50 backdrop-blur-sm rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Accedi al Sito</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci la password"
              className="px-4 py-2 mb-4 rounded-md bg-white/80 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        preload="metadata"
        onEnded={handleEnded}
      >
        <source
          src="/intro/nuova intro.mp4"
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
