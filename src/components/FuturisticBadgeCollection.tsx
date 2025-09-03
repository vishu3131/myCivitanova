'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Crown, Shield, Zap, Target, Calendar, Users, Heart, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

interface Badge {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  earned_at?: string;
  progress?: number;
  is_earned: boolean;
}

interface BadgeProgress {
  badge_id: string;
  current_value: number;
  requirement_value: number;
  progress_percentage: number;
}

interface FuturisticBadgeCollectionProps {
  userId: string;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  trophy: Trophy,
  star: Star,
  award: Award,
  crown: Crown,
  shield: Shield,
  zap: Zap,
  target: Target,
  calendar: Calendar,
  users: Users,
  heart: Heart,
  sparkles: Sparkles,
};

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-500'
};

const rarityGlow = {
  common: 'shadow-gray-500/20',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/30',
  legendary: 'shadow-yellow-500/40'
};

function FuturisticBadgeCollection({ userId }: FuturisticBadgeCollectionProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<'all' | 'earned' | 'unearned'>('all');

  const loadBadges = useCallback(async () => {
    try {
      // Load all badges with user's earned status
      const { data: badgesData, error: badgesError } = await supabase
        .rpc('get_user_badges_with_progress', { user_id: userId });

      if (badgesError) {
        console.error('Error loading badges:', badgesError);
        // Fallback to basic badges query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('badges')
          .select('*');
        
        if (fallbackError) throw fallbackError;
        setBadges(fallbackData || []);
      } else {
        setBadges(badgesData || []);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  }, [userId]);

  const loadBadgeProgress = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_badge_progress', { user_id: userId });

      if (error) {
        console.error('Error loading badge progress:', error);
      } else {
        setBadgeProgress(data || []);
      }
    } catch (error) {
      console.error('Error loading badge progress:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBadges();
    loadBadgeProgress();
  }, [userId, loadBadges, loadBadgeProgress]);

  const categories = ['all', ...Array.from(new Set(badges.map(badge => badge.category)))];

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const filterMatch = filter === 'all' || 
                       (filter === 'earned' && badge.is_earned) ||
                       (filter === 'unearned' && !badge.is_earned);
    return categoryMatch && filterMatch;
  });

  const getBadgeProgress = (badgeId: string) => {
    return badgeProgress.find(p => p.badge_id === badgeId);
  };

  const renderBadgeIcon = (iconName: string, className: string = '') => {
    const IconComponent = iconMap[iconName.toLowerCase()] || Award;
    return <IconComponent className={className} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {['all', 'earned', 'unearned'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === filterOption
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filterOption === 'all' ? 'Tutti' : 
               filterOption === 'earned' ? 'Ottenuti' : 'Da Ottenere'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category === 'all' ? 'Tutte le Categorie' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">
            {badges.filter(b => b.is_earned).length}
          </div>
          <div className="text-sm text-gray-400">Badge Ottenuti</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">
            {badges.length}
          </div>
          <div className="text-sm text-gray-400">Badge Totali</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">
            {badges.filter(b => b.is_earned && b.rarity === 'legendary').length}
          </div>
          <div className="text-sm text-gray-400">Leggendari</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">
            {Math.round((badges.filter(b => b.is_earned).length / badges.length) * 100) || 0}%
          </div>
          <div className="text-sm text-gray-400">Completamento</div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredBadges.map((badge, index) => {
            const progress = getBadgeProgress(badge.id);
            const progressPercentage = progress?.progress_percentage || 0;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedBadge(badge)}
                className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border cursor-pointer transition-all hover:scale-105 ${
                  badge.is_earned 
                    ? `border-transparent bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg ${rarityGlow[badge.rarity]}`
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {/* Badge Icon */}
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  badge.is_earned 
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gray-700'
                }`}>
                  {badge.is_earned ? (
                    renderBadgeIcon(badge.icon, 'w-6 h-6 text-white')
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                {/* Badge Info */}
                <div className="text-center">
                  <h3 className={`font-bold text-sm mb-1 ${
                    badge.is_earned ? 'text-white' : 'text-gray-400'
                  }`}>
                    {badge.title}
                  </h3>
                  
                  <div className={`text-xs mb-2 ${
                    badge.is_earned ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </div>

                  {/* Progress Bar for Unearned Badges */}
                  {!badge.is_earned && progress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {progress.current_value}/{progress.requirement_value}
                      </div>
                    </div>
                  )}

                  {/* XP Reward */}
                  <div className={`text-xs flex items-center justify-center gap-1 mt-2 ${
                    badge.is_earned ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    <Zap className="w-3 h-3" />
                    {badge.xp_reward} XP
                  </div>
                </div>

                {/* Earned Date */}
                {badge.is_earned && badge.earned_at && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border ${
                selectedBadge.is_earned 
                  ? `border-transparent bg-gradient-to-br ${rarityColors[selectedBadge.rarity]} shadow-2xl ${rarityGlow[selectedBadge.rarity]}`
                  : 'border-gray-700'
              }`}
            >
              {/* Badge Icon Large */}
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                selectedBadge.is_earned 
                  ? 'bg-white/20 backdrop-blur-sm'
                  : 'bg-gray-700'
              }`}>
                {selectedBadge.is_earned ? (
                  renderBadgeIcon(selectedBadge.icon, 'w-10 h-10 text-white')
                ) : (
                  <Lock className="w-10 h-10 text-gray-500" />
                )}
              </div>

              {/* Badge Details */}
              <div className="text-center">
                <h2 className={`text-2xl font-bold mb-2 ${
                  selectedBadge.is_earned ? 'text-white' : 'text-gray-400'
                }`}>
                  {selectedBadge.title}
                </h2>
                
                <div className={`text-sm mb-4 ${
                  selectedBadge.is_earned ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {selectedBadge.description}
                </div>

                <div className="flex justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      selectedBadge.is_earned ? 'text-yellow-400' : 'text-gray-500'
                    }`}>
                      {selectedBadge.xp_reward}
                    </div>
                    <div className="text-xs text-gray-400">XP Reward</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      selectedBadge.is_earned ? 'text-white' : 'text-gray-500'
                    }`}>
                      {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
                    </div>
                    <div className="text-xs text-gray-400">Rarità</div>
                  </div>
                </div>

                {selectedBadge.earned_at && (
                  <div className="text-sm text-green-400 mb-4">
                    Ottenuto il {new Date(selectedBadge.earned_at).toLocaleDateString('it-IT')}
                  </div>
                )}

                {!selectedBadge.is_earned && (
                  <div className="text-sm text-gray-400 mb-4">
                    Requisito: {selectedBadge.requirement_type} ({selectedBadge.requirement_value})
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl font-medium hover:from-gray-500 hover:to-gray-600 transition-all"
              >
                Chiudi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FuturisticBadgeCollection;
export { FuturisticBadgeCollection };