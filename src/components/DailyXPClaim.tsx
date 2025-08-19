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
    <div className={`${className}`}>
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-sm">⚡</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="text-white font-semibold text-sm">XP Giornaliera</div>
              <div className={`${available ? 'text-accent' : 'text-white/60'} text-xs`}>
                {userId
                  ? available
                    ? 'Disponibile'
                    : `Tra ${formatTime(secondsRemaining)}`
                  : 'Accedi'}
              </div>
            </div>
            <div className="relative w-full h-[12px] bg-white/5 border border-white/10 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-blue-400 to-accent rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
          <button
            onClick={handleClaim}
            disabled={!userId || !available || claiming}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-md border shrink-0
              ${userId && available && !claiming
                ? "bg-gradient-to-r from-accent to-blue-500 text-white border-transparent hover:opacity-90"
                : "bg-white/5 text-white/50 border-white/10 cursor-not-allowed"}`}
            aria-label="Ritira XP giornaliera"
          >
            {claiming ? "Ritiro..." : "Ritira"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyXPClaim;
