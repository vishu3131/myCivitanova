"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';

interface Merchant { id: string; name: string; slug: string; }
interface Coupon {
  id: string;
  merchant_id: string;
  merchant?: Merchant;
  title: string;
  description?: string;
  category?: string;
  type: 'percent' | 'fixed_price' | 'promo';
  discount_percent?: number | null;
  fixed_price?: number | null;
  currency?: string | null;
  code_type: 'unique' | 'generic';
  code_prefix?: string | null;
  generic_code?: string | null;
  max_total_redemptions?: number | null;
  max_per_user: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
}

export default function CouponsAdminPage() {
  const { user, loading, hasRole } = useAuthWithRole(['admin', 'moderator']);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [q, setQ] = useState('');
  const [merchantFilter, setMerchantFilter] = useState<string>('');
  const [onlyActive, setOnlyActive] = useState<'all'|'true'|'false'>('all');
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Partial<Coupon>>({ type: 'percent', code_type: 'unique', max_per_user: 1, is_active: true });

  async function load() {
    try {
      setLoadingList(true);
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token;
      if (!idToken) throw new Error('Auth mancante');
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (merchantFilter) params.set('merchant_id', merchantFilter);
      if (onlyActive !== 'all') params.set('active', onlyActive);
      const res = await fetch(`/api/admin/coupons?${params.toString()}`, { headers: { Authorization: `Bearer ${idToken}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore caricamento');
      setCoupons(data.coupons || []);

      // Load merchants for selector
      const resM = await fetch(`/api/admin/merchants`, { headers: { Authorization: `Bearer ${idToken}` } });
      const dataM = await resM.json();
      setMerchants(dataM.merchants || []);
    } catch (e) {
      console.error(e);
      setCoupons([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token;
      if (!idToken) throw new Error('Auth mancante');

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore creazione');
      setForm({ type: 'percent', code_type: 'unique', max_per_user: 1, is_active: true });
      await load();
    } catch (e: any) {
      alert(e.message || 'Errore');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(c: Coupon) {
    try {
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token;
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ is_active: !c.is_active })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore aggiornamento');
      await load();
    } catch (e) {
      console.error(e);
    }
  }

  async function generateBatch(c: Coupon) {
    try {
      const count = parseInt(prompt('Quanti codici generare? (max 500)') || '50', 10);
      if (!count || count < 1) return;
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token;
      const res = await fetch(`/api/admin/coupons/${c.id}/generate-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ count })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore generazione');
      alert(`Generati ${data.generated} codici`);
    } catch (e: any) {
      alert(e.message || 'Errore');
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Caricamento...</div>;
  }
  if (!user || !hasRole(['admin','moderator'])) {
    return <div className="min-h-screen flex items-center justify-center text-white">Accesso negato</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Gestione Coupon</h1>
        </div>

        {/* Filtro/Search */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca per titolo o descrizione"
              className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/50"
            />
            <select value={merchantFilter} onChange={(e) => setMerchantFilter(e.target.value)} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="">Tutti i merchant</option>
              {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select value={onlyActive} onChange={(e) => setOnlyActive(e.target.value as any)} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="all">Tutti</option>
              <option value="true">Attivi</option>
              <option value="false">Disattivi</option>
            </select>
            <button onClick={load} className="px-3 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white">Aggiorna</button>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          {loadingList ? (
            <div className="text-white/70">Caricamento...</div>
          ) : coupons.length === 0 ? (
            <div className="text-white/70">Nessun coupon trovato</div>
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/30">
                  <div>
                    <div className="font-semibold text-white">{c.title} <span className="text-white/50 text-xs">/ {c.merchant?.name || c.merchant_id}</span></div>
                    <div className="text-white/70 text-sm">{c.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => generateBatch(c)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10">Genera codici</button>
                    <span className={`text-xs px-2 py-1 rounded-full border ${c.is_active ? 'text-green-300 border-green-500/40' : 'text-white/60 border-white/10'}`}>{c.is_active ? 'Attivo' : 'Disattivo'}</span>
                    <button onClick={() => toggleActive(c)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10">{c.is_active ? 'Disattiva' : 'Attiva'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form nuovo coupon */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="font-semibold mb-2 text-white">Crea nuovo Coupon</div>
          <form onSubmit={createCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select required value={form.merchant_id || ''} onChange={(e) => setForm({ ...form, merchant_id: e.target.value })} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="">Seleziona merchant</option>
              {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input required value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titolo" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Categoria" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrizione" className="md:col-span-3 bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-6 gap-3">
              <select value={form.type || 'percent'} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="percent">Percentuale</option>
                <option value="fixed_price">Prezzo fisso</option>
                <option value="promo">Promo</option>
              </select>
              <input type="number" value={form.discount_percent || ''} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} placeholder="Sconto %" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              <input type="number" value={form.fixed_price || ''} onChange={(e) => setForm({ ...form, fixed_price: Number(e.target.value) })} placeholder="Prezzo fisso" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              <input value={form.currency || 'EUR'} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="Valuta (EUR)" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              <select value={form.code_type || 'unique'} onChange={(e) => setForm({ ...form, code_type: e.target.value as any })} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="unique">Codici univoci</option>
                <option value="generic">Codice generico</option>
              </select>
              <input value={form.code_prefix || ''} onChange={(e) => setForm({ ...form, code_prefix: e.target.value })} placeholder="Prefisso codici" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-3">
              <input type="number" value={form.max_total_redemptions || ''} onChange={(e) => setForm({ ...form, max_total_redemptions: Number(e.target.value) })} placeholder="Redenzioni totali max" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              <input type="number" value={form.max_per_user || 1} onChange={(e) => setForm({ ...form, max_per_user: Number(e.target.value) })} placeholder="Max per utente" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              <input type="datetime-local" value={form.starts_at || ''} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              <input type="datetime-local" value={form.expires_at || ''} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
              <label className="flex items-center gap-2 text-white text-sm"><input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Attivo</label>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button disabled={submitting} className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60">{submitting ? 'Creazione...' : 'Crea coupon'}</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
