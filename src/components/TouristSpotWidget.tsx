"use client";

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface TouristSpot {
  id: number;
  name: string;
  address: string;
  description: string;
  rating: number;
  image: string;
  tags: string[];
  category: string;
}

const touristSpots: TouristSpot[] = [
  {
    id: 1,
    name: "Parco della Resistenza",
    address: "Zona Biblioteca Zavatti",
    description: "Oasi verde nel cuore di Civitanova. Perfetto per leggere, fare sport leggero o rilassarsi. Spesso ospita eventi culturali e attività per famiglie.",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop",
    tags: ["Natura", "Relax", "Cultura"],
    category: "Natura"
  },
  {
    id: 2,
    name: "Lungomare Piermanni",
    address: "Lungomare Piermanni",
    description: "Splendida passeggiata con vista sul mare Adriatico. Ideale per jogging, momenti romantici e relax al tramonto.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop",
    tags: ["Mare", "Passeggiata", "Relax"],
    category: "Mare"
  },
  {
    id: 3,
    name: "Piazza XX Settembre",
    address: "Piazza XX Settembre",
    description: "Cuore pulsante della città con eventi, mercatini e locali. Ottimo punto d'incontro per residenti e turisti.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=800&h=400&fit=crop",
    tags: ["Centro", "Eventi", "Socialità"],
    category: "Centro"
  },
  {
    id: 4,
    name: "Porto Turistico",
    address: "Porto Turistico",
    description: "Zona suggestiva con arte e mare. Perfetto per una passeggiata romantica al tramonto e per apprezzare la street art.",
    rating: 4.8,
    image: "https://statics.cedscdn.it/photos/MED/96/99/489699_20140708_civitanova_colori.jpg",
    tags: ["Mare", "Arte", "Panorama"],
    category: "Mare"
  },
  {
    id: 5,
    name: "Centro Commerciale Cuore Adriatico",
    address: "Centro Commerciale Cuore Adriatico",
    description: "Ampia offerta di negozi, intrattenimento e ristorazione per un pomeriggio di shopping e svago.",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
    tags: ["Shopping", "Tempo libero", "Famiglia"],
    category: "Shopping"
  },
  {
    id: 6,
    name: "Lungomare Sud",
    address: "Lungomare Sud",
    description: "Spiaggia sabbiosa e misto ghiaia, lunga circa 2,5 km. Promenade con palme, stabilimenti, bar e locali. Atmosfera vivace, perfetta per relax di giorno e socialità la sera.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
    tags: ["Sabbia", "Tramonti", "Socialità"],
    category: "Mare"
  },
  {
    id: 7,
    name: "Lungomare Nord",
    address: "Lungomare Nord",
    description: "Spiaggia ampia con sabbia fine e mare limpido dall'azzurro al blu cobalto. Delimitata a sud dal porto, verso nord si unisce alla costa di Potenza Picena. Contornata da piste ciclabili, hotel e ristoranti.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop",
    tags: ["Mare", "Natura", "Piste ciclabili"],
    category: "Mare"
  },
  {
    id: 8,
    name: "Pista Ciclabile di Civitanova Marche",
    address: "Percorso lungo i due lungomare",
    description: "Una ciclabile continua di circa 3,3 km che collega il Lungomare Sud (1,7 km) e il Nord (1,6 km), parte integrante del progetto Ciclovia Adriatica. Sicurezza: adatta anche ai bambini, percorsi separati pedoni/ciclisti.",
    rating: 4.7,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzzBGaDWwGJhsD5aFWRVJI6aEboVC9rbJIOg&s",
    tags: ["Ciclovia", "Mare", "Mobilità sostenibile"],
    category: "Sport"
  }
];

export function TouristSpotWidget() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-scroll ogni 6 secondi
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % touristSpots.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % touristSpots.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Riprende auto-play dopo 10s
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + touristSpots.length) % touristSpots.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Riprende auto-play dopo 10s
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Riprende auto-play dopo 10s
  };

  // Touch handlers per swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(false);
    setIsAutoPlaying(false); // Pausa auto-play durante il touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
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



  const currentSpot = touristSpots[currentSlide];

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
        <div 
          className={`flex h-full select-none ${
            isDragging ? 'transition-none' : 'transition-transform duration-700 ease-in-out'
          }`}
          style={{ 
            transform: `translateX(-${currentSlide * 100}%)`,
            touchAction: 'pan-y pinch-zoom'
          }}
        >
          {touristSpots.map((spot) => (
            <div key={spot.id} className="w-full h-full flex-shrink-0 relative">
              <Image 
                src={spot.image}
                alt={spot.name}
                fill
                className={`object-cover pointer-events-none ${
                  spot.name === "Pista Ciclabile di Civitanova Marche" 
                    ? "pista-ciclabile-crop" 
                    : ""
                }`}
                draggable={false}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Controlli di navigazione - Ottimizzati per touch */}
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

        {/* Indicatori di posizione - Ottimizzati per touch */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {touristSpots.map((_, index) => (
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

        {/* Contenuto overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-heading font-medium text-xl">{currentSpot.name}</h2>
              <div className="flex items-center text-white/80 text-sm mt-1">
                <MapPin size={14} className="mr-1" />
                <span>{currentSpot.address}</span>
              </div>
            </div>
            <div className="flex items-center bg-accent/90 text-black font-medium rounded-lg px-2 py-1">
              <Star size={16} className="mr-1" />
              <span>{currentSpot.rating}</span>
            </div>
          </div>
        </div>

        {/* Indicatore categoria */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {currentSpot.category}
          </span>
        </div>

        {/* Indicatore auto-play - Aggiornato */}
        {isAutoPlaying && (
          <div className="absolute top-3 right-3">
            <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Contenuto descrittivo */}
      <div className="p-4">
        <p className="text-white/80 text-sm mb-4 line-clamp-3">
          {currentSpot.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 flex-wrap">
            {currentSpot.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-dark-200 text-white/80 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <button className="flex items-center text-accent text-sm hover:underline active:text-accent/80 transition-colors touch-manipulation min-h-[44px] px-2 -mx-2">
            <Info size={16} className="mr-1" />
            <span>Dettagli</span>
          </button>
        </div>
      </div>


    </div>
  );
};