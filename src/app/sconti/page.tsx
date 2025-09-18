"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";

function formatDateShort(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
  } catch {
    return "--/--";
  }
}

function isExpired(iso?: string | null) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

type ApiCoupon = {
  id: string;
  merchant_id: string;
  merchant?: { id: string; name: string; slug: string; category?: string; logo_url?: string };
  title: string;
  description?: string;
  category?: string;
  type: "percent" | "fixed_price" | "promo";
  discount_percent?: number | null;
  fixed_price?: number | null;
  currency?: string | null;
  max_per_user: number;
  starts_at?: string | null;
  expires_at?: string | null;
};

export default function ScontiPage() {
  const { user, loading } = useAuthWithRole();
  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  const [activeTab, setActiveTab] = useState<"attivi" | "usati" | "scaduti">("attivi");
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tutto");
  const [open, setOpen] = useState<{ coupon: ApiCoupon; code: string } | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingList(true);
        const { supabase } = await import("@/utils/supabaseClient");
        const { data: { session } } = await supabase.auth.getSession();
        const idToken = (session as any)?.access_token || null;
        if (!idToken) return;
        const res = await fetch(`/api/coupons`, { signal: controller.signal, headers: { Authorization: `Bearer ${idToken}` } });
        const data = await res.json();
        setCoupons(data.coupons || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    })();
    return () => controller.abort();
  }, [user]);

  const categories = useMemo(() => [
    "Tutto",
    ...Array.from(new Set((coupons || []).map((c) => c.category).filter(Boolean))) as string[],
  ], [coupons]);

  const filtered = useMemo(() => {
    const base = (coupons || []).filter((c) => {
      const text = `${c.title} ${c.description ?? ''}`.toLowerCase();
      const matchQuery = text.includes(query.toLowerCase());
      const matchCat = category === "Tutto" || c.category === category;
      return matchQuery && matchCat;
    });

    if (activeTab === "usati") return base.filter((c) => usedIds.includes(c.id));
    if (activeTab === "scaduti") return base.filter((c) => isExpired(c.expires_at));
    return base.filter((c) => !isExpired(c.expires_at) && !usedIds.includes(c.id));
  }, [activeTab, query, category, usedIds, coupons]);

  async function claim(coupon: ApiCoupon) {
    try {
      setClaimingId(coupon.id);
      const { supabase } = await import("@/utils/supabaseClient");
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token || null;
      if (!idToken) throw new Error('Devi effettuare il login');

      const res = await fetch(`/api/coupons/${coupon.id}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossibile ottenere il codice');
      setOpen({ coupon, code: data.code });
    } catch (e: any) {
      alert(e.message || 'Errore durante l\'operazione');
    } finally {
      setClaimingId(null);
    }
  }

  async function confirmUse() {
    if (!open) return;
    try {
      const { supabase } = await import("@/utils/supabaseClient");
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token || null;
      if (!idToken) throw new Error('Devi effettuare il login');

      const res = await fetch(`/api/coupons/${open.coupon.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ code: open.code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante il redeem');
      setUsedIds((prev) => Array.from(new Set([...prev, open.coupon.id])));
      setOpen(null);
    } catch (e: any) {
      alert(e.message || 'Errore durante il redeem');
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-4">Caricamento...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 z-20 bg-black/70 backdrop-blur border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white">←</Link>
            <h1 className="text-lg font-semibold tracking-wide">Sconti</h1>
            <div className="ml-auto text-xs text-white/50">Offerte & Coupon</div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h2 className="text-xl font-semibold">Accedi per vedere i coupon</h2>
          <p className="text-white/70 mt-2">I codici sono riservati agli utenti registrati.</p>
          <Link href="/login" className="inline-block mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold">Accedi</Link>
        </div>
      </div>
    );
  }

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

      {/* Intro Framer */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
          <div style={{ aspectRatio: '16 / 9' }}>
            <iframe
              src="https://framer.com/m/Metal-Card-SefC?embed=1"
              title="Intro Sconti — Metal Card (Framer)"
              loading="lazy"
              className="w-full h-full"
              allow="fullscreen; autoplay; clipboard-write; encrypted-media"
              style={{ border: '0' }}
            />
          </div>
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
        {loadingList && <div className="text-center text-white/60 py-4">Caricamento coupon...</div>}
        {!loadingList && filtered.length === 0 ? (
          <div className="text-center text-white/60 py-10">Nessun coupon da mostrare.</div>
        ) : null}

        {filtered.map((c) => {
          const expired = isExpired(c.expires_at);
          const used = usedIds.includes(c.id);
          const discountLabel = c.type === 'percent' && c.discount_percent ? `-${c.discount_percent}%` : c.type === 'fixed_price' && c.fixed_price ? `${c.fixed_price}€` : 'Promo';
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
                  {c.category === "Ristoranti" ? "🍸" : c.category === "Shopping" ? "🛍️" : "🎉"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight">{c.title}</h3>
                      <div className="text-white/70 text-sm">{c.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-purple-300">{discountLabel}</div>
                      {c.expires_at ? (
                        <div className="text-[11px] text-white/60">Scade il {formatDateShort(c.expires_at)}</div>
                      ) : null}
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
                      {c.merchant?.name || c.category || 'Coupon'}
                    </div>
                    <div className="flex items-center gap-2">
                      {!expired && !used ? (
                        <button
                          onClick={() => claim(c)}
                          disabled={claimingId === c.id}
                          className="px-3 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-60"
                        >
                          {claimingId === c.id ? 'Richiesta...' : 'Ottieni codice'}
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

      {/* Modal codice */}
      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" />
          <div className="relative z-10 max-w-md mx-auto mt-16 px-4">
            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl select-none" aria-hidden>
                  {open.coupon.category === "Ristoranti" ? "🍸" : open.coupon.category === "Shopping" ? "🛍️" : "🎉"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg leading-tight">{open.coupon.title}</div>
                  <div className="text-white/70 text-sm">{open.coupon.description}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-xs text-white/60">Codice da mostrare in cassa</div>
                <div className="mt-1 text-2xl font-mono tracking-wider">{open.code}</div>
                {open.coupon.expires_at ? (
                  <div className="mt-2 text-[11px] text-white/50">Valido fino al {formatDateShort(open.coupon.expires_at)}</div>
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setOpen(null)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Chiudi
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
