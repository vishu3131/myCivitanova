// Hook personalizzato per gestire lo stato e la logica del profilo

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import {
  UserProfile,
  UserStats,
  Badge,
  ProfileCache,
  ProfileHookReturn
} from '@/types/profile';
import {
  validateUserData,
  validateUserStats,
  validateBadges,
  createDefaultStats
} from '@/utils/profileValidation';
import { useXPSystem } from '@/hooks/useXPSystem';

const CACHE_DURATION = 60; // minuti
const BACKGROUND_REFRESH_THRESHOLD = 5; // minuti

export const useProfile = (): ProfileHookReturn => {
  const { user } = useUnifiedAuth();
  const { addXP } = useXPSystem(user?.id); // autoDailyLogin attivo qui

  // State
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentBadges, setRecentBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  /**
   * Carica le statistiche utente
   */
  const loadUserStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user stats:', error);
        setUserStats(createDefaultStats());
        return;
      }

      if (data) {
        const validatedStats = validateUserStats(data);
        setUserStats(validatedStats);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      toast.error('Errore nel caricamento delle statistiche utente.');
      setUserStats(createDefaultStats());
    }
  }, [user?.id]);

  /**
   * Carica i badge utente
   */
  const loadBadges = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error loading badges:', error);
        toast.error('Errore nel caricamento dei badge.');
        setBadges([]);
        setRecentBadges([]);
        return;
      }

      if (data && Array.isArray(data)) {
        const earnedBadges = data
          .filter(ub => ub.badges)
          .map(ub => ({
            ...ub.badges,
            earned_at: ub.earned_at,
          }));

        const validatedBadges = validateBadges(earnedBadges);
        setBadges(validatedBadges);
        setRecentBadges(validatedBadges.slice(0, 3));
      } else {
        setBadges([]);
        setRecentBadges([]);
      }
    } catch (error) {
      console.error('Unexpected error loading badges:', error);
      toast.error('Errore imprevisto nel caricamento dei badge.');
      setBadges([]);
      setRecentBadges([]);
    }
  }, [user?.id]);

  /**
   * Carica il profilo dalla cache
   */
  const loadFromCache = useCallback((): { data: UserProfile; shouldRefresh: boolean } | null => {
    if (!user?.id) return null;

    const cachedProfile = localStorage.getItem(`profile_${user.id}`);
    if (!cachedProfile) return null;

    try {
      const parsedProfile: ProfileCache = JSON.parse(cachedProfile);
      const cacheTimestamp = new Date(parsedProfile.timestamp);
      const now = new Date();
      const cacheAge = (now.getTime() - cacheTimestamp.getTime()) / 1000 / 60; // in minuti

      if (cacheAge < CACHE_DURATION && parsedProfile.data) {
        return {
          data: parsedProfile.data,
          shouldRefresh: cacheAge > BACKGROUND_REFRESH_THRESHOLD
        };
      }
    } catch (e) {
      console.error('Failed to parse cached profile:', e);
      localStorage.removeItem(`profile_${user.id}`);
    }

    return null;
  }, [user?.id]);

  /**
   * Salva il profilo nella cache
   */
  const saveToCache = useCallback((profile: UserProfile) => {
    if (!user?.id) return;

    const profileCache: ProfileCache = {
      data: profile,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileCache));
  }, [user?.id]);

  /**
   * Carica il profilo dal database
   */
  const loadFreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user?.id) return null;

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Impossibile caricare il profilo dal database.');
        return null;
      }

      if (profileData) {
        const validatedProfile = validateUserData(profileData);
        if (validatedProfile) {
          saveToCache(validatedProfile);
          return validatedProfile;
        }
      }
    } catch (error) {
      console.error('Error in loadFreshProfile:', error);
      toast.error('Errore nel caricamento dei dati del profilo.');
    }

    return null;
  }, [user?.id, saveToCache]);

  /**
   * Carica il profilo completo
   */
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    
    try {
      // Prova prima la cache
      const cachedResult = loadFromCache();
      
      if (cachedResult) {
        setProfileUser(cachedResult.data);
        setLastUpdated(new Date().toLocaleString());
        
        // Carica dati aggiuntivi
        await Promise.all([
          loadUserStats(),
          loadBadges()
        ]);
        
        // Aggiorna in background se necessario
        if (cachedResult.shouldRefresh) {
          setTimeout(async () => {
            const freshProfile = await loadFreshProfile();
            if (freshProfile) {
              setProfileUser(freshProfile);
              setLastUpdated(new Date().toLocaleString());
            }
          }, 0);
        }
      } else {
        // Carica dal database
        const freshProfile = await loadFreshProfile();
        if (freshProfile) {
          setProfileUser(freshProfile);
          setLastUpdated(new Date().toLocaleString());
          
          // Carica dati aggiuntivi
          await Promise.all([
            loadUserStats(),
            loadBadges()
          ]);
        }
      }

      // Daily login gestito automaticamente da useXPSystem (guardia one-per-session)
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Errore nel caricamento del profilo.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadFromCache, loadFreshProfile, loadUserStats, loadBadges]);

  /**
   * Aggiorna il profilo
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id || !profileUser) return;

    try {
      const updatedProfile = { ...profileUser, ...updates, updated_at: new Date().toISOString() };
      
      // Aggiorna nel database
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Aggiorna stato locale e cache
      setProfileUser(updatedProfile);
      saveToCache(updatedProfile);
      setLastUpdated(new Date().toLocaleString());

      // Aggiungi XP per aggiornamento profilo
      if (addXP) {
        const result = await addXP('profile_update', 10);
        if (result) {
          toast.success(`Profilo aggiornato! +10 XP`);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Errore durante l\'aggiornamento del profilo.');
    }
  }, [user?.id, profileUser, saveToCache, addXP]);

  /**
   * Refresh manuale del profilo
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      // Rimuovi cache e ricarica
      localStorage.removeItem(`profile_${user.id}`);
      await loadUserProfile();
    }
  }, [user?.id, loadUserProfile]);

  // Effect per caricare il profilo quando l'utente cambia
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    } else {
      // Reset stato quando l'utente si disconnette
      setProfileUser(null);
      setUserStats(null);
      setBadges([]);
      setRecentBadges([]);
      setLastUpdated('');
    }
  }, [user?.id, loadUserProfile]);

  // Listener per cambiamenti di autenticazione
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          loadUserProfile();
        }
        if (event === 'SIGNED_OUT') {
          setProfileUser(null);
          setUserStats(null);
          setBadges([]);
          setRecentBadges([]);
          if (user?.id) {
            localStorage.removeItem(`profile_${user.id}`);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUserProfile, user?.id]);

  return {
    profileUser,
    userStats,
    badges,
    recentBadges,
    loading,
    lastUpdated,
    refreshProfile,
    updateProfile
  };
};