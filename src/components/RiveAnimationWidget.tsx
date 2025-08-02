'use client';

import React from 'react';
import { useRive } from '@rive-app/react-canvas';
import { Heart, Play, Pause } from 'lucide-react';

interface RiveAnimationWidgetProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function RiveAnimationWidget({ 
  title = "Animazione Interattiva",
  description = "Passa il mouse per attivare l'animazione",
  className = ""
}: RiveAnimationWidgetProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [hasRiveFile, setHasRiveFile] = React.useState(false);

  const { rive, RiveComponent } = useRive({
    src: '/animations/heart.riv', // Il file che metterai in public/animations/
    stateMachines: ['State Machine 1'],
    autoplay: false,
    onLoad: () => {
      setHasRiveFile(true);
    },
    onLoadError: () => {
      setHasRiveFile(false);
    }
  });

  const handlePlay = () => {
    if (rive) {
      rive.play();
    }
    setIsAnimating(true);
  };

  const handlePause = () => {
    if (rive) {
      rive.pause();
    }
    setIsAnimating(false);
  };

  const handleReset = () => {
    if (rive) {
      rive.reset();
    }
    setIsAnimating(false);
  };

  // Componente di fallback quando il file .riv non è disponibile
  const FallbackAnimation = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100">
      <div className={`text-6xl transition-transform duration-300 ${isAnimating ? 'scale-125 animate-pulse' : 'scale-100'}`}>
        ❤️
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Header del Widget */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-red-500 p-2 rounded-full">
          <Heart className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Container dell'animazione Rive */}
      <div className="relative">
        <div 
          className="w-full h-48 bg-gradient-to-br from-pink-50 to-red-50 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-pink-200 transition-all duration-300"
          onMouseEnter={handlePlay}
          onMouseLeave={handlePause}
          onClick={handlePlay}
        >
          {hasRiveFile ? (
            <RiveComponent className="w-full h-full" />
          ) : (
            <FallbackAnimation />
          )}
        </div>

        {/* Overlay con informazioni */}
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1">
          <span className="text-xs text-gray-600">
            {hasRiveFile ? 'Hover per animare' : 'Demo: Click per animare'}
          </span>
        </div>
      </div>

      {/* Controlli dell'animazione */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm">Play</span>
        </button>
        
        <button
          onClick={handlePause}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
        >
          <Pause className="w-4 h-4" />
          <span className="text-sm">Pause</span>
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm"
        >
          Reset
        </button>
      </div>

      {/* Indicatore di stato */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <div className={`w-2 h-2 rounded-full ${hasRiveFile ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
          <span className="text-xs text-gray-600">
            {hasRiveFile ? 'Animazione Rive caricata' : 'Modalità demo (aggiungi heart.riv)'}
          </span>
        </div>
      </div>
    </div>
  );
}