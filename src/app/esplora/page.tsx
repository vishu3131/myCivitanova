"use client";

import React from 'react';
import { MobileExploreScreen } from '@/components/MobileExploreScreen';

export default function EsploraPage() {
  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileExploreScreen />
      </div>
      
      {/* Desktop View - Placeholder for now */}
      <div className="hidden md:block">
        <div className="min-h-screen bg-dark-400 flex items-center justify-center">
          <h1 className="text-white text-2xl">Pagina Esplora - Desktop Version Coming Soon</h1>
        </div>
      </div>
    </>
  );
}