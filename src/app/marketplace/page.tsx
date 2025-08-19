"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// Categories (mock) — sostituibili con dati reali
const BENI_CATEGORIES = [
  "Elettronica",
  "Arredo",
  "Sport",
  "Auto & Moto",
  "Libri",
  "Bimbi",
  "Casa",
  "Altro",
];

const SERVIZI_CATEGORIES = [
  "Riparazioni",
  "Lezioni",
  "Benessere",
  "Pulizie",
  "Eventi",
  "Professionisti",
  "Traslochi",
  "Altro",
];

type Listing = {
  id: string;
  type: "beni" | "servizi";
  title: string;
  price?: string;
  image: string;
  location: string;
  badge?: string;
  category?: string;
  rating?: number;
  available?: boolean;
  verified?: boolean;
};

const MOCK_LISTINGS: Listing[] = [
  { id: "1", type: "beni", title: "Bici da Città", price: "120€", image: "https://images.unsplash.com/photo-1520975922217-7f61d4dc18c5?w=800&h=600&fit=crop", location: "Civitanova Centro", badge: "Top", category: "Sport", rating: 4.8, available: true, verified: false },
  { id: "2", type: "beni", title: "iPhone 12 128GB", price: "380€", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop", location: "Civitanova Alta", badge: "Verificato", category: "Elettronica", rating: 4.9, available: true, verified: true },
  { id: "3", type: "servizi", title: "Lezioni di Chitarra", price: "20€/h", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop", location: "Porto", badge: "Popolare", category: "Lezioni", rating: 4.7, available: true, verified: false },
  { id: "4", type: "servizi", title: "Idraulico d'Urgenza", price: "Sopralluogo", image: "https://images.unsplash.com/photo-1581091014534-1a04b18b5b08?w=800&h=600&fit=crop", location: "Risorgimento", badge: "24/7", category: "Riparazioni", rating: 4.6, available: true, verified: true },
  { id: "5", type: "beni", title: "Divano 3 Posti", price: "220€", image: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d95?w=800&h=600&fit=crop", location: "San Marone", badge: "Come nuovo", category: "Arredo", rating: 4.5, available: false, verified: false },
  { id: "6", type: "servizi", title: "Personal Trainer", price: "Su richiesta", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop", location: "Centro", badge: "Pro", category: "Benessere", rating: 4.9, available: true, verified: true },
];

type ViewMode = "grid" | "list";

function SafeImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [error, setError] = React.useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={!src || error ? "/marketplace/placeholder.svg" : src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as "beni" | "servizi") || "beni";

  const [activeTab, setActiveTab] = useState<"beni" | "servizi">(initialTab);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("recenti");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const tab = (searchParams.get("tab") as "beni" | "servizi") || "beni";
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTab);
    router.replace(`/marketplace?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const categories = activeTab === "beni" ? BENI_CATEGORIES : SERVIZI_CATEGORIES;

  const filtered = useMemo(() => {
    let list = MOCK_LISTINGS.filter((l) => l.type === activeTab);
    if (category) list = list.filter((l) => l.category === category);
    if (query.trim()) list = list.filter((l) => l.title.toLowerCase().includes(query.toLowerCase()));
    if (onlyAvailable) list = list.filter((l) => l.available !== false);
    if (onlyVerified) list = list.filter((l) => l.verified || l.badge === "Verificato");

    if (sort === "prezzo") {
      list = [...list].sort((a, b) => (a.price || "").localeCompare(b.price || ""));
    } else if (sort === "rating") {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [activeTab, category, query, onlyAvailable, onlyVerified, sort]);

  const featured = useMemo(() => {
    return [...MOCK_LISTINGS.filter((l) => l.type === activeTab)]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [activeTab]);

  // Stats (mock): conteggi base per arricchire header
  const activeCount = filtered.length;
  const verifiedCount = filtered.filter((l) => l.verified).length;
  const nearYouCount = filtered.filter((l) => /civitanova|centro/i.test(l.location)).length;

  return (
    <Suspense fallback={<div>Loading marketplace...</div>}>
      <div className="min-h-screen bg-black text-white">
        {/* Sticky header con stats e CTA */}
        <div className="sticky top-0 z-30 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white">←</Link>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg">🛍️</span>
              <span>Marketplace Civitanova</span>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs hover:bg-white/20" aria-label="Crea annuncio">
                + Nuovo annuncio
              </button>
            </div>
          </div>
          {/* mini-stats */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
              <span>📦</span>
              <div>
                <div className="text-white/90 font-medium">{activeCount}</div>
                <div className="text-white/60">Annunci attivi</div>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
              <span>✅</span>
              <div>
                <div className="text-white/90 font-medium">{verifiedCount}</div>
                <div className="text-white/60">Verificati</div>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
              <span>📍</span>
              <div>
                <div className="text-white/90 font-medium">{nearYouCount}</div>
                <div className="text-white/60">Vicino a te</div>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setActiveTab("beni")}
              className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1 ${activeTab === "beni" ? "bg-accent/20 text-white border border-accent/30" : "text-white/70 hover:text-white"}`}
            >
              <span>🛒</span> Beni
            </button>
            <button
              onClick={() => setActiveTab("servizi")}
              className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1 ${activeTab === "servizi" ? "bg-accent/20 text-white border border-accent/30" : "text-white/70 hover:text-white"}`}
            >
              <span>🧰</span> Servizi
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-4 py-3 grid grid-cols-1 gap-3">
        {/* search + sort + view toggle */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cerca ${activeTab === "beni" ? "oggetti" : "servizi"}...`}
              className="w-full pl-7 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                aria-label="Cancella ricerca"
              >
                ✖
              </button>
            )}
          </div>
          <div className="hidden sm:flex bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button onClick={() => setSort("recenti")} className={`px-2 py-1 rounded-lg ${sort === "recenti" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Recenti</button>
            <button onClick={() => setSort("prezzo")} className={`px-2 py-1 rounded-lg ${sort === "prezzo" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Prezzo</button>
            <button onClick={() => setSort("rating")} className={`px-2 py-1 rounded-lg ${sort === "rating" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Rating</button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button onClick={() => setViewMode("grid")} className={`px-2 py-1 rounded-lg ${viewMode === "grid" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Griglia</button>
            <button onClick={() => setViewMode("list")} className={`px-2 py-1 rounded-lg ${viewMode === "list" ? "bg-accent/20 border border-accent/30" : "hover:bg-white/10"}`}>Lista</button>
          </div>
        </div>

        {/* quick toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOnlyAvailable((v) => !v)}
            className={`px-3 py-1.5 rounded-full text-[12px] border flex items-center gap-1 ${onlyAvailable ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <span>🟢</span> Solo disponibili
          </button>
          <button
            onClick={() => setOnlyVerified((v) => !v)}
            className={`px-3 py-1.5 rounded-full text-[12px] border flex items-center gap-1 ${onlyVerified ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <span>🛡️</span> Solo verificati
          </button>
          <button
            onClick={() => { setCategory(null); setQuery(""); setOnlyAvailable(false); setOnlyVerified(false); setSort("recenti"); }}
            className="ml-auto px-3 py-1.5 rounded-full text-[12px] border bg-white/5 border-white/10 hover:bg-white/10"
          >
            Reset filtri
          </button>
        </div>

        {/* Category chips: scroll or wrap */}
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 py-1 w-max">
            <button
              onClick={() => setCategory(null)}
              className={`px-3 py-1.5 rounded-full text-[12px] border ${category === null ? "bg-accent/20 border-accent/30" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
            >
              Tutte le categorie
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-[12px] border ${category === c ? "bg-accent/20 border-accent/30" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured horizontal carousel */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-2 text-sm text-white/80">Vetrina</div>
        <div className="relative -mx-1 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2">
          {featured.map((f) => (
            <div key={f.id} className="snap-start shrink-0 w-64 rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <div className="relative h-36">
                <SafeImage src={f.image} alt={f.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                {f.badge && (
                  <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/60 border border-white/10">{f.badge}</span>
                )}
                <button className="absolute top-2 right-2 text-sm px-2 py-1 rounded-full bg-black/60 border border-white/10">❤️</button>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium line-clamp-1">{f.title}</div>
                <div className="text-[12px] text-white/70 line-clamp-1">📍 {f.location}</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-[12px] text-white/90 font-semibold">{f.price}</div>
                  {typeof f.rating === "number" && (
                    <div className="text-[11px] text-white/70">★ {f.rating.toFixed(1)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-4xl mb-2">🗂️</div>
            <div className="text-lg font-semibold">Nessun risultato trovato</div>
            <div className="text-white/70 text-sm mt-1">Prova a rimuovere qualche filtro o modifica la ricerca.</div>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => { setCategory(null); setQuery(""); setOnlyAvailable(false); setOnlyVerified(false); setSort("recenti"); }}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-sm"
              >
                Reset filtri
              </button>
              <button
                onClick={() => setActiveTab(activeTab === "beni" ? "servizi" : "beni")}
                className="px-4 py-2 rounded-xl bg-accent/30 border border-accent/30 hover:bg-accent/40 text-sm"
              >
                Vai a {activeTab === "beni" ? "Servizi" : "Beni"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((l) => (
                <article key={l.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="relative h-28 sm:h-32 md:h-36">
                    <SafeImage src={l.image} alt={l.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                    {l.badge && (
                      <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/60 border border-white/10">{l.badge}</span>
                    )}
                    <button className="absolute top-2 right-2 text-sm px-2 py-1 rounded-full bg-black/60 border border-white/10">❤️</button>
                    {l.price && (
                      <span className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-full bg-black/60 border border-white/10">{l.price}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-1">{l.title}</div>
                    <div className="text-[12px] text-white/70 line-clamp-1">📍 {l.location}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className={`text-[11px] ${l.available === false ? "text-red-400" : "text-green-400"}`}>
                        {l.available === false ? "Non disponibile" : "Disponibile"}
                      </div>
                      {typeof l.rating === "number" && (
                        <div className="text-[11px] text-white/70">★ {l.rating.toFixed(1)}</div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((l) => (
                <article key={l.id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden flex">
                  <div className="relative w-32 sm:w-40 h-28 sm:h-32 flex-shrink-0">
                    <SafeImage src={l.image} alt={l.title} className="w-full h-full object-cover" />
                    {l.badge && (
                      <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/60 border border-white/10">{l.badge}</span>
                    )}
                    <button className="absolute top-2 right-2 text-sm px-2 py-1 rounded-full bg-black/60 border border-white/10">❤️</button>
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium line-clamp-1">{l.title}</div>
                        <div className="text-[12px] text-white/70 line-clamp-1">📍 {l.location}</div>
                      </div>
                      {l.price && (
                        <div className="text-[12px] text-white/90 font-semibold whitespace-nowrap">{l.price}</div>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-white/70">
                      <div className={`${l.available === false ? "text-red-400" : "text-green-400"}`}>
                        {l.available === false ? "Non disponibile" : "Disponibile"}
                      </div>
                      {typeof l.rating === "number" && (
                        <div>★ {l.rating.toFixed(1)}</div>
                      )}
                      {l.verified && <div className="text-blue-300">🛡️ Verificato</div>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA fixed bottom on mobile */}
      <div className="sticky bottom-0 z-20 bg-black/70 backdrop-blur-md border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="text-white/70 text-sm">Hai qualcosa da proporre?</div>
          <button className="ml-auto px-4 py-2 rounded-xl bg-accent/30 hover:bg-accent/40 border border-accent/30 text-sm">
            Pubblica annuncio
          </button>
        </div>
      </div>
    </Suspense>
  );
}
