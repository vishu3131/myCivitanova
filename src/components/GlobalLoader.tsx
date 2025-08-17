"use client";

import React from 'react';
import { useLoading } from '@/context/LoadingContext';

export function GlobalLoader() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Spinner principale */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-600 rounded-full animate-spin border-t-accent"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-accent/30"></div>
        </div>

        {/* Punti animati */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce"></div>
          <div 
            className="w-3 h-3 bg-accent rounded-full animate-bounce" 
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-accent rounded-full animate-bounce" 
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>

        {/* Messaggio di caricamento */}
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-2">{loadingMessage}</p>
          <p className="text-gray-400 text-sm">Attendere prego...</p>
        </div>

        {/* Barra di progresso animata */}
        <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}