"use client";

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

export interface AdvancedFiltersState {
  priceRange: { min: number | null; max: number | null };
  location: string;
  locationRadius: number; // in km
  dateRange: { from: Date | null; to: Date | null };
  condition: string | null;
  tags: string[];
  hasImages: boolean;
  hasReviews: boolean;
}

interface AdvancedFiltersProps {
  filters: AdvancedFiltersState;
  onFiltersChange: (filters: AdvancedFiltersState) => void;
  isOpen: boolean;
  onToggle: () => void;
  activeTab: 'beni' | 'servizi';
}

const CONDITIONS = [
  { value: 'nuovo', label: 'Nuovo' },
  { value: 'come_nuovo', label: 'Come nuovo' },
  { value: 'buono', label: 'Buono' },
  { value: 'discreto', label: 'Discreto' },
  { value: 'da_riparare', label: 'Da riparare' }
];

const LOCATIONS = [
  'Civitanova Marche',
  'Porto Sant\'Elpidio',
  'Sant\'Elpidio a Mare',
  'Montecosaro',
  'Potenza Picena',
  'Recanati',
  'Macerata',
  'Fermo'
];

const POPULAR_TAGS = {
  beni: ['vintage', 'artigianale', 'fatto a mano', 'collezione', 'raro', 'design', 'moderno', 'antico'],
  servizi: ['domicilio', 'urgente', 'weekend', 'serale', 'professionale', 'certificato', 'esperienza', 'garanzia']
};

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle, 
  activeTab 
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AdvancedFiltersState>(filters);

  const updateFilter = (key: keyof AdvancedFiltersState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const resetState: AdvancedFiltersState = {
      priceRange: { min: null, max: null },
      location: '',
      locationRadius: 10,
      dateRange: { from: null, to: null },
      condition: null,
      tags: [],
      hasImages: false,
      hasReviews: false
    };
    setLocalFilters(resetState);
    onFiltersChange(resetState);
  };

  const toggleTag = (tag: string) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    updateFilter('tags', newTags);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.priceRange.min !== null ||
      localFilters.priceRange.max !== null ||
      localFilters.location !== '' ||
      localFilters.condition !== null ||
      localFilters.tags.length > 0 ||
      localFilters.hasImages ||
      localFilters.hasReviews
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
          hasActiveFilters()
            ? 'bg-accent/20 border-accent/30 text-accent'
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
      >
        <span>🔧</span>
        Filtri avanzati
        {hasActiveFilters() && (
          <span className="bg-accent text-black rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
            {Object.values(localFilters).filter(v => 
              Array.isArray(v) ? v.length > 0 : 
              typeof v === 'object' && v !== null ? Object.values(v).some(val => val !== null && val !== '') :
              v !== null && v !== '' && v !== false
            ).length}
          </span>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span>🔧</span>
          Filtri avanzati
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="text-xs text-white/60 hover:text-white"
            >
              Reset
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-white/60 hover:text-white"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-xs text-white/80">Fascia di prezzo (€)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.priceRange.min || ''}
              onChange={(e) => updateFilter('priceRange', {
                ...localFilters.priceRange,
                min: e.target.value ? Number(e.target.value) : null
              })}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-accent/40"
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilters.priceRange.max || ''}
              onChange={(e) => updateFilter('priceRange', {
                ...localFilters.priceRange,
                max: e.target.value ? Number(e.target.value) : null
              })}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs text-white/80">Località</label>
          <select
            value={localFilters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Tutte le località</option>
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          {localFilters.location && (
            <div className="space-y-1">
              <label className="text-xs text-white/60">Raggio: {localFilters.locationRadius} km</label>
              <input
                type="range"
                min="1"
                max="50"
                value={localFilters.locationRadius}
                onChange={(e) => updateFilter('locationRadius', Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Condition (only for beni) */}
        {activeTab === 'beni' && (
          <div className="space-y-2">
            <label className="text-xs text-white/80">Condizione</label>
            <select
              value={localFilters.condition || ''}
              onChange={(e) => updateFilter('condition', e.target.value || null)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">Tutte le condizioni</option>
              {CONDITIONS.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-xs text-white/80">Tag popolari</label>
        <div className="flex flex-wrap gap-1">
          {POPULAR_TAGS[activeTab].map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                localFilters.tags.includes(tag)
                  ? 'bg-accent/20 border-accent/30 text-accent'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Additional filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter('hasImages', !localFilters.hasImages)}
          className={`px-3 py-1.5 rounded-full text-xs border flex items-center gap-1 ${
            localFilters.hasImages
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <span>📸</span> Solo con immagini
        </button>
        <button
          onClick={() => updateFilter('hasReviews', !localFilters.hasReviews)}
          className={`px-3 py-1.5 rounded-full text-xs border flex items-center gap-1 ${
            localFilters.hasReviews
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <span>⭐</span> Solo con recensioni
        </button>
      </div>
    </div>
  );
}