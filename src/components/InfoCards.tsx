"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sun, Settings, Newspaper, Map, Waves, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntegratedWidgetBar } from './IntegratedWidgetBar';
import ModernServicesWidget from './ModernServicesWidget';
import { TutorialWidget } from './TutorialWidget';
import Link from 'next/link';

interface InfoCardsProps {
  onReportClick?: () => void;
  userId?: string;
}

export function InfoCards({ onReportClick, userId }: InfoCardsProps) {
  const router = useRouter();
  const [heartActive, setHeartActive] = useState(false);
  const [prevSlide, setPrevSlide] = useState(0);
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [offset, setOffset] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const SLIDE_MS = 3500;

  // Carousel murales - eccentric scrolling + spray overlay
  // Inserisci qui i tuoi file locali sotto public/murales (rinominali come suggerito oppure aggiorna questo array)
  const muralImages = [
    "/murales/mural-1.jpg",
    "/murales/mural-2.jpg",
    "/murales/mural-3.jpg",
    "/murales/mural-4.jpg",
    "/murales/mural-5.jpg",
    "/murales/mural-6.jpg",
    "/murales/mural-7.jpg",
    "/murales/mural-8.jpg",
    "/murales/mural-9.jpg",
    "/murales/mural-10.jpg",
    "/murales/mural-11.jpg",
    "/murales/mural-12.jpg",
    "/murales/mural-13.jpg",
  ];
  const [slide, setSlide] = useState(0);
  const [animMs, setAnimMs] = useState(1000);
  const [jitter, setJitter] = useState<{x:number;y:number;r:number;s:number}>({ x: 0, y: 0, r: 0, s: 1 });
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setSlide((p) => {
        const next = (p + 1) % muralImages.length;
        setPrevSlide(p);
        return next;
      });
      const dur = reducedMotionRef.current ? 0 : Math.floor(Math.random() * (1500 - 800) + 800);
      setAnimMs(dur);
      setJitter(
        reducedMotionRef.current
          ? { x: 0, y: 0, r: 0, s: 1 }
          : {
              x: Math.random() * 8 - 4,
              y: Math.random() * 6 - 3,
              r: Math.random() * 3 - 1.5,
              s: 0.97 + Math.random() * 0.03,
            }
      );
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [isPaused]);

  // Pause autoplay when tab is hidden
  useEffect(() => {
    const onVis = () => setIsPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const goNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlide((p) => {
      const next = (p + 1) % muralImages.length;
      setPrevSlide(p);
      return next;
    });
    const dur = reducedMotionRef.current ? 0 : Math.floor(Math.random() * (1500 - 800) + 800);
    setAnimMs(dur);
    setJitter(
      reducedMotionRef.current
        ? { x: 0, y: 0, r: 0, s: 1 }
        : {
            x: Math.random() * 8 - 4,
            y: Math.random() * 6 - 3,
            r: Math.random() * 3 - 1.5,
            s: 0.97 + Math.random() * 0.03,
          }
    );
  };

  const goPrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlide((p) => {
      const prev = (p - 1 + muralImages.length) % muralImages.length;
      setPrevSlide(prev);
      return prev;
    });
    const dur = reducedMotionRef.current ? 0 : Math.floor(Math.random() * (1500 - 800) + 800);
    setAnimMs(dur);
    setJitter(
      reducedMotionRef.current
        ? { x: 0, y: 0, r: 0, s: 1 }
        : {
            x: Math.random() * 8 - 4,
            y: Math.random() * 6 - 3,
            r: Math.random() * 3 - 1.5,
            s: 0.97 + Math.random() * 0.03,
          }
    );
  };

  const handleCardClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    router.push('/arte');
  };

  useEffect(() => {
    const compute = () => {
      if (!containerRef.current || !naturalSize) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      const ratio = naturalSize.w / naturalSize.h;
      let w = cw;
      let h = w / ratio;
      if (h > ch) {
        h = ch;
        w = h * ratio;
      }
      w *= 0.92;
      h *= 0.92;
      setImgSize({ w, h });
      setOffset({ left: (cw - w) / 2, top: (ch - h) / 2 });
    };
    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [naturalSize, slide]);

  return (
    <div style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '24px' }}>
      <div className="space-y-4">
        {/* Prima riga: Arte a Civitanova */}
        <div className="space-y-3">
          {/* Card immagine luogo - Carosello murales migliorato */}
          <div
            className="relative h-[240px] rounded-[20px] overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-gray-900 to-black"
            role="region"
            aria-roledescription="carousel"
            aria-label="Galleria murales - Arte a Civitanova"
            aria-live="polite"
            onClick={handleCardClick}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={(e) => { 
              touchStartXRef.current = e.touches[0].clientX; 
              setIsPaused(true);
            }}
            onTouchEnd={(e) => {
              if (touchStartXRef.current === null) return;
              const delta = e.changedTouches[0].clientX - touchStartXRef.current;
              if (Math.abs(delta) > 50) {
                didSwipeRef.current = true;
                if (delta < 0) { goNext(); } else { goPrev(); }
              }
              touchStartXRef.current = null;
              setIsPaused(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
              if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
              if (e.key === ' ') { e.preventDefault(); setIsPaused(!isPaused); }
            }}
            tabIndex={0}
          >
            {/* Main image container with improved responsive sizing */}
            <div className="absolute inset-0 rounded-[20px] overflow-hidden">
              {/* Current image */}
              <div 
                key={`current-${slide}`}
                className="absolute inset-0 murals-slide-current"
                style={{ 
                  animationDuration: `${animMs}ms`,
                  transform: reducedMotionRef.current ? 'none' : `translate(${jitter.x * 0.5}px, ${jitter.y * 0.5}px) rotate(${jitter.r * 0.3}deg) scale(${0.98 + jitter.s * 0.02})`,
                  transition: reducedMotionRef.current ? 'none' : `transform ${animMs}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                }}
              >
                <Image 
                  src={muralImages[slide]} 
                  alt={`Murale ${slide + 1} di Civitanova Marche - Arte urbana`} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  sizes="(max-width: 768px) 50vw, 400px"
                  priority={slide < 3}
                  onLoadingComplete={(img) => { 
                    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight }); 
                  }}
                />
                
                {/* Subtle shine effect */}
                <div className="murals-shine absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Previous image for transition */}
              {prevSlide !== slide && (
                <div 
                  key={`previous-${prevSlide}`}
                  className="absolute inset-0 murals-slide-previous"
                  style={{ animationDuration: `${animMs}ms` }}
                >
                  <Image 
                    src={muralImages[prevSlide]} 
                    alt={`Murale ${prevSlide + 1} di Civitanova Marche`} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 50vw, 400px"
                  />
                </div>
              )}

              {/* Improved gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />
              
              {/* Neon progress border - pauses when carousel is paused */}
              <div className="murals-neon-border absolute inset-0 pointer-events-none rounded-[20px]">
                <div 
                  className="murals-progress-ring absolute inset-1 rounded-[18px] border-2 border-cyan-400/60"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0, 247, 255, 0.3), transparent)',
                    backgroundSize: '200% 100%',
                    animation: isPaused ? 'none' : `muralsProgress ${SLIDE_MS}ms linear infinite`,
                    filter: 'drop-shadow(0 0 8px rgba(0, 247, 255, 0.5))',
                    opacity: isPaused ? 0.3 : 1,
                    transition: 'opacity 0.5s ease'
                  }}
                />
              </div>
            </div>

            {/* Improved controls with better accessibility - fade when paused */}
            <button
              className={`murals-control murals-control-prev absolute left-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/80 hover:scale-110 active:scale-95 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                isPaused ? 'opacity-5 pointer-events-none' : 'opacity-100'
              }`}
              onClick={goPrev}
              aria-label="Immagine precedente"
              tabIndex={-1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            
            <button
              className={`murals-control murals-control-next absolute right-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/80 hover:scale-110 active:scale-95 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                isPaused ? 'opacity-5 pointer-events-none' : 'opacity-100'
              }`}
              onClick={goNext}
              aria-label="Immagine successiva"
              tabIndex={-1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>

            {/* Play/Pause indicator */}
            <button
              className="absolute top-3 left-3 z-30 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
              aria-label={isPaused ? "Riprendi slideshow" : "Pausa slideshow"}
              tabIndex={-1}
            >
              {isPaused ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              )}
            </button>

            {/* Improved counter */}
            <div className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
              <span className="text-cyan-400">{slide + 1}</span>
              <span className="text-white/60 mx-1">/</span>
              <span className="text-white/80">{muralImages.length}</span>
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
              {muralImages.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === slide % 5 
                      ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlide(index);
                    setPrevSlide(slide);
                  }}
                  aria-label={`Vai all'immagine ${index + 1}`}
                  tabIndex={-1}
                />
              ))}
            </div>

            {/* Enhanced and optimized title section */}
            <div className="absolute bottom-4 left-4 z-30 max-w-[calc(100%-32px)]">
              <h3 className="murals-title-optimized text-white text-lg font-bold leading-tight transform group-hover:translate-y-[-2px] transition-all duration-300">
                Arte a Civitanova
              </h3>
            </div>

            <style jsx>{`
              .murals-slide-current {
                animation: muralsSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
              }
              
              .murals-slide-previous {
                animation: muralsSlideOut 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
              }
              
              @keyframes muralsSlideIn {
                0% { 
                  opacity: 0; 
                  transform: translateX(30px) scale(0.95); 
                  filter: blur(4px);
                }
                100% { 
                  opacity: 1; 
                  transform: translateX(0) scale(1); 
                  filter: blur(0);
                }
              }
              
              @keyframes muralsSlideOut {
                0% { 
                  opacity: 1; 
                  transform: translateX(0) scale(1); 
                  filter: blur(0);
                }
                100% { 
                  opacity: 0; 
                  transform: translateX(-30px) scale(0.95); 
                  filter: blur(4px);
                }
              }
              
              @keyframes muralsProgress {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              
              .murals-shine {
                background: linear-gradient(
                  105deg, 
                  transparent 40%, 
                  rgba(255, 255, 255, 0.3) 50%, 
                  transparent 60%
                );
                background-size: 200% 100%;
                animation: muralsShine 2s ease-in-out;
              }
              
              @keyframes muralsShine {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              
              .murals-title {
                text-shadow: 
                  0 0 10px rgba(0, 247, 255, 0.5),
                  0 2px 4px rgba(0, 0, 0, 0.8);
              }
              
              .murals-title-optimized {
                text-shadow: 
                  0 0 12px rgba(0, 247, 255, 0.7),
                  0 0 24px rgba(0, 247, 255, 0.4),
                  0 2px 8px rgba(0, 0, 0, 0.9);
                filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
              }
              
              .murals-subtitle {
                text-shadow: 
                  0 1px 3px rgba(0, 0, 0, 0.8),
                  0 0 8px rgba(0, 247, 255, 0.3);
                backdrop-filter: blur(1px);
              }
              
              .murals-control {
                backdrop-filter: blur(8px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              }
              
              .murals-cta {
                box-shadow: 0 4px 12px rgba(0, 247, 255, 0.2);
              }
              
              .murals-cta-optimized {
                backdrop-filter: blur(12px);
                box-shadow: 
                  0 8px 32px rgba(0, 247, 255, 0.15),
                  0 4px 16px rgba(59, 130, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(0, 247, 255, 0.3);
                position: relative;
                overflow: hidden;
              }
              
              .murals-cta-optimized:hover {
                box-shadow: 
                  0 12px 40px rgba(0, 247, 255, 0.25),
                  0 6px 20px rgba(59, 130, 246, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
                border-color: rgba(0, 247, 255, 0.5);
              }
              
              .murals-cta-optimized:active {
                box-shadow: 
                  0 4px 16px rgba(0, 247, 255, 0.2),
                  0 2px 8px rgba(59, 130, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
              }
              
              /* Reduced motion support */
              @media (prefers-reduced-motion: reduce) {
                .murals-slide-current,
                .murals-slide-previous {
                  animation: none;
                }
                
                .murals-shine {
                  animation: none;
                }
                
                .murals-progress-ring {
                  animation: none;
                }
              }
              
              /* High contrast mode support */
              @media (prefers-contrast: high) {
                .murals-control {
                  border: 2px solid white;
                  background: black;
                }
                
                .murals-title {
                  text-shadow: 2px 2px 0 black;
                }
              }
            `}</style>
          </div>

          {/* Tutorial e Prossimamente Widget - side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tutorial Widget */}
            <TutorialWidget
              userId={userId}
              className="h-[100px]"
            />
            
            {/* Prossimamente Widget - stesso stile del Tutorial Widget */}
            <div
              className="relative h-[100px] rounded-[20px] overflow-visible cursor-pointer group 
                bg-gradient-to-br from-gray-500/20 to-slate-500/20 backdrop-blur-sm 
                border border-gray-400/30 card-glow 
                hover:scale-105 transition-all duration-300"
              role="button"
              aria-label="Widget vuoto - Prossimamente"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); } }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />

              <div className="relative z-10 p-4 h-full flex flex-col justify-between overflow-hidden rounded-[20px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-lg">🚀</div>
                    <div>
                      <h3 className="text-white font-semibold text-sm leading-tight">Prossimamente</h3>
                      <p className="text-white/70 text-xs">Nuovo widget</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse shadow-lg shadow-gray-400/50" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-xs font-medium">In arrivo...</span>
                  <div className="text-white/60 group-hover:text-white transition-colors duration-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-[20px]" />
            </div>
          </div>
        </div>

        {/* Terza riga: Widget Bar Integrato */}
        <IntegratedWidgetBar 
          onEventClick={() => router.push('/eventi')}
          onParkingClick={() => router.push('/parcheggi')}
          onBeachClick={() => router.push('/spiaggia')}
          onReportClick={onReportClick}
        />

        {/* Quarta riga: Widget duplicato (4 opzioni) */}
        <IntegratedWidgetBar
          items={[
            { id: 'novita', label: 'Novità', icon: Newspaper, bgClass: 'widget-btn-eventi', onClick: () => router.push('/news') },
            { id: 'mappa', label: 'Mappa', icon: Map, bgClass: 'widget-btn-parcheggi', onClick: () => router.push('/mappa') },
            { id: 'spiagge', label: 'Spiagge', icon: Waves, bgClass: 'widget-btn-spiagge', onClick: () => router.push('/spiaggia') },
            { id: 'community', label: 'Community', icon: Users, bgClass: 'widget-btn-segnala', onClick: () => router.push('/community') },
          ]}
        />

        {/* Quinta riga: Modern Services Widget */}
        <ModernServicesWidget />

        {/* Sesta riga: Costruiamo insieme widget (spostato qui) */}
        <Link href="/costruiamo" className="costruiamo-widget">
          <div
            className="h-[100px] rounded-[20px] overflow-visible cursor-pointer group 
                bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm 
                border border-white/10 card-glow 
                hover:scale-105 transition-all duration-300 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center action-button-float">
                <span className="text-lg">✨</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold">Costruiamo insieme MyCivitanova</div>
                <div className="text-white/70 text-xs">Scopri la visione e come supportare il progetto</div>
              </div>
              <div className="text-white/70 group-hover:text-white nav-item-transition">→</div>
            </div>
          </div>
        </Link>
      </div>

    </div>
  );
}
