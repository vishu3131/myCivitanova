'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Quartiere } from '@/data/quartieriData';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface QuartieriCarousel3DProps {
  quartieri: Quartiere[];
  onQuartiereSelect: (quartiere: Quartiere) => void;
  selectedQuartiereId: number | null;
}

export const QuartieriCarousel3D: React.FC<QuartieriCarousel3DProps> = ({
  quartieri,
  onQuartiereSelect,
  selectedQuartiereId
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Auto-rotation ogni 5 secondi
  useEffect(() => {
    if (isAutoRotating) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % quartieri.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoRotating, quartieri.length]);

  // Pausa auto-rotation al hover
  const handleMouseEnter = () => setIsAutoRotating(false);
  const handleMouseLeave = () => setIsAutoRotating(true);

  // Navigazione manuale
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + quartieri.length) % quartieri.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 3000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % quartieri.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 3000);
  };

  // Touch handlers per mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Calcola la posizione e trasformazione per ogni card
  const getCardTransform = (index: number) => {
    const diff = index - currentIndex;
    const absIndex = Math.abs(diff);
    
    if (absIndex === 0) {
      // Card centrale
      return {
        transform: 'translateX(0) translateZ(0) rotateY(0deg) scale(1)',
        opacity: 1,
        zIndex: 10
      };
    } else if (absIndex === 1) {
      // Card adiacenti
      const direction = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${direction * 120}px) translateZ(-100px) rotateY(${-direction * 25}deg) scale(0.8)`,
        opacity: 0.7,
        zIndex: 5
      };
    } else if (absIndex === 2) {
      // Card più distanti
      const direction = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${direction * 200}px) translateZ(-200px) rotateY(${-direction * 45}deg) scale(0.6)`,
        opacity: 0.4,
        zIndex: 1
      };
    } else {
      // Card nascoste
      return {
        transform: 'translateX(0) translateZ(-300px) rotateY(0deg) scale(0.4)',
        opacity: 0,
        zIndex: 0
      };
    }
  };

  const handleCardClick = (quartiere: Quartiere, index: number) => {
    if (index === currentIndex) {
      onQuartiereSelect(quartiere);
    } else {
      setCurrentIndex(index);
      setIsAutoRotating(false);
      setTimeout(() => setIsAutoRotating(true), 3000);
    }
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-purple-500/5 to-transparent"></div>
      
      {/* Carousel container */}
      <div 
        className="relative w-full h-full flex items-center justify-center perspective-1000"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {quartieri.map((quartiere, index) => {
          const style = getCardTransform(index);
          const isActive = index === currentIndex;
          
          return (
            <div
              key={quartiere.id}
              className={`absolute w-72 h-80 cursor-pointer transition-all duration-700 ease-out transform-gpu ${
                isActive ? 'hover:scale-105' : 'hover:scale-110'
              }`}
              style={style}
              onClick={() => handleCardClick(quartiere, index)}
            >
              {/* Card */}
              <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-500 ${
                isActive 
                  ? `border-${quartiere.color}-400 shadow-${quartiere.color}-500/30` 
                  : 'border-gray-600 shadow-gray-900/50'
              }`}>
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                  style={{ 
                    backgroundImage: `url(${quartiere.image})`,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                
                {/* Overlay gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
                  isActive 
                    ? `from-${quartiere.color}-900/90 via-${quartiere.color}-800/50 to-transparent`
                    : 'from-gray-900/90 via-gray-800/50 to-transparent'
                }`} />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className={`text-2xl font-bold mb-2 transition-all duration-500 ${
                    isActive ? `text-${quartiere.color}-100` : 'text-white'
                  }`}>
                    {quartiere.name}
                  </h3>
                  
                  {isActive && (
                    <div className="animate-fadeIn">
                      <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                        {quartiere.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {quartiere.highlights.slice(0, 2).map((highlight, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-1 text-xs rounded-full bg-${quartiere.color}-500/20 text-${quartiere.color}-200 border border-${quartiere.color}-400/30`}
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-${quartiere.color}-400 animate-pulse`} />
                )}
              </div>
            </div>
          );
        })}
        
        {/* Navigation buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50 hover:scale-110 transition-all duration-300"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50 hover:scale-110 transition-all duration-300"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {quartieri.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
      
      {/* Auto-rotation indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white text-xs ${
          isAutoRotating ? 'opacity-100' : 'opacity-50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isAutoRotating ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <span>Auto</span>
        </div>
      </div>
    </div>
  );
};