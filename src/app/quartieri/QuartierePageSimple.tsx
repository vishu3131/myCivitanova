'use client';

import React, { useState } from 'react';
import { Quartiere } from '../../data/quartieriData';
import Image from 'next/image';

interface QuartierePageSimpleProps {
  quartiereData: Quartiere[];
}

const QuartierePageSimple: React.FC<QuartierePageSimpleProps> = ({ quartiereData }) => {
  const [selectedQuartiere, setSelectedQuartiere] = useState<Quartiere | null>(quartiereData[0]);

  if (!selectedQuartiere) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏘️</div>
          <p className="text-white text-xl">Caricamento quartieri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">🚀 Quartieri Rinnovati!</h1>
            <p className="text-gray-400">Nuova interfaccia futuristica attiva</p>
          </div>
        </div>
      </div>

      {/* Simple Quartiere Selection */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quartiereData.map((quartiere) => (
            <div
              key={quartiere.id}
              onClick={() => setSelectedQuartiere(quartiere)}
              className={`relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                selectedQuartiere.id === quartiere.id 
                  ? `border-${quartiere.color}-400 shadow-lg shadow-${quartiere.color}-500/30` 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <Image
                src={quartiere.image}
                alt={quartiere.name}
                width={500} // Aggiungi una larghezza appropriata
                height={300} // Aggiungi un'altezza appropriata
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h3 className={`font-bold text-lg ${
                  selectedQuartiere.id === quartiere.id 
                    ? `text-${quartiere.color}-100` 
                    : 'text-white'
                }`}>
                  {quartiere.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {quartiere.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Quartiere Details */}
        <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-${selectedQuartiere.color}-500/20`}>
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold text-${selectedQuartiere.color}-100 mb-4`}>
              {selectedQuartiere.name}
            </h2>
            <p className="text-gray-300 text-lg">
              {selectedQuartiere.description}
            </p>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {selectedQuartiere.highlights?.map((highlight, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-full bg-${selectedQuartiere.color}-500/20 text-${selectedQuartiere.color}-200 border border-${selectedQuartiere.color}-400/30 font-medium`}
              >
                {highlight}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold text-${selectedQuartiere.color}-400`}>
                {selectedQuartiere.events?.length || 0}
              </div>
              <div className="text-gray-400 text-sm">Eventi</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-${selectedQuartiere.color}-400`}>
                {selectedQuartiere.parks?.length || 0}
              </div>
              <div className="text-gray-400 text-sm">Parchi</div>
            </div>
            <div>
              <div className={`text-2xl font-bold text-${selectedQuartiere.color}-400`}>
                {selectedQuartiere.gallery?.length || 0}
              </div>
              <div className="text-gray-400 text-sm">Foto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuartierePageSimple;