"use client";

import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Coins, Sparkles } from 'lucide-react';

export default function FundraisingWidget() {
  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-2 sm:p-3 card-glow border border-white/10">
      <div className="flex items-start gap-2">
        {/* Icona */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center shrink-0">
          <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
        </div>

        {/* Testi e contenuto */}
        <div className="flex-1 min-w-0">
          {/* Titolo + badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="text-white font-semibold text-[11px] sm:text-xs leading-none">Raccolta Fondi</h3>
            <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/10 shrink-0">In arrivo</span>
          </div>

          {/* Descrizione breve */}
          <p className="text-white/70 text-[10px] sm:text-[11px] mt-1 leading-snug">
            Sostieni i progetti che migliorano Civitanova Marche.
          </p>

          {/* Mini stats - in colonna su mobile, 2 colonne da sm in su */}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2">
              <div className="text-[9px] sm:text-[10px] text-white/60 leading-none">Totale raccolto</div>
              <div className="text-[11px] sm:text-xs font-semibold text-emerald-300 mt-0.5">€ 12.340</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-1.5 sm:p-2">
              <div className="text-[9px] sm:text-[10px] text-white/60 leading-none">Progetti attivi</div>
              <div className="text-[11px] sm:text-xs font-semibold text-cyan-300 mt-0.5">12</div>
            </div>
          </div>

          {/* Azioni - singola colonna su mobile, due colonne da sm in su */}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <Link href="/raccolta-fondi" className="group" aria-label="Scopri i Progetti">
              <div className="w-full py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] text-center bg-gradient-to-r from-blue-600/80 to-emerald-500/80 text-white border border-white/10 hover:from-blue-500 hover:to-emerald-400 transition-all shadow">
                Scopri i Progetti
              </div>
            </Link>
            <Link href="/raccolta-fondi#creatori" className="group" aria-label="Proponi Progetto">
              <div className="w-full py-1.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] text-center bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors flex items-center justify-center gap-1">
                <HeartHandshake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-300" />
                Proponi Progetto
              </div>
            </Link>
          </div>

          {/* Footer informativo - nascosto su mobile stretto */}
          <div className="mt-2 hidden sm:flex items-center justify-between text-[10px] text-white/60">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>Match donatori intelligente</span>
            </div>
            <span className="text-white/40">Beta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
