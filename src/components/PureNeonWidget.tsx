'use client';

import React from 'react';
import PureNeonButton from './PureNeonButton';
import { Sparkles, Zap } from 'lucide-react';

interface PureNeonWidgetProps {
  title?: string;
  description?: string;
  className?: string;
  onButtonClick?: () => void;
  buttonText?: string;
}

export default function PureNeonWidget({ 
  title = "Effetto Neon Puro",
  description = "Tocca per attivare l'effetto",
  className = "",
  onButtonClick,
  buttonText = "MyCivitanova.it"
}: PureNeonWidgetProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Header del Widget */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-green-500 p-2 rounded-full">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Container dell'effetto neon - Sfondo scuro come nell'HTML originale */}
      <div className="relative">
        <div 
          className="w-full h-48 rounded-xl overflow-hidden border-2 border-transparent hover:border-green-200 transition-all duration-300 flex items-center justify-center"
          style={{
            background: '#111' // Sfondo scuro come nell'HTML originale
          }}
        >
          {/* Pulsante Neon Puro */}
          <PureNeonButton 
            text={buttonText}
            onClick={onButtonClick}
            fontSize="clamp(1.2rem, 4vw, 2rem)" // Responsive font size
          />
        </div>
      </div>

      {/* Controlli e informazioni */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-600">
            Effetto CSS Puro Attivo
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-green-500">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-medium">PURE CSS</span>
        </div>
      </div>

      {/* Indicatore di stato */}
      <div className="mt-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-600">
            Effetto Neon CSS Nativo
          </span>
        </div>
      </div>
    </div>
  );
}