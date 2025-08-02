'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavbar } from '@/components/BottomNavbar';
import { QuartieriScroller } from '@/components/QuartieriScroller';

const QuartierePage = () => {
  const [selectedQuartiere, setSelectedQuartiere] = useState("Centro");

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header title="Quartieri" />
      
      <div className="pt-16 md:pt-[70px] lg:pt-20">
        <QuartieriScroller />
      </div>

      <main className="flex-grow p-4 md:p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-accent">{selectedQuartiere}</h2>
          <p className="text-gray-300">
            Le informazioni dettagliate per il quartiere &quot;{selectedQuartiere}&quot; saranno disponibili a breve.
            Stiamo lavorando per offrirti la migliore esperienza possibile.
          </p>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default QuartierePage;