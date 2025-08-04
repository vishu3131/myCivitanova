'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PhotoGallery3DProps {
  images: string[];
  title?: string;
  color?: string;
}

export const PhotoGallery3D: React.FC<PhotoGallery3DProps> = ({ 
  images, 
  title = "Galleria Foto",
  color = "blue"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Auto-rotation ogni 5 secondi
  useEffect(() => {
    if (isAutoRotating && !isFullscreen) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoRotating, isFullscreen, images.length]);

  const handleMouseEnter = () => setIsAutoRotating(false);
  const handleMouseLeave = () => setIsAutoRotating(true);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 3000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoRotating(false);
    setTimeout(() => setIsAutoRotating(true), 3000);
  };

  // Touch handlers
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

  // Calcola trasformazione per effetto coverflow
  const getImageTransform = (index: number) => {
    const diff = index - currentIndex;
    const absIndex = Math.abs(diff);
    
    if (absIndex === 0) {
      return {
        transform: 'translateX(0) translateZ(0) rotateY(0deg) scale(1)',
        opacity: 1,
        zIndex: 10
      };
    } else if (absIndex === 1) {
      const direction = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${direction * 80}px) translateZ(-50px) rotateY(${-direction * 35}deg) scale(0.85)`,
        opacity: 0.8,
        zIndex: 5
      };
    } else if (absIndex === 2) {
      const direction = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${direction * 140}px) translateZ(-100px) rotateY(${-direction * 55}deg) scale(0.7)`,
        opacity: 0.6,
        zIndex: 2
      };
    } else {
      return {
        transform: 'translateX(0) translateZ(-150px) rotateY(0deg) scale(0.5)',
        opacity: 0,
        zIndex: 0
      };
    }
  };

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
    setIsAutoRotating(false);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsAutoRotating(true);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">Nessuna immagine disponibile</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="w-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h3 className={`text-xl font-bold text-${color}-100`}>{title}</h3>
          <p className="text-gray-400 text-sm">{images.length} foto</p>
        </div>

        {/* 3D Carousel */}
        <div 
          className="relative h-64 flex items-center justify-center perspective-1000 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((image, index) => {
            const style = getImageTransform(index);
            const isActive = index === currentIndex;
            
            return (
              <div
                key={index}
                className="absolute w-48 h-36 cursor-pointer transition-all duration-700 ease-out transform-gpu hover:scale-105"
                style={style}
                onClick={() => openFullscreen(index)}
              >
                <div className={`relative w-full h-full rounded-lg overflow-hidden shadow-2xl border-2 transition-all duration-500 ${
                  isActive 
                    ? `border-${color}-400 shadow-${color}-500/30` 
                    : 'border-gray-600 shadow-gray-900/50'
                }`}>
                  <img
                    src={image}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700"
                    style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                  />
                  
                  {/* Overlay per foto non attive */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/30" />
                  )}
                  
                  {/* Indicatore foto attiva */}
                  {isActive && (
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-${color}-400 animate-pulse`} />
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Navigation buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 hover:scale-110 transition-all duration-300"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 hover:scale-110 transition-all duration-300"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex 
                    ? `border-${color}-400 scale-110` 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            {/* Main image */}
            <div className="relative max-w-4xl max-h-full">
              <img
                src={images[currentIndex]}
                alt={`Foto ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Navigation in fullscreen */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};