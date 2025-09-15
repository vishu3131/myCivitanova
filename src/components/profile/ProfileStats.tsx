// Componente Stats del profilo

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Users, Award, Zap, Target, Clock } from 'lucide-react';
import { UserStats } from '@/types/profile';

interface ProfileStatsProps {
  userStats: UserStats | null;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ userStats }) => {
  if (!userStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Nessuna statistica disponibile</p>
        </div>
      </div>
    );
  }

  const statsCategories = [
    {
      title: 'Esperienza',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      stats: [
        { label: 'XP Totali', value: userStats.total_xp || 0, suffix: 'XP' },
        { label: 'Livello Attuale', value: userStats.level || 1, suffix: '' },
        { label: 'XP Questo Mese', value: userStats.monthly_xp || 0, suffix: 'XP' },
        { label: 'XP Questa Settimana', value: userStats.weekly_xp || 0, suffix: 'XP' }
      ]
    },
    {
      title: 'Attività',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      stats: [
        { label: 'Eventi Partecipati', value: userStats.events_attended || 0, suffix: '' },
        { label: 'Eventi Creati', value: userStats.events_created || 0, suffix: '' },
        { label: 'Giorni Consecutivi', value: userStats.login_streak || 0, suffix: 'giorni' },
        { label: 'Ultimo Accesso', value: userStats.last_login ? new Date(userStats.last_login).toLocaleDateString('it-IT') : 'Mai', suffix: '' }
      ]
    },
    {
      title: 'Riconoscimenti',
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      stats: [
        { label: 'Badge Totali', value: userStats.badges_count || 0, suffix: '' },
        { label: 'Badge Rari', value: userStats.rare_badges || 0, suffix: '' },
        { label: 'Punti Reputazione', value: userStats.reputation_points || 0, suffix: 'pts' },
        { label: 'Ranking', value: userStats.ranking || 'N/A', suffix: '' }
      ]
    },
    {
      title: 'Sociale',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      stats: [
        { label: 'Amici', value: userStats.friends_count || 0, suffix: '' },
        { label: 'Seguaci', value: userStats.followers_count || 0, suffix: '' },
        { label: 'Seguiti', value: userStats.following_count || 0, suffix: '' },
        { label: 'Gruppi', value: userStats.groups_joined || 0, suffix: '' }
      ]
    }
  ];

  const achievements = [
    {
      title: 'Primo Login',
      description: 'Hai effettuato il tuo primo accesso',
      icon: '🎉',
      achieved: true,
      date: userStats.created_at
    },
    {
      title: 'Esploratore',
      description: 'Hai partecipato a 5 eventi',
      icon: '🗺️',
      achieved: (userStats.events_attended || 0) >= 5,
      progress: Math.min((userStats.events_attended || 0) / 5 * 100, 100)
    },
    {
      title: 'Veterano',
      description: 'Hai raggiunto il livello 10',
      icon: '⭐',
      achieved: (userStats.level || 1) >= 10,
      progress: Math.min((userStats.level || 1) / 10 * 100, 100)
    },
    {
      title: 'Collezionista',
      description: 'Hai ottenuto 10 badge',
      icon: '🏆',
      achieved: (userStats.badges_count || 0) >= 10,
      progress: Math.min((userStats.badges_count || 0) / 10 * 100, 100)
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statsCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{category.title}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {category.stats.map((stat, statIndex) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (categoryIndex * 0.1) + (statIndex * 0.05), duration: 0.4 }}
                    className="bg-white/5 rounded-xl p-4 text-center border border-white/10"
                  >
                    <div className="text-2xl font-bold text-white mb-1">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      {stat.suffix && <span className="text-sm text-gray-400 ml-1">{stat.suffix}</span>}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-400" />
          Obiettivi e Traguardi
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                achievement.achieved
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{achievement.title}</h4>
                    {achievement.achieved && (
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                  
                  {!achievement.achieved && achievement.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Progresso</span>
                        <span>{Math.round(achievement.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.achieved && achievement.date && (
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ottenuto il {new Date(achievement.date).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity Heatmap Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Attività nel Tempo
        </h3>
        
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Grafico attività in arrivo</p>
          <p className="text-sm text-gray-500 mt-2">
            Qui verrà mostrata la tua attività nel corso del tempo
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileStats;