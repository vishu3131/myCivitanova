"use client";

import React from 'react';
import { MobileServicesScreen } from '@/components/MobileServicesScreen';

export default function ServiziPage() {
  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileServicesScreen />
      </div>
      
      {/* Desktop View - Placeholder for now */}
      <div className="hidden md:block">
        <div className="min-h-screen bg-dark-400 flex items-center justify-center">
          <h1 className="text-white text-2xl">Pagina Servizi - Desktop Version Coming Soon</h1>
        </div>
      </div>
    </>
  );
}