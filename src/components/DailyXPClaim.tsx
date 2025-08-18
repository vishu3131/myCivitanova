"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useXPSystem } from "@/hooks/useXPSystem";

interface DailyXPClaimProps {
  userId?: string;
  className?: string;
}

// 24 hours in seconds
const COOLDOWN_SECONDS = 24 * 60 * 60;

export function DailyXPClaim({ userId, className = "" }: DailyXPClaimProps) {
  // Disable auto daily login; this button controls the claim.
  // Note: the hook will be updated to support the options parameter.
  const { dailyLogin } = useXPSystem(userId, { autoDailyLogin: false });

  const storageKey = useMemo(
    () => (userId ? `daily_xp_last_claimed_at_${userId}` : "daily_xp_last_claimed_at_guest"),
    [userId]
  );

  const [lastClaimAt, setLastClaimAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [claiming, setClaiming] = useState(false);

  // Load last claim time from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) setLastClaimAt(parsed);
    }
  }, [storageKey]);

  // Tick every second for countdown/progress
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsSinceClaim = useMemo(() => {
    if (!lastClaimAt) return COOLDOWN_SECONDS; // If never claimed, allow claim immediately
    return Math.floor((now - lastClaimAt) / 1000);
  }, [now, lastClaimAt]);

  const secondsRemaining = useMemo(() => {
    const remaining = COOLDOWN_SECONDS - secondsSinceClaim;
    return Math.max(0, remaining);
  }, [secondsSinceClaim]);

  const available = secondsRemaining === 0;

  const progressPercent = useMemo(() => {
    if (available) return 100;
    const elapsed = Math.min(COOLDOWN_SECONDS, Math.max(0, secondsSinceClaim));
    return Math.round((elapsed / COOLDOWN_SECONDS) * 100);
  }, [available, secondsSinceClaim]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleClaim = useCallback(async () => {
    if (!userId || !available || claiming) return;
    try {
      setClaiming(true);
      const result = await dailyLogin();
      // If the backend awarded XP, set the local cooldown timestamp
      if (result && (result.xp_earned ?? 0) > 0) {
        const ts = Date.now();
        setLastClaimAt(ts);
        if (typeof window !== "undefined") localStorage.setItem(storageKey, String(ts));
      }
      // If result is null or xp_earned === 0, the server likely enforced cooldown.
      // UI will keep countdown based on local state.
    } catch (e) {
      console.error("Errore durante il ritiro XP giornaliero:", e);
    } finally {
      setClaiming(false);
    }
  }, [userId, available, claiming, dailyLogin, storageKey]);

  return (
    <div className={`px-3 mt-3 ${className}`}>
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">XP Giornaliera</div>
              <div className="text-white/60 text-xs">
                {userId
                  ? available
                    ? "Disponibile ora"
                    : `Prossimo ritiro tra ${formatTime(secondsRemaining)}`
                  : "Accedi per ritirare"}
              </div>
            </div>
          </div>
          <button
            onClick={handleClaim}
            disabled={!userId || !available || claiming}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-md border
              ${userId && available && !claiming
                ? "bg-gradient-to-r from-accent to-blue-500 text-white border-transparent hover:opacity-90"
                : "bg-white/5 text-white/50 border-white/10 cursor-not-allowed"}`}
          >
            {claiming ? "Ritiro..." : "Ritira XP"}
          </button>
        </div>

        <div className="mb-1 flex items-center justify-between text-xs text-white/60">
          <span>Progresso</span>
          <span className="text-accent font-medium">{progressPercent}%</span>
        </div>
        <div className="w-full bg-dark-400/50 rounded-full h-[10px] overflow-hidden">
          <div
            className="bg-gradient-to-r from-accent via-blue-400 to-accent h-[10px] rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyXPClaim;
