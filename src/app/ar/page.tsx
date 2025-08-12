"use client";

import React from 'react';
import Link from 'next/link';
import { Glasses } from 'lucide-react';

export default function ARServiceLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Glasses className="w-7 h-7" />
          <h1 className="text-3xl font-heading font-bold">Esperienza AR Civitanova</h1>
        </div>
        <p className="text-white/80 max-w-2xl mb-8">
          Questa è la pagina dedicata al servizio di Realtà Aumentata. Qui si attiverà l&apos;esperienza
          completa: rilevamento superfici, ancoraggi, POI geo-referenziati e narrazione interattiva.
          Per ora, è disponibile una demo dell&apos;interfaccia. Torna presto per l&apos;esperienza completa!
        </p>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-2">In arrivo</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/85">
            <li>WebXR/AR Quick Look quando supportato</li>
            <li>Rilevamento dei piani per posizionare ancoraggi AR</li>
            <li>Overlay informativi per punti di interesse reali</li>
            <li>Modalità tour guidati con tap-to-navigate</li>
          </ul>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Link href="/" className="px-4 py-2 bg-white text-[#302b63] rounded-lg font-semibold shadow hover:bg-white/90">
            Torna alla Home
          </Link>
          <Link href="/ar-experience" className="px-4 py-2 bg-cyan-400 text-black rounded-lg font-semibold shadow hover:bg-cyan-300">
            Apri AR geolocalizzata
          </Link>
        </div>
      </div>
    </main>
  );
}


