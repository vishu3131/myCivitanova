"use client";

import React, { useState } from 'react';

interface SuggestionCardProps {
  title: string;
  description: string;
  image: string;
  rating: number;
  category: string;
  onClick: () => void;
}

function SuggestionCard({ title, description, image, rating, category, onClick }: SuggestionCardProps) {
  return (
    <div 
      className="bg-dark-300 rounded-xl overflow-hidden shadow-sm border border-dark-100 hover:shadow-md transition-shadow cursor-pointer card-glow"
      onClick={onClick}
    >
      <div className="relative h-40">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 bg-dark-300/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-white">
          {category}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-medium">{title}</h3>
          <div className="flex items-center bg-accent/20 text-accent text-xs font-medium px-2 py-1 rounded-full">
            <span className="mr-1">⭐</span>
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-textSecondary text-sm line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

export function SuggestionsWidget() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const showFeatureComingSoon = () => {
    alert("Questa funzionalità sarà disponibile prossimamente!");
  };
  
  const filters = [
    { id: 'all', label: 'Tutti' },
    { id: 'free', label: 'Gratis', emoji: '🆓' },
    { id: 'family', label: 'Famiglia', emoji: '👨‍👩‍👧‍👦' },
    { id: 'outdoor', label: 'All\'aperto', emoji: '🌳' },
    { id: 'culture', label: 'Cultura', emoji: '🏛️' }
  ];
  
  const suggestions = [
    {
      id: 1,
      title: 'Passeggiata sul Lungomare',
      description: 'Goditi una rilassante passeggiata sul lungomare di Civitanova, con vista sul mare Adriatico e numerosi locali dove fermarsi.',
      image: 'https://source.unsplash.com/random/400x300/?seafront,promenade',
      rating: 4.8,
      category: 'All\'aperto'
    },
    {
      id: 2,
      title: 'Museo Civico',
      description: 'Visita il museo civico per scoprire la storia e le tradizioni di Civitanova Marche attraverso reperti archeologici e opere d\'arte.',
      image: 'https://source.unsplash.com/random/400x300/?museum,art',
      rating: 4.5,
      category: 'Cultura'
    },
    {
      id: 3,
      title: 'Parco Giochi Comunale',
      description: 'Un\'area verde attrezzata con giochi per bambini, perfetta per le famiglie che vogliono trascorrere qualche ora all\'aria aperta.',
      image: 'https://source.unsplash.com/random/400x300/?playground,park',
      rating: 4.3,
      category: 'Famiglia'
    },
    {
      id: 4,
      title: 'Mercato Settimanale',
      description: 'Esplora il tradizionale mercato settimanale con bancarelle di prodotti locali, abbigliamento e artigianato.',
      image: 'https://source.unsplash.com/random/400x300/?market,local',
      rating: 4.2,
      category: 'Gratis'
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-heading font-medium">Cosa fare oggi</h2>
        <button 
          className="text-accent text-sm font-medium flex items-center"
          onClick={showFeatureComingSoon}
        >
          Vedi tutti
          <span className="ml-1">→</span>
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
        {filters.map(filter => (
          <button 
            key={filter.id}
            className={`
              flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              ${activeFilter === filter.id 
                ? 'bg-accent text-black' 
                : 'bg-dark-200 text-white hover:bg-dark-100'
              }
            `}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.emoji && <span className="mr-1">{filter.emoji}</span>}
            {filter.label}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map(suggestion => (
          <SuggestionCard 
            key={suggestion.id}
            title={suggestion.title}
            description={suggestion.description}
            image={suggestion.image}
            rating={suggestion.rating}
            category={suggestion.category}
            onClick={showFeatureComingSoon}
          />
        ))}
      </div>
    </div>
  );
}