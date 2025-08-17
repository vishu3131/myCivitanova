"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sun, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntegratedWidgetBar } from './IntegratedWidgetBar';
import WalkingTimeWidget from './WalkingTimeWidget';
import ModernServicesWidget from './ModernServicesWidget';

interface InfoCardsProps {
  onReportClick?: () => void;
}

export function InfoCards({ onReportClick }: InfoCardsProps) {
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
       <div className="grid grid-cols-2 gap-4">
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

        {/* Card percorso - sostituita con widget dinamico a scorrimento */}
        <WalkingTimeWidget />
        {/* Widget Bar Integrato */}
        <IntegratedWidgetBar 
          onEventClick={() => router.push('/eventi')}
          onParkingClick={() => router.push('/parcheggi')}
          onBeachClick={() => router.push('/spiaggia')}
          onReportClick={onReportClick}
        />

        {/* Card meteo */}
        <div className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
             style={{
               background: 'linear-gradient(135deg, #93F9B9, #1D976C)',
             }}>
          <div className="flex items-center justify-between">
            <Sun className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-200">14:30</span>
          </div>
          <div>
            <span className="text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-200 inline-block">24°C</span>
          </div>
        </div>

        {/* Modern Services Widget */}
        <ModernServicesWidget />

        {/* Love Heart widget (Uiverse.io by barisdogansutcu) + Heart Animation on toggle */}
        <div className="h-[100px] flex items-center justify-center bg-transparent relative">
          {!heartActive ? (
            <>
              <div className="love relative">
                <input id="love-switch" type="checkbox" onChange={(e) => { if (e.target.checked) { setTimeout(() => setHeartActive(true), 1300); } }} />
                <label className="love-heart" htmlFor="love-switch">
                  <i className="left"></i>
                  <i className="right"></i>
                  <i className="bottom"></i>
                  <div className="round"></div>
                </label>
              </div>
              <style jsx>{`
                /* From Uiverse.io by barisdogansutcu */
                .love-heart:before, #love-switch {
                  display: none;
                }
                .love-heart, .love-heart::after {
                  border-color: hsl(231deg 28% 86%);
                  border: 1px solid;
                  border-top-left-radius: 100px;
                  border-top-right-radius: 100px;
                  width: 10px;
                  height: 8px;
                  border-bottom: 0;
                }
                .round {
                  position: absolute;
                  z-index: 1;
                  width: 8px;
                  height: 8px;
                  background: hsl(0deg 0% 100%);
                  box-shadow: rgb(0 0 0 / 24%) 0px 0px 4px 0px;
                  border-radius: 100%;
                  left: 0px;
                  bottom: -1px;
                  transition: all 1.2s ease;
                  animation: check-animation2 1.2s forwards;
                }
                input:checked + label .round {
                  transform: translate(0px, 0px);
                  animation: check-animation 1.2s forwards;
                  background-color: hsl(0deg 0% 100%);
                }
                @keyframes check-animation {
                  0% { transform: translate(0px, 0px); }
                  50% { transform: translate(0px, 7px); }
                  100% { transform: translate(7px, 7px); }
                }
                @keyframes check-animation2 {
                  0% { transform: translate(7px, 7px); }
                  50% { transform: translate(0px, 7px); }
                  100% { transform: translate(0px, 0px); }
                }
                .love-heart {
                  box-sizing: border-box;
                  position: relative;
                  transform: rotate(-45deg) translate(-50%, -33px) scale(4);
                  display: block;
                  border-color: hsl(231deg 28% 86%);
                  cursor: pointer;
                  top: 0;
                }
                input:checked + .love-heart, 
                input:checked + .love-heart::after, 
                input:checked + .love-heart .bottom {
                  border-color: hsl(347deg 81% 61%);
                  box-shadow: inset 6px -5px 0px 2px hsl(347deg 99% 72%);
                }
                .love-heart::after, .love-heart .bottom {
                  content: "";
                  display: block;
                  box-sizing: border-box;
                  position: absolute;
                  border-color: hsl(231deg 28% 86%);
                }
                .love-heart::after {
                  right: -9px;
                  transform: rotate(90deg);
                  top: 7px;
                }
                .love-heart .bottom {
                  width: 11px;
                  height: 11px;
                  border-left: 1px solid;
                  border-bottom: 1px solid;
                  border-color: hsl(231deg 28% 86%);
                  left: -1px;
                  top: 5px;
                  border-radius: 0px 0px 0px 5px;
                }
              `}</style>
            </>
          ) : (
            <>
              {/* From Uiverse.io by SouravBandyopadhyay */}
              <div className="cssload-main">
                <div className="cssload-heart">
                  <span className="cssload-heartL"></span>
                  <span className="cssload-heartR"></span>
                  <span className="cssload-square"></span>
                </div>
                <div className="cssload-shadow"></div>
              </div>
              <style jsx>{`
                /* From Uiverse.io by SouravBandyopadhyay */
                .cssload-main {
                  position: relative;
                  width: 124px;
                  height: 124px;
                }
                .cssload-main * { font-size: 62px; }
                .cssload-heart {
                  animation: cssload-heart 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                  top: 50%;
                  left: 50%;
                  position: absolute;
                  transform: translate(-50%, -65%);
                }
                .cssload-heartL {
                  width: 1em;
                  height: 1em;
                  border: 1px solid rgb(252, 0, 101);
                  background-color: rgb(252, 0, 101);
                  content: '';
                  position: absolute;
                  display: block;
                  border-radius: 100%;
                  animation: cssload-heartL 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                  transform: translate(-28px, -27px);
                }
                .cssload-heartR {
                  width: 1em;
                  height: 1em;
                  border: 1px solid rgb(252, 0, 101);
                  background-color: rgb(252, 0, 101);
                  content: '';
                  position: absolute;
                  display: block;
                  border-radius: 100%;
                  transform: translate(28px, -27px);
                  animation: cssload-heartR 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                }
                .cssload-square {
                  width: 1em;
                  height: 1em;
                  border: 1px solid rgb(252, 0, 101);
                  background-color: rgb(252, 0, 101);
                  position: relative;
                  display: block;
                  content: '';
                  transform: scale(1) rotate(-45deg);
                  animation: cssload-square 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                }
                .cssload-shadow {
                  left: 50%;
                  position: absolute;
                  bottom: 2px;
                  transform: translateX(-50%);
                  width: 1em;
                  height: .24em;
                  background-color: rgb(215,215,215);
                  border: 1px solid rgb(215,215,215);
                  border-radius: 50%;
                  animation: cssload-shadow 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
                }
                @keyframes cssload-square {
                  50% { border-radius: 100%; transform: scale(0.5) rotate(-45deg); }
                  100% { transform: scale(1) rotate(-45deg); }
                }
                @keyframes cssload-heart {
                  50% { transform: translate(-50%, -65%) rotate(360deg); }
                  100% { transform: translate(-50%, -65%) rotate(720deg); }
                }
                @keyframes cssload-heartL { 60% { transform: translate(-28px, -27px) scale(0.4); } }
                @keyframes cssload-heartR { 40% { transform: translate(28px, -27px) scale(0.4); } }
                @keyframes cssload-shadow { 50% { transform: translateX(-50%) scale(0.5); border-color: rgb(228,228,228); } }
              `}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
}