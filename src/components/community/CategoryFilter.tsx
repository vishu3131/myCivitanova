'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter } from 'lucide-react';
import { COMMUNITY_CATEGORIES, getCategoryById, getCategoryLabel } from '@/lib/categories';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (category: string) => {
    // Convert display label back to category ID for backend
    const categoryObj = COMMUNITY_CATEGORIES.find(cat => cat.label === category);
    const categoryId = categoryObj ? categoryObj.id : category.toLowerCase();
    onSelectCategory(categoryId);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-1 bg-dark-300/50 border border-white/10 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Filter className="w-4 h-4" />
        {selectedCategory ? (
          <>
            <span className="text-sm">{getCategoryById(selectedCategory)?.icon}</span>
            <span className="text-sm">{getCategoryLabel(selectedCategory)}</span>
          </>
        ) : (
          <span className="text-sm">Tutte le categorie</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute left-0 top-10 bg-dark-400 rounded-lg shadow-xl border border-white/10 py-2 w-48 z-20"
          >
            <button
              onClick={() => handleSelect('')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 ${
                !selectedCategory ? 'text-accent' : 'text-white'
              }`}
            >
              Tutte le categorie
            </button>
            {categories.map((category) => (
              <button
              key={category}
              onClick={() => handleSelect(category)}
              className={`w-full px-4 py-2 text-left hover:bg-white/10 text-sm flex items-center space-x-2 ${
                selectedCategory === COMMUNITY_CATEGORIES.find(cat => cat.label === category)?.id ? 'text-accent' : 'text-white'
              }`}
            >
              <span>{COMMUNITY_CATEGORIES.find(cat => cat.label === category)?.icon || '📝'}</span>
              <span>{category}</span>
            </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
