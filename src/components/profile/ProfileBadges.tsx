// Componente Badges del profilo

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Filter, Search, Calendar, Star, Trophy, Medal } from 'lucide-react';
import { Badge } from '@/types/profile';
import { getRarityColor } from '@/utils/profileValidation';

interface ProfileBadgesProps {
  badges: Badge[];
}

type FilterType = 'all' | 'common' | 'rare' | 'epic' | 'legendary';
type SortType = 'recent' | 'alphabetical' | 'rarity';

export const ProfileBadges: React.FC<ProfileBadgesProps> = ({ badges }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Filter and sort badges
  const filteredAndSortedBadges = React.useMemo(() => {
    let filtered = badges.filter(badge => {
      const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || badge.rarity === filterType;
      return matchesSearch && matchesFilter;
    });

    // Sort badges
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'recent':
          return new Date(b.earned_at || 0).getTime() - new Date(a.earned_at || 0).getTime();
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
          return (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - 
                 (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [badges, searchTerm, filterType, sortType]);

  const badgeStats = React.useMemo(() => {
    const stats = badges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: badges.length,
      common: stats.common || 0,
      rare: stats.rare || 0,
      epic: stats.epic || 0,
      legendary: stats.legendary || 0
    };
  }, [badges]);

  const filterOptions = [
    { value: 'all' as FilterType, label: 'Tutti', count: badgeStats.total },
    { value: 'common' as FilterType, label: 'Comuni', count: badgeStats.common },
    { value: 'rare' as FilterType, label: 'Rari', count: badgeStats.rare },
    { value: 'epic' as FilterType, label: 'Epici', count: badgeStats.epic },
    { value: 'legendary' as FilterType, label: 'Leggendari', count: badgeStats.legendary }
  ];

  if (badges.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nessun badge ottenuto</p>
          <p className="text-gray-500 text-sm mt-2">
            Partecipa agli eventi per ottenere i tuoi primi badge!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Collezione Badge
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {filterOptions.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="text-center p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="text-2xl font-bold text-white">{option.count}</div>
              <div className="text-sm text-gray-400">{option.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca badge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          
          {/* Filter */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
            
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 transition-colors"
            >
              <option value="recent" className="bg-gray-800">Più Recenti</option>
              <option value="alphabetical" className="bg-gray-800">Alfabetico</option>
              <option value="rarity" className="bg-gray-800">Rarità</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <AnimatePresence>
          {filteredAndSortedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBadge(badge)}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center cursor-pointer hover:border-white/20 transition-all duration-300 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {badge.icon}
              </div>
              
              <h4 className="font-semibold text-white mb-2 text-sm">{badge.name}</h4>
              
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getRarityColor(badge.rarity)}`}>
                {badge.rarity}
              </div>
              
              {badge.earned_at && (
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(badge.earned_at).toLocaleDateString('it-IT')}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {filteredAndSortedBadges.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nessun badge trovato</p>
          <p className="text-gray-500 text-sm mt-2">
            Prova a modificare i filtri di ricerca
          </p>
        </motion.div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/20 rounded-3xl p-8 max-w-md w-full text-center"
            >
              <div className="text-6xl mb-4">{selectedBadge.icon}</div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{selectedBadge.name}</h3>
              
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getRarityColor(selectedBadge.rarity)}`}>
                {selectedBadge.rarity}
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">{selectedBadge.description}</p>
              
              {selectedBadge.earned_at && (
                <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
                  <Medal className="w-5 h-5" />
                  <span>Ottenuto il {new Date(selectedBadge.earned_at).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
              )}
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300"
              >
                Chiudi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileBadges;