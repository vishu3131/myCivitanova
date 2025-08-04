'use client';

import React from 'react';
import { quartieriData, Quartiere } from '@/data/quartieriData';

interface QuartieriScrollerProps {
  onQuartiereSelect: (quartiere: Quartiere) => void;
  selectedQuartiereId: string | null;
}

// Duplichiamo la lista per l'effetto loop
const loopedQuartieri = [...quartieriData, ...quartieriData];

export const QuartieriScroller: React.FC<QuartieriScrollerProps> = ({ onQuartiereSelect, selectedQuartiereId }) => {
  return (
    <div className="relative w-full overflow-hidden bg-gray-900 py-4 group">
      <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
      
      <div className="flex animate-scroll-loop group-hover:pause">
        {loopedQuartieri.map((quartiere, index) => (
          <div
            key={`${quartiere.id}-${index}`}
            onClick={() => onQuartiereSelect(quartiere)}
            className={`flex-shrink-0 mx-2 px-5 py-3 rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1
              ${selectedQuartiereId === quartiere.id
                ? 'bg-accent shadow-accent/30'
                : 'bg-gray-800/80 backdrop-blur-sm hover:bg-accent hover:shadow-accent/30'
              }`
            }
          >
            <p className="text-white font-semibold text-lg whitespace-nowrap">{quartiere.nome}</p>
          </div>
        ))}
      </div>
    </div>
  );
};