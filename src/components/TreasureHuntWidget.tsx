"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ProgressState {
  currentIndex: number;
  stepsCompleted: number;
  total: number;
  startedAt?: string;
  points?: number;
}

const STORAGE_KEY = "treasureHuntProgressV1";

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
    console.warn("TreasureHuntWidget: invalid progress in storage", e);
  }
  return null;
}

export default function TreasureHuntWidget() {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setProgress(loadProgress());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const completed = progress?.stepsCompleted ?? 0;
  const total = progress?.total ?? 5;
  const pct = Math.min(100, Math.round(((completed || 0) / (total || 1)) * 100));

  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10">
      <div className="text-center">
        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-xs text-emerald-300">🧭</span>
        </div>
        <div className="text-white font-medium text-xs">Caccia al Tesoro</div>
        <div className="mt-2 space-y-2">
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-[10px] text-white/70">{completed}/{total} tappe completate</div>
          <Link href="/caccia-al-tesoro" className="block">
            <button
              className="w-full py-1 rounded-lg text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 transition-colors"
              aria-label="Apri la Caccia al Tesoro"
            >
              {completed > 0 && completed < total ? "Riprendi" : completed >= total ? "Rigioca" : "Inizia"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
