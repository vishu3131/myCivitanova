"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  earned_at?: string;
  newly_earned?: boolean;
}

interface UserStats {
  total_xp: number;
  current_level: number;
  level_progress: number;
  level_title: string;
  badges_count: number;
  xp_rank: number;
  badge_rank: number;
}

interface BadgeSystemProps {
  userId: string;
  showNotifications?: boolean;
}

export function BadgeSystem({ userId, showNotifications = true }: BadgeSystemProps) {
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBadgeNotification, setNewBadgeNotification] = useState<Badge | null>(null);

  const rarityColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500'
  };

  const rarityGlow = {
    common: 'shadow-gray-500/50',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-yellow-500/50'
  };

  useEffect(() => {
    if (userId) {
      loadUserBadges();
      loadUserStats();
      loadAvailableBadges();
    }
  }, [userId]);

  const loadUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge_types (
            id,
            name,
            description,
            icon,
            category,
            rarity,
            xp_reward
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      const badges = data?.map(item => ({
        id: item.badge_types.id,
        name: item.badge_types.name,
        description: item.badge_types.description,
        icon: item.badge_types.icon,
        category: item.badge_types.category,
        rarity: item.badge_types.rarity,
        xp_reward: item.badge_types.xp_reward,
        earned_at: item.earned_at
      })) || [];

      setUserBadges(badges);
    } catch (error) {
      console.error('Errore caricamento badge utente:', error);
    }
  };

  const loadAvailableBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badge_types')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: true });

      if (error) throw error;
      setAvailableBadges(data || []);
    } catch (error) {
      console.error('Errore caricamento badge disponibili:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats_complete')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserStats(data);
    } catch (error) {
      console.error('Errore caricamento statistiche utente:', error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (activityName: string, metadata: any = {}) => {
    try {
      const { data, error } = await supabase.rpc('add_user_xp', {
        p_user_id: userId,
        p_activity_name: activityName,
        p_metadata: metadata
      });

      if (error) throw error;

      const result = data[0];
      if (result.xp_earned > 0) {
        // Ricarica statistiche
        await loadUserStats();
        
        // Controlla nuovi badge
        await checkNewBadges();
        
        // Mostra notifica XP
        if (showNotifications) {
          showXPNotification(result.xp_earned, result.level_up);
        }
      }

      return result;
    } catch (error) {
      console.error('Errore aggiunta XP:', error);
      return null;
    }
  };

  const checkNewBadges = async () => {
    try {
      const { data, error } = await supabase.rpc('check_and_award_badges', {
        p_user_id: userId
      });

      if (error) throw error;

      const newBadges = data?.filter((badge: any) => badge.newly_earned) || [];
      
      if (newBadges.length > 0) {
        // Ricarica badge utente
        await loadUserBadges();
        
        // Mostra notifica per il primo nuovo badge
        if (showNotifications && newBadges[0]) {
          const badgeInfo = availableBadges.find(b => b.name === newBadges[0].badge_name);
          if (badgeInfo) {
            setNewBadgeNotification({ ...badgeInfo, newly_earned: true });
          }
        }
      }
    } catch (error) {
      console.error('Errore controllo nuovi badge:', error);
    }
  };

  const showXPNotification = (xpEarned: number, levelUp: boolean) => {
    // Implementa notifica XP (toast, modal, etc.)
    console.log(`+${xpEarned} XP!`, levelUp ? 'LEVEL UP!' : '');
  };

  const getBadgeProgress = (badge: Badge) => {
    // Calcola progresso verso il badge basato sui requisiti
    // Questa è una versione semplificata - espandibile
    const userBadge = userBadges.find(b => b.id === badge.id);
    return userBadge ? 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiche Utente */}
      {userStats && (
        <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{userStats.total_xp}</div>
              <div className="text-white/60 text-sm">XP Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">Lv.{userStats.current_level}</div>
              <div className="text-white/60 text-sm">{userStats.level_title}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{userStats.badges_count}</div>
              <div className="text-white/60 text-sm">Badge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">#{userStats.xp_rank}</div>
              <div className="text-white/60 text-sm">Classifica</div>
            </div>
          </div>
          
          {/* Barra Progresso Livello */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Progresso Livello</span>
              <span>{userStats.level_progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-dark-400 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-accent to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${userStats.level_progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Ottenuti */}
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">I Tuoi Badge ({userBadges.length})</h3>
        
        {userBadges.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <div className="text-4xl mb-2">🏆</div>
            <p>Nessun badge ancora ottenuto</p>
            <p className="text-sm">Inizia a partecipare per guadagnare i tuoi primi badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userBadges.map((badge) => (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border-2 ${rarityColors[badge.rarity]} border-opacity-50 bg-gradient-to-br from-white/5 to-transparent hover:scale-105 transition-all duration-300 ${rarityGlow[badge.rarity]} shadow-lg`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-white font-semibold text-sm">{badge.name}</div>
                  <div className="text-white/60 text-xs mt-1">{badge.description}</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-2 ${rarityColors[badge.rarity]} text-white`}>
                    {badge.rarity.toUpperCase()}
                  </div>
                </div>
                {badge.newly_earned && (
                  <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    NUOVO!
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badge Disponibili */}
      <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Badge Disponibili</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableBadges.map((badge) => {
            const isEarned = userBadges.some(b => b.id === badge.id);
            const progress = getBadgeProgress(badge);
            
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
                      <span className={`px-2 py-1 rounded-full text-xs ${rarityColors[badge.rarity]} text-white`}>
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

      {/* Notifica Nuovo Badge */}
      {newBadgeNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-300 rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-accent/50 shadow-2xl">
            <div className="text-6xl mb-4">{newBadgeNotification.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">Nuovo Badge!</h3>
            <h4 className="text-xl text-accent mb-2">{newBadgeNotification.name}</h4>
            <p className="text-white/80 mb-4">{newBadgeNotification.description}</p>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${rarityColors[newBadgeNotification.rarity]} text-white`}>
              {newBadgeNotification.rarity.toUpperCase()}
            </div>
            {newBadgeNotification.xp_reward > 0 && (
              <p className="text-accent text-sm mb-4">+{newBadgeNotification.xp_reward} XP Bonus!</p>
            )}
            <button
              onClick={() => setNewBadgeNotification(null)}
              className="bg-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-accent/80 transition-colors"
            >
              Fantastico!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook personalizzato per gestire XP e badge
export function useBadgeSystem(userId: string) {
  const [badgeSystem, setBadgeSystem] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      // Inizializza il sistema badge
      setBadgeSystem({
        addXP: async (activityName: string, metadata: any = {}) => {
          try {
            const { data, error } = await supabase.rpc('add_user_xp', {
              p_user_id: userId,
              p_activity_name: activityName,
              p_metadata: metadata
            });
            return data?.[0] || null;
          } catch (error) {
            console.error('Errore aggiunta XP:', error);
            return null;
          }
        },
        
        checkBadges: async () => {
          try {
            const { data, error } = await supabase.rpc('check_and_award_badges', {
              p_user_id: userId
            });
            return data || [];
          } catch (error) {
            console.error('Errore controllo badge:', error);
            return [];
          }
        }
      });
    }
  }, [userId]);

  return badgeSystem;
}