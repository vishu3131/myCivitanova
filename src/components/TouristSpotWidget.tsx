"use client";

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PoiApiItem {
  id: string | number;
  name: string;
  address?: string;
  description?: string;
  category: string;
  imageUrl?: string;
  position?: [number, number];
  // optional enriched fields
  phone?: string;
  website?: string;
  rating?: number;
}

export function TouristSpotWidget() {
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [spots, setSpots] = useState<PoiApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch from unified POI API (demo ensures geocoded pins and many entries)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/pois?demo=1');
        const data: PoiApiItem[] = await res.json();
        if (cancelled) return;
        // Prefer curated order by category relevance. Keep first 18.
        const ordered = data
          .filter(p => p.name && p.category)
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 18);
        setSpots(ordered);
      } catch (_) {
        if (!cancelled) setSpots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Auto-scroll ogni 6 secondi
  useEffect(() => {
    if (!isAutoPlaying || spots.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % spots.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, spots.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(spots.length, 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(spots.length, 1)) % Math.max(spots.length, 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Touch handlers per swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(false);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    if (!touchStart || touchEnd === null) {
      setIsAutoPlaying(true);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    } else {
      setIsAutoPlaying(true);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
  };

  const currentSpot = spots[currentSlide];

  return (
    <div 
      className="bg-dark-300 rounded-xl overflow-hidden card-glow border border-dark-100 relative no-select"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Immagine con overlay */}
      <div 
        className="relative h-40 overflow-hidden carousel-touch-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        <div 
          className={`flex h-full select-none ${
            isDragging ? 'transition-none' : 'transition-transform duration-700 ease-in-out'
          }`}
          style={{ 
            transform: `translateX(-${(spots.length ? currentSlide : 0) * 100}%)`,
            touchAction: 'pan-y pinch-zoom'
          }}
        >
          {(loading ? Array.from({ length: 1 }) : spots).map((spot, idx) => (
            <div key={(spot as any)?.id ?? idx} className="w-full h-full flex-shrink-0 relative">
              {loading ? (
                <div className="absolute inset-0 bg-gray-800 animate-pulse" />
              ) : (
                <Image 
                  src={spot?.imageUrl || 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&h=400&fit=crop'}
                  alt={spot?.name || 'Luogo'}
                  fill
                  className="object-cover pointer-events-none"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
              {!loading && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>}
            </div>
          ))}
        </div>

        {/* Controlli di navigazione */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-8 md:h-8 bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full flex items-center justify-center carousel-control touch-manipulation z-10"
          aria-label="Slide precedente"
        >
          <ChevronLeft size={18} className="md:w-4 md:h-4" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-8 md:h-8 bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full flex items-center justify-center carousel-control touch-manipulation z-10"
          aria-label="Slide successiva"
        >
          <ChevronRight size={18} className="md:w-4 md:h-4" />
        </button>

        {/* Indicatori di posizione */}
        {!loading && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
            {spots.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={`w-3 h-3 md:w-2 md:h-2 rounded-full dot-indicator touch-manipulation transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-accent active scale-125' 
                    : 'bg-white/50 hover:bg-white/70 active:bg-white/90'
                }`}
                aria-label={`Vai alla slide ${index + 1}`}
                style={{ minWidth: '12px', minHeight: '12px' }}
              />
            ))}
          </div>
        )}

        {/* Contenuto overlay */}
        {!loading && currentSpot && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-heading font-medium text-xl">{currentSpot.name}</h2>
                {currentSpot.address && (
                  <div className="flex items-center text-white/80 text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span>{currentSpot.address}</span>
                  </div>
                )}
              </div>
              {/* Rating: shown only if provided */}
              {typeof currentSpot.rating === 'number' && (
                <div className="flex items-center bg-accent/90 text-black font-medium rounded-lg px-2 py-1">
                  <Star size={16} className="mr-1" />
                  <span>{currentSpot.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicatore categoria */}
        {!loading && currentSpot && (
          <div className="absolute top-3 left-3">
            <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {currentSpot.category}
            </span>
          </div>
        )}

        {/* Indicatore auto-play */}
        {isAutoPlaying && !loading && (
          <div className="absolute top-3 right-3">
            <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Contenuto descrittivo */}
      <div className="p-4">
        {loading ? (
          <div className="h-12 bg-white/10 rounded animate-pulse" />
        ) : (
          <>
            <p className="text-white/80 text-sm mb-4 line-clamp-3">
              {currentSpot?.description || 'Scopri questo luogo su mappa con dettagli e contatti.'}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 flex-wrap">
                <span className="bg-dark-200 text-white/80 text-xs px-2 py-1 rounded-full">{currentSpot?.category || 'Interesse'}</span>
                <span className="bg-dark-200 text-white/80 text-xs px-2 py-1 rounded-full">Civitanova</span>
              </div>
              {currentSpot?.position && (
                <button
                  className="flex items-center text-accent text-sm hover:underline active:text-accent/80 transition-colors touch-manipulation min-h-[44px] px-2 -mx-2"
                  onClick={() => {
                    const [lat, lng] = currentSpot.position!;
                    router.push(`/mappa?focus=${lat.toFixed(6)},${lng.toFixed(6)}&name=${encodeURIComponent(currentSpot.name)}`);
                  }}
                >
                  <Info size={16} className="mr-1" />
                  <span>Dettagli</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
