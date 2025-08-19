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
  const stateLabel = completed >= total ? "Completata" : completed > 0 ? "In corso" : "Nuova";

  return (
    <div className="relative rounded-xl p-3 border border-white/10 overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#0f0f10] to-[#1b1b1d]">
      {/* Metallic sheen */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -inset-6 bg-[conic-gradient(from_200deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_20%,rgba(255,255,255,0.06)_40%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.06)_80%,rgba(255,255,255,0)_100%)] opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%)]" />
      </div>

      <div className="relative text-center">
        <div className="w-9 h-9 rounded-lg mx-auto mb-2 grid place-items-center bg-gradient-to-br from-emerald-500/25 to-emerald-400/10 border border-emerald-400/30 shadow-[inset_0_0_12px_rgba(16,185,129,0.25)]">
          <span className="text-sm text-emerald-300">🧭</span>
        </div>
        <div className="text-white font-semibold text-xs tracking-wide">Caccia al Tesoro</div>
        <div className="mt-1 text-[10px] text-white/60">{stateLabel}</div>

        <div className="mt-2 space-y-2">
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06))] border border-white/10">
            <div
              className="h-full rounded-full transition-all bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shadow-[0_0_8px_rgba(45,212,191,0.6)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-[10px] text-white/70">{completed}/{total} tappe completate</div>
          <Link href="/caccia-al-tesoro" className="block">
            <button
              className="relative w-full py-1 rounded-lg text-[10px] font-semibold text-black overflow-hidden group"
              aria-label="Apri la Caccia al Tesoro"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-emerald-300 to-teal-300 group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors" />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(110deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_40%)]" />
              <span className="relative">
                {completed > 0 && completed < total ? "Riprendi" : completed >= total ? "Rigioca" : "Inizia"}
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Edge highlight */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/10" />
    </div>
  );
}
