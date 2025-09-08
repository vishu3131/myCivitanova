"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type Coupon = {
  id: string;
  title: string;
  description: string;
  discount: string; // e.g. "-20%" o "2x1"
  expiresAt: string; // ISO string
  category: string; // e.g. "Ristoranti", "Shopping", "Tempo Libero"
  code: string; // codice mostrato in cassa
};

const demoCoupons: Coupon[] = [
  {
    id: "mc-1",
    title: "Burger Gourmet",
    description: "Menu Burger + Patatine + Bibita",
    discount: "-30%",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // +3 giorni
    category: "Ristoranti",
    code: "CIVI-BURGER-30",
  },
  {
    id: "shop-1",
    title: "Sneaker Store",
    description: "Su tutte le nuove collezioni",
    discount: "-20%",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // +10 giorni
    category: "Shopping",
    code: "CIVI-SNK-20",
  },
  {
    id: "fun-1",
    title: "Cinema Downtown",
    description: "Biglietto 2x1 dal lunedì al giovedì",
    discount: "2x1",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), // +1 giorno
    category: "Tempo Libero",
    code: "CIVI-CINE-2X1",
  },
  {
    id: "food-2",
    title: "Pizzeria Bella Vita",
    description: "Pizza + Bibita",
    discount: "-25%",
    expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // scaduto 2 giorni fa
    category: "Ristoranti",
    code: "CIVI-PIZZA-25",
  },
];

function formatDateShort(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
  } catch {
    return "--/--";
  }
}

function isExpired(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

export default function ScontiPage() {
  const [activeTab, setActiveTab] = useState<"attivi" | "usati" | "scaduti">("attivi");
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tutto");
  const [openCoupon, setOpenCoupon] = useState<Coupon | null>(null);

  const categories = useMemo(() => ["Tutto", ...Array.from(new Set(demoCoupons.map(c => c.category)))], []);

  const filtered = useMemo(() => {
    const base = demoCoupons.filter((c) => {
      const matchQuery = `${c.title} ${c.description} ${c.discount}`.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "Tutto" || c.category === category;
      return matchQuery && matchCat;
    });

    if (activeTab === "attivi") return base.filter((c) => !isExpired(c.expiresAt) && !usedIds.includes(c.id));
    if (activeTab === "usati") return base.filter((c) => usedIds.includes(c.id));
    return base.filter((c) => isExpired(c.expiresAt)); // scaduti
  }, [activeTab, query, category, usedIds]);

  const onUse = (coupon: Coupon) => {
    setOpenCoupon(coupon);
  };

  const confirmUse = () => {
    if (openCoupon) setUsedIds((prev) => Array.from(new Set([...prev, openCoupon.id])));
    setOpenCoupon(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-black/70 backdrop-blur border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-white/70 hover:text-white">←</Link>
          <h1 className="text-lg font-semibold tracking-wide">Sconti</h1>
          <div className="ml-auto text-xs text-white/50">Offerte & Coupon</div>
        </div>
      </div>

      {/* Hero banner */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/20 via-cyan-500/10 to-indigo-600/20 p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏷️</div>
            <div>
              <div className="text-white/90 text-sm">Scopri le migliori offerte in città</div>
              <div className="font-semibold text-xl">Coupon esclusivi per te</div>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(600px 120px at 20% -20%, rgba(255,255,255,0.08), transparent), radial-gradient(600px 120px at 80% 120%, rgba(255,255,255,0.06), transparent)" }} />
        </div>
      </div>

      {/* Search + categories */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca coupon, negozi, categorie"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: "attivi", label: "Attivi" },
            { key: "usati", label: "Usati" },
            { key: "scaduti", label: "Scaduti" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                activeTab === t.key
                  ? "bg-purple-600 text-white border-purple-500"
                  : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto px-4 mt-4 pb-24 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-white/60 py-10">Nessun coupon da mostrare.</div>
        ) : null}

        {filtered.map((c) => {
          const expired = isExpired(c.expiresAt);
          const used = usedIds.includes(c.id);
          return (
            <div key={c.id} className={`relative overflow-hidden rounded-2xl border backdrop-blur p-4 ${
              expired
                ? "bg-white/5 border-white/10 opacity-70"
                : used
                ? "bg-white/5 border-white/10"
                : "bg-gradient-to-br from-purple-600/15 via-cyan-500/10 to-indigo-600/15 border-white/10"
            }`}>
              <div className="flex items-start gap-3">
                <div className="text-3xl select-none" aria-hidden>
                  {c.category === "Ristoranti" ? "🍔" : c.category === "Shopping" ? "🛍️" : "🎉"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight">{c.title}</h3>
                      <div className="text-white/70 text-sm">{c.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-purple-300">{c.discount}</div>
                      <div className="text-[11px] text-white/60">Scade il {formatDateShort(c.expiresAt)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full border ${
                      expired
                        ? "text-white/50 border-white/10"
                        : used
                        ? "text-white/70 border-white/10"
                        : "text-purple-300 border-purple-500/40"
                    }`}>
                      {c.category}
                    </div>
                    <div className="flex items-center gap-2">
                      {!expired && !used ? (
                        <button
                          onClick={() => onUse(c)}
                          className="px-3 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 transition-colors"
                        >
                          Usa ora
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                        >
                          {expired ? "Scaduto" : "Usato"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ticket perforation decoration */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" aria-hidden />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full border border-white/10" aria-hidden />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full border border-white/10" aria-hidden />
            </div>
          );
        })}
      </div>

      {/* Modal utilizzo coupon */}
      {openCoupon ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" />
          <div className="relative z-10 max-w-md mx-auto mt-16 px-4">
            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl select-none" aria-hidden>
                  {openCoupon.category === "Ristoranti" ? "🍔" : openCoupon.category === "Shopping" ? "🛍️" : "🎉"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg leading-tight">{openCoupon.title}</div>
                  <div className="text-white/70 text-sm">{openCoupon.description}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-xs text-white/60">Codice da mostrare in cassa</div>
                <div className="mt-1 text-2xl font-mono tracking-wider">{openCoupon.code}</div>
                <div className="mt-2 text-[11px] text-white/50">Valido fino al {formatDateShort(openCoupon.expiresAt)}</div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setOpenCoupon(null)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmUse}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700"
                >
                  Conferma utilizzo
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
