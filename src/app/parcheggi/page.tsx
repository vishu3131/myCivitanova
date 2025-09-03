"use client";

import React, { useRef, useState, useEffect } from "react";
import { Car, CreditCard, Info, MapPin, Clock, Hash, AlertTriangle } from "lucide-react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import 'leaflet/dist/leaflet.css'; // Keep Leaflet CSS
import Switch from "@/components/Switch";
import ParkingMap from "@/components/ParkingMap"; // Import the new ParkingMap component

// Parking areas (approximate polygons/polylines) for clarity over clusters
const PARKING_AREAS: Array<
  | { id: string; name: string; type: 'free' | 'paid'; shape: 'polygon'; coords: [number, number][] }
  | { id: string; name: string; type: 'free' | 'paid'; shape: 'polyline'; coords: [number, number][] }
> = [
  // Zona Stadio (gratuita) - area ampia attorno allo stadio
  {
    id: 'stadio-area',
    name: 'Area Parcheggio Stadio',
    type: 'free',
    shape: 'polygon',
    coords: [
      [43.3095, 13.7145],
      [43.3095, 13.7172],
      [43.3078, 13.7172],
      [43.3078, 13.7145],
    ],
  },
  // Biblioteca Zavatti (gratuita) - piccola area a lato
  {
    id: 'zavatti-area',
    name: 'Area Parcheggio Biblioteca Zavatti',
    type: 'free',
    shape: 'polygon',
    coords: [
      [43.3079, 13.7247],
      [43.3079, 13.7252],
      [43.3076, 13.7252],
      [43.3076, 13.7247],
    ],
  },
  // Piazza XX Settembre (pagamento) - area frontale al Comune
  {
    id: 'piazza-xx-settembre',
    name: 'Piazza XX Settembre (A Pagamento)',
    type: 'paid',
    shape: 'polygon',
    coords: [
      [43.3076, 13.7224],
      [43.3076, 13.7234],
      [43.3069, 13.7234],
      [43.3069, 13.7224],
    ],
  },
  // Corso Umberto I (pagamento) - corridoio lungo il corso (polilinea spessa)
  {
    id: 'corso-umberto',
    name: 'Corso Umberto I (A Pagamento)',
    type: 'paid',
    shape: 'polyline',
    coords: [
      [43.3074, 13.7237],
      [43.3078, 13.7225],
      [43.3082, 13.7215],
      [43.3086, 13.7205],
      [43.3090, 13.7196],
    ],
  },
];

function getAreaStyle(type: 'free' | 'paid') {
  return type === 'paid'
    ? { color: '#3b82f6', weight: 3, fillColor: '#3b82f6', fillOpacity: 0.2 }
    : { color: '#22c55e', weight: 3, fillColor: '#22c55e', fillOpacity: 0.2 };
}

export default function ParcheggiPage() {
  type Tab = "all" | "free" | "paid";
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const { triggerHaptic } = useHapticFeedback();
  const [isAltView, setIsAltView] = useState(false);
  const [showParkingNotice, setShowParkingNotice] = useState(false);
  useEffect(() => {
    try {
      const dismissed = typeof window !== 'undefined' && sessionStorage.getItem('parkingNoticeDismissed') === '1';
      if (!dismissed) setShowParkingNotice(true);
    } catch {}
  }, []);
  const touchStartX = useRef<number | null>(null);
  const onTabsTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTabsTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      const order: Tab[] = ['all', 'free', 'paid'];
      const idx = order.indexOf(activeTab);
      const nextIdx = dx < 0 ? Math.min(idx + 1, order.length - 1) : Math.max(idx - 1, 0);
      if (nextIdx !== idx) {
        setActiveTab(order[nextIdx]);
        triggerHaptic('light');
      }
    }
    touchStartX.current = null;
  };

  
  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "Tutti" },
    { id: "free", label: "Gratuiti" },
    { id: "paid", label: "A pagamento" },
  ];

  return (
    <div className="min-h-screen bg-black" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)", WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/70 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
              <Car className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold leading-tight">Parcheggi di Civitanova</h1>
              <p className="text-white/60 text-xs">{isAltView ? 'Vista Open Data (beta)' : 'Mappa e lista dei parcheggi (in arrivo)'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-xs hidden sm:inline">Open Data</span>
            <Switch isOn={isAltView} onToggle={() => { try { sessionStorage.setItem('parkingNoticeDismissed', '1'); } catch {} triggerHaptic('light'); setIsAltView(v => !v); }} />
          </div>
        </div>
      </div>

      {isAltView && <AltParkingView onToggle={() => { try { sessionStorage.setItem('parkingNoticeDismissed', '1'); } catch {} triggerHaptic('light'); setIsAltView(false); }} isAlt={isAltView} />}

      {!isAltView && showParkingNotice && (
        <>
          <div className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-sm"></div>
          <div className="fixed left-0 right-0 z-[999] flex justify-center px-4" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}>
            <div className="relative w-[92%] max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-[1px]">
                <div className="rounded-2xl bg-[#0b0b0f] relative">
                  <div className="p-5 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow">
                        <AlertTriangle className="w-5 h-5 text-yellow-300" />
                      </div>
                      <h3 className="text-white text-lg font-bold">Sezione Parcheggi in sviluppo</h3>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Stiamo lavorando per migliorare questa sezione. I dati visualizzati potrebbero essere incompleti o indicativi.
                    </p>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        className="px-3 py-2 text-xs rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors"
                        onClick={() => {
                          try { sessionStorage.setItem('parkingNoticeDismissed', '1'); } catch {}
                          triggerHaptic('light');
                          setShowParkingNotice(false);
                        }}
                      >
                        Capito
                      </button>
                    </div>
                  </div>
                  <div className="absolute -inset-0.5 rounded-2xl pointer-events-none opacity-30 blur-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={`max-w-4xl mx-auto px-4 py-4 space-y-4 ${isAltView ? 'hidden' : ''}`}>
        {/* Tabs */}
        <div className="flex gap-2" role="tablist" aria-label="Filtri parcheggi" onTouchStart={onTabsTouchStart} onTouchEnd={onTabsTouchEnd}>
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={activeTab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => { triggerHaptic('light'); setActiveTab(t.id); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors min-w-[88px] ${
                activeTab === t.id
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Map */}
        <ParkingMap activeTab={activeTab} onToggleAlt={() => { try { sessionStorage.setItem('parkingNoticeDismissed', '1'); } catch {} triggerHaptic('light'); setIsAltView(true); }} isAlt={isAltView} />

        {/* List */}
        <ParkingList activeTab={activeTab} onToggleAlt={() => { try { sessionStorage.setItem('parkingNoticeDismissed', '1'); } catch {} triggerHaptic('light'); setIsAltView(true); }} isAlt={isAltView} />

        {/* Payment mock UI */}
        <PaymentStarter />

        {/* Data sources note */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white/80 text-sm font-semibold mb-1">Fonti dati previste</div>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• OpenStreetMap via Overpass API (amenity=parking, tag fee=yes/no per gratuiti/a pagamento)</li>
            <li>• Eventuali Open Data ufficiali del Comune/Regione (capienza, vincoli, orari)</li>
            <li>• Opzioni commerciali: Parkopedia / integrazioni provider di pagamento sosta</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AltParkingView({ onToggle, isAlt }: { onToggle: () => void; isAlt: boolean }) {
  const { triggerHaptic } = useHapticFeedback();
  type Tab = 'all' | 'free' | 'paid';
  const [tab, setTab] = React.useState<Tab>('all');
  const [fc, setFc] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/data/parcheggi.geojson');
        if (!res.ok) throw new Error(`Errore caricamento Open Data (${res.status})`);
        const data = await res.json();
        setFc(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const features = React.useMemo(() => (fc?.features ?? []) as any[], [fc]);
  const counts = React.useMemo(() => {
    const free = features.filter(f => f.properties?.fee_bool === false).length;
    const paid = features.filter(f => f.properties?.fee_bool === true).length;
    return { free, paid, total: features.length };
  }, [features]);

  const filteredFeatures = React.useMemo(() => {
    if (!features) return [];
    if (tab === 'all') return features;
    if (tab === 'free') return features.filter(f => f.properties?.fee_bool === false);
    return features.filter(f => f.properties?.fee_bool === true);
  }, [features, tab]);

  const filteredFC = React.useMemo(() => ({ type: 'FeatureCollection', features: filteredFeatures }), [filteredFeatures]);
  const center: [number, number] = [43.307, 13.73];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold text-sm">Parcheggi • Open Data</div>
            <div className="text-white/60 text-xs">Dataset comunale (esempio) + mappa interattiva</div>
          </div>
          <div className="flex gap-2" role="tablist" aria-label="Filtri open data">
            {(['all','free','paid'] as const).map(t => (
              <button key={t} onClick={() => { triggerHaptic('light'); setTab(t); }} className={`px-3 py-1.5 rounded-full text-xs border ${tab===t ? (t==='paid' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : t==='free' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-white border-white/20') : 'bg-white/5 text-white/70 border-white/10'}`}>
                {t === 'all' ? 'Tutti' : t === 'free' ? 'Gratuiti' : 'A pagamento'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
          <span>Totale: <span className="text-white/90 font-medium">{counts.total}</span></span>
          <span>•</span>
          <span>Gratuiti: <span className="text-emerald-300 font-medium">{counts.free}</span></span>
          <span>•</span>
          <span>A pagamento: <span className="text-blue-300 font-medium">{counts.paid}</span></span>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Mappa Open Data <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">Modalità: Open Data</span></div>
              <div className="text-white/60 text-xs">Fonte: Open Data locale (GeoJSON) • {tab === 'all' ? 'Tutti' : tab === 'free' ? 'Gratuiti' : 'A pagamento'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-xs hidden sm:inline">Open Data</span>
            <Switch isOn={isAlt} onToggle={onToggle} />
            {loading && <span className="text-[10px] text-white/50">Caricamento…</span>}
          </div>
        </div>
        <div className="h-64 w-full">
          <ParkingMap
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            filteredFC={filteredFC}
            filteredFeatures={filteredFeatures}
            parkingAreas={PARKING_AREAS}
            getAreaStyle={getAreaStyle}
          />
        </div>
        {error && (
          <div className="p-3 text-xs text-red-300">{error}</div>
        )}
      </div>

      {/* Elenco sintetico dal dataset */}
      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Car className="w-4 h-4 text-white/80" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Elenco Parcheggi (Open Data)</div>
              <div className="text-white/60 text-xs">Dataset locale di esempio</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-xs hidden sm:inline">Open Data</span>
            <Switch isOn={isAlt} onToggle={onToggle} />
          </div>
        </div>
        <div className="p-4 space-y-2">
          {loading && <div className="text-white/70 text-sm">Caricamento…</div>}
          {error && <div className="text-red-300 text-sm">{error}</div>}
          {!loading && !error && filteredFeatures.length === 0 && (
            <div className="text-white/60 text-sm">Nessun risultato.</div>
          )}
          <ul className="space-y-2">
            {(collapsed ? filteredFeatures.slice(0, 12) : filteredFeatures).map((f: any) => (
              <li key={f.properties?.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-white text-sm font-medium">{f.properties?.name || 'Parcheggio'}</div>
                  <div className="text-white/60 text-xs">Fee: {String(f.properties?.fee)}{typeof f.properties?.capacity === 'number' ? ` • Capienza: ${f.properties.capacity}` : ''}{f.properties?.operator ? ` • Gestore: ${f.properties.operator}` : ''}</div>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full border ${f.properties?.fee_bool === true ? 'text-amber-300 border-amber-400/30 bg-amber-500/10' : f.properties?.fee_bool === false ? 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10' : 'text-white/60 border-white/20'}`}>
                  {f.properties?.fee_bool === true ? 'A pagamento' : f.properties?.fee_bool === false ? 'Gratuito' : 'Sconosciuto'}
                </div>
              </li>
            ))}
          </ul>
          {filteredFeatures.length > 12 && (
            <div className="pt-2">
              <button
                className="w-full px-3 py-2 text-xs rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
                onClick={() => setCollapsed(c => !c)}
              >
                {collapsed ? `Mostra tutti (${filteredFeatures.length})` : 'Nascondi elenco'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Risorse Esterne e App Sosta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white font-semibold text-sm mb-2">Risorse Esterne</div>
          <ul className="text-white/70 text-sm space-y-2">
            <li>
              <a className="text-blue-300 hover:underline" href="https://www.comune.civitanova.mc.it/" target="_blank" rel="noreferrer">
                Dataset Open del Comune (portale istituzionale)
              </a>
            </li>
            <li>
              <a className="text-blue-300 hover:underline" href="https://www.viamichelin.it/" target="_blank" rel="noreferrer">
                ViaMichelin • Parcheggi a Civitanova Marche
              </a>
            </li>
            <li>
              <a className="text-blue-300 hover:underline" href="https://www.tuttocitta.it/" target="_blank" rel="noreferrer">
                Tuttocittà • Mappa parcheggi (richiede JavaScript)
              </a>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-white font-semibold text-sm">App comunale pagamento sosta</div>
          </div>
          <div className="text-white/70 text-sm">Integrazione prevista con app ufficiale (Civitas). Endpoint e realtime in arrivo.</div>
          <div className="mt-3">
            <button onClick={() => { triggerHaptic('light'); alert('Integrazione in arrivo.'); }} className="px-3 py-2 text-xs rounded-lg bg-purple-500/20 border border-purple-400/30 text-white/90">
              Collega app sosta (demo)
            </button>
          </div>
        </div>
      </div>

      {/* Nota licenze */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-white/60">
        Dati di esempio basati su Open Data/OSM. Verificare licenze e condizioni d&apos;uso prima della pubblicazione.
      </div>
    </div>
  );
}

// Subcomponents (ParkingList and PaymentStarter remain here)

function PaymentStarter() {
  const { triggerHaptic } = useHapticFeedback();
  const [plate, setPlate] = React.useState('');
  const [duration, setDuration] = React.useState(60);
  const [tariff, setTariff] = React.useState<'standard' | 'residenti' | 'turisti'>('standard');
  const [isStarting, setIsStarting] = React.useState(false);

  const startMock = async () => {
    triggerHaptic('light');
    setIsStarting(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsStarting(false);
    alert('Pagamento in arrivo: integrazione provider necessaria');
  };

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-600/10 to-emerald-600/10" onPointerDown={() => triggerHaptic('light')}>
      <div className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold">Avvia pagamento sosta (Mock)</div>
          <div className="text-white/70 text-sm mt-1">Seleziona i dati e avvia: in futuro si collegherà al provider.</div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="col-span-2">
              <label className="block text-white/70 text-xs mb-1">Targa</label>
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-white/50" />
                <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="ES. AB123CD" className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-xs mb-1">Durata (min)</label>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white/50" />
                <input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white outline-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="col-span-3">
              <label className="block text-white/70 text-xs mb-1">Tariffa</label>
              <div className="flex gap-2">
                {(['standard','residenti','turisti'] as const).map(t => (
                  <button key={t} onClick={() => setTariff(t)} className={`px-3 py-1.5 rounded-full text-xs border ${tariff===t ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-white/70 border-white/10'}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={startMock} disabled={isStarting || !plate || duration <= 0} className="px-3 py-2 text-xs rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 disabled:opacity-50">
              {isStarting ? 'Avvio…' : 'Avvia sosta'}
            </button>
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Mock</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-white/50">
            <Info className="w-3.5 h-3.5" />
            Provider da definire (es. EasyPark/myCicero/Telepass Pay) e integrazione con aree/parcometri comunali.
          </div>
        </div>
      </div>
    </div>
  );
}

function ParkingList({ activeTab, onToggleAlt, isAlt }: { activeTab: 'all' | 'free' | 'paid'; onToggleAlt: () => void; isAlt: boolean }) {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/parking?fee=${activeTab}`);
        if (!res.ok) throw new Error(`Errore caricamento parcheggi (${res.status})`);
        const data = await res.json();
        setItems(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}>
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <Car className="w-4 h-4 text-white/80" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Elenco Parcheggi</div>
            <div className="text-white/60 text-xs">
              {activeTab === "all" && "Mostra tutti (gratuiti e a pagamento)"}
              {activeTab === "free" && "Solo gratuiti"}
              {activeTab === "paid" && "Solo a pagamento"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-xs hidden sm:inline">Open Data</span>
          <Switch isOn={isAlt} onToggle={onToggleAlt} />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {loading && <div className="text-white/70 text-sm">Caricamento…</div>}
        {error && <div className="text-red-300 text-sm">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="text-white/60 text-sm">Nessun risultato trovato.</div>
        )}
        <ul className="space-y-2">
          {(collapsed ? items.slice(0, 12) : items).map((it) => (
            <li key={it.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">{it.name}</div>
                <div className="text-white/60 text-xs">Fee: {String(it.fee)}{typeof it.capacity === 'number' ? ` • Capienza: ${it.capacity}` : ''}{it.operator ? ` • Gestore: ${it.operator}` : ''}</div>
              </div>
              <div className={`text-xs px-2 py-0.5 rounded-full border ${it.fee_bool === true ? 'text-amber-300 border-amber-400/30 bg-amber-500/10' : it.fee_bool === false ? 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10' : 'text-white/60 border-white/20'}`}>
                {it.fee_bool === true ? 'A pagamento' : it.fee_bool === false ? 'Gratuito' : 'Sconosciuto'}
              </div>
            </li>
          ))}
        </ul>
        {items.length > 12 && (
          <div className="pt-2">
            <button
              className="w-full px-3 py-2 text-xs rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
              onClick={() => setCollapsed(c => !c)}
            >
              {collapsed ? `Mostra tutti (${items.length})` : 'Nascondi elenco'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}