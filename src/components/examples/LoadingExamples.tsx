"use client";

import React from 'react';
import { OptimizedButton } from '@/components/OptimizedButton';
import { OptimizedLink } from '@/components/OptimizedLink';
import { useOptimizedNavigation } from '@/hooks/useOptimizedNavigation';
import { useLoading } from '@/context/LoadingContext';

export function LoadingExamples() {
  const { navigateTo } = useOptimizedNavigation();
  const { startLoading, stopLoading } = useLoading();

  const handleAsyncOperation = async () => {
    // Simula un'operazione asincrona
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Operazione completata!');
  };

  const handleManualLoading = async () => {
    startLoading('Elaborazione dati...');
    try {
      // Simula un'operazione che richiede tempo
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Elaborazione completata!');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">
        Esempi di Sistema di Caricamento Ottimizzato
      </h2>

      <div className="grid gap-4">
        {/* Bottoni ottimizzati */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Bottoni Ottimizzati</h3>
          <div className="flex flex-wrap gap-3">
            <OptimizedButton
              variant="primary"
              loadingMessage="Salvando i dati..."
              onClick={handleAsyncOperation}
            >
              Salva Dati
            </OptimizedButton>

            <OptimizedButton
              variant="accent"
              loadingMessage="Inviando messaggio..."
              onClick={handleAsyncOperation}
            >
              Invia Messaggio
            </OptimizedButton>

            <OptimizedButton
              variant="secondary"
              loadingMessage="Eliminando..."
              onClick={handleAsyncOperation}
            >
              Elimina
            </OptimizedButton>

            <OptimizedButton
              variant="ghost"
              loadingMessage="Caricamento..."
              onClick={handleManualLoading}
            >
              Caricamento Manuale
            </OptimizedButton>
          </div>
        </div>

        {/* Link ottimizzati */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Link Ottimizzati</h3>
          <div className="flex flex-wrap gap-3">
            <OptimizedLink
              href="/community"
              loadingMessage="Caricamento community..."
              className="text-accent hover:text-accent/80 underline"
            >
              Vai alla Community
            </OptimizedLink>

            <OptimizedLink
              href="/"
              loadingMessage="Tornando alla home..."
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Torna alla Home
            </OptimizedLink>
          </div>
        </div>

        {/* Navigazione programmatica */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Navigazione Programmatica</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigateTo('/community', 'Caricamento sezione community...')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Naviga alla Community
            </button>

            <button
              onClick={() => navigateTo('/', 'Tornando alla home page...')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Vai alla Home
            </button>
          </div>
        </div>

        {/* Informazioni sul sistema */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Come Funziona</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• <strong>Feedback Immediato:</strong> L'animazione di caricamento appare immediatamente al clic</li>
            <li>• <strong>Prevenzione Clic Multipli:</strong> I bottoni si disabilitano durante l'elaborazione</li>
            <li>• <strong>Messaggi Personalizzati:</strong> Ogni azione può avere un messaggio di caricamento specifico</li>
            <li>• <strong>Navigazione Ottimizzata:</strong> Le transizioni tra pagine sono fluide e immediate</li>
            <li>• <strong>Gestione Globale:</strong> Un unico sistema gestisce tutti i caricamenti dell'app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}