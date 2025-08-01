"use client";

import React from 'react';

interface ServiceItemProps {
  title: string;
  color: string;
  emoji: string;
}

function ServiceItem({ title, color, emoji }: ServiceItemProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-dark-200 hover:bg-dark-100 transition-colors cursor-pointer">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${color} text-xl`}>
        {emoji}
      </div>
      <span className="text-white text-xs text-center font-medium">{title}</span>
    </div>
  );
}

export function ServicesWidget() {
  return (
    <div className="bg-dark-300 rounded-xl p-5 card-glow border border-dark-100">
      <h2 className="text-xl font-heading font-medium text-white mb-4">Servizi comunali</h2>
      
      <div className="grid grid-cols-3 gap-3">
        <ServiceItem 
          emoji="🚌" 
          title="Trasporti" 
          color="bg-blue-500/20 text-blue-400"
        />
        <ServiceItem 
          emoji="🗑️" 
          title="Rifiuti" 
          color="bg-green-500/20 text-green-400"
        />
        <ServiceItem 
          emoji="📄" 
          title="Documenti" 
          color="bg-yellow-500/20 text-yellow-400"
        />
        <ServiceItem 
          emoji="🅿️" 
          title="Parcheggi" 
          color="bg-purple-500/20 text-purple-400"
        />
        <ServiceItem 
          emoji="📞" 
          title="Contatti" 
          color="bg-red-500/20 text-red-400"
        />
        <ServiceItem 
          emoji="🏢" 
          title="Uffici" 
          color="bg-indigo-500/20 text-indigo-400"
        />
      </div>
    </div>
  );
}