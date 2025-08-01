'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  TrendingUp,
  Heart,
  MessageCircle,
  MapPin,
  Users,
  Calendar,
  Target,
  Zap,
  Crown,
  Shield,
  Gift
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'participation' | 'helpfulness' | 'leadership' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: number;
  completed: boolean;
  completedAt?: string;
}

const CommunityGamification = () => {
  const [activeTab, setActiveTab] = useState('badges');

  const userStats = {
    level: 8,
    experience: 1250,
    nextLevelExp: 2000,
    reputation: 2840,
    badges: 12,
    totalBadges: 25,
    achievements: 8,
    totalAchievements: 15,
    streak: 7,
    rank: 'Cittadino Attivo'
  };

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Primo Post',
      description: 'Hai pubblicato il tuo primo post nella community',
      icon: '📝',
      category: 'participation',
      unlocked: true,
      unlockedAt: '2024-01-15',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Segnalatore',
      description: 'Hai segnalato 5 problemi nella città',
      icon: '🚨',
      category: 'helpfulness',
      unlocked: true,
      unlockedAt: '2024-01-20',
      rarity: 'common'
    },
    {
      id: '3',
      name: 'Organizzatore',
      description: 'Hai organizzato un evento community',
      icon: '🎪',
      category: 'leadership',
      unlocked: true,
      unlockedAt: '2024-02-01',
      rarity: 'rare'
    },
    {
      id: '4',
      name: 'Cittadino Esemplare',
      description: 'Hai raggiunto 1000 punti reputazione',
      icon: '👑',
      category: 'special',
      unlocked: true,
      unlockedAt: '2024-02-10',
      rarity: 'epic'
    },
    {
      id: '5',
      name: 'Fotografo Urbano',
      description: 'Hai condiviso 20 foto della città',
      icon: '📸',
      category: 'participation',
      unlocked: false,
      rarity: 'common'
    },
    {
      id: '6',
      name: 'Volontario',
      description: 'Hai partecipato a 10 eventi community',
      icon: '🤝',
      category: 'helpfulness',
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: '7',
      name: 'Moderatore',
      description: 'Sei diventato moderatore di un gruppo',
      icon: '🛡️',
      category: 'leadership',
      unlocked: false,
      rarity: 'epic'
    },
    {
      id: '8',
      name: 'Leggenda Civica',
      description: 'Hai raggiunto il livello 10',
      icon: '🌟',
      category: 'special',
      unlocked: false,
      rarity: 'legendary'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Esploratore',
      description: 'Visita 10 luoghi diversi nella città',
      progress: 7,
      maxProgress: 10,
      reward: 100,
      completed: false
    },
    {
      id: '2',
      name: 'Social Butterfly',
      description: 'Partecipa a 5 discussioni nel forum',
      progress: 5,
      maxProgress: 5,
      reward: 150,
      completed: true,
      completedAt: '2024-02-05'
    },
    {
      id: '3',
      name: 'Event Planner',
      description: 'Organizza 3 eventi community',
      progress: 2,
      maxProgress: 3,
      reward: 300,
      completed: false
    },
    {
      id: '4',
      name: 'Problem Solver',
      description: 'Segnala 20 problemi e ottieni 10 risoluzioni',
      progress: 15,
      maxProgress: 20,
      reward: 500,
      completed: false
    },
    {
      id: '5',
      name: 'Community Leader',
      description: 'Crea un gruppo con 50+ membri',
      progress: 0,
      maxProgress: 1,
      reward: 1000,
      completed: false
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'participation': return <MessageCircle className="w-4 h-4" />;
      case 'helpfulness': return <Heart className="w-4 h-4" />;
      case 'leadership': return <Crown className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const progressPercentage = (userStats.experience / userStats.nextLevelExp) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Il Tuo Profilo</h2>
            <p className="text-gray-600">Continua a contribuire per sbloccare nuovi traguardi</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">Livello {userStats.level}</div>
            <div className="text-sm text-gray-500">{userStats.rank}</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Esperienza</span>
            <span>{userStats.experience} / {userStats.nextLevelExp}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{userStats.reputation}</div>
            <div className="text-sm text-gray-600">Reputazione</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{userStats.badges}</div>
            <div className="text-sm text-gray-600">Badge</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{userStats.achievements}</div>
            <div className="text-sm text-gray-600">Traguardi</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
            <div className="text-sm text-gray-600">Giorni Streak</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'badges'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Badge ({userStats.badges}/{userStats.totalBadges})</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'achievements'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Traguardi ({userStats.achievements}/{userStats.totalAchievements})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all ${
                badge.unlocked 
                  ? 'border-green-200 hover:border-green-300' 
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`text-3xl ${badge.unlocked ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{badge.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {getCategoryIcon(badge.category)}
                      <span>{badge.category}</span>
                    </div>
                    
                    {badge.unlocked && (
                      <div className="text-sm text-green-600">
                        Sbloccato {badge.unlockedAt}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all ${
                achievement.completed 
                  ? 'border-green-200' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {achievement.completed ? (
                    <Trophy className="w-6 h-6 text-green-600" />
                  ) : (
                    <Target className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                    {achievement.completed && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Completato
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progresso</span>
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          achievement.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Gift className="w-4 h-4" />
                        <span>Ricompensa: {achievement.reward} punti</span>
                      </div>
                      
                      {achievement.completed && (
                        <div className="text-sm text-green-600">
                          Completato {achievement.completedAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityGamification; 