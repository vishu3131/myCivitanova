"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useXPSystem } from "@/hooks/useXPSystem";

// Tipi base
type Step = {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  radiusM: number; // raggio entro il quale attivare l'indovinello
  riddle: {
    question: string;
    answers: string[]; // risposte valide normalizzate
    hint?: string; // suggerimento base
  };
  rewardXp?: number;
};

type ProgressState = {
  currentIndex: number;
  stepsCompleted: number;
  total: number;
  startedAt?: string;
  points?: number;
};

const STORAGE_KEY = "treasureHuntProgressV1";

// Dataset demo di tappe a Civitanova (coordinate indicative per demo)
const STEPS: Step[] = [
  {
    id: "fontanella-xx",
    title: "La Fontanella di Piazza",
    description: "Raggiungi la fontanella in piazza e osserva i dettagli...",
    lat: 43.3074, // coord demo
    lng: 13.7203, // coord demo
    radiusM: 60,
    riddle: {
      question: "Quanti beccucci ha la fontanella?",
      answers: ["6", "sei"],
      hint: "Conta i beccucci della fontanella principale."
    },
    rewardXp: 50
  },
  {
    id: "molo-ovest",
    title: "Verso il Molo",
    description: "Avvicinati al molo e guarda i cartelli informativi.",
    lat: 43.3047, // demo
    lng: 13.7302, // demo
    radiusM: 70,
    riddle: {
      question: "Quanti sono i pescherecci indicati nell'ultima banchina?",
      answers: ["3", "tre"],
      hint: "Controlla il tabellone con le assegnazioni."
    },
    rewardXp: 60
  },
  {
    id: "largo-municipio",
    title: "Davanti al Municipio",
    description: "Raggiungi l'ingresso del Municipio e osserva la targa.",
    lat: 43.3089, // demo
    lng: 13.7209, // demo
    radiusM: 60,
    riddle: {
      question: "Qual è l'anno riportato in fondo alla targa commemorativa?",
      answers: ["1913"],
      hint: "È inciso in basso a destra."
    },
    rewardXp: 80
  }
];

function loadProgress(): ProgressState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (
      typeof data.currentIndex === "number" &&
      typeof data.stepsCompleted === "number" &&
      typeof data.total === "number"
    ) {
      return data as ProgressState;
    }
  } catch (e) {
    console.warn("TreasureHunt: invalid progress in storage", e);
  }
  return null;
}

function saveProgress(progress: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function normalizeAnswer(a: string) {
  return a.trim().toLowerCase().replace(/\s+/g, "");
}

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // metri
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function TreasureHuntPage() {
  const [progress, setProgress] = useState<ProgressState>(() => {
    const loaded = loadProgress();
    return (
      loaded || {
        currentIndex: 0,
        stepsCompleted: 0,
        total: STEPS.length,
        startedAt: new Date().toISOString(),
      }
    );
  });
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { addXP } = useXPSystem(userId, { autoDailyLogin: false });
  const { triggerHaptic } = useHapticFeedback();

  // Geo state
  const [allowedByGPS, setAllowedByGPS] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Riddle state
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const currentStep = useMemo(() => STEPS[Math.min(progress.currentIndex, STEPS.length - 1)], [progress.currentIndex]);

  // Carica userId da localStorage se presente
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) setUserId(parsed.id as string);
      } catch {}
    }
  }, []);

  // Watch posizione
  useEffect(() => {
    if (!currentStep) return;

    let watchId: number | null = null;
    setGeoError(null);

    const onSuccess = (pos: GeolocationPosition) => {
      const d = haversineDistanceMeters(pos.coords.latitude, pos.coords.longitude, currentStep.lat, currentStep.lng);
      setDistance(d);
      setAllowedByGPS(d <= currentStep.radiusM);
    };

    const onError = (err: GeolocationPositionError) => {
      setGeoError(err.message || "Geolocalizzazione non disponibile");
    };

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      });
    } else {
      setGeoError("Geolocalizzazione non supportata dal dispositivo");
    }

    return () => {
      if (watchId !== null && navigator.geolocation && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [currentStep]);

  // Sincronizza progress con storage (widget home ascolta evento storage)
  useEffect(() => {
    saveProgress(progress);
    // dispatch manuale per forzare aggiornamento altri tab/iframe (soprattutto su stesso tab non serve)
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch {}
  }, [progress]);

  const pct = Math.min(100, Math.round(((progress.stepsCompleted || 0) / (progress.total || 1)) * 100));

  const canAttemptRiddle = demoMode || allowedByGPS;

  const verifyAnswer = useCallback(async () => {
    if (!currentStep) return;
    if (!canAttemptRiddle) return;
    setChecking(true);
    const normalized = normalizeAnswer(userAnswer);
    const isCorrect = currentStep.riddle.answers.map(normalizeAnswer).includes(normalized);

    setTimeout(async () => {
      setChecking(false);
      if (isCorrect) {
        triggerHaptic("heavy");
        setCelebrate(true);
        // XP opzionale
        if (currentStep.rewardXp && userId) {
          try {
            await addXP("treasure_hunt_step", currentStep.rewardXp, { stepId: currentStep.id });
          } catch {}
        }

        // Avanza allo step successivo
        setTimeout(() => {
          const nextIndex = Math.min(progress.currentIndex + 1, STEPS.length - 1);
          const nextCompleted = Math.min(progress.stepsCompleted + 1, STEPS.length);
          setProgress((p) => ({ ...p, currentIndex: nextIndex, stepsCompleted: nextCompleted }));
          setUserAnswer("");
          setAttempts(0);
          setCelebrate(false);
        }, 900);
      } else {
        triggerHaptic("medium");
        setAttempts((a) => a + 1);
      }
    }, 600);
  }, [currentStep, userAnswer, canAttemptRiddle, progress.currentIndex, progress.stepsCompleted, triggerHaptic, addXP, userId]);

  const hint = useMemo(() => {
    if (!currentStep) return "";
    // Suggerimenti progressivi in base ai tentativi
    if (attempts >= 3) {
      // ultimo aiuto, maschera parziale risposta
      const any = currentStep.riddle.answers[0] || "";
      if (/^\d+$/.test(any)) return `È un numero di ${any.length} cifre.`;
      return `Inizia per "${any.slice(0, 1)}" e ha ${any.length} lettere.`;
    }
    if (attempts >= 1) return currentStep.riddle.hint || "Osserva meglio i dettagli sul posto.";
    return "";
  }, [attempts, currentStep]);

  const completedAll = progress.stepsCompleted >= progress.total;

  const resetHunt = () => {
    setProgress({ currentIndex: 0, stepsCompleted: 0, total: STEPS.length, startedAt: new Date().toISOString() });
    setUserAnswer("");
    setAttempts(0);
    setCelebrate(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/70 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 grid place-items-center">🧭</div>
            <div>
              <div className="text-sm text-white/80">Caccia al Tesoro</div>
              <div className="text-xs text-white/60">{progress.stepsCompleted}/{progress.total} tappe completate</div>
            </div>
          </div>
          <div className="text-xs text-white/70 hidden sm:block">Progresso {pct}%</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Barra progresso */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/0 to-white/5 animate-pulse" />
          <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        {/* Stato GPS + Toggle Demo */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-white/70">
            {geoError ? (
              <span className="text-amber-300">GPS: {geoError}</span>
            ) : distance !== null ? (
              <span>
                Sei a <span className="text-emerald-300 font-semibold">~{distance} m</span> dall&apos;obiettivo — raggio utile {currentStep.radiusM} m
              </span>
            ) : (
              <span>Acquisizione posizione in corso…</span>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
            <input type="checkbox" className="accent-emerald-500" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
            Modalità prova
          </label>
        </div>

        {/* Card step corrente o stato finale */}
        {!completedAll ? (
          <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl p-4 border border-white/10 overflow-hidden card-glow">
            {/* FX */}
            <div className="absolute -inset-1 opacity-20 bg-[radial-gradient(800px_200px_at_10%_0%,rgba(16,185,129,0.25),transparent),radial-gradient(800px_200px_at_90%_100%,rgba(20,184,166,0.2),transparent)]" />
            <div className="relative">
              <div className="text-xs text-white/60">Tappa {progress.currentIndex + 1} di {progress.total}</div>
              <h1 className="text-xl font-bold mt-0.5">{currentStep.title}</h1>
              <p className="text-white/80 text-sm mt-1">{currentStep.description}</p>

              {/* Stato distanza */}
              <div className="mt-3 text-xs">
                {canAttemptRiddle ? (
                  <span className="px-2 py-1 rounded bg-emerald-400/15 text-emerald-200 border border-emerald-300/20">Sei nel raggio utile. Risolvi l&apos;indovinello!</span>
                ) : (
                  <span className="px-2 py-1 rounded bg-white/10 text-white/80 border border-white/15">Avvicinati alla posizione per sbloccare l&apos;indovinello.</span>
                )}
              </div>

              {/* Indovinello */}
              <div className={`mt-4 transition-opacity ${canAttemptRiddle ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                <div className="text-sm font-semibold text-emerald-200">Indovinello</div>
                <div className="text-white/90 text-sm mt-1">{currentStep.riddle.question}</div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Scrivi la risposta…"
                    className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                  <button
                    onClick={verifyAnswer}
                    disabled={checking || !userAnswer.trim()}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-400 text-black hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checking ? "Verifica…" : "Verifica"}
                  </button>
                </div>

                {/* Hint / feedback */}
                {attempts > 0 && (
                  <div className="mt-2 text-xs text-amber-200/90">
                    {attempts < 3 ? (
                      <span>Non è corretto. {hint}</span>
                    ) : (
                      <span>Ancora nulla? {hint}</span>
                    )}
                  </div>
                )}

                {/* Celebrations */}
                {celebrate && (
                  <div className="mt-3 text-sm text-emerald-300 font-semibold flex items-center gap-2">
                    <span>✅</span>
                    Ottimo! Tappa superata.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 rounded-2xl p-6 border border-emerald-400/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(600px_180px_at_20%_10%,rgba(16,185,129,0.2),transparent),radial-gradient(600px_180px_at_80%_90%,rgba(20,184,166,0.15),transparent)] opacity-40" />
            <div className="relative">
              <div className="text-2xl font-bold text-emerald-300">Complimenti! 🎉</div>
              <p className="text-white/85 mt-2">Hai completato la caccia al tesoro. Vuoi rigiocare per migliorare il tempo o aiutare un amico?</p>
              <button onClick={resetHunt} className="mt-4 px-4 py-2 bg-emerald-400 text-black rounded-lg font-semibold hover:bg-emerald-300">Ricomincia</button>
            </div>
          </div>
        )}

        {/* Elenco tappe con stato */}
        <div className="mt-6">
          <h2 className="text-sm text-white/70 mb-2">Tappe</h2>
          <ul className="space-y-2">
            {STEPS.map((s, idx) => {
              const done = idx < progress.stepsCompleted;
              const current = idx === progress.currentIndex && !completedAll;
              return (
                <li key={s.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${done ? "border-emerald-400/30 bg-emerald-400/10" : current ? "border-white/15 bg-white/5" : "border-white/10"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full grid place-items-center text-xs ${done ? "bg-emerald-400 text-black" : current ? "bg-white/20 text-white" : "bg-white/10 text-white/60"}`}>
                      {done ? "✓" : idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-white/60 text-xs">Raggio utile {s.radiusM} m</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/70">{done ? "Fatta" : current ? "In corso" : "In attesa"}</div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Info */}
        <div className="mt-6 text-xs text-white/60">
          Suggerimento: per motivi di privacy, la tua posizione non viene salvata sui nostri server. Tutti i dati di progresso rimangono sul tuo dispositivo.
        </div>
      </div>
    </main>
  );
}
