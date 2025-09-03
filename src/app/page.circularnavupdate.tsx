"use client";

import React from 'react';
import { CircularDevNavigation } from '@/components/CircularDevNavigation';

export default function CircularNavUpdatePreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      {/* Background content to show the navigation overlay */}
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Circular Navigation Preview
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Il componente di navigazione circolare è stato spostato leggermente a sinistra per un migliore centraggio. 
          Clicca il pulsante centrale per aprire il menu e verificare l&apos;allineamento.
        </p>
        
        {/* Sample content cards to show background */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Navigazione</h3>
            <p className="text-gray-300">Menu principale con 6 sezioni</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Funzioni Rapide</h3>
            <p className="text-gray-300">10 azioni rapide disponibili</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Centraggio</h3>
            <p className="text-gray-300">Posizionamento ottimizzato</p>
          </div>
        </div>

        <div className="mt-16 text-sm text-gray-400">
          Tocca il pulsante centrale per testare la navigazione circolare
        </div>
      </div>

      {/* The circular navigation component */}
      <CircularDevNavigation />
    </div>
  );
}