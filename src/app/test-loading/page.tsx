"use client";

import React from 'react';
import { LoadingExamples } from '@/components/examples/LoadingExamples';

export default function TestLoadingPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Test Sistema di Caricamento Ottimizzato
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Questa pagina dimostra il funzionamento del nuovo sistema di caricamento 
            che previene i clic multipli e fornisce feedback immediato all'utente.
          </p>
        </div>
        
        <LoadingExamples />
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Prova a cliccare rapidamente sui bottoni per vedere come il sistema previene i clic multipli.
          </p>
        </div>
      </div>
    </div>
  );
}