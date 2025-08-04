'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Quartiere, QuartiereEvent, QuartierePark } from '@/data/quartieriData';
import { MagnifyingGlassIcon, XMarkIcon, MapPinIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';

interface SearchResult {
  type: 'quartiere' | 'event' | 'park';
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  category?: string;
  quartiere?: string;
  data: Quartiere | QuartiereEvent | QuartierePark;
}

interface QuartiereSearchWidgetProps {
  quartieri: Quartiere[];
  onResultSelect: (result: SearchResult) => void;
  color?: string;
}

export const QuartiereSearchWidget: React.FC<QuartiereSearchWidgetProps> = ({
  quartieri,
  onResultSelect,
  color = "blue"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'quartiere' | 'event' | 'park'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Carica ricerche recenti dal localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quartiere-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Salva ricerche recenti
  const saveRecentSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)]; // Mantieni solo le ultime 5
      setRecentSearches(updated);
      localStorage.setItem('quartiere-recent-searches', JSON.stringify(updated));
    }
  };

  // Crea indice di ricerca
  const searchIndex = useMemo(() => {
    const results: SearchResult[] = [];

    quartieri.forEach(quartiere => {
      // Aggiungi quartiere
      results.push({
        type: 'quartiere',
        id: quartiere.id,
        title: quartiere.name,
        subtitle: 'Quartiere',
        description: quartiere.description,
        image: quartiere.image,
        data: quartiere
      });

      // Aggiungi eventi del quartiere
      quartiere.events.forEach(event => {
        results.push({
          type: 'event',
          id: event.id,
          title: event.title,
          subtitle: `Evento • ${event.date}`,
          description: event.description,
          image: event.image,
          category: event.category,
          quartiere: quartiere.name,
          data: event
        });
      });

      // Aggiungi parchi del quartiere
      quartiere.parks.forEach(park => {
        results.push({
          type: 'park',
          id: park.id,
          title: park.name,
          subtitle: `Parco • ${park.address}`,
          description: park.description,
          image: park.image,
          quartiere: quartiere.name,
          data: park
        });
      });
    });

    return results;
  }, [quartieri]);

  // Filtra risultati
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    
    return searchIndex.filter(result => {
      // Filtro per tipo
      if (selectedFilter !== 'all' && result.type !== selectedFilter) {
        return false;
      }

      // Ricerca nel titolo, descrizione, categoria, quartiere
      const searchableText = [
        result.title,
        result.description,
        result.category,
        result.quartiere,
        result.subtitle
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(query);
    }).slice(0, 10); // Limita a 10 risultati
  }, [searchQuery, selectedFilter, searchIndex]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsExpanded(true);
      saveRecentSearch(query);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    setIsExpanded(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsExpanded(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'quartiere': return '🏘️';
      case 'event': return '📅';
      case 'park': return '🌳';
      default: return '📍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quartiere': return 'blue';
      case 'event': return 'purple';
      case 'park': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="relative w-full">
      {/* Search input */}
      <div className={`relative bg-gray-800 rounded-xl border-2 transition-all duration-300 ${
        isExpanded ? `border-${color}-400` : 'border-gray-600 hover:border-gray-500'
      }`}>
        <div className="flex items-center p-4">
          <MagnifyingGlassIcon className={`w-5 h-5 text-${color}-400 mr-3`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Cerca quartieri, eventi, parchi..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        {isExpanded && (
          <div className="border-t border-gray-700 p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Tutto', icon: '🔍' },
                { key: 'quartiere', label: 'Quartieri', icon: '🏘️' },
                { key: 'event', label: 'Eventi', icon: '📅' },
                { key: 'park', label: 'Parchi', icon: '🌳' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1 ${
                    selectedFilter === filter.key
                      ? `bg-${color}-500 text-white`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search results */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 rounded-xl border border-gray-600 shadow-2xl max-h-96 overflow-hidden">
          {searchQuery.trim() ? (
            filteredResults.length > 0 ? (
              <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {filteredResults.map((result, index) => {
                  const typeColor = getTypeColor(result.type);
                  
                  return (
                    <div
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleResultClick(result)}
                      className="p-4 hover:bg-gray-700 cursor-pointer transition-colors duration-200 border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Result image or icon */}
                        <div className="flex-shrink-0">
                          {result.image ? (
                            <img
                              src={result.image}
                              alt={result.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-lg bg-${typeColor}-500/20 flex items-center justify-center text-xl`}>
                              {getResultIcon(result.type)}
                            </div>
                          )}
                        </div>

                        {/* Result content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-white truncate">{result.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full bg-${typeColor}-500/20 text-${typeColor}-300 text-xs font-medium`}>
                              {result.type === 'quartiere' ? 'Quartiere' : 
                               result.type === 'event' ? 'Evento' : 'Parco'}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-1">{result.subtitle}</p>
                          <p className="text-gray-300 text-sm line-clamp-2">{result.description}</p>
                          
                          {/* Additional info */}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {result.quartiere && (
                              <div className="flex items-center space-x-1">
                                <MapPinIcon className="w-3 h-3" />
                                <span>{result.quartiere}</span>
                              </div>
                            )}
                            {result.category && (
                              <div className="flex items-center space-x-1">
                                <TagIcon className="w-3 h-3" />
                                <span className="capitalize">{result.category}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-400">Nessun risultato trovato</p>
                <p className="text-gray-500 text-sm mt-1">Prova con termini diversi</p>
              </div>
            )
          ) : (
            // Recent searches
            <div className="p-4">
              <h4 className="text-gray-400 text-sm font-medium mb-3">Ricerche recenti</h4>
              {recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nessuna ricerca recente</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};