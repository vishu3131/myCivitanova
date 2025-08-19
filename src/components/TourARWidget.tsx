'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Glasses, MapPin, Landmark, Info, Camera, Users, Sparkles, Compass } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <MapPin className="w-6 h-6 text-fuchsia-400 mr-2" />,
    title: 'Mappa Interattiva',
    description: 'Visualizza i punti di interesse direttamente sulla mappa AR.',
    popup:
      'La mappa interattiva ti guiderà tra monumenti, musei e attrazioni, mostrando informazioni contestuali in tempo reale.',
  },
  {
    icon: <Landmark className="w-6 h-6 text-indigo-300 mr-2" />,
    title: 'Monumenti e Storia',
    description: 'Scopri la storia dei luoghi mentre li osservi.',
    popup:
      'Avvicinati ai monumenti e ricevi dettagli storici, curiosità e aneddoti direttamente sullo schermo.',
  },
  {
    icon: <Info className="w-6 h-6 text-purple-300 mr-2" />,
    title: 'Informazioni Utili',
    description: 'Orari, servizi e contatti sempre a portata di mano.',
    popup:
      'Ottieni informazioni pratiche su orari di apertura, servizi disponibili e contatti utili per ogni punto di interesse.',
  },
  {
    icon: <Camera className="w-6 h-6 text-pink-300 mr-2" />,
    title: 'Foto e Ricordi',
    description: 'Scatta foto AR e condividi la tua esperienza.',
    popup:
      'Cattura momenti unici con la fotocamera AR e condividi le tue avventure con amici e familiari.',
  },
  {
    icon: <Users className="w-6 h-6 text-yellow-300 mr-2" />,
    title: 'Tour di Gruppo',
    description: 'Partecipa a tour guidati virtuali con altri utenti.',
    popup:
      'Unisciti a tour di gruppo, interagisci con altri visitatori e vivi esperienze condivise in realtà aumentata.',
  },
];

type DemoHotspot = {
  id: string;
  title: string;
  subtitle: string;
  distanceM: number;
  xPercent: number; // 0-100
  yPercent: number; // 0-100
  colorClass: string;
};

