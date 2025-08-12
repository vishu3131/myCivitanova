"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

type ARPoi = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  audio_url?: string | null;
  icon_3d_url?: string | null;
};

const testPoi: ARPoi[] = [
  {
    id: 1,
    name: "Museo Storico",
    lat: 45.4641,
    lng: 9.1919,
    description:
      "Un museo che racconta la storia della città con reperti unici.",
    audio_url: "https://example.com/audio/museo.mp3",
    icon_3d_url: "https://example.com/icons/museum.png",
  },
  {
    id: 2,
    name: "Parco Centrale",
    lat: 45.4655,
    lng: 9.1859,
    description:
      "Un'oasi verde nel cuore della città, perfetta per una passeggiata.",
    audio_url: "https://example.com/audio/parco.mp3",
    icon_3d_url: "https://example.com/icons/park.png",
  },
];

function mapDbPoi(row: any): ARPoi | null {
  if (!row) return null;
  const lat = row.lat ?? row.latitude;
  const lng = row.lng ?? row.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    id: row.id,
    name: row.name ?? row.title ?? "POI",
    lat,
    lng,
    description: row.description ?? row.address ?? undefined,
    audio_url: row.audio_url ?? null,
    icon_3d_url: row.icon_3d_url ?? row.imageUrl ?? null,
  };
}

export default function ARExperience() {
  const [pois, setPois] = useState<ARPoi[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<ARPoi | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false);
  const [status, setStatus] = useState<string>("Avvio AR...");
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">(
    "environment"
  );
  const [resetNonce, setResetNonce] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);

  // Detect if DeviceOrientation permission is required (iOS >= 13)
  useEffect(() => {
    const needsPermission =
      typeof window !== "undefined" &&
      (window as any).DeviceOrientationEvent &&
      typeof (window as any).DeviceOrientationEvent.requestPermission ===
        "function";
    if (needsPermission) setShowOrientationPrompt(true);
  }, []);

  // Load POIs from Supabase with fallback
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Carico i punti di interesse...");
        const { data, error } = await supabase.from("pois").select("*");
        if (error) throw error;
        const mapped = (data || [])
          .map(mapDbPoi)
          .filter(Boolean) as ARPoi[];
        if (!cancelled) {
          setPois(mapped.length ? mapped : testPoi);
          setStatus("GPS attivo: cerca i punti vicini...");
        }
      } catch (_e) {
        if (!cancelled) {
          setPois(testPoi);
          setStatus("Modo demo: usando POI di test");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Attach click listeners to A-Frame entities once they exist in the DOM
  useEffect(() => {
    if (!sceneContainerRef.current) return;
    const root = sceneContainerRef.current;
    const elements = root.querySelectorAll(".poi-entity");
    const handlers: Array<{ el: Element; handler: any }> = [];

    elements.forEach((el) => {
      const handler = (e: any) => {
        const id = (el as HTMLElement).dataset["poiId"];
        const poi = pois.find((p) => String(p.id) === String(id));
        if (poi) setSelectedPoi(poi);
      };
      el.addEventListener("click", handler);
      handlers.push({ el, handler });
    });

    return () => {
      handlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
    };
  }, [pois]);

  const requestOrientationPermission = useCallback(async () => {
    try {
      const g = (window as any).DeviceOrientationEvent;
      if (g && typeof g.requestPermission === "function") {
        const resp = await g.requestPermission();
        if (resp === "granted") setShowOrientationPrompt(false);
      } else {
        setShowOrientationPrompt(false);
      }
    } catch (_e) {
      setShowOrientationPrompt(false);
    }
  }, []);

  const onPlayAudio = useCallback(
    (url?: string | null) => {
      if (!url) return;
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(url);
        } else {
          audioRef.current.pause();
          audioRef.current.src = url;
        }
        audioRef.current.onended = () => setIsAudioPlaying(false);
        audioRef.current.play().then(() => setIsAudioPlaying(true));
        setAudioUrl(url);
      } catch (_e) {
        // ignore
      }
    },
    []
  );

  const onToggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, []);

  // Ensure 100dvh on mobile (accounting for dynamic toolbar)
  const containerStyle = useMemo<React.CSSProperties>(
    () => ({ height: "100dvh", width: "100vw", position: "relative" }),
    []
  );

  return (
    <div className="relative overflow-hidden" style={containerStyle}>
      {/* Controls */}
      <div className="absolute top-3 right-3 z-50 flex flex-col gap-2">
        <button
          onClick={() => {
            setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
            setStatus("Cambio fotocamera...");
            setResetNonce((n) => n + 1);
          }}
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90 backdrop-blur-md hover:bg-white/15 active:scale-[0.99]"
        >
          {cameraFacing === "environment" ? "Usa camera frontale" : "Usa camera posteriore"}
        </button>
        <button
          onClick={() => {
            try {
              // Stop audio if playing
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
            } catch {}
            setSelectedPoi(null);
            setStatus("Reinizializzo AR...");
            setResetNonce((n) => n + 1);
          }}
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90 backdrop-blur-md hover:bg-white/15 active:scale-[0.99]"
        >
          Reset AR
        </button>
      </div>
      {/* Status / Toast */}
      <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-40 text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white">
        {status}
      </div>

      {/* Orientation permission prompt (iOS) */}
      {showOrientationPrompt && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 text-center shadow-2xl animate-[fadeIn_.3s_ease]">
            <h3 className="text-lg font-semibold mb-2">Abilita Bussola</h3>
            <p className="text-white/80 text-sm mb-4">
              Per orientare correttamente i POI è necessario abilitare l'accesso ai sensori.
            </p>
            <button
              onClick={requestOrientationPermission}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-bold shadow-lg active:scale-[0.99]"
            >
              Consenti orientamento
            </button>
          </div>
        </div>
      )}

      {/* A-Frame Scene */}
      <div ref={sceneContainerRef} className="h-full w-full">
        {/* We intentionally render raw a-scene; AR.js is loaded on the page via Script */}
        {/* @ts-expect-error - A-Frame is not typed in JSX */}
        <a-scene
          key={`scene-${cameraFacing}-${resetNonce}`}
          vr-mode-ui="enabled: false"
          embedded
          renderer="colorManagement: true; physicallyCorrectLights: true; antialias: true"
          arjs={`sourceType: webcam; facingMode: ${cameraFacing}; videoTexture: true; debugUIEnabled: false; trackingMethod: best;`}
          className="block h-full w-full"
        >
          {/* Camera with gps and cursor for tap interactions */}
          {/* @ts-expect-error */}
          <a-entity
            gps-camera="minDistance: 1; maxDistance: 10000;"
            look-controls="enabled: true; touchEnabled: true; mouseEnabled: false;"
          >
            {/* @ts-expect-error */}
            <a-entity cursor="rayOrigin: mouse; fuse: false" raycaster="objects: .clickable"></a-entity>
          </a-entity>

          {/* Light to make planes readable */}
          {/* @ts-expect-error */}
          <a-entity light="type: ambient; color: #BBB; intensity: 1.0"></a-entity>
          {/* @ts-expect-error */}
          <a-entity light="type: directional; color: #FFF; intensity: 0.6" position="1 1 0"></a-entity>

          {/* POIs */}
          {pois.map((poi) => {
            const title = poi.name || "POI";
            const icon = poi.icon_3d_url || "";
            return (
              // @ts-expect-error A-Frame JSX
              <a-entity
                key={poi.id}
                className="poi-entity clickable"
                data-poi-id={String(poi.id)}
                gps-entity-place={`latitude: ${poi.lat}; longitude: ${poi.lng};`}
              >
                {/* Billboard (icon) */}
                {/* @ts-expect-error */}
                <a-plane
                  position="0 2 0"
                  width="2.2"
                  height="2.2"
                  material={`color: #111; src: ${icon}; transparent: true; opacity: 0.95; side:double`}
                  className="poi-entity clickable"
                ></a-plane>
                {/* Label */}
                {/* @ts-expect-error */}
                <a-text
                  value={title}
                  position="0 3.4 0"
                  align="center"
                  width="6"
                  color="#FFFFFF"
                  className="poi-entity clickable"
                ></a-text>
              </a-entity>
            );
          })}
        </a-scene>
      </div>

      {/* Info Panel (Bottom Sheet) */}
      {selectedPoi && (
        <div
          className="absolute inset-x-0 z-50 p-3"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 72px)" }}
        >
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden animate-[slideUp_.28s_ease]">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400/70 to-fuchsia-500/70 border border-white/20 shadow-inner"></div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-tight line-clamp-2">
                    {selectedPoi.name}
                  </h3>
                  {selectedPoi.description && (
                    <p className="mt-1 text-sm text-white/80 line-clamp-3">
                      {selectedPoi.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {selectedPoi.audio_url ? (
                  <button
                    onClick={() =>
                      audioUrl === selectedPoi.audio_url
                        ? onToggleAudio()
                        : onPlayAudio(selectedPoi.audio_url)
                    }
                    className="flex-1 py-3 rounded-2xl font-bold text-black bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-lg active:scale-[0.99]"
                  >
                    {audioUrl === selectedPoi.audio_url && isAudioPlaying
                      ? "Pausa Audio"
                      : "Ascolta"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-3 rounded-2xl font-semibold text-white/60 bg-white/10 border border-white/10"
                  >
                    Audio non disponibile
                  </button>
                )}
                <button
                  onClick={() => setSelectedPoi(null)}
                  className="px-4 py-3 rounded-2xl font-semibold bg-white/10 border border-white/15 text-white/90"
                >
                  Chiudi
                </button>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400"></div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        /* Make the canvas fill mobile viewport reliably */
        a-scene, .a-canvas, .a-enter-vr, .a-orientation-modal {
          touch-action: none;
        }
      `}</style>
    </div>
  );
}


