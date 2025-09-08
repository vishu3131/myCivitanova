import React from 'react';
import { MobileEventsScreen } from '@/components/MobileEventsScreen';

export default function EventiPage() {
  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileEventsScreen />
      </div>
      
      {/* Desktop View - Placeholder for now */}
      <div className="hidden md:block">
        <div className="min-h-screen bg-dark-400 flex items-center justify-center">
          <h1 className="text-white text-2xl">Pagina Eventi - Desktop Version Coming Soon</h1>
        </div>
      </div>
    </>
  );
}