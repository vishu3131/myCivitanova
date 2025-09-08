"use client";

import Link from "next/link";

export default function ScontiWidget() {
  return (
    <Link
      href="/sconti"
      className="group block h-full rounded-xl border border-white/10 bg-gradient-to-br from-purple-600/15 via-cyan-500/10 to-indigo-600/15 p-3 hover:from-purple-600/25 hover:via-cyan-500/15 hover:to-indigo-600/25 transition-colors relative overflow-hidden"
      aria-label="Apri Sconti"
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">🏷️</div>
        <div>
          <div className="text-white/80 text-xs">Offerte in città</div>
          <div className="text-white font-semibold text-sm leading-tight">Sconti</div>
        </div>
        <div className="ml-auto text-xs text-white/60">Apri →</div>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden style={{ background: "radial-gradient(400px 100px at 20% -20%, rgba(255,255,255,0.08), transparent), radial-gradient(400px 100px at 80% 120%, rgba(255,255,255,0.06), transparent)" }} />
    </Link>
  );
}