export const TourARWidget = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [hotspots, setHotspots] = useState<DemoHotspot[]>([]);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initHotspots = useCallback(() => {
    const demo: DemoHotspot[] = [
      {
        id: 'duomo',
        title: 'Piazza XX Settembre',
        subtitle: 'Cuore della città',
        distanceM: 320,
        xPercent: 18,
        yPercent: 52,
        colorClass: 'from-fuchsia-400 to-purple-400',
      },
      {
        id: 'museo',
        title: 'Museo Magazzino',
        subtitle: 'Arte e cultura',
        distanceM: 610,
        xPercent: 62,
        yPercent: 34,
        colorClass: 'from-indigo-300 to-blue-400',
      },
      {
        id: 'porto',
        title: 'Porto di Civitanova',
        subtitle: 'Passeggiata sul mare',
        distanceM: 980,
        xPercent: 76,
        yPercent: 68,
        colorClass: 'from-emerald-300 to-teal-400',
      },
    ];
    setHotspots(demo);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStreamError('La fotocamera non è supportata su questo dispositivo/browser.');
      return;
    }
    try {
      setStreamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setStreamError('Permesso negato o dispositivo non disponibile.');
    }
  }, []);

  const startDemo = useCallback(async () => {
    setIsDemoActive(true);
    setIsScanning(true);
    initHotspots();
    try {
      setIsStartingCamera(true);
      await startCamera();
    } finally {
      setIsStartingCamera(false);
    }
  }, [initHotspots, startCamera]);

  const stopDemo = useCallback(() => {
    setIsDemoActive(false);
    setIsScanning(false);
    setScanStep(0);
    stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    let timer: number | undefined;
    if (isScanning) {
      timer = window.setInterval(() => {
        setScanStep((s) => (s + 1) % 100);
      }, 120);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isScanning]);

  // Respect user motion preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    setReduceMotion(mq.matches);
    try {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } catch {
      // Safari fallback
      // @ts-ignore
      mq.addListener?.(onChange);
      return () => {
        // @ts-ignore
        mq.removeListener?.(onChange);
      };
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <section className="relative p-4 md:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between overflow-hidden min-h-[280px] md:min-h-[220px] col-span-2 bg-dark-300/50 backdrop-blur-sm card-glow border border-white/10">
      {/* FX Background */}
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen">
        <div className="absolute -inset-40 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.35),transparent_40%)]" />
      </div>

      {/* Left: Copy + CTA */}
      <div className="relative z-10 md:w-1/2 pr-0 md:pr-6 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Glasses className="w-8 h-8 text-white/90" />
          <span className="px-2 py-1 bg-white/10 text-white rounded-full text-[11px] font-semibold tracking-wide">
            AR Tour • Anteprima
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2 text-white leading-tight">
          Esperienza AR di Civitanova
        </h2>
        <p className="text-white/85 mb-3 text-sm md:text-base max-w-xl">
          Inquadra, scansiona e scopri curiosità sui luoghi attorno a te. Questa è una demo interattiva:
          avvia la fotocamera e prova l&apos;overlay in realtà aumentata.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {!isDemoActive ? (
            <button
              onClick={startDemo}
              className="h-11 px-5 w-full bg-emerald-400 text-black font-semibold rounded-xl shadow hover:bg-emerald-300 transition-all text-sm md:text-base flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Avvia Demo AR
            </button>
          ) : (
            <button
              onClick={stopDemo}
              className="h-11 px-5 w-full bg-white/15 text-white font-semibold rounded-xl shadow hover:bg-white/25 transition-all text-sm md:text-base"
            >
              Arresta Demo
            </button>
          )}

          <Link
            href="/ar"
            className="h-11 px-5 w-full bg-white text-[#302b63] font-semibold rounded-xl shadow hover:bg-white/90 transition-all text-sm md:text-base inline-flex items-center justify-center"
          >
            Vai al servizio completo
          </Link>
        </div>

        {/* Feature Pills */}
        <ul className="w-full max-w-lg mt-3 hidden md:block">
          {features.slice(0, 3).map((f, i) => (
            <li key={f.title} className="mb-1">
              <button
                className="w-full h-11 flex items-center bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 font-medium shadow transition-all text-sm md:text-base"
                onClick={() => setSelected(i)}
              >
                {f.icon}
                <span className="flex-1 text-left">{f.title}</span>
                <span className="ml-2 text-xs text-white/70 hidden xl:inline">{f.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Camera + AR Overlay */}
      <div className="relative z-10 md:w-1/2 mt-4 md:mt-0">
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/15 bg-black">
          {/* Camera Feed */}
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="Anteprima fotocamera per esperienza AR"
            aria-describedby="ar-instructions"
            className={`absolute inset-0 w-full h-full object-cover ${isDemoActive ? 'opacity-100' : 'opacity-30'} transition-opacity`}
          />

          <div id="ar-instructions" className="sr-only">
            Quando attivi la demo, la fotocamera posteriore si avvia. Sposta il telefono per cercare punti di interesse.
            I contenuti in sovrimpressione mostrano nome, distanza e categoria del luogo.
          </div>

          {/* Placeholder when inactive */}
          {!isDemoActive && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center text-white/80">
                <div className="text-lg font-semibold mb-1">Anteprima Realtà Aumentata</div>
                <div className="text-xs opacity-80">Tocca su “Avvia Demo AR” per attivare la fotocamera</div>
              </div>
            </div>
          )}

          {/* Futuristic HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corners */}
            <div className="absolute inset-3 border border-white/15 rounded-xl" />
            {/* Center reticle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/30" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />

            {/* Scanning line */}
            {isDemoActive && !reduceMotion && (
              <div className="absolute left-0 right-0" style={{ top: `${10 + (scanStep * 0.8)}%` }}>
                <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            )}

            {/* Top HUD */}
            <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[10px] text-white/70">
              <div className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>AR DEMO</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-white/10">SCAN {String(scanStep).padStart(2, '0')}%</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10">HD</span>
              </div>
            </div>

            {/* Hotspots (simulated) */}
            {isDemoActive && hotspots.map((h) => (
              <div
                key={h.id}
                className="absolute select-none"
                style={{ left: `${h.xPercent}%`, top: `${h.yPercent}%` }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className={`px-3 py-2 rounded-lg text-[11px] text-white bg-gradient-to-r ${h.colorClass} shadow-lg shadow-black/40 backdrop-blur-sm`}> 
                    <div className="font-semibold leading-tight">{h.title}</div>
                    <div className="opacity-90">{h.subtitle}</div>
                    <div className="mt-0.5 text-[10px] opacity-80">≈ {h.distanceM} m</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom HUD */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-white/70">
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-white/10">GPS • OK</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10">Stabilizzazione</span>
              </div>
              <div className="px-1.5 py-0.5 rounded bg-white/10">Civitanova Marche</div>
            </div>
          </div>

          {/* Loading overlay while starting camera */}
          {isStartingCamera && (
            <div className="absolute inset-0 grid place-items-center bg-black/50">
              <div className="flex items-center gap-2 text-white/90">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true"></span>
                <span className="text-sm font-medium">Avvio fotocamera…</span>
              </div>
            </div>
          )}

          {/* Inline controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
            {!isDemoActive ? (
              <button
                onClick={startDemo}
                className="h-11 px-5 bg-emerald-400 text-black font-semibold rounded-full shadow hover:bg-emerald-300 transition-all text-sm"
                aria-label="Avvia demo realtà aumentata"
              >
                Avvia Demo
              </button>
            ) : (
              <button
                onClick={stopDemo}
                className="h-11 px-5 bg-white/15 text-white font-semibold rounded-full shadow hover:bg-white/25 transition-all text-sm"
                aria-label="Arresta demo realtà aumentata"
              >
                Arresta
              </button>
            )}
            <span className="px-2 py-1 rounded-full bg-white/10 text-white/80 text-[10px] hidden sm:inline">
              Sicurezza: fai attenzione all’ambiente
            </span>
          </div>

          {/* Camera error */}
          {streamError && (
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-2 text-[11px] text-yellow-200 bg-yellow-900/60" role="status" aria-live="polite">{streamError}</div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Popup */}
      {selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setSelected(null)}
              aria-label="Chiudi"
            >
              ×
            </button>
            <div className="flex items-center mb-3">
              {features[selected].icon}
              <h3 className="ml-2 text-lg font-heading font-bold text-indigo-700">{features[selected].title}</h3>
            </div>
            <p className="text-gray-700 mb-2 font-medium text-sm">{features[selected].popup}</p>
          </div>
        </div>
      )}

      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/10 pointer-events-none rounded-2xl" />
    </section>
  );
};
