"use client";

import React from 'react';

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string | number;
  onClick: () => void;
}

function QuickAction({ icon, title, subtitle, badge, onClick }: QuickActionProps) {
  return (
    <button 
      className="bg-dark-300 rounded-xl p-4 shadow-sm border border-dark-100 hover:shadow-md transition-all flex flex-col items-start w-full card-glow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start w-full mb-3">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl">
          {icon}
        </div>
        
        {badge && (
          <div className="bg-accent text-black text-xs font-medium px-2 py-1 rounded-full">
            {badge}
          </div>
        )}
      </div>
      
      <h3 className="text-white font-medium text-lg">{title}</h3>
      <p className="text-textSecondary text-sm">{subtitle}</p>
    </button>
  );
}

export function QuickActionsGrid() {
  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
  };

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-heading font-medium mb-4">Azioni rapide</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction 
          icon="📍" 
          title="Segnala Problema" 
          subtitle="Aiuta a migliorare la città" 
          onClick={showFeatureComingSoon}
        />
        
        <QuickAction 
          icon="📅" 
          title="Eventi Oggi" 
          subtitle="Cosa fare in città" 
          badge="5 eventi"
          onClick={showFeatureComingSoon}
        />
        
        <QuickAction 
          icon="🏛️" 
          title="Servizi" 
          subtitle="Prenota e gestisci" 
          onClick={showFeatureComingSoon}
        />
        
        <QuickAction 
          icon="📊" 
          title="Dashboard" 
          subtitle="Punti e attività" 
          onClick={showFeatureComingSoon}
        />
      </div>
    </div>
  );
}