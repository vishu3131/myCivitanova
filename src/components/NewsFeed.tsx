"use client";

import React from 'react';

interface NewsItemProps {
  title: string;
  timestamp: string;
  source: string;
  type: 'urgent' | 'news' | 'event';
  onClick: () => void;
}

function NewsItem({ title, timestamp, source, type, onClick }: NewsItemProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'urgent':
        return {
          icon: '⚠️',
          bgColor: 'bg-[#E76F51]/10',
          textColor: 'text-[#E76F51]',
          borderColor: 'border-[#E76F51]/20'
        };
      case 'event':
        return {
          icon: '📅',
          bgColor: 'bg-[#2A9D8F]/10',
          textColor: 'text-[#2A9D8F]',
          borderColor: 'border-[#2A9D8F]/20'
        };
      default:
        return {
          icon: '📰',
          bgColor: 'bg-[#0077BE]/10',
          textColor: 'text-[#0077BE]',
          borderColor: 'border-[#0077BE]/20'
        };
    }
  };
  
  const styles = getTypeStyles();

  return (
    <button 
      className={`w-full text-left p-4 rounded-lg ${styles.bgColor} border ${styles.borderColor} mb-3 hover:shadow-sm transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className={`w-8 h-8 rounded-full ${styles.bgColor} flex items-center justify-center ${styles.textColor} mr-3 text-lg`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${type === 'urgent' ? 'text-[#E76F51]' : 'text-[#264653]'}`}>
            {title}
          </h3>
          <div className="flex items-center text-gray-500 text-xs mt-1">
            <span>{timestamp}</span>
            <span className="mx-1">•</span>
            <span>{source}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function NewsFeed() {
  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-heading font-medium">News & Annunci</h2>
        <button 
          className="text-accent text-sm font-medium flex items-center"
          onClick={showFeatureComingSoon}
        >
          Vedi tutti
          <span className="ml-1">→</span>
        </button>
      </div>
      
      <div className="space-y-3">
        <NewsItem 
          title="LAVORI STRADALI: Via Dante chiusa fino al 15 agosto" 
          timestamp="2 ore fa" 
          source="Ufficio Tecnico" 
          type="urgent"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Festa della Pizza 2024 - Sabato 3 agosto in Piazza" 
          timestamp="Ieri" 
          source="Eventi Comunali" 
          type="event"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Nuovi orari biblioteca comunale per l'estate" 
          timestamp="3 giorni fa" 
          source="Biblioteca Civica" 
          type="news"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Inaugurazione nuova pista ciclabile" 
          timestamp="1 settimana fa" 
          source="Assessorato Mobilità" 
          type="news"
          onClick={showFeatureComingSoon}
        />
        
        <NewsItem 
          title="Concerto al tramonto - Lungomare Sud" 
          timestamp="15 Agosto, 19:30" 
          source="Eventi Estivi" 
          type="event"
          onClick={showFeatureComingSoon}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="bg-dark-200 hover:bg-dark-100 text-white text-sm px-3 py-1 rounded-full transition-colors">
          Tutti
        </button>
        <button className="bg-[#E76F51]/20 hover:bg-[#E76F51]/30 text-[#E76F51] text-sm px-3 py-1 rounded-full transition-colors">
          Urgenti
        </button>
        <button className="bg-accent/20 hover:bg-accent/30 text-accent text-sm px-3 py-1 rounded-full transition-colors">
          News
        </button>
        <button className="bg-accent/20 hover:bg-accent/30 text-accent text-sm px-3 py-1 rounded-full transition-colors">
          Eventi
        </button>
      </div>
    </div>
  );
}