"use client";

import React from 'react';
import { Search, Waves, Calendar, Building, ShoppingBag, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'search', label: 'Cerca', icon: Search, path: '/esplora' },
  { id: 'beach', label: 'Spiaggia', icon: Waves, path: '/spiaggia' },
  { id: 'events', label: 'Eventi', icon: Calendar, path: '/eventi' },
  { id: 'culture', label: 'Cultura', icon: Building, path: '/esplora' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, path: '/esplora' },
  { id: 'districts', label: 'Quartieri', icon: Home, path: '/quartieri' },
];

export function CategoryTags() {
  const [activeTag, setActiveTag] = React.useState('search');
  const router = useRouter();

  return (
    <div style={{ paddingLeft: '24px', paddingRight: '24px', marginTop: '24px' }}>
      <div 
        className="flex flex-row gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
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