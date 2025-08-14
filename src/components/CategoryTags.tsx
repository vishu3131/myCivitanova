"use client";

import React, { useState, useEffect } from 'react';
import { Search, Waves, Calendar, Building, ShoppingBag, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'beach', label: 'Spiaggia', icon: Waves, path: '/spiaggia' },
  { id: 'events', label: 'Eventi', icon: Calendar, path: '/eventi' },
  { id: 'culture', label: 'Cultura', icon: Building, path: '/esplora' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, path: '/esplora' },
  { id: 'districts', label: 'Quartieri', icon: Home, path: '/quartieri' },
];

export function CategoryTags() {
  const [activeTag, setActiveTag] = useState('');
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    const text = 'in arrivo';
    let i = 0;
    setPlaceholder('');
    const interval = setInterval(() => {
      i++;
      setPlaceholder(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 90);
    return () => clearInterval(interval);
  }, []);

  const submitSearch = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/esplora?query=${encodeURIComponent(q)}`);
  };

  return (
    <div style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '24px' }}>
      <div 
        className="flex flex-row gap-3 overflow-x-auto scrollbar-hide scroll-smooth items-center"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Custom Search Input (replaces the 'Cerca' pill) */}
        <div className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
          <div className="input__container">
            <input
              type="text"
              className="input__search"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearch();
              }}
            />
            <button
              className="input__button__shadow"
              aria-label="Cerca"
              onClick={submitSearch}
            >
              <Search className="w-5 h-5 text-black/70" />
            </button>
            <span className="shadow__input"></span>
          </div>
        </div>

        {/* Remaining category pills */}
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          const isActive = activeTag === category.id;
          return (
            <div
              key={category.id}
              className={`flex-shrink-0 h-10 px-4 rounded-full flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                isActive ? 'scale-105' : 'hover:scale-105'
              }`}
              style={{
                background: isActive 
                  ? 'rgba(198, 255, 0, 0.15)' 
                  : 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: isActive 
                  ? '1px solid rgba(198, 255, 0, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isActive 
                  ? 'inset 0 0 0.5px rgba(198, 255, 0, 0.4), 0 0 10px rgba(198, 255, 0, 0.1)' 
                  : 'inset 0 0 0.5px rgba(255, 255, 255, 0.2)',
                scrollSnapAlign: 'start',
                animationDelay: `${index * 0.1}s`,
              }}
              onClick={() => {
                setActiveTag(category.id);
                router.push(category.path);
              }}
            >
              <IconComponent className={`w-4 h-4 transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-white/80'
              }`} />
              <span className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-white/90'
              }`}>
                {category.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}