'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, SortDesc, Clock, TrendingUp, Flame } from 'lucide-react';

type SortOption = 'recent' | 'popular' | 'trending';

const sortOptionsConfig = [
  { id: 'recent', label: 'Più Recenti', icon: Clock },
  { id: 'popular', label: 'Più Popolari', icon: TrendingUp },
  { id: 'trending', label: 'In Tendenza', icon: Flame }
];

interface SortMenuProps {
  sortBy: SortOption;
  onSortByChange: (option: SortOption) => void;
}

export const SortMenu: React.FC<SortMenuProps> = ({ sortBy, onSortByChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option: SortOption) => {
    onSortByChange(option);
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

  const selectedOption = sortOptionsConfig.find(opt => opt.id === sortBy);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 px-3 py-1 bg-dark-300/50 border border-white/10 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <SortDesc className="w-4 h-4" />
        <span className="text-sm">{selectedOption?.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-10 bg-dark-400 rounded-lg shadow-xl border border-white/10 py-2 min-w-[160px] z-20"
          >
            {sortOptionsConfig.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id as SortOption)}
                  className={`w-full px-4 py-2 text-left hover:bg-white/10 flex items-center space-x-2 text-sm ${
                    sortBy === option.id ? 'text-accent' : 'text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
