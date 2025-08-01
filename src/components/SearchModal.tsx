"use client";

import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, MapPin } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const recentSearches = [
  'Centro Storico',
  'Eventi jazz',
  'Ristoranti porto',
  'Spiagge libere',
];

const trendingSearches = [
  'Concerto stasera',
  'Mercato del pesce',
  'Lungomare sud',
  'Palazzo Sforza',
];

const quickFilters = [
  { id: 'places', label: 'Luoghi', icon: MapPin },
  { id: 'events', label: 'Eventi', icon: Clock },
  { id: 'trending', label: 'Tendenze', icon: TrendingUp },
];

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('places');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm" style={{ zIndex: 9990 }}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-16 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="flex-1 flex items-center gap-3 p-4 rounded-2xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Search className="w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Cerca luoghi, eventi, servizi..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && query && handleSearch(query)}
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-sm"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {quickFilters.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                    activeFilter === filter.id ? 'scale-105' : 'hover:scale-105'
                  }`}
                  style={{
                    background: activeFilter === filter.id 
                      ? 'rgba(198, 255, 0, 0.15)' 
                      : 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: activeFilter === filter.id 
                      ? '1px solid rgba(198, 255, 0, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <IconComponent className={`w-4 h-4 ${
                    activeFilter === filter.id ? 'text-accent' : 'text-white/70'
                  }`} />
                  <span className={`text-sm font-medium ${
                    activeFilter === filter.id ? 'text-white' : 'text-white/70'
                  }`}>
                    {filter.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 overflow-y-auto">
          {/* Recent Searches */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-white/60" />
              <h3 className="text-white text-sm font-bold">Ricerche Recenti</h3>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white/60" />
                  </div>
                  <span className="text-white text-sm">{search}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Searches */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h3 className="text-white text-sm font-bold">Tendenze</h3>
            </div>
            <div className="space-y-2">
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200 text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-white text-sm">{search}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}