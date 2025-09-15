"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';

interface Merchant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  created_at?: string;
}

export default function MerchantsAdminPage() {
  const { user, loading, hasRole } = useAuthWithRole(['admin', 'moderator']);
  const [items, setItems] = useState<Merchant[]>([]);
  const [q, setQ] = useState('');
  const [onlyActive, setOnlyActive] = useState<'all'|'true'|'false'>('all');
  const [loadingList, setLoadingList] = useState(false);
  const [form, setForm] = useState<Partial<Merchant>>({ is_active: true });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      setLoadingList(true);
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token;
      if (!idToken) throw new Error('Auth mancante');
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (onlyActive !== 'all') params.set('active', onlyActive);
      const res = await fetch(`/api/admin/merchants?${params.toString()}`, { headers: { Authorization: `Bearer ${idToken}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore caricamento');
      setItems(data.merchants || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => items, [items]);

  async function createMerchant(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token;
      if (!idToken) throw new Error('Auth mancante');
      const res = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          category: form.category,
          address: form.address,
          phone: form.phone,
          website: form.website,
          logo_url: form.logo_url,
          is_active: form.is_active ?? true,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore creazione');
      setForm({ is_active: true });
      await load();
    } catch (e: any) {
      alert(e.message || 'Errore');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(m: Merchant) {
    try {
      const { supabase } = await import('@/utils/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const idToken = (session as any)?.access_token;
      const res = await fetch(`/api/admin/merchants/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ is_active: !m.is_active })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore aggiornamento');
      await load();
    } catch (e) {
      console.error(e);
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
          <h1 className="text-2xl font-semibold text-white">Attività (Merchants)</h1>
        </div>

        {/* Filtro/Search */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca per nome o descrizione"
              className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/50"
            />
            <select value={onlyActive} onChange={(e) => setOnlyActive(e.target.value as any)} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="all">Tutte</option>
              <option value="true">Attive</option>
              <option value="false">Disattive</option>
            </select>
            <button onClick={load} className="px-3 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white">Aggiorna</button>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          {loadingList ? (
            <div className="text-white/70">Caricamento...</div>
          ) : filtered.length === 0 ? (
            <div className="text-white/70">Nessuna attività trovata</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/30">
                  <div>
                    <div className="font-semibold text-white">{m.name} <span className="text-white/50 text-xs">/ {m.slug}</span></div>
                    <div className="text-white/70 text-sm">{m.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${m.is_active ? 'text-green-300 border-green-500/40' : 'text-white/60 border-white/10'}`}>{m.is_active ? 'Attivo' : 'Disattivo'}</span>
                    <button onClick={() => toggleActive(m)} className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10">{m.is_active ? 'Disattiva' : 'Attiva'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form nuovo merchant */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="font-semibold mb-2 text-white">Crea nuova Attività</div>
          <form onSubmit={createMerchant} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input required value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Categoria" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrizione" className="md:col-span-3 bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Indirizzo" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefono" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Sito web" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <input value={form.logo_url || ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="Logo URL" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            <label className="flex items-center gap-2 text-white text-sm"><input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Attivo</label>
            <div className="md:col-span-3 flex justify-end">
              <button disabled={submitting} className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60">{submitting ? 'Creazione...' : 'Crea'}</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
