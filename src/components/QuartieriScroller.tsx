'use client';

import React from 'react';

const quartieri = [
  "Centro",
  "San Marone",
  "San Gabriele",
  "Fontespina",
  "Quattro Marine",
  "Lungomare Sud (Stadio)",
  "Lungomare Nord",
  "San Giuseppe (Risorgimento)",
  "Santa Maria Apparente",
  "Civitanova Alta",
  "Fontanella",
  "Villa Eugenia",
];

// Duplichiamo la lista per l'effetto loop
const loopedQuartieri = [...quartieri, ...quartieri];

export const QuartieriScroller = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gray-900 py-4 group">
      <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
      
      <div className="flex animate-scroll-loop group-hover:pause">
        {loopedQuartieri.map((nome, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-2 px-5 py-3 bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:bg-accent hover:shadow-accent/30 hover:-translate-y-1"
          >
            <p className="text-white font-semibold text-lg whitespace-nowrap">{nome}</p>
          </div>
        ))}
      </div>
    </div>
  );
};