"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient.ts';
import { useXPSystem } from '@/hooks/useXPSystem';
import { demoBadges, DemoXPSystem } from '@/data/demoData';

interface UserStats {
  total_xp: number;
  current_level: number;
  level_progress: number;
  badges_count: number;
  badges_list: string[];
  rank_position: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xp_reward: number;
}

interface SimpleBadgeSystemProps {
  userId?: string;
  compact?: boolean;
}

export function SimpleBadgeSystem({ userId, compact = false }: SimpleBadgeSystemProps) {
  const { userStats, loading, xpNotification, quickActions } = useXPSystem(userId);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [demoStats, setDemoStats] = useState<UserStats | null>(null);
  const [demoNotification, setDemoNotification] = useState<{xp: number; levelUp?: boolean; newBadges?: string[]} | null>(null);

  const rarityColors = {
    common: 'bg-gray-500/20 text-gray-300',
    rare: 'bg-blue-500/20 text-blue-400',
    epic: 'bg-purple-500/20 text-purple-400',
    legendary: 'bg-yellow-500/20 text-yellow-400'
  };

  const initializeDemoMode = useCallback(() => {
    // Se non c'è userId o il database non è disponibile, usa la modalità demo
    if (!userId) {
      setDemoMode(true);
      const demoSystem = DemoXPSystem.getInstance();
      
      // Login giornaliero automatico in demo
      const loginResult = demoSystem.dailyLogin();
      if (loginResult.xp_earned > 0) {
        setDemoNotification({ xp: loginResult.xp_earned });
        setTimeout(() => setDemoNotification(null), 3000);
      }
      
      // Carica statistiche demo
      const stats = demoSystem.getUserStats();
      setDemoStats({
        total_xp: stats.total_xp,
        current_level: stats.current_level,
        level_progress: stats.level_progress,
        badges_count: stats.badges_count,
        badges_list: stats.badges_list,
        rank_position: stats.rank_position
      });
    }
  }, [userId]);

  useEffect(() => {
    loadAvailableBadges();
    initializeDemoMode();
  }, [initializeDemoMode]);

  const loadAvailableBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value', { ascending: true });

      if (error) throw error;
      setAvailableBadges(data || []);
    } catch (error) {
      console.error('Database non disponibile, uso dati demo:', error instanceof Error ? error.message : error);
      // Fallback ai dati demo
      setAvailableBadges(demoBadges);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (demoMode) {
      const demoSystem = DemoXPSystem.getInstance();
      let result;
      
      switch (action) {
        case 'share':
          result = demoSystem.addXP('share_content', 5);
          break;
        case 'explore':
          result = demoSystem.addXP('location_visit', 30);
          break;
        case 'report':
          result = demoSystem.addXP('submit_report', 25);
          break;
        default:
          return;
      }
      
      if (result.xp_earned > 0) {
        setDemoNotification({
          xp: result.xp_earned,
          levelUp: result.level_up,
          newBadges: result.new_badges
        });
        setTimeout(() => setDemoNotification(null), 3000);
        
        // Aggiorna statistiche
        const newStats = demoSystem.getUserStats();
        setDemoStats({
          total_xp: newStats.total_xp,
          current_level: newStats.current_level,
          level_progress: newStats.level_progress,
          badges_count: newStats.badges_count,
          badges_list: newStats.badges_list,
          rank_position: newStats.rank_position
        });
      }
    } else {
      switch (action) {
        case 'share':
          await quickActions.share();
          break;
        case 'explore':
          await quickActions.explore();
          break;
        case 'report':
          await quickActions.report();
          break;
      }
    }
  };

  const getBadgeInfo = (badgeName: string) => {
    return availableBadges.find(b => b.name === badgeName);
  };

  // Usa dati demo o reali
  const currentStats = demoMode ? demoStats : userStats;
  const currentNotification = demoMode ? demoNotification : xpNotification;
  const isLoading = demoMode ? false : loading;

  if (isLoading) {
    return (
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-2 bg-white/10 rounded"></div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-white/10 rounded-full"></div>
            <div className="w-8 h-8 bg-white/10 rounded-full"></div>
            <div className="w-8 h-8 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10 relative">
        {currentNotification && (
          <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full animate-bounce z-10">
            +{currentNotification.xp} XP!
            {currentNotification.levelUp && <span className="ml-1">🆙</span>}
          </div>
        )}
        
        {demoMode && (
          <div className="absolute top-2 left-2 bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
            DEMO
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Progresso</h3>
          <div className="text-accent text-xs">Lv.{currentStats?.current_level || 1}</div>
        </div>
        
        {currentStats && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>{currentStats.total_xp} XP</span>
                <span>{currentStats.level_progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-dark-400 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-accent to-blue-400 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${currentStats.level_progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">{currentStats.badges_count} badge</span>
              <span className="text-accent">#{currentStats.rank_position}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiche Utente */}
      {currentStats && (
        <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 relative">
          {currentNotification && (
            <div className="absolute top-4 right-4 bg-accent text-white text-sm px-3 py-1 rounded-full animate-bounce z-10">
              +{currentNotification.xp} XP!
              {currentNotification.levelUp && <span className="ml-2">🎉 LEVEL UP!</span>}
              {currentNotification.newBadges && currentNotification.newBadges.length > 0 && (
                <span className="ml-2">🏆 Nuovo Badge!</span>
              )}
            </div>
          )}
          
          {demoMode && (
            <div className="absolute top-4 left-4 bg-blue-500/20 text-blue-400 text-sm px-3 py-1 rounded-full">
              MODALITÀ DEMO
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{currentStats.total_xp}</div>
              <div className="text-white/60 text-sm">XP Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">Lv.{currentStats.current_level}</div>
              <div className="text-white/60 text-sm">Livello</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{currentStats.badges_count}</div>
              <div className="text-white/60 text-sm">Badge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">#{currentStats.rank_position}</div>
              <div className="text-white/60 text-sm">Classifica</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Progresso Livello</span>
              <span>{currentStats.level_progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-dark-400 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-accent to-blue-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${currentStats.level_progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Ottenuti */}
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">I Tuoi Badge ({currentStats?.badges_count || 0})</h3>
        
        {!currentStats?.badges_list || currentStats.badges_list.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <div className="text-4xl mb-2">🏆</div>
            <p>Nessun badge ancora ottenuto</p>
            <p className="text-sm">Inizia a partecipare per guadagnare i tuoi primi badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentStats.badges_list.map((badgeName) => {
              const badgeInfo = getBadgeInfo(badgeName);
              if (!badgeInfo) return null;
              
              return (
                <div
                  key={badgeName}
                  className={`p-4 rounded-xl border-2 border-opacity-50 bg-gradient-to-br from-white/5 to-transparent hover:scale-105 transition-all duration-300 shadow-lg ${rarityColors[badgeInfo.rarity as keyof typeof rarityColors] || rarityColors.common}`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{badgeInfo.icon}</div>
                    <div className="text-white font-semibold text-sm">{badgeInfo.name}</div>
                    <div className="text-white/60 text-xs mt-1">{badgeInfo.description}</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-2 ${rarityColors[badgeInfo.rarity as keyof typeof rarityColors] || rarityColors.common}`}>
                      {badgeInfo.rarity.toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Azioni Rapide */}
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Guadagna XP</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction('share')}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-4 rounded-xl transition-colors flex flex-col items-center space-y-2"
          >
            <span className="text-2xl">📤</span>
            <span className="text-sm font-medium">Condividi</span>
            <span className="text-xs opacity-60">+5 XP</span>
          </button>
          <button
            onClick={() => handleQuickAction('explore')}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-400 p-4 rounded-xl transition-colors flex flex-col items-center space-y-2"
          >
            <span className="text-2xl">🗺️</span>
            <span className="text-sm font-medium">Esplora</span>
            <span className="text-xs opacity-60">+30 XP</span>
          </button>
          <button
            onClick={() => handleQuickAction('report')}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-4 rounded-xl transition-colors flex flex-col items-center space-y-2"
          >
            <span className="text-2xl">📝</span>
            <span className="text-sm font-medium">Segnala</span>
            <span className="text-xs opacity-60">+25 XP</span>
          </button>
        </div>
      </div>

      {/* Badge Disponibili */}
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Badge Disponibili</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableBadges.map((badge) => {
            const isEarned = currentStats?.badges_list.includes(badge.name);
            
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border border-white/10 ${
                  isEarned 
                    ? 'bg-gradient-to-r from-green-500/20 to-transparent' 
                    : 'bg-dark-400/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl ${isEarned ? '' : 'grayscale opacity-50'}`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-semibold">{badge.name}</h4>
                      {isEarned && <span className="text-green-400 text-sm">✓</span>}
                    </div>
                    <p className="text-white/60 text-sm">{badge.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${rarityColors[badge.rarity as keyof typeof rarityColors] || rarityColors.common}`}>
                        {badge.rarity}
                      </span>
                      {badge.xp_reward > 0 && (
                        <span className="text-accent text-xs">+{badge.xp_reward} XP</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controlli Demo */}
      {demoMode && (
        <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-blue-400 font-semibold">Modalità Demo</h4>
              <p className="text-blue-300/60 text-sm">Stai usando dati di esempio. Connetti il database per dati reali.</p>
            </div>
            <button
              onClick={() => {
                const demoSystem = DemoXPSystem.getInstance();
                demoSystem.reset();
                const newStats = demoSystem.getUserStats();
                setDemoStats({
                  total_xp: newStats.total_xp,
                  current_level: newStats.current_level,
                  level_progress: newStats.level_progress,
                  badges_count: newStats.badges_count,
                  badges_list: newStats.badges_list,
                  rank_position: newStats.rank_position
                });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Reset Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}