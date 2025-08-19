"use client";

import React from "react";
import { useRouter } from "next/navigation";

export type MarketplaceWidgetProps = {
  className?: string;
};

export default function MarketplaceWidget({ className = "" }: MarketplaceWidgetProps) {
  const router = useRouter();

  const goTo = (tab?: "beni" | "servizi") => {
    const base = "/marketplace";
    const href = tab ? `${base}?tab=${tab}` : base;
    router.push(href);
  };

  return (
    <div className={`h-full bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Marketplace</h3>
        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
          <span className="text-xs text-green-400">🛍️</span>
        </div>
      </div>
      <p className="text-white/70 text-xs mb-3">Compra e vendi tra cittadini e attività locali, scopri offerte e pubblica annunci.</p>
      <div className="flex flex-row space-x-1 mt-3 flex-nowrap">
        <button
          onClick={() => goTo("beni")}
          className="flex items-center justify-center py-1 bg-green-600/30 rounded-full text-green-300 hover:bg-green-600/50 transition-colors shadow-lg flex-grow"
          aria-label="Vai alla sezione Beni"
        >
          <span className="text-[10px] mr-0.5">🛒</span>
          <span className="text-[6px] font-medium whitespace-nowrap">Beni</span>
        </button>
        <button
          onClick={() => goTo("servizi")}
          className="flex items-center justify-center py-1 bg-purple-600/30 rounded-full text-purple-300 hover:bg-purple-600/50 transition-colors shadow-lg flex-grow"
          aria-label="Vai alla sezione Servizi"
        >
          <span className="text-[10px] mr-0.5">🧰</span>
          <span className="text-[6px] font-medium whitespace-nowrap">Servizi</span>
        </button>
      </div>
    </div>
  );
}
