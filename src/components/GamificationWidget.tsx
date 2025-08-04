"use client";

import React from 'react';
import Image from 'next/image';

interface BadgeProps {
  icon: string;
  name: string;
  color: string;
}

function Badge({ icon, name, color }: BadgeProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white text-xl mb-1`}>
        {icon}
      </div>
      <span className="text-xs text-textSecondary text-center">{name}</span>
    </div>
  );
}

interface LeaderboardItemProps {
  position: number;
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

function LeaderboardItem({ position, name, points, avatar, isCurrentUser }: LeaderboardItemProps) {
  return (
    <div className={`flex items-center p-2 rounded-lg ${isCurrentUser ? 'bg-accent/20' : ''}`}>
      <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-medium mr-2">
        {position}
      </div>
      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
        <Image src={avatar} alt={name} className="w-full h-full object-cover" fill sizes="32px" />
      </div>
      <div className="flex-1">
        <p className="text-white font-medium text-sm">{name}</p>
      </div>
      <div className="text-accent font-medium text-sm">{points} pt</div>
    </div>
  );
}

export function GamificationWidget() {
  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
  };

  return (
    <div className="bg-dark-300 rounded-xl p-5 shadow-sm border border-dark-100 mb-8 card-glow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-heading font-medium">I tuoi progressi</h2>
        <button 
          className="text-accent text-sm font-medium flex items-center"
          onClick={showFeatureComingSoon}
        >
          Vedi tutti
          <span className="ml-1">→</span>
        </button>
      </div>
      
      {/* Livello e punti */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-textSecondary text-sm">Livello Cittadino</span>
          <span className="text-accent font-medium text-sm">Livello 3</span>
        </div>
        <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full" style={{ width: '65%' }}></div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-textSecondary text-xs">1,250 punti</span>
          <span className="text-textSecondary text-xs">2,000 punti per Livello 4</span>
        </div>
      </div>
      
      {/* Badge recenti */}
      <div className="mb-6">
        <h3 className="text-white font-medium text-base mb-3">Badge recenti</h3>
        <div className="flex justify-between">
          <Badge 
            icon="🏆" 
            name="Esploratore" 
            color="bg-accent" 
          />
          <Badge 
            icon="🌟" 
            name="Cittadino Attivo" 
            color="bg-accent/80" 
          />
          <Badge 
            icon="📸" 
            name="Fotografo" 
            color="bg-accent/60" 
          />
        </div>
      </div>
      
      {/* Classifica settimanale */}
      <div>
        <h3 className="text-white font-medium text-base mb-3">Classifica settimanale</h3>
        <div className="space-y-2">
          <LeaderboardItem 
            position={1} 
            name="Laura Bianchi" 
            points={2450} 
            avatar="https://i.pravatar.cc/150?img=5" 
          />
          <LeaderboardItem 
            position={2} 
            name="Mario Rossi" 
            points={1250} 
            avatar="https://i.pravatar.cc/150?img=12" 
            isCurrentUser={true}
          />
          <LeaderboardItem 
            position={3} 
            name="Giulia Verdi" 
            points={980} 
            avatar="https://i.pravatar.cc/150?img=9" 
          />
        </div>
      </div>
    </div>
  );
}
