"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface XPResult {
  new_total_xp: number;
  level_up: boolean;
  new_badges: string[];
}

interface UserStats {
  total_xp: number;
  current_level: number;
  level_progress: number;
  badges_count: number;
  badges_list: string[];
  rank_position: number;
}

export function useXPSystem(userId?: string) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [xpNotification, setXpNotification] = useState<{
    xp: number;
    levelUp?: boolean;
    newBadges?: string[];
  } | null>(null);

  // Carica statistiche utente
  const loadUserStats = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: userId
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const stats = data[0];
        setUserStats({
          total_xp: stats.total_xp || 0,
          current_level: stats.current_level || 1,
          level_progress: stats.level_progress || 0,
          badges_count: stats.badges_count || 0,
          badges_list: stats.badges_list ? Object.values(stats.badges_list) : [],
          rank_position: stats.rank_position || 999
        });
      } else {
        // Utente nuovo - inizializza con dati base
        setUserStats({
          total_xp: 0,
          current_level: 1,
          level_progress: 0,
          badges_count: 0,
          badges_list: [],
          rank_position: 999
        });
      }
    } catch (error) {
      console.error('Errore caricamento statistiche XP:', error);
      // Fallback ai dati demo
      setUserStats({
        total_xp: 0,
        current_level: 1,
        level_progress: 0,
        badges_count: 0,
        badges_list: [],
        rank_position: 999
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Aggiungi XP
  const addXP = useCallback(async (
    activityType: string, 
    amount: number, 
    metadata: any = {}
  ): Promise<XPResult | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase.rpc('add_xp_simple', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_xp_amount: amount,
        p_metadata: metadata
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const result = data[0];
        
        // Mostra notifica
        setXpNotification({
          xp: amount,
          levelUp: result.level_up,
          newBadges: result.new_badges
        });
        
        // Nascondi notifica dopo 3 secondi
        setTimeout(() => setXpNotification(null), 3000);
        
        // Ricarica statistiche
        await loadUserStats();
        
        return result;
      }
    } catch (error) {
      console.error('Errore aggiunta XP:', error);
      
      // Fallback: mostra comunque la notifica XP
      setXpNotification({ xp: amount });
      setTimeout(() => setXpNotification(null), 3000);
    }
    
    return null;
  }, [userId, loadUserStats]);

  // Login giornaliero
  const dailyLogin = useCallback(async () => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase.rpc('daily_login_xp', {
        p_user_id: userId
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.xp_earned > 0) {
          setXpNotification({
            xp: result.xp_earned,
            levelUp: false
          });
          setTimeout(() => setXpNotification(null), 3000);
          
          await loadUserStats();
        }
        
        return result;
      }
    } catch (error) {
      console.error('Errore login giornaliero:', error);
    }
    
    return null;
  }, [userId, loadUserStats]);

  // Azioni rapide predefinite
  const quickActions = {
    share: () => addXP('share_content', 5, { source: 'quick_action' }),
    explore: () => addXP('location_visit', 30, { location: 'quick_explore' }),
    report: () => addXP('submit_report', 25, { source: 'quick_action' }),
    comment: () => addXP('helpful_comment', 15, { source: 'quick_action' }),
    event: () => addXP('event_participation', 75, { source: 'quick_action' }),
    survey: () => addXP('survey_complete', 40, { source: 'quick_action' })
  };

  // Carica statistiche all'inizializzazione
  useEffect(() => {
    if (userId) {
      loadUserStats();
      dailyLogin(); // Automatico al caricamento
    }
  }, [userId, loadUserStats, dailyLogin]);

  return {
    userStats,
    loading,
    xpNotification,
    addXP,
    dailyLogin,
    loadUserStats,
    quickActions
  };
}

// Hook semplificato per componenti che necessitano solo delle statistiche
export function useUserStats(userId?: string) {
  const { userStats, loading, loadUserStats } = useXPSystem(userId);
  
  return {
    userStats,
    loading,
    refresh: loadUserStats
  };
}

// Hook per notifiche XP globali
export function useXPNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    xp: number;
    levelUp?: boolean;
    newBadges?: string[];
    timestamp: number;
  }>>([]);

  const addNotification = useCallback((notification: {
    xp: number;
    levelUp?: boolean;
    newBadges?: string[];
  }) => {
    const id = Date.now().toString();
    const newNotification = {
      ...notification,
      id,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Rimuovi automaticamente dopo 3 secondi
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification
  };
}