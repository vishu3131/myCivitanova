'use client';

import React from 'react';
import { quartieriData } from '@/data/quartieriData';
import QuartierePage from '../quartieri/QuartierePage';

const QuartieriDemoPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto">
        <div className="text-center py-8 border-b border-gray-800">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏘️ Quartieri Demo - Funzionalità Futuristiche
          </h1>
          <p className="text-gray-400 text-lg">
            Esplora la nuova sezione quartieri con carousel 3D, gallerie interattive e widget avanzati
          </p>
          <div className="flex justify-center space-x-4 mt-4 text-sm text-gray-500">
            <span>✨ Carousel 3D</span>
            <span>📸 Galleria Foto</span>
            <span>📅 Eventi</span>
            <span>🌳 Parchi</span>
            <span>🔍 Ricerca</span>
          </div>
        </div>
        
        <QuartierePage quartiereData={quartieriData} />
      </div>
    </div>
  );
};

export default QuartieriDemoPage;