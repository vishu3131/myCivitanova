"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface UserStats {
  total_xp: number;
  current_level: number;
  level_progress: number;
  level_title: string;
  badges_count: number;
  xp_to_next_level: number;
  weekly_xp: number;
  monthly_xp: number;
}

interface LeaderboardUser {
  id: string;
  display_name: string;
  username: string;
  total_xp: number;
  current_level: number;
  badges_count: number;
  rank: number;
  email?: string;
  avatar_url?: string;
}

interface RecentBadge {
  id: string;
  name: string;
  icon: string;
  rarity: string;
  earned_at: string;
}

interface GamificationWidgetProps {
  userId?: string;
  onViewAllBadges?: () => void;
}

export function GamificationWidgetNew({ userId, onViewAllBadges }: GamificationWidgetProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentBadges, setRecentBadges] = useState<RecentBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);
  
  const loadUserStats = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_uuid: userId
      });

      if (error) throw error;
      
      if (data) {
        setUserStats({
          total_xp: data.total_xp || 0,
          current_level: data.current_level || 1,
          level_progress: ((data.total_xp || 0) % 100),
          level_title: `Livello ${data.current_level || 1}`,
          badges_count: data.badges_count || 0,
          xp_to_next_level: data.xp_to_next_level || 100,
          weekly_xp: data.weekly_xp || 0,
          monthly_xp: data.monthly_xp || 0
        });
      }
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
      // Fallback ai dati demo
      setUserStats({
        total_xp: 0,
        current_level: 1,
        level_progress: 0,
        level_title: 'Nuovo Cittadino',
        badges_count: 0,
        xp_to_next_level: 100,
        weekly_xp: 0,
        monthly_xp: 0
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadRecentBadges = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_badges', {
        user_uuid: userId
      });

      if (error) throw error;

      if (data?.earned_badges) {
        const recentBadges = data.earned_badges.slice(0, 3).map((badge: any) => ({
          id: badge.id,
          name: badge.name,
          icon: badge.icon,
          rarity: badge.rarity,
          earned_at: badge.earned_at
        })) || [];

        setRecentBadges(recentBadges);
      }
    } catch (error) {
      console.error('Errore caricamento badge recenti:', error);
    }
  }, [userId, setRecentBadges]);

  const simulateDailyLogin = useCallback(async () => {
    if (!userId || !badgeSystem) return;
    
    try {
      // Controlla se l'utente ha già fatto login oggi
      const today = new Date().toISOString().split('T')[0];
      const { data: todayLogin } = await supabase
        .from('user_xp_log')
        .select('*')
        .eq('user_id', userId)
        .gte('earned_at', today + 'T00:00:00')
        .eq('activity_id', (await supabase.from('xp_activities').select('id').eq('name', 'daily_login').single()).data?.id);

      if (!todayLogin || todayLogin.length === 0) {
        // Aggiungi XP per login giornaliero
        const result = await badgeSystem.addXP('daily_login');
        if (result && result.xp_earned > 0) {
          setXpAnimation(result.xp_earned);
          setTimeout(() => setXpAnimation(null), 3000);
          
          // Ricarica statistiche
          await loadUserStats();
          await loadRecentBadges();
        }
      }
    } catch (error) {
      console.error('Errore simulazione login giornaliero:', error);
    }
  }, [userId, badgeSystem, loadUserStats, loadRecentBadges, setXpAnimation]);

  useEffect(() => {
    if (userId) {
      loadUserStats();
      loadRecentBadges();
      simulateDailyLogin();
    } else {
      // Dati demo se non c'è utente
      setUserStats({
        total_xp: 750,
        current_level: 3,
        level_progress: 75.0,
        level_title: 'Cittadino Impegnato',
        badges_count: 5
      });
      setRecentBadges([
        { id: '1', name: 'Benvenuto', icon: '👋', rarity: 'common', earned_at: '2024-01-15' },
        { id: '2', name: 'Prima Segnalazione', icon: '📝', rarity: 'common', earned_at: '2024-01-16' },
        { id: '3', name: 'Cittadino Attivo', icon: '⭐', rarity: 'rare', earned_at: '2024-01-20' }
      ]);
      setLoading(false);
    }
  }, [userId, loadUserStats, loadRecentBadges, simulateDailyLogin, setUserStats, setRecentBadges, setLoading]);

  const handleQuickAction = async (action: string) => {
    if (!userId || !badgeSystem) return;
    
    try {
      let result = null;
      
      switch (action) {
        case 'share':
          result = await badgeSystem.addXP('share_content', { source: 'widget' });
          break;
        case 'explore':
          result = await badgeSystem.addXP('location_visit', { location: 'widget_demo' });
          break;
        case 'report':
          // Questo dovrebbe essere gestito dal componente di segnalazione
          console.log('Apri modal segnalazione');
          break;
      }
      
      if (result && result.xp_earned > 0) {
        setXpAnimation(result.xp_earned);
        setTimeout(() => setXpAnimation(null), 3000);
        await loadUserStats();
        await loadRecentBadges();
      }
    } catch (error) {
      console.error('Errore azione rapida:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 bg-yellow-400/20';
      case 'epic': return 'text-purple-400 bg-purple-400/20';
      case 'rare': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
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

  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-4 card-glow border border-white/10 relative overflow-hidden">
      {/* Animazione XP */}
      {xpAnimation && (
        <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full animate-bounce z-10">
          +{xpAnimation} XP!
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Progresso</h3>
        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
          <span className="text-xs text-accent">🎮</span>
        </div>
      </div>
      
      {userStats && (
        <>
          {/* Level Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm">
                Lv.{userStats.current_level} - {userStats.level_title}
              </span>
              <span className="text-accent text-sm">{userStats.total_xp} XP</span>
            </div>
            <div className="w-full bg-dark-400 rounded-full h-2 relative overflow-hidden">
              <div 
                className="bg-gradient-to-r from-accent to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${userStats.level_progress}%` }}
              ></div>
              {/* Effetto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            <div className="text-right text-xs text-white/60 mt-1">
              {userStats.level_progress.toFixed(1)}% al prossimo livello
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <h4 className="text-white text-sm font-medium">Badge Recenti</h4>
              <span className="text-accent text-xs">{userStats.badges_count} totali</span>
            </div>
            <div className="flex space-x-2">
              {recentBadges.length > 0 ? (
                recentBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${getRarityColor(badge.rarity)} hover:scale-110 transition-transform cursor-pointer`}
                    title={`${badge.name} (${badge.rarity})`}
                  >
                    {badge.icon}
                  </div>
                ))
              ) : (
                <div className="text-white/40 text-xs">Nessun badge ancora</div>
              )}
              {recentBadges.length < 3 && (
                Array.from({ length: 3 - recentBadges.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-8 h-8 rounded-full bg-dark-400 border-2 border-dashed border-white/20 flex items-center justify-center text-white/20"
                  >
                    ?
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-white text-sm font-medium">Azioni Rapide</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickAction('share')}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs py-2 px-2 rounded-lg transition-colors flex flex-col items-center space-y-1"
                title="Condividi (+5 XP)"
              >
                <span>📤</span>
                <span>Condividi</span>
              </button>
              <button
                onClick={() => handleQuickAction('explore')}
                className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs py-2 px-2 rounded-lg transition-colors flex flex-col items-center space-y-1"
                title="Esplora (+30 XP)"
              >
                <span>🗺️</span>
                <span>Esplora</span>
              </button>
              <button
                onClick={() => handleQuickAction('report')}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs py-2 px-2 rounded-lg transition-colors flex flex-col items-center space-y-1"
                title="Segnala (+25 XP)"
              >
                <span>📝</span>
                <span>Segnala</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button 
          onClick={onViewAllBadges}
          className="w-full bg-accent/10 hover:bg-accent/20 text-accent text-sm py-2 px-3 rounded-lg transition-colors font-medium"
        >
          Visualizza Tutti i Badge
        </button>
      </div>
    </div>
  );
}