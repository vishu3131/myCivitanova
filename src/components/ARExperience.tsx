"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from '@/utils/supabaseClient';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneContainerRef = useRef<HTMLDivElement | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect if DeviceOrientation permission is required (iOS >= 13)
  useEffect(() => {
    const needsPermission =
      typeof window !== "undefined" &&
      (window as any).DeviceOrientationEvent &&
      typeof (window as any).DeviceOrientationEvent.requestPermission ===
        "function";
    if (needsPermission) setShowOrientationPrompt(true);
  }, []);

  // Cache for POIs to avoid unnecessary re-fetching
  const poisCacheRef = useRef<{ data: ARPoi[]; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Load POIs from Supabase with improved error handling, retry logic, and caching
  const loadPois = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first
      if (!forceRefresh && poisCacheRef.current) {
        const { data: cachedData, timestamp } = poisCacheRef.current;
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired && cachedData.length > 0) {
          setPois(cachedData);
          setStatus(`${cachedData.length} POI (cache) - GPS attivo`);
          setIsLoading(false);
          return;
        }
      }
      
      setIsLoading(true);
      setError(null);
      setStatus("Carico i punti di interesse...");
      
      // Set a timeout for loading
      loadingTimeoutRef.current = setTimeout(() => {
        setStatus("Caricamento in corso... Verifica la connessione");
      }, 5000);
      
      const { data, error } = await supabase
        .from("pois")
        .select("*")
        .order('created_at', { ascending: false });
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      if (error) {
        console.error('Errore caricamento POI:', error);
        throw new Error(`Errore database: ${error.message}`);
      }
      
      const mapped = (data || [])
        .map(mapDbPoi)
        .filter(Boolean) as ARPoi[];
      
      if (mapped.length === 0) {
        console.warn("Nessun POI trovato nel database, uso POI di test");
        setPois(testPoi);
        setStatus("Modo demo: usando POI di test");
        // Don't cache test data
      } else {
        setPois(mapped);
        setStatus(`${mapped.length} POI caricati - GPS attivo`);
        // Cache the data
        poisCacheRef.current = {
          data: mapped,
          timestamp: Date.now()
        };
      }
      
      setRetryCount(0);
    } catch (err: any) {
      console.error("Errore caricamento POI:", err);
      setError(err.message || "Errore sconosciuto");
      
      // Try to use cached data as fallback
      if (poisCacheRef.current?.data.length) {
        setPois(poisCacheRef.current.data);
        setStatus("Errore rete - Usando cache locale");
      } else {
        setPois(testPoi);
        setStatus("Errore caricamento - Modo demo attivo");
      }
    } finally {
      setIsLoading(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }, [CACHE_DURATION]);
  
  useEffect(() => {
    loadPois();
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loadPois]);

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
        if (poi) {
          setSelectedPoi(poi);
          // Provide haptic feedback if available
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }
      };
      el.addEventListener("click", handler);
      handlers.push({ el, handler });
    });

    return () => {
      handlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
    };
  }, [pois]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

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
    async (url?: string | null) => {
      if (!url) {
        console.warn("URL audio non fornito");
        return;
      }
      
      try {
        // Stop current audio if playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        
        // Create new audio instance
        const audio = new Audio(url);
        audioRef.current = audio;
        
        // Set up event listeners
        audio.onended = () => {
          setIsAudioPlaying(false);
          setAudioUrl(null);
        };
        
        audio.onerror = (e) => {
          console.error("Errore riproduzione audio:", e);
          setIsAudioPlaying(false);
          setAudioUrl(null);
          setStatus("Errore riproduzione audio");
          setTimeout(() => setStatus("GPS attivo: cerca i punti vicini..."), 3000);
        };
        
        audio.onloadstart = () => {
          setStatus("Caricamento audio...");
        };
        
        audio.oncanplay = () => {
          setStatus("Audio pronto");
        };
        
        // Attempt to play
        await audio.play();
        setIsAudioPlaying(true);
        setAudioUrl(url);
        setStatus("Riproduzione audio in corso...");
        
      } catch (error: any) {
        console.error("Errore riproduzione audio:", error);
        setIsAudioPlaying(false);
        setAudioUrl(null);
        
        // Provide user-friendly error messages
        if (error.name === "NotAllowedError") {
          setStatus("Riproduzione bloccata - Tocca per riprovare");
        } else if (error.name === "NotSupportedError") {
          setStatus("Formato audio non supportato");
        } else {
          setStatus("Errore riproduzione audio");
        }
        
        setTimeout(() => setStatus("GPS attivo: cerca i punti vicini..."), 3000);
      }
    },
    []
  );

  const onToggleAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    try {
      if (audio.paused) {
        await audio.play();
        setIsAudioPlaying(true);
        setStatus("Riproduzione audio in corso...");
      } else {
        audio.pause();
        setIsAudioPlaying(false);
        setStatus("Audio in pausa");
      }
    } catch (error: any) {
      console.error("Errore toggle audio:", error);
      setIsAudioPlaying(false);
      setStatus("Errore controllo audio");
      setTimeout(() => setStatus("GPS attivo: cerca i punti vicini..."), 3000);
    }
  }, []);

  // Memoize POI rendering to avoid unnecessary re-renders
  const renderedPois = useMemo(() => {
    if (pois.length === 0) return null;
    
    return pois.map((poi, index) => {
      const title = poi.name || "POI";
      const icon = poi.icon_3d_url || "";
      const isSelected = selectedPoi?.id === poi.id;
      
      return (
        // @ts-expect-error A-Frame JSX
        <a-entity
          key={`${poi.id}-${resetNonce}`}
          className="poi-entity clickable"
          data-poi-id={String(poi.id)}
          gps-entity-place={`latitude: ${poi.lat}; longitude: ${poi.lng};`}
          animation__mouseenter="property: scale; to: 1.2 1.2 1.2; startEvents: mouseenter; dur: 200"
          animation__mouseleave="property: scale; to: 1 1 1; startEvents: mouseleave; dur: 200"
          animation__selected={isSelected ? "property: rotation; to: 0 360 0; dur: 2000; loop: true" : ""}
        >
          {/* Billboard (icon) */}
          {/* @ts-expect-error */}
          <a-plane
            position="0 2 0"
            width="2.2"
            height="2.2"
            material={`color: ${isSelected ? '#ffff00' : '#111'}; src: ${icon}; transparent: true; opacity: ${isSelected ? '1.0' : '0.95'}; side:double; alphaTest: 0.1`}
            className="poi-entity clickable"
          ></a-plane>
          {/* Text label */}
          {/* @ts-expect-error */}
          <a-text
            value={title}
            position="0 3.4 0"
            align="center"
            width="6"
            color={isSelected ? "#ffff00" : "#FFFFFF"}
            className="poi-entity clickable"
            material="transparent: true"
            shader="msdf"
          ></a-text>
          {/* Distance indicator */}
          {/* @ts-expect-error */}
          <a-text
            value={`📍 ${index + 1}`}
            position="0 1 0"
            align="center"
            width="4"
            color={isSelected ? "#ffff00" : "#00ff00"}
            className="poi-entity clickable"
            material="transparent: true"
            shader="msdf"
          ></a-text>
          {/* Audio indicator */}
          {poi.audio_url && (
            /* @ts-expect-error */
            <a-text
              value="🔊"
              position="1.5 0.5 0"
              align="center"
              width="2"
              color={isAudioPlaying && audioUrl === poi.audio_url ? "#ff0000" : "#ffffff"}
              className="poi-entity clickable"
              material="transparent: true"
              shader="msdf"
            ></a-text>
          )}
        </a-entity>
      );
    });
  }, [pois, resetNonce, selectedPoi, isAudioPlaying, audioUrl]);

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
            // Reset audio when switching camera
            if (audioRef.current) {
              audioRef.current.pause();
              setIsAudioPlaying(false);
            }
            setSelectedPoi(null);
          }}
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90 backdrop-blur-md hover:bg-white/15 active:scale-[0.99]"
          disabled={isLoading}
        >
          {cameraFacing === "environment" ? "📷 Frontale" : "📷 Posteriore"}
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
            setError(null);
            setStatus("Reinizializzo AR...");
            setResetNonce((n) => n + 1);
            if (audioRef.current) {
              setIsAudioPlaying(false);
              setAudioUrl(null);
            }
            // Reload POIs after reset
            setTimeout(() => loadPois(true), 1000);
          }}
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90 backdrop-blur-md hover:bg-white/15 active:scale-[0.99]"
          disabled={isLoading}
        >
          Reset AR
        </button>
        
        {error && (
          <button
            onClick={() => {
              setRetryCount(prev => prev + 1);
              loadPois(true); // Force refresh
            }}
            className="px-3 py-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-100 backdrop-blur-md hover:bg-red-500/30 active:scale-[0.99]"
            disabled={isLoading}
          >
            🔄 Riprova ({retryCount + 1})
          </button>
        )}
        
        <button
          onClick={() => loadPois(true)}
          className="px-3 py-2 rounded-xl bg-green-500/20 border border-green-400/30 text-green-100 backdrop-blur-md hover:bg-green-500/30 active:scale-[0.99]"
          disabled={isLoading}
          title="Aggiorna POI dal database"
        >
          🔄 Aggiorna
        </button>
      </div>
      {/* Status / Toast */}
      <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-40 text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15">
        <div className={`flex items-center gap-2 ${
          error 
            ? 'bg-red-500/50 text-red-100 border-red-400/30'
            : isLoading
            ? 'bg-blue-500/50 text-blue-100 border-blue-400/30'
            : 'bg-white/10 text-white'
        }`}>
          {isLoading && (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          )}
          {error && <span>⚠️</span>}
          <span>{status}</span>
        </div>
        {error && (
          <div className="text-xs mt-1 opacity-80 text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Orientation permission prompt (iOS) */}
      {showOrientationPrompt && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 text-center shadow-2xl animate-[fadeIn_.3s_ease]">
            <h3 className="text-lg font-semibold mb-2">Abilita Bussola</h3>
            <p className="text-white/80 text-sm mb-4">
              Per orientare correttamente i POI è necessario abilitare l&apos;accesso ai sensori.
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
          renderer="colorManagement: true; physicallyCorrectLights: true; antialias: true; logarithmicDepthBuffer: true; alpha: true"
          arjs={`sourceType: webcam; facingMode: ${cameraFacing}; videoTexture: true; debugUIEnabled: false; trackingMethod: best; maxDetectionRate: 60; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960;`}
          className="block h-full w-full"
          loading-screen="enabled: false"
          device-orientation-permission-ui="enabled: false"
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
          {renderedPois}
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
            <div className="absolute inset-x-0 bottom-4 text-center z-20">
              <p className="text-white text-sm bg-black/50 rounded-full px-4 py-2">
                Tocca un&apos;icona per vedere i dettagli
              </p>
            </div>
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


