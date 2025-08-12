'use client';

import React from 'react';
import { X, Search, Filter } from 'lucide-react';

interface MapControlWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

import { POI_CATEGORIES } from '@/data/poiCategories';
const categories = POI_CATEGORIES;

const MapControlWidget: React.FC<MapControlWidgetProps> = ({ 
  isOpen, 
  onClose, 
  activeCategory, 
  onCategoryChange,
  searchTerm,
  onSearchChange
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-gray-800 mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Controlli Mappa</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cerca un luogo o un'attività..."
            className="w-full bg-gray-100 border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filters */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
            <Filter size={20} className="mr-2" />
            Filtri per Categoria
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapControlWidget;
