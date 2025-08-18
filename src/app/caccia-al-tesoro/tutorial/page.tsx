"use client";

import React, { useState } from "react";
import Link from "next/link";
import TreasureHuntTutorial from "@/components/TreasureHuntTutorial";

export default function TreasureHuntTutorialPage() {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-20 bg-dark-300/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-white/70 hover:text-white">← Home</Link>
          <div className="text-sm font-semibold">Tutorial Caccia al Tesoro</div>
          <Link href="/caccia-al-tesoro" className="text-emerald-400 hover:text-emerald-300">Inizia</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl p-4 border border-white/10 bg-white/5 mb-6">
          <div className="text-lg font-bold mb-1">Come funziona</div>
          <div className="text-white/80 text-sm">Segui il tutorial interattivo qui sotto. Puoi aprirlo anche dalla pagina della caccia.</div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setOpen(true)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Apri Tutorial</button>
          <Link href="/caccia-al-tesoro" className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm">Vai alla Caccia</Link>
        </div>

        <div className="text-white/70 text-sm">
          Suggerimento: attiva la geolocalizzazione dal tuo dispositivo per un'esperienza migliore.
        </div>
      </div>

      <TreasureHuntTutorial isOpen={open} onClose={() => setOpen(false)} onStart={() => (window.location.href = '/caccia-al-tesoro')} />
    </div>
  );
}
