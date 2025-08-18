"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useXPSystem } from "@/hooks/useXPSystem";
import TreasureHuntTutorial, { isTutorialHidden } from "@/components/TreasureHuntTutorial";

// Simple types
type LatLng = { lat: number; lng: number };

type Step = {
  id: string;
  title: string;
  description: string;
  clue: string;
  location: LatLng;
  radiusM: number; // acceptance radius in meters
  hint?: string;
  image?: string;
};

type Hunt = {
  id: string;
  name: string;
  city: string;
  steps: Step[];
  rewardXP: number;
  badgeId?: string;
};

type Progress = {
  huntId: string;
  currentIndex: number; // index of the next step to complete
  completed: string[]; // step ids
  startedAt: string;
  finishedAt?: string;
  points: number;
};

const STORAGE_KEY = "treasureHuntProgressV1";

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentIndex: p.currentIndex,
        stepsCompleted: p.completed.length,
        total: pTotalSteps(p.huntId),
        startedAt: p.startedAt,
        points: p.points,
      })
    );
    localStorage.setItem(`${STORAGE_KEY}:${p.huntId}`, JSON.stringify(p));
  } catch {}
}

function loadProgress(huntId: string): Progress | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${huntId}`);
    return raw ? (JSON.parse(raw) as Progress) : null;
  } catch {
    return null;
  }
}

function haversineM(a: LatLng, b: LatLng) {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlng = Math.sin(dLng / 2);
  const c = 2 * Math.asin(
    Math.sqrt(sinDlat * sinDlat + Math.cos(lat1) * Math.cos(lat2) * sinDlng * sinDlng)
  );
  return R * c;
}

// Demo hunt data for Civitanova
const CIVITANOVA_CENTER: LatLng = { lat: 43.3059, lng: 13.7264 };

const demoHunt: Hunt = {
  id: "cvt-hunt-001",
  name: "Caccia al Tesoro: Civitanova",
  city: "Civitanova Marche",
  rewardXP: 250,
  badgeId: "treasure_hunter",
  steps: [
    {
      id: "step-1",
      title: "Piazza XX Settembre",
      description: "Il cuore della città, dove si incontrano cultura e vita quotidiana.",
      clue: "Cerca la fontana e conta i getti d'acqua. Sei nel posto giusto?",
      location: { lat: 43.3066, lng: 13.7232 },
      radiusM: 120,
      hint: "Vicino al Teatro Rossini.",
      image: "https://images.unsplash.com/photo-1523419409543-a7cbe5d6f98b?w=1200&h=900&fit=crop",
    },
    {
      id: "step-2",
      title: "Lungomare Sud",
      description: "Il mare che abbraccia la città: ascolta le onde, segui l'indizio.",
      clue: "Dove le barche riposano, trova il pontile che guarda l'orizzonte.",
      location: { lat: 43.3046, lng: 13.7296 },
      radiusM: 150,
      hint: "Allineati con il faro e il molo.",
      image: "https://images.unsplash.com/photo-1530543787849-128d94430c6b?w=1200&h=900&fit=crop",
    },
    {
      id: "step-3",
      title: "Chiesa di San Marone",
      description: "Antiche pietre e storia secolare.",
      clue: "Cerca il portale in legno e una statua del santo: sei vicino.",
      location: { lat: 43.3103, lng: 13.7187 },
      radiusM: 120,
      hint: "A nord della piazza, verso l'interno.",
      image: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=1200&h=900&fit=crop",
    },
    {
      id: "step-4",
      title: "Porto Turistico",
      description: "L'anima marinara della città.",
      clue: "Osserva le reti e gli ormeggi: c'è un edificio blu con una torretta.",
      location: { lat: 43.3076, lng: 13.7238 },
      radiusM: 140,
      hint: "Vicino alle cooperative dei pescatori.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop",
    },
    {
      id: "step-5",
      title: "Belvedere Nord",
      description: "Vista mozzafiato sulla città e il mare.",
      clue: "Trova la panchina con vista e scatta una foto mentale del panorama.",
      location: { lat: 43.312, lng: 13.72 },
      radiusM: 180,
      hint: "Sali verso la collina.",
      image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&h=900&fit=crop",
    },
  ],
};

function pTotalSteps(huntId: string) {
  // For now we only have one hunt
  return demoHunt.steps.length;
}

function StepCard({
  step,
  index,
  isCurrent,
  completed,
  onVerify,
  verifying,
  distanceM,
}: {
  step: Step;
  index: number;
  isCurrent: boolean;
  completed: boolean;
  onVerify: () => void;
  verifying: boolean;
  distanceM?: number | null;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 overflow-hidden bg-white/5 ${completed ? 'opacity-70' : ''}`}>
      {step.image && (
        <div className="relative h-36 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={step.image} alt={step.title} className="object-cover w-full h-full" />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold text-sm">{index + 1}. {step.title}</div>
          {completed ? (
            <span className="text-emerald-400 text-xs">Completata ✅</span>
          ) : isCurrent ? (
            <span className="text-amber-300 text-xs">Prossima ➜</span>
          ) : (
            <span className="text-white/40 text-xs">Bloccata 🔒</span>
          )}
        </div>
        <div className="text-white/80 text-xs">{step.description}</div>
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-white text-xs">Indizio: {step.clue}</div>
          {step.hint && (
            <details className="mt-1">
              <summary className="text-emerald-300 text-[11px] cursor-pointer">Serve un aiuto?</summary>
              <div className="text-white/70 text-[11px] mt-1">Suggerimento: {step.hint}</div>
            </details>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span>Raggio: {Math.round(step.radiusM)} m</span>
          <span>{distanceM != null ? `Distanza: ${Math.round(distanceM)} m` : 'Distanza: -'}</span>
        </div>
        <button
          disabled={!isCurrent || completed || verifying}
          onClick={onVerify}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${!isCurrent || completed ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'} ${verifying ? 'opacity-70' : ''}`}
        >
          {completed ? 'Già completata' : verifying ? 'Verifica…' : isCurrent ? 'Verifica posizione' : 'Completa gli step precedenti'}
        </button>
      </div>
    </div>
  );
}

export default function TreasureHuntPage() {
  const router = useRouter();
  const hunt = demoHunt;
  const [userId, setUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.id) setUserId(u.id);
      }
    } catch {}
  }, []);
  const { addXP } = useXPSystem(userId);
  const REWARD_KEY = `${STORAGE_KEY}:rewarded:${hunt.id}`;

  const [progress, setProgress] = useState<Progress>(() => {
    if (typeof window === 'undefined') {
      return {
        huntId: hunt.id,
        currentIndex: 0,
        completed: [],
        startedAt: new Date().toISOString(),
        points: 0,
      };
    }
    const loaded = loadProgress(hunt.id);
    return (
      loaded ?? {
        huntId: hunt.id,
        currentIndex: 0,
        completed: [],
        startedAt: new Date().toISOString(),
        points: 0,
      }
    );
  });

  // Watch geolocation to show live distance to current step
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalizzazione non supportata dal dispositivo.');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setGeoError(err.message || 'Impossibile ottenere la posizione.');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const currentStep = hunt.steps[progress.currentIndex] || null;

  const distances = useMemo(() => {
    if (!userPos) return {} as Record<string, number>;
    const res: Record<string, number> = {};
    for (const s of hunt.steps) {
      res[s.id] = haversineM(userPos, s.location);
    }
    return res;
  }, [userPos, hunt.steps]);

  const [verifying, setVerifying] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  useEffect(() => {
    // Apri tutorial al primo accesso se non disabilitato
    try {
      if (!isTutorialHidden()) setShowTutorial(true);
    } catch {}
  }, []);
  const verifyCurrent = useCallback(() => {
    if (!currentStep) return;
    if (!navigator.geolocation) {
      alert('Geolocalizzazione non disponibile.');
      return;
    }
    setVerifying(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const d = haversineM(here, currentStep.location);
        if (d <= currentStep.radiusM) {
          // success
          const newCompleted = [...progress.completed, currentStep.id];
          const nextIndex = progress.currentIndex + 1;
          const finished = nextIndex >= hunt.steps.length;
          const newProgress: Progress = {
            ...progress,
            completed: newCompleted,
            currentIndex: Math.min(nextIndex, hunt.steps.length - 1),
            points: progress.points + 50, // per step
            finishedAt: finished ? new Date().toISOString() : progress.finishedAt,
          };
          setProgress(newProgress);
          saveProgress(newProgress);
          if (finished) {
            try {
              const rewarded = localStorage.getItem(REWARD_KEY) === '1';
              if (!rewarded) {
                // Accredi XP per il completamento della caccia (una sola volta)
                addXP('treasure_hunt_complete', hunt.rewardXP, { huntId: hunt.id, steps: hunt.steps.length });
                localStorage.setItem(REWARD_KEY, '1');
              }
            } catch {}
            setTimeout(() => {
              alert('Complimenti! Caccia al tesoro completata! Hai guadagnato XP e (se previsto) un badge.');
            }, 50);
          }
        } else {
          alert(`Non sei abbastanza vicino. Distanza attuale: ${Math.round(d)} m`);
        }
        setVerifying(false);
      },
      (err) => {
        alert(`Errore geolocalizzazione: ${err.message}`);
        setVerifying(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  }, [currentStep, progress, hunt.steps.length]);

  const stepsCompleted = progress.completed.length;
  const total = hunt.steps.length;
  const pct = Math.round((stepsCompleted / total) * 100);
  const done = stepsCompleted >= total;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-dark-300/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white/70 hover:text-white">← Indietro</button>
          <div className="text-sm font-semibold">Caccia al Tesoro</div>
          <Link href="/" className="text-white/70 hover:text-white">Home</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">🧭</div>
            <div>
              <div className="text-lg font-bold">{hunt.name}</div>
              <div className="text-white/70 text-xs">{hunt.city} • {total} tappe • Ricompensa: {hunt.rewardXP} XP</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-white/70 mt-1">Progresso: {stepsCompleted}/{total} ({pct}%)</div>
          </div>
          {geoError && (
            <div className="mt-2 text-amber-300 text-xs">⚠️ {geoError}</div>
          )}
          <div className="mt-3 flex gap-2">
            <a href="/caccia-al-tesoro/tutorial" className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs">Tutorial</a>
            <button onClick={() => setShowTutorial(true)} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs">Apri Tutorial</button>
          </div>
        </div>

        {/* How to play */}
        <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
          <div className="font-semibold text-sm mb-1">Come si gioca</div>
          <ol className="list-decimal list-inside text-white/80 text-xs space-y-1">
            <li>Raggiungi la località suggerita dall'indizio.</li>
            <li>Quando sei vicino, premi "Verifica posizione".</li>
            <li>Completa tutte le tappe per ottenere XP e un badge.</li>
            <li>Puoi tornare più tardi: i progressi vengono salvati automaticamente.</li>
          </ol>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {hunt.steps.map((step, idx) => {
            const isCompleted = progress.completed.includes(step.id);
            const isCurrent = idx === progress.currentIndex;
            const d = distances[step.id];
            return (
              <StepCard
                key={step.id}
                step={step}
                index={idx}
                isCurrent={isCurrent}
                completed={isCompleted}
                onVerify={verifyCurrent}
                verifying={verifying && isCurrent}
                distanceM={userPos ? d : null}
              />
            );
          })}
        </div>

        {/* Finish box */}
        <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
          <div className="font-semibold text-sm mb-1">Ricompense</div>
          <div className="text-white/80 text-xs">
            Completa la caccia per ottenere {hunt.rewardXP} XP {hunt.badgeId ? `e il badge "${hunt.badgeId}"` : ''}.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                // Reset progress
                const fresh: Progress = {
                  huntId: hunt.id,
                  currentIndex: 0,
                  completed: [],
                  startedAt: new Date().toISOString(),
                  points: 0,
                };
                setProgress(fresh);
                saveProgress(fresh);
              }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs"
            >
              Resetta
            </button>
            {done && (
              <button
                onClick={() => {
                  const fresh: Progress = {
                    huntId: hunt.id,
                    currentIndex: 0,
                    completed: [],
                    startedAt: new Date().toISOString(),
                    points: 0,
                  };
                  setProgress(fresh);
                  saveProgress(fresh);
                }}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                Rigioca
              </button>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${(currentStep ?? hunt.steps[0]).location.lat},${(currentStep ?? hunt.steps[0]).location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              Apri in Maps
            </a>
          </div>
        </div>

        <div className="h-24" />
      </div>
      <TreasureHuntTutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} onStart={() => { setShowTutorial(false); }} />
    </div>
  );
}
