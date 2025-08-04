'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavbar } from '@/components/BottomNavbar';
import { QuartieriScroller } from '@/components/QuartieriScroller';
import { quartieriData, Quartiere } from '@/data/quartieriData';
import Image from 'next/image';

const QuartierePage = () => {
  const [selectedQuartiere, setSelectedQuartiere] = useState<Quartiere>(quartieriData);

  const handleSelectQuartiere = (quartiere: Quartiere) => {
    setSelectedQuartiere(quartiere);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header title="Quartieri" />
      
      <div className="pt-16 md:pt-[70px] lg:pt-20">
        <QuartieriScroller 
          onQuartiereSelect={handleSelectQuartiere}
          selectedQuartiereId={selectedQuartiere.id}
        />
      </div>

      <main className="flex-grow p-4 md:p-6">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative w-full h-48 md:h-64">
            <Image
              src={selectedQuartiere.immagine}
              alt={`Immagine del quartiere ${selectedQuartiere.nome}`}
              layout="fill"
              objectFit="cover"
              className="opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
            <h2 className="absolute bottom-4 left-4 text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {selectedQuartiere.nome}
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-6">{selectedQuartiere.descrizione}</p>
            
            <h3 className="text-xl font-semibold mb-4 text-accent">Punti di Interesse</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedQuartiere.puntiInteresse.map((punto, index) => (
                <div key={index} className="bg-gray-700/50 p-4 rounded-lg flex items-center">
                  <span className="text-2xl mr-4">
                    {punto.tipo === 'monumento' && '🏛️'}
                    {punto.tipo === 'ristorante' && '🍴'}
                    {punto.tipo === 'parco' && '🌳'}
                    {punto.tipo === 'negozio' && '🛍️'}
                  </span>
                  <div>
                    <h4 className="font-bold text-white">{punto.nome}</h4>
                    <p className="text-sm text-gray-400 capitalize">{punto.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default QuartierePage;