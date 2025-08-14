"use client";

import React, { useEffect, useMemo, useState } from "react";

// Tipi
interface LatLng { lat: number; lon: number }
interface RouteResult { durationSec?: number; distanceM?: number; error?: string }

type PlaceId =
  | 'piazza'
  | 'porto'
  | 'teatro'
  | 'lido'
  | 'stazione'
  | 'biblioteca'
  | 'lungomare_nord'
  | 'cuore_adriatico'
  | 'pista_ciclabile'
  | 'mercato_ittico'
  | 'stadio';

const PLACES: Record<PlaceId, { name: string; lat: number; lon: number }> = {
  piazza: { name: 'Piazza XX Settembre', lat: 43.3070, lon: 13.7280 },
  porto: { name: 'Porto di Civitanova', lat: 43.3050, lon: 13.7350 },
  teatro: { name: 'Teatro Rossini', lat: 43.3080, lon: 13.7260 },
  lido: { name: 'Lido Cluana', lat: 43.3020, lon: 13.7330 },
  stazione: { name: 'Stazione Ferroviaria', lat: 43.3090, lon: 13.7230 },
  biblioteca: { name: 'Biblioteca Silvio Zavatti', lat: 43.3076, lon: 13.7220 },
  lungomare_nord: { name: 'Lungomare Nord', lat: 43.3162, lon: 13.7318 },
  cuore_adriatico: { name: 'Centro Comm. Cuore Adriatico', lat: 43.2926, lon: 13.7225 },
  pista_ciclabile: { name: 'Pista Ciclabile', lat: 43.3048, lon: 13.7345 },
  mercato_ittico: { name: 'Mercato Ittico', lat: 43.3059, lon: 13.7372 },
  stadio: { name: 'Stadio Comunale Polisportivo', lat: 43.3069, lon: 13.7198 },
};

interface PairDef { id: string; from: PlaceId; to: PlaceId; label?: string }

const PAIRS: PairDef[] = [
  { id: 'porto-piazza', from: 'porto', to: 'piazza', label: 'Porto ⇄ Piazza' },
  { id: 'stazione-centro', from: 'stazione', to: 'piazza', label: 'Stazione ⇄ Centro' },
  { id: 'piazza-teatro', from: 'piazza', to: 'teatro', label: 'Piazza ⇄ Teatro' },
  { id: 'piazza-lido', from: 'piazza', to: 'lido', label: 'Piazza ⇄ Lido Cluana' },
  { id: 'porto-lido', from: 'porto', to: 'lido', label: 'Porto ⇄ Lido' },
  { id: 'stazione-porto', from: 'stazione', to: 'porto', label: 'Stazione ⇄ Porto' },
  { id: 'piazza-biblioteca', from: 'piazza', to: 'biblioteca', label: 'Piazza ⇄ Biblioteca' },
  { id: 'piazza-lungomare-nord', from: 'piazza', to: 'lungomare_nord', label: 'Piazza ⇄ Lungomare Nord' },
  { id: 'piazza-cuore-adriatico', from: 'piazza', to: 'cuore_adriatico', label: 'Piazza ⇄ Cuore Adriatico' },
  { id: 'piazza-pista-ciclabile', from: 'piazza', to: 'pista_ciclabile', label: 'Piazza ⇄ Pista Ciclabile' },
  { id: 'piazza-mercato-ittico', from: 'piazza', to: 'mercato_ittico', label: 'Piazza ⇄ Mercato Ittico' },
  { id: 'piazza-stadio', from: 'piazza', to: 'stadio', label: 'Piazza ⇄ Stadio' },
];

const fmtMinutes = (s?: number) => {
  if (!s || s <= 0) return '-';
  return `${Math.round(s / 60)} min`;
};
const fmtDistance = (m?: number) => {
  if (!m || m <= 0) return '-';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
};

function haversineM(a: LatLng, b: LatLng) {
  const R = 6371e3;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

async function osrmFoot(from: LatLng, to: LatLng): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/foot/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false&alternatives=false&steps=false`;
  try {
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error(`OSRM ${r.status}`);
    const data = await r.json();
    const route = data?.routes?.[0];
    if (!route) throw new Error('no-route');
    return { durationSec: route.duration, distanceM: route.distance };
  } catch (e) {
    const d = haversineM(from, to);
    const speed = 1.33; // 4.8 km/h
    return { durationSec: d / speed, distanceM: d, error: String(e) };
  }
}

export default function WalkingTimeWidget() {
  const [idx, setIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [results, setResults] = useState<Record<string, RouteResult>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(false);

  const pairs = useMemo(() => PAIRS, []);
  const total = pairs.length;
  const current = pairs[idx];
  const currRes = results[current?.id];

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      const entries: [string, RouteResult][] = await Promise.all(
        pairs.map(async (p) => {
          const from = PLACES[p.from];
          const to = PLACES[p.to];
          const res = await osrmFoot(from, to);
          return [p.id, res];
        })
      );
      if (!cancel) {
        setResults(Object.fromEntries(entries));
        setLoading(false);
      }
    })();
    return () => { cancel = true };
  }, [pairs]);

  const next = () => setIdx((i) => (i + 1) % total);
  const prev = () => setIdx((i) => (i - 1 + total) % total);

  const openMaps = async () => {
    const from = PLACES[current.from];
    const to = PLACES[current.to];
    const gmaps = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lon}&destination=${to.lat},${to.lon}&travelmode=walking`;
    window.open(gmaps, '_blank');
  };

  return (
    <div className={`parent ${selected ? 'isActive' : 'tilted'}`}>
      <div className="card" onClick={() => setSelected((s) => !s)} role="button" aria-label="Seleziona widget">
        <div className="logo">
          <span className="circle circle1"></span>
          <span className="circle circle2"></span>
          <span className="circle circle3"></span>
          <span className="circle circle4"></span>
          <span className="circle circle5">
            {/* Pin di posizione */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"></path>
            </svg>
          </span>
        </div>

        <div className="glass"></div>

        <div className="content">
          <span className="title">Percorsi a piedi</span>
          <span className="text">
            {current?.label}
            <br />
            <strong>{loading ? 'Calcolo…' : fmtMinutes(currRes?.durationSec)}</strong> • {loading ? '' : (currRes?.error ? 'stima' : 'reale')} {loading ? '' : `• ${fmtDistance(currRes?.distanceM)}`}
          </span>
        </div>

        <div className="bottom">
          <div className="social-buttons-container">
            {/* Prev */}
            <button className="social-button social-button1" aria-label="Precedente" onClick={(e) => { e.stopPropagation(); prev(); }}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M7 10l5 5 5-5z" fill="currentColor" />
              </svg>
            </button>
            {/* Mappe */}
            <button className="social-button social-button2" aria-label="Apri in mappe" onClick={(e) => { e.stopPropagation(); openMaps(); }}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M12 2c-3.314 0-6 2.686-6 6 0 5 6 12 6 12s6-7 6-12c0-3.314-2.686-6-6-6z" fill="none" stroke="currentColor" />
                <circle cx="12" cy="8" r="2" fill="currentColor" />
              </svg>
            </button>
            {/* Next */}
            <button className="social-button social-button3" aria-label="Successivo" onClick={(e) => { e.stopPropagation(); next(); }}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div className="view-more" onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}>
            <button className="view-more-button">Dettagli</button>
            <svg className="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </div>
        </div>

        {/* Pannello dettagli sovrapposto */}
        {expanded && (
          <div className="details-panel" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <span>Elenco percorsi</span>
              <span className="counter">{idx + 1} / {total}</span>
            </div>
            <div className="details-list">
              {pairs.map((p, i) => {
                const res = results[p.id];
                const active = i === idx;
                return (
                  <div key={p.id} className={`row ${active ? 'active' : ''}`}>
                    <div className="row-left">
                      <span className="label">{p.label}</span>
                      <span className="meta">{res?.error ? 'stima' : 'reale'} • {fmtDistance(res?.distanceM)}</span>
                    </div>
                    <div className="row-right">
                      <span className="time">{fmtMinutes(res?.durationSec)}</span>
                      <button className="show-btn" onClick={() => setIdx(i)}>Mostra</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* From Uiverse.io by Smit-Prajapati (adattato e reso responsive) */
        .parent {
          width: 100%;
          height: 240px;
          perspective: 1000px;
          position: relative;
        }
        @media (min-width: 420px) {
          .parent { height: 280px; }
        }

        .card {
          height: 100%;
          border-radius: 50px;
          background: linear-gradient(135deg, rgb(0, 255, 214) 0%, rgb(8, 226, 96) 100%);
          transition: all 0.5s ease-in-out;
          transform-style: preserve-3d;
          box-shadow: rgba(5, 71, 17, 0) 40px 50px 25px -40px, rgba(5, 71, 17, 0.2) 0px 25px 25px -5px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          will-change: transform;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .glass {
          transform-style: preserve-3d;
          position: absolute;
          inset: 8px;
          border-radius: 55px;
          border-top-right-radius: 100%;
          background: linear-gradient(0deg, rgba(255, 255, 255, 0.349) 0%, rgba(255, 255, 255, 0.815) 100%);
          -webkit-backdrop-filter: blur(5px);
          backdrop-filter: blur(5px);
          transform: translate3d(0px, 0px, 25px);
          border-left: 1px solid white;
          border-bottom: 1px solid white;
          transition: all 0.5s ease-in-out;
        }

        .content {
          padding: 20px 16px 0px 16px; /* leggermente più basso */
          transform: translate3d(0, 0, 26px);
        }
        @media (min-width: 420px) {
          .content { padding: 28px 28px 0px 20px; }
        }
        .content .title {
          display: block;
          color: #00894d;
          font-weight: 900;
          font-size: 22px; /* maggiore leggibilità */
        }
        .content .text {
          display: block;
          color: rgba(0, 137, 78, 0.7647058824);
          font-size: 15px; /* maggiore leggibilità */
          margin-top: 10px;
          line-height: 1.35rem;
        }

        .bottom {
          padding: 10px 12px;
          transform-style: preserve-3d;
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transform: translate3d(0, 0, 26px);
          z-index: 2;
        }
        .bottom .view-more {
          display: flex;
          align-items: center;
          width: 40%;
          justify-content: flex-end;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }
        .bottom .view-more:hover { transform: translate3d(0, 0, 10px); }
        .bottom .view-more .view-more-button {
          background: none;
          border: none;
          color: #00c37b;
          font-weight: bolder;
          font-size: 12px;
        }
        .bottom .view-more .svg {
          fill: none;
          stroke: #00c37b;
          stroke-width: 3px;
          max-height: 15px;
          margin-left: 6px;
        }
        .bottom .social-buttons-container { display: flex; gap: 10px; transform-style: preserve-3d; }
        .bottom .social-buttons-container .social-button {
          width: 30px; aspect-ratio: 1; padding: 5px; background: rgb(255, 255, 255); border-radius: 50%; border: none; display: grid; place-content: center; box-shadow: rgba(5, 71, 17, 0.5) 0px 7px 5px -5px; cursor: pointer;
        }
        .bottom .social-buttons-container .social-button .svg { width: 16px; fill: #00894d; stroke: #00894d; stroke-width: 2px; }
        .bottom .social-buttons-container .social-button:hover { background: black; }
        .bottom .social-buttons-container .social-button:hover .svg { fill: white; stroke: white; }
        .bottom .social-buttons-container .social-button:active { background: rgb(255, 234, 0); }
        .bottom .social-buttons-container .social-button:active .svg { fill: black; stroke: black; }

        .logo { position: absolute; right: 0; top: 0; transform-style: preserve-3d; }
        .logo .circle {
          display: block; position: absolute; aspect-ratio: 1; border-radius: 50%; top: 0; right: 0; box-shadow: rgba(100, 100, 111, 0.2) -10px 10px 20px 0px; -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); background: rgba(0, 249, 203, 0.2); transition: all 0.5s ease-in-out; will-change: transform;
        }
        .logo .circle1 { width: 170px; transform: translate3d(0, 0, 20px); top: 8px; right: 8px; }
        .logo .circle2 { width: 140px; transform: translate3d(0, 0, 40px); top: 10px; right: 10px; backdrop-filter: blur(1px); transition-delay: 0.4s; }
        .logo .circle3 { width: 110px; transform: translate3d(0, 0, 60px); top: 17px; right: 17px; transition-delay: 0.8s; }
        .logo .circle4 { width: 80px; transform: translate3d(0, 0, 80px); top: 23px; right: 23px; transition-delay: 1.2s; }
        .logo .circle5 { width: 50px; transform: translate3d(0, 0, 100px); top: 30px; right: 30px; display: grid; place-content: center; transition-delay: 1.6s; }
        .logo .circle5 .svg { width: 20px; fill: white; }

        .parent.tilted .card { transform: rotate3d(1, 1, 0, 30deg); box-shadow: rgba(5, 71, 17, 0.3) 30px 50px 25px -40px, rgba(5, 71, 17, 0.1) 0px 25px 30px 0px; }
        .parent.tilted .card .bottom .social-buttons-container .social-button { transform: translate3d(0, 0, 50px); box-shadow: rgba(5, 71, 17, 0.2) -5px 20px 10px 0px; }
        .parent.tilted .card .logo .circle2 { transform: translate3d(0, 0, 60px); }
        .parent.tilted .card .logo .circle3 { transform: translate3d(0, 0, 80px); }
        .parent.tilted .card .logo .circle4 { transform: translate3d(0, 0, 100px); }
        .parent.tilted .card .logo .circle5 { transform: translate3d(0, 0, 120px); }
        
        /* Stato attivo: card dritta */
        .parent.isActive .card { transform: none; box-shadow: rgba(5, 71, 17, 0) 40px 50px 25px -40px, rgba(5, 71, 17, 0.2) 0px 25px 25px -5px; }
        .parent.isActive .card .bottom .social-buttons-container .social-button { transform: none; box-shadow: rgba(5, 71, 17, 0.5) 0px 7px 5px -5px; }

        /* Stato premuto: feedback immediato anche senza stato selezionato */
        .parent:active .card { transform: none; box-shadow: rgba(5, 71, 17, 0) 40px 50px 25px -40px, rgba(5, 71, 17, 0.2) 0px 25px 25px -5px; }
        .parent:active .card .bottom .social-buttons-container .social-button { transform: none; box-shadow: rgba(5, 71, 17, 0.5) 0px 7px 5px -5px; }
        
        /* Pannello dettagli */
        .details-panel {
          position: absolute;
          left: 14px; right: 14px;
          top: 90px; bottom: 70px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 10px;
          backdrop-filter: blur(6px);
          transform: translate3d(0,0,60px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 3;
        }
        .details-header { display: flex; align-items: center; justify-content: space-between; color: white; font-weight: 600; font-size: 12px; margin-bottom: 6px; }
        .details-header .counter { font-weight: 500; opacity: 0.9; }
        .details-list { flex: 1; overflow: auto; }
        .row { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 8px; color: white; font-size: 12px; margin-bottom: 6px; }
        .row.active { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.3); }
        .row-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .row-left .label { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .row-left .meta { opacity: 0.85; font-size: 11px; }
        .row-right { display: flex; align-items: center; gap: 8px; }
        .row-right .time { font-weight: 700; }
        .show-btn { padding: 4px 8px; font-size: 11px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.4); background: transparent; color: white; cursor: pointer; }
        .show-btn:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
}
