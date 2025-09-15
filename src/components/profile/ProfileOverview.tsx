// Componente Overview del profilo

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Award, Zap, Star, Trophy } from 'lucide-react';
import { UserProfile, UserStats, Badge } from '@/types/profile';
import { getRarityColor } from '@/utils/profileValidation';

interface ProfileOverviewProps {
  profileUser: UserProfile;
  userStats: UserStats | null;
  recentBadges: Badge[];
  xpHistory?: Array<{ date: string; xp: number; reason: string }>;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  profileUser,
  userStats,
  recentBadges,
  xpHistory = []
}) => {
  const currentXP = userStats?.total_xp || 0;
  const currentLevel = userStats?.level || 1;
  const xpForNextLevel = currentLevel * 1000;
  const xpProgress = ((currentXP % 1000) / 1000) * 100;

  const quickStats = [
    {
      label: 'Eventi Partecipati',
      value: userStats?.events_attended || 0,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Badge Ottenuti',
      value: userStats?.badges_count || 0,
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Streak Giorni',
      value: userStats?.login_streak || 0,
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      label: 'Punti Reputazione',
      value: userStats?.reputation_points || 0,
      icon: Star,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* XP Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Progresso XP
          </h3>
          <div className="text-sm text-gray-400">
            Livello {currentLevel}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* XP Bar */}
          <div className="relative">
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>{currentXP} XP</span>
              <span>{xpForNextLevel} XP</span>
            </div>
          </div>
          
          {/* XP Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{currentXP}</div>
              <div className="text-sm text-gray-400">XP Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{xpForNextLevel - currentXP}</div>
              <div className="text-sm text-gray-400">XP al Prossimo Livello</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Badge Recenti
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-white/5 rounded-2xl p-4 text-center border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-semibold text-white mb-1">{badge.name}</h4>
                <p className="text-sm text-gray-400 mb-2">{badge.description}</p>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                  {badge.rarity}
                </div>
                {badge.earned_at && (
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(badge.earned_at).toLocaleDateString('it-IT')}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Statistiche Rapide</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`${stat.bgColor} rounded-2xl p-4 text-center border border-white/10`}
              >
                <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      {xpHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Attività Recente</h3>
          
          <div className="space-y-3">
            {xpHistory.slice(0, 5).map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-white">{activity.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-medium">+{activity.xp} XP</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(activity.date).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileOverview;