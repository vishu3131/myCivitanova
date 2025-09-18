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

// Default locale per evitare errori quando il DB non è disponibile
const DEFAULT_USER_STATS: UserStats = {
  total_xp: 0,
  current_level: 1,
  level_progress: 0,
  badges_count: 0,
  badges_list: [],
  rank_position: 999,
};

export function useXPSystem(userId?: string, options?: { autoDailyLogin?: boolean }) {
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
      // Se il client diretto di Supabase non è configurato, evita RPC e usa fallback
      const canUseRpc = typeof (supabase as any)?.rpc === 'function';
      if (!canUseRpc) {
        console.warn('[XP] Supabase RPC non disponibile: uso dati locali di default', {
          hasDirectClient: !!(supabase as any)?.direct,
        });
        setUserStats(DEFAULT_USER_STATS);
        return;
      }

      // get_user_stats accetta il parametro user_uuid e ritorna un JSON (oggetto)
      const { data, error } = await (supabase as any).rpc('get_user_stats', {
        user_uuid: userId,
      });

      if (error) throw error;
      
      if (data) {
        const stats = data as any;

        // Ottieni la lista dei badge separatamente (best-effort)
        const { data: badgesData, error: badgesError } = await (supabase as any)
          .from('user_badges')
          .select('badge_name')
          .eq('user_id', userId)
          .not('earned_at', 'is', null);
        
        const badgesList = !badgesError && badgesData ? badgesData.map((b: any) => b.badge_name) : [];
        
        setUserStats({
          total_xp: stats.total_xp || 0,
          current_level: stats.current_level || 1,
          // il progress viene calcolato localmente (0-100)
          level_progress: ((stats.total_xp || 0) % 100),
          badges_count: stats.badges_count || 0,
          badges_list: badgesList,
          rank_position: 999,
        });
      } else {
        // Utente nuovo - inizializza con dati base
        setUserStats(DEFAULT_USER_STATS);
      }
    } catch (error: unknown) {
      // Normalizza l'errore per evitare output vuoti {}
      const e = error as any;
      const info = {
        message: e?.message || e?.error_description || e?.error || 'Errore sconosciuto',
        code: e?.code || e?.status || 'Nessun codice',
        details: e?.details || e?.hint || 'Nessun dettaglio',
        keys: e && typeof e === 'object' ? Object.keys(e) : [],
        userId,
        function: 'get_user_stats',
      };
      // Log solo se c'è qualche contenuto informativo
      if (info.message !== 'Errore sconosciuto' || info.code !== 'Nessun codice' || info.details !== 'Nessun dettaglio') {
        console.error('Errore caricamento statistiche XP:', info);
      }
      // Fallback ai dati demo
      setUserStats(DEFAULT_USER_STATS);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addXP = useCallback(async (
    activityType: string, 
    amount: number, 
    metadata: any = {}
  ): Promise<XPResult | null> => {
    if (!userId) return null;
    
    try {
      const canUseRpc = typeof (supabase as any)?.rpc === 'function';
      if (!canUseRpc) {
        // Mostra comunque la notifica locale e termina senza errore
        setXpNotification({ xp: amount });
        setTimeout(() => setXpNotification(null), 3000);
        return null;
      }

      const { data, error } = await (supabase as any).rpc('add_xp_simple', {
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
        
        // Notifica globale per sincronizzare altri widget
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('xp-updated', { detail: { userId, type: 'addXP', amount } }));
        }
        
        return result;
      }
    } catch (error: unknown) {
      const e = error as any;
      const errorInfo = {
        errorType: typeof e,
        errorString: String(e),
        errorMessage: e?.message || 'Nessun messaggio di errore',
        errorCode: e?.code || 'Nessun codice errore',
        errorDetails: e?.details || 'Nessun dettaglio',
        userId: userId,
        activityType: activityType,
        amount: amount,
        rpcFunction: 'add_xp_simple',
        timestamp: new Date().toISOString(),
        hasUserId: !!userId,
        supabaseConnected: !!supabase
      };
      // Log solo se l'errore ha contenuto significativo
      if (e && (e.message || e.code || e.details)) {
        console.error('Errore aggiunta XP:', errorInfo);
        console.error('Errore originale:', e);
      }
      
      // Fallback: mostra comunque la notifica XP
      setXpNotification({ xp: amount });
      setTimeout(() => setXpNotification(null), 3000);
    }
    
    return null;
  }, [userId, loadUserStats]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dailyLogin = useCallback(async () => {
    if (!userId) return null;
    
    try {
      const canUseRpc = typeof (supabase as any)?.rpc === 'function';
      if (!canUseRpc) {
        return null;
      }

      const { data, error } = await (supabase as any).rpc('daily_login_xp', {
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
          // Notifica globale per sincronizzare altri widget
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('xp-updated', { detail: { userId, type: 'daily', amount: result.xp_earned } }));
          }
        }
        
        return result;
      }
    } catch (error: unknown) {
      // Log solo se l'errore ha contenuto significativo (allineato con addXP)
      const e = error as any;
      if (e && (e.message || e.code || e.details)) {
        const errorInfo = {
          errorType: typeof e,
          errorString: String(e),
          errorMessage: e?.message || 'Nessun messaggio di errore',
          errorCode: e?.code || 'Nessun codice errore',
          errorDetails: e?.details || 'Nessun dettaglio',
          errorKeys: e && typeof e === 'object' ? Object.keys(e) : [],
          userId: userId,
          rpcFunction: 'daily_login_xp',
          timestamp: new Date().toISOString(),
          hasUserId: !!userId,
          supabaseConnected: !!supabase,
        };
        const hasMeaningful =
          errorInfo.errorMessage !== 'Nessun messaggio di errore' ||
          errorInfo.errorCode !== 'Nessun codice errore' ||
          errorInfo.errorDetails !== 'Nessun dettaglio' ||
          (errorInfo.errorKeys && errorInfo.errorKeys.length > 0);
        if (hasMeaningful && process.env.NODE_ENV !== 'production') {
          console.warn('XP: dailyLogin non critico, procedo offline. Dettagli:', errorInfo);
        }
      }
    }

    return null;
  }, [userId, loadUserStats]);

  useEffect(() => {
    if (!userId) return;
    const handler = (e: any) => {
      try {
        const detail = e?.detail;
        if (!detail || detail.userId !== userId) return;
        // Ricarica le statistiche quando altri componenti aggiornano gli XP
        loadUserStats();
      } catch {
        // ignora
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('xp-updated', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('xp-updated', handler as EventListener);
      }
    };
  }, [userId, loadUserStats]);
  // Inizializzazione al cambio utente: evita side-effect durante il render
  useEffect(() => {
    if (!userId) return;
    loadUserStats();
    if (options?.autoDailyLogin !== false) {
      // Guardia once-per-session per evitare invocazioni multiple automatiche nello stesso tab
      if (typeof window !== 'undefined') {
        try {
          const sessionKey = `xp:autoDailyLogin:attempted:${userId}`;
          const alreadyAttempted = sessionStorage.getItem(sessionKey);
          if (!alreadyAttempted) {
            sessionStorage.setItem(sessionKey, '1');
            dailyLogin(); // Automatico al caricamento (solo una volta per sessione)
          } else {
            // opzionale: debug
            // console.debug('[XP] Auto dailyLogin già tentato in questa sessione per', userId);
          }
        } catch {
          // In caso di errori con lo storage, fallback: prova comunque una sola volta
          dailyLogin();
        }
      } else {
        // Ambiente senza window: fallback
        dailyLogin();
      }
    }
  }, [userId, loadUserStats, dailyLogin, options?.autoDailyLogin]);

  // IMPORTANTISSIMO: ritorniamo l'API dell'hook per evitare undefined durante il destructuring
  return {
    userStats,
    loading,
    xpNotification,
    addXP,
    dailyLogin,
    loadUserStats,
  };
}

export function useUserStats(userId?: string) {
  const { userStats, loading } = useXPSystem(userId, { autoDailyLogin: false });
  return { userStats, loading };
}

export function useXPNotifications() {
  const [notification, setNotification] = useState<{xp: number; levelUp?: boolean; newBadges?: string[]} | null>(null);
  useEffect(() => {
    // Placeholder per future migliorie (event bus, ecc.)
  }, []);
  return { notification, setNotification };
}
