"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sun, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IntegratedWidgetBar } from './IntegratedWidgetBar';
import WalkingTimeWidget from './WalkingTimeWidget';

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

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((p) => {
        const next = (p + 1) % muralImages.length;
        setPrevSlide(p);
        return next;
      });
      const dur = Math.floor(Math.random() * (1500 - 800) + 800);
      setAnimMs(dur);
      setJitter({
        x: Math.random() * 8 - 4,
        y: Math.random() * 6 - 3,
        r: Math.random() * 3 - 1.5,
        s: 0.97 + Math.random() * 0.03
      });
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, []);

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
        {/* Card immagine luogo - Carosello murales con effetto spray */}
        <div className="relative h-[200px] rounded-[20px] overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => router.push('/arte')} aria-label="Apri la pagina Arte">
          <div className="absolute inset-0">
            {/* Wrapper con jitter eccentrico */}
            <div
              className="h-full w-full"
              style={{
                transform: `translate(${jitter.x}px, ${jitter.y}px) rotate(${jitter.r}deg) scale(${jitter.s})`,
                transition: `transform ${animMs}ms cubic-bezier(.22,1,.36,1)`
              }}
            >
              {/* Transizione 3D cube modern wow */}
              <div className="absolute inset-0" ref={containerRef} style={{ perspective: '900px' }}>
                {/* layer uscente */}
                <div key={`out-${prevSlide}-${slide}`} className="absolute inset-0 slide-out" style={{ animationDuration: `${animMs}ms` }}>
                  <div className="absolute" style={{ left: `${offset.left}px`, top: `${offset.top}px`, width: `${imgSize.w}px`, height: `${imgSize.h}px`, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
                    <Image src={muralImages[prevSlide]} alt={`Murale ${prevSlide + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 400px" />
                  </div>
                </div>
                {/* layer entrante */}
                <div key={`in-${slide}`} className="absolute inset-0 slide-in" style={{ animationDuration: `${animMs}ms` }}>
                  <div className="absolute" style={{ left: `${offset.left}px`, top: `${offset.top}px`, width: `${imgSize.w}px`, height: `${imgSize.h}px`, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
                    <Image src={muralImages[slide]} alt={`Murale ${slide + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 400px" onLoadingComplete={(img) => { setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight }); }} />
                    <div className="shine"></div>
                  </div>
                </div>
                {/* Neon timer glow */}
                <div className="neon-timer absolute pointer-events-none" style={{ zIndex: 25, top: `${offset.top}px`, left: `${offset.left}px`, width: `${imgSize.w}px`, height: `${imgSize.h}px` }}>
                  <svg width={imgSize.w} height={imgSize.h} className="block">
                    <defs>
                      <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00F7FF" />
                        <stop offset="50%" stopColor="#7C4DFF" />
                        <stop offset="100%" stopColor="#00F7FF" />
                      </linearGradient>
                      <filter id="neonFilter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur1" />
                        <feGaussianBlur in="blur1" stdDeviation="4" result="blur2" />
                        <feMerge>
                          <feMergeNode in="blur2" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <rect key={slide}
                      x={1.5}
                      y={1.5}
                      width={Math.max(imgSize.w - 3, 0)}
                      height={Math.max(imgSize.h - 3, 0)}
                      rx={12}
                      ry={12}
                      className="neon-rect"
                      stroke="url(#neonGrad)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#neonFilter)"
                      style={{ animationDuration: `${SLIDE_MS}ms` }}
                      strokeDasharray={`${2 * (imgSize.w + imgSize.h)}`}
                      strokeDashoffset={`${2 * (imgSize.w + imgSize.h)}`}
                    />
                    <rect
                      x={3}
                      y={3}
                      width={Math.max(imgSize.w - 6, 0)}
                      height={Math.max(imgSize.h - 6, 0)}
                      rx={10}
                      ry={10}
                      stroke="#00F7FF"
                      strokeOpacity="0.35"
                      strokeWidth="2"
                      fill="none"
                      filter="url(#neonFilter)"
                    />
                  </svg>
                </div>
              </div>
            </div>

            
            {/* Overlay spray che simula la vernice */}
            <div
              key={slide}
              className="pointer-events-none absolute inset-0 z-20 spray-overlay"
              style={{ animation: `spritz ${Math.min(animMs + 400, 1800)}ms ease-out` }}
            />

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300"></div>
            <div className="absolute bottom-3 left-4 z-30 transform group-hover:translate-y-[-2px] transition-transform duration-300">
              <span className="neon-title text-white text-base font-semibold">L'arte a civitanova</span>
            </div>
          </div>

          <style jsx>{`
            .spray-overlay {
              background:
                radial-gradient(14px 14px at 10% 20%, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.2) 45%, transparent 70%),
                radial-gradient(10px 10px at 30% 70%, rgba(255,255,255,0.30) 0, rgba(255,255,255,0.18) 45%, transparent 70%),
                radial-gradient(18px 18px at 80% 40%, rgba(255,255,255,0.28) 0, rgba(255,255,255,0.16) 45%, transparent 70%),
                radial-gradient(12px 12px at 60% 80%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.14) 45%, transparent 70%),
                radial-gradient(20px 20px at 40% 35%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.14) 45%, transparent 70%),
                repeating-radial-gradient(circle at 15% 15%, rgba(255,255,255,0.14) 0 1px, transparent 1px 3px),
                repeating-radial-gradient(circle at 70% 60%, rgba(255,255,255,0.14) 0 1px, transparent 1px 3px);
              mix-blend-mode: screen;
              opacity: 0;
              filter: blur(0.6px) contrast(1.08);
            }
            @keyframes spritz {
              0% { opacity: 0.0; transform: scale(0.94) translateY(6px); filter: blur(2px); }
              10% { opacity: 0.85; }
              40% { opacity: 0.65; }
              100% { opacity: 0; transform: scale(1) translateY(0); filter: blur(0); }
            }
            .slide-in {
              transform-origin: left center;
              animation-name: cubeIn;
              animation-timing-function: cubic-bezier(.2,.8,.2,1);
              animation-fill-mode: forwards;
            }
            .slide-out {
              transform-origin: right center;
              animation-name: cubeOut;
              animation-timing-function: cubic-bezier(.2,.8,.2,1);
              animation-fill-mode: forwards;
            }
            @keyframes cubeIn {
              0% { transform: rotateY(-65deg) scale(0.96); filter: blur(8px) saturate(120%); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: rotateY(0deg) scale(1); filter: blur(0) saturate(105%); opacity: 1; }
            }
            @keyframes cubeOut {
              0% { transform: rotateY(0deg) scale(1); filter: blur(0); opacity: 1; }
              100% { transform: rotateY(65deg) scale(0.96); filter: blur(8px); opacity: 0; }
            }
            .shine {
              position: absolute;
              inset: 0;
              pointer-events: none;
              background: linear-gradient(105deg, rgba(255,255,255,0) 10%, rgba(255,255,255,0.22) 12%, rgba(255,255,255,0) 15%) no-repeat;
              background-size: 15% 120%;
              background-position: -20% -10%;
              animation: shineSweep 900ms ease-out forwards;
              mix-blend-mode: screen;
              filter: blur(1px);
            }
            @keyframes shineSweep {
              to { background-position: 120% 110%; opacity: 0; }
            }
            .neon-rect {
              stroke: #00f7ff;
              fill: transparent;
              stroke-width: 3px;
              filter: drop-shadow(0 0 6px #00f7ff) drop-shadow(0 0 14px #00f7ff) drop-shadow(0 0 22px rgba(0,247,255,0.6));
              animation-name: neonTimer;
              animation-timing-function: linear;
              animation-fill-mode: forwards;
            }
            @keyframes neonTimer {
              to { stroke-dashoffset: 0; }
            }
            .neon-title {
              position: relative;
              display: inline-block;
              letter-spacing: 0.3px;
              text-shadow:
                0 0 4px rgba(0,247,255,0.6),
                0 0 8px rgba(0,247,255,0.6),
                0 0 14px rgba(0,247,255,0.5),
                0 0 22px rgba(124,77,255,0.35);
              animation: neonPulse 2200ms ease-in-out infinite;
            }
            .neon-title::after {
              content: '';
              position: absolute;
              inset: -6px -12px;
              background: linear-gradient(100deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 65%);
              transform: translateX(-120%) skewX(-18deg);
              mix-blend-mode: screen;
              filter: blur(0.6px);
              animation: titleShine 3500ms ease-in-out infinite;
              pointer-events: none;
            }
            @keyframes neonPulse {
              0%, 100% {
                text-shadow:
                  0 0 6px rgba(0,247,255,0.85),
                  0 0 16px rgba(0,247,255,0.75),
                  0 0 28px rgba(0,247,255,0.45),
                  0 0 42px rgba(124,77,255,0.55);
              }
              50% {
                text-shadow:
                  0 0 3px rgba(0,247,255,0.55),
                  0 0 9px rgba(0,247,255,0.45),
                  0 0 16px rgba(0,247,255,0.35),
                  0 0 28px rgba(124,77,255,0.35);
              }
            }
            @keyframes titleShine {
              0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
              15% { opacity: 1; }
              60% { transform: translateX(120%) skewX(-18deg); opacity: 1; }
              100% { transform: translateX(150%) skewX(-18deg); opacity: 0; }
            }
          `}</style>
        </div>

        {/* Card percorso - sostituita con widget dinamico a scorrimento */}
        <WalkingTimeWidget />
        {/* Widget Bar Integrato */}
        <IntegratedWidgetBar 
          onEventClick={() => console.log('Eventi clicked')}
          onParkingClick={() => console.log('Parcheggi clicked')}
          onBeachClick={() => console.log('Spiagge clicked')}
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

        {/* Card servizi */}
        <div 
          className="h-[100px] rounded-[20px] p-4 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
          }}
          onClick={() => router.push('/servizi')}
        >
          <div className="flex items-center justify-between">
            <Settings className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-200 group-hover:rotate-90" />
            <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors duration-200">Disponibili</span>
          </div>
          <div>
            <span className="text-white text-sm font-medium group-hover:text-white transition-colors duration-200">Servizi</span>
          </div>
        </div>

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