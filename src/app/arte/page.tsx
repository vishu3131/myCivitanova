"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SLIDE_MS = 3500;

export default function ArtePage() {
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
  const [prevSlide, setPrevSlide] = useState(0);
  const [animMs, setAnimMs] = useState(1200);
  const [jitter, setJitter] = useState<{x:number;y:number;r:number;s:number}>({ x: 0, y: 0, r: 0, s: 1 });
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [offset, setOffset] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState<{x:number;y:number}>({ x: 0, y: 0 });
  const tiltRaf = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setSlide((p) => {
        const next = (p + 1) % muralImages.length;
        setPrevSlide(p);
        return next;
      });
      const dur = Math.floor(Math.random() * (1600 - 900) + 900);
      setAnimMs(dur);
      setJitter({
        x: Math.random() * 10 - 5,
        y: Math.random() * 6 - 3,
        r: Math.random() * 2 - 1,
        s: 0.98 + Math.random() * 0.02
      });
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [paused]);

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
      // Scala leggermente per evitare upscaling e mantenere margini
      w *= 0.98;
      h *= 0.98;
      setImgSize({ w, h });
      setOffset({ left: (cw - w) / 2, top: (ch - h) / 2 });
    };
    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [naturalSize, slide]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    const max = 6;
    if (tiltRaf.current) cancelAnimationFrame(tiltRaf.current);
    tiltRaf.current = requestAnimationFrame(() => {
      setTilt({ x: nx * max, y: -ny * max });
    });
  };
  const handleLeave = () => {
    if (tiltRaf.current) cancelAnimationFrame(tiltRaf.current);
    setTilt({ x: 0, y: 0 });
  };
  const goNext = () => {
    setSlide((p) => {
      const next = (p + 1) % muralImages.length;
      setPrevSlide(p);
      return next;
    });
  };
  const goPrev = () => {
    setSlide((p) => {
      const prev = (p - 1 + muralImages.length) % muralImages.length;
      setPrevSlide(prev);
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 pt-6 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-white/70 hover:text-white transition-colors">← Home</Link>
        <h1 className="text-lg font-semibold neon-title">L'arte a Civitanova</h1>
        <div />
      </div>

      <div className="relative max-w-6xl mx-auto mt-4 rounded-2xl overflow-hidden shadow-2xl" style={{ height: '68vh' }}>
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
            <div
              className="absolute inset-0"
              ref={containerRef}
              onMouseMove={handleMove}
              onMouseLeave={(e) => { handleLeave(); setPaused(false); }}
              onMouseEnter={() => setPaused(true)}
              style={{ perspective: '1200px', transformStyle: 'preserve-3d', transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
            >
              <div className="absolute inset-0 pointer-events-none cyber-grid"></div>
              <div className="absolute inset-0 pointer-events-none holo-rings"></div>
              {/* layer uscente */}
              <div key={`out-${prevSlide}-${slide}`} className="absolute inset-0 slide-out" style={{ animationDuration: `${animMs}ms` }}>
                <div className="absolute" style={{ left: `${offset.left}px`, top: `${offset.top}px`, width: `${imgSize.w}px`, height: `${imgSize.h}px`, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' }}>
                  <Image src={muralImages[prevSlide]} alt={`Murale ${prevSlide + 1}`} fill className="object-cover" sizes="(max-width: 1280px) 80vw, 1000px" />
                </div>
              </div>
              {/* layer entrante */}
              <div key={`in-${slide}`} className="absolute inset-0 slide-in" style={{ animationDuration: `${animMs}ms` }}>
                <div className="absolute" style={{ left: `${offset.left}px`, top: `${offset.top}px`, width: `${imgSize.w}px`, height: `${imgSize.h}px`, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' }}>
                  <Image src={muralImages[slide]} alt={`Murale ${slide + 1}`} fill className="object-cover" sizes="(max-width: 1280px) 80vw, 1000px" onLoadingComplete={(img) => { setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight }); }} />
                  <div className="shine"></div>
                </div>
              </div>

              {/* controlli neon */}
              <div className="absolute inset-y-0 left-3 z-30 flex items-center">
                <button aria-label="Precedente" onClick={goPrev} className="nav-btn" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
              </div>
              <div className="absolute inset-y-0 right-3 z-30 flex items-center">
                <button aria-label="Successivo" onClick={goNext} className="nav-btn" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>

              {/* Neon timer glow maggiorato */}
              <div className="neon-timer absolute pointer-events-none" style={{ zIndex: 25, top: `${offset.top}px`, left: `${offset.left}px`, width: `${imgSize.w}px`, height: `${imgSize.h}px` }}>
                <svg width={imgSize.w} height={imgSize.h} className="block">
                  <defs>
                    <linearGradient id="neonGradBig" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00F7FF" />
                      <stop offset="50%" stopColor="#7C4DFF" />
                      <stop offset="100%" stopColor="#00F7FF" />
                    </linearGradient>
                    <filter id="neonFilterBig" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="blur1" />
                      <feGaussianBlur in="blur1" stdDeviation="5" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <rect key={slide}
                    x={2}
                    y={2}
                    width={Math.max(imgSize.w - 4, 0)}
                    height={Math.max(imgSize.h - 4, 0)}
                    rx={18}
                    ry={18}
                    className="neon-rect-big"
                    stroke="url(#neonGradBig)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonFilterBig)"
                    style={{ animationDuration: `${SLIDE_MS}ms` }}
                    strokeDasharray={`${2 * (imgSize.w + imgSize.h)}`}
                    strokeDashoffset={`${2 * (imgSize.w + imgSize.h)}`}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Spray overlay */}
          <div key={slide} className="pointer-events-none absolute inset-0 z-20 spray-overlay" style={{ animation: `spritz ${Math.min(animMs + 400, 1800)}ms ease-out` }} />

          {/* Titolo neon */}
          <div className="absolute bottom-5 left-6 z-30">
            <span className="neon-title text-white text-xl font-semibold">L'arte a Civitanova</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spray-overlay {
          background:
            radial-gradient(16px 16px at 10% 20%, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.2) 45%, transparent 70%),
            radial-gradient(12px 12px at 30% 70%, rgba(255,255,255,0.30) 0, rgba(255,255,255,0.18) 45%, transparent 70%),
            radial-gradient(18px 18px at 80% 40%, rgba(255,255,255,0.28) 0, rgba(255,255,255,0.16) 45%, transparent 70%),
            radial-gradient(14px 14px at 60% 80%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.14) 45%, transparent 70%),
            radial-gradient(22px 22px at 40% 35%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.14) 45%, transparent 70%),
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
          0% { transform: rotateY(-65deg) scale(0.98); filter: blur(10px) saturate(120%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: rotateY(0deg) scale(1); filter: blur(0) saturate(105%); opacity: 1; }
        }
        @keyframes cubeOut {
          0% { transform: rotateY(0deg) scale(1); filter: blur(0); opacity: 1; }
          100% { transform: rotateY(65deg) scale(0.98); filter: blur(10px); opacity: 0; }
        }
        .cyber-grid {
          background-image:
            linear-gradient(rgba(0, 247, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 247, 255, 0.06) 1px, transparent 1px);
          background-size: 28px 28px, 28px 28px;
          background-position: 0 0, 0 0;
          animation: gridShift 12s linear infinite;
          mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 85%);
        }
        @keyframes gridShift {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 280px 280px, 280px 280px; }
        }
        .holo-rings {
          background:
            radial-gradient(200px 200px at 20% 30%, rgba(124,77,255,0.16), transparent 60%),
            radial-gradient(260px 260px at 80% 70%, rgba(0,247,255,0.12), transparent 60%);
          mix-blend-mode: screen;
          animation: ringsPulse 8s ease-in-out infinite alternate;
          filter: blur(0.5px);
        }
        @keyframes ringsPulse {
          from { filter: blur(0.6px); opacity: 0.8; }
          to { filter: blur(1px); opacity: 0.6; }
        }
        .nav-btn {
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          color: #00f7ff;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(0,247,255,0.35);
          box-shadow: 0 0 8px rgba(0,247,255,0.35), inset 0 0 8px rgba(0,247,255,0.18);
          transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
          backdrop-filter: blur(2px);
        }
        .nav-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 0 12px rgba(0,247,255,0.65), inset 0 0 12px rgba(0,247,255,0.3);
          background: rgba(0,0,0,0.45);
        }
        .neon-rect-big {
          stroke: #00f7ff;
          fill: transparent;
          stroke-width: 4px;
          filter: drop-shadow(0 0 8px #00f7ff) drop-shadow(0 0 18px #00f7ff) drop-shadow(0 0 28px rgba(0,247,255,0.6));
          animation-name: neonTimerBig;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes neonTimerBig {
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
  );
}
