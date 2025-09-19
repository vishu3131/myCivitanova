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
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Carica le statistiche utente con retry automatico e fallback multipli
   */
  const loadUserStats = useCallback(async (attempt: number = 1): Promise<void> => {
    if (!user?.id) return;
    
    const maxAttempts = 3;
    const retryDelay = 1000 * attempt; // Delay crescente

    try {
      console.log(`📊 Caricamento user_stats per ${user.id} (tentativo ${attempt}/${maxAttempts})`);
      
      // Strategia 1: Carica direttamente dalla tabella user_stats
      let { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.warn('Errore caricamento da user_stats:', statsError);
      }

      // Strategia 2: Se non trovato, prova con RPC function
      if (!statsData) {
        try {
          const canUseRpc = typeof (supabase as any)?.rpc === 'function';
          if (canUseRpc) {
            console.log(`🔧 Tentativo caricamento via RPC get_user_stats`);
            const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_user_stats', {
              user_uuid: user.id,
            });
            
            if (!rpcError && rpcData) {
              console.log(`✅ Dati ottenuti via RPC:`, rpcData);
              statsData = {
                user_id: user.id,
                total_xp: rpcData.total_xp || 0,
                current_level: rpcData.current_level || 1,
                level_progress: ((rpcData.total_xp || 0) % 100),
                badges_count: rpcData.badges_count || 0,
                badges_list: rpcData.badges_list || [],
                rank_position: rpcData.rank_position || 999,
                weekly_xp: rpcData.weekly_xp || 0,
                monthly_xp: rpcData.monthly_xp || 0,
                xp_to_next_level: (rpcData.current_level || 1) * 100 - (rpcData.total_xp || 0),
                activities_completed: rpcData.activities_completed || 0,
                streak_days: rpcData.streak_days || 0
              };
            } else if (rpcError) {
              console.warn('Errore RPC get_user_stats:', rpcError);
            }
          }
        } catch (rpcErr) {
          console.warn('RPC non disponibile o errore:', rpcErr);
        }
      }

      // Strategia 3: Se ancora nessun dato, prova a estrarre dal profilo
      if (!statsData) {
        console.log(`📋 Tentativo caricamento dati XP dal profilo`);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('total_xp, current_level, badges_count')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          statsData = {
            user_id: user.id,
            total_xp: profileData.total_xp || 0,
            current_level: profileData.current_level || 1,
            level_progress: ((profileData.total_xp || 0) % 100),
            badges_count: profileData.badges_count || 0,
            badges_list: [],
            rank_position: 999,
            weekly_xp: 0,
            monthly_xp: 0,
            xp_to_next_level: (profileData.current_level || 1) * 100 - (profileData.total_xp || 0),
            activities_completed: 0,
            streak_days: 0
          };
          console.log(`✅ Dati estratti dal profilo:`, statsData);
        }
      }

      // Strategia 4: Crea e inserisci dati di default se ancora mancanti
      if (!statsData) {
        console.log(`🆕 Creazione record user_stats di default`);
        const defaultStats = createDefaultStats();
        
        try {
          const insertData = {
            user_id: user.id,
            ...defaultStats,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Usa il client diretto se disponibile, altrimenti fallback al wrapper
          const client = supabase.direct || supabase;
          if (client && typeof client.from === 'function') {
            const { data: insertedStats, error: insertError } = await client
              .from('user_stats')
              .insert(insertData)
              .select('*')
              .single();

            if (!insertError && insertedStats) {
              statsData = insertedStats;
              console.log(`✅ Record user_stats creato:`, statsData);
            } else {
              console.warn('Impossibile creare record user_stats:', insertError);
              // Usa comunque i dati default localmente
              statsData = { user_id: user.id, ...defaultStats };
            }
          } else {
            console.warn('Client Supabase non disponibile per inserimento');
            statsData = { user_id: user.id, ...defaultStats };
          }
        } catch (insertErr) {
          console.warn('Errore inserimento stats default:', insertErr);
          statsData = { user_id: user.id, ...createDefaultStats() };
        }
      }

      if (statsData) {
        const validatedStats = validateUserStats(statsData);
        setUserStats(validatedStats);
        setRetryCount(0); // Reset retry count su successo
        console.log(`✅ User stats caricati con successo:`, validatedStats);
      } else {
        throw new Error('Impossibile ottenere dati user_stats da tutte le strategie');
      }

    } catch (error) {
      console.error(`❌ Errore caricamento user stats (tentativo ${attempt}):`, error);
      
      // Retry automatico se non abbiamo raggiunto il massimo
      if (attempt < maxAttempts) {
        console.log(`🔄 Retry automatico in ${retryDelay}ms...`);
        setRetryCount(attempt);
        setTimeout(() => {
          loadUserStats(attempt + 1);
        }, retryDelay);
        return;
      }
      
      // Ultimo tentativo fallito - usa dati di default e notifica errore
      console.error('❌ Tutti i tentativi di caricamento falliti, uso dati default');
      setUserStats(createDefaultStats());
      setRetryCount(0);
      
      if (attempt === maxAttempts) {
        toast.error('Impossibile caricare le statistiche utente. Riprova più tardi.');
      }
    }
  }, [user?.id]);

  /**
   * Carica i badge utente con retry
   */
  const loadBadges = useCallback(async (attempt: number = 1): Promise<void> => {
    if (!user?.id) return;
    
    const maxAttempts = 2;
    
    try {
      console.log(`🏆 Caricamento badges per ${user.id} (tentativo ${attempt}/${maxAttempts})`);
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Errore caricamento badges:', error);
        if (attempt < maxAttempts) {
          setTimeout(() => loadBadges(attempt + 1), 1000 * attempt);
          return;
        }
        throw error;
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
        console.log(`✅ ${validatedBadges.length} badges caricati`);
      } else {
        setBadges([]);
        setRecentBadges([]);
        console.log(`📝 Nessun badge trovato per l'utente`);
      }
    } catch (error) {
      console.error('Errore definitivo caricamento badges:', error);
      setBadges([]);
      setRecentBadges([]);
      if (attempt === maxAttempts) {
        toast.error('Errore nel caricamento dei badge.');
      }
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
   * Carica il profilo completo con gestione avanzata degli errori
   */
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    console.log(`👤 Inizio caricamento profilo completo per ${user.id}`);
    
    try {
      // Strategia cache-first con validazione età
      const cachedResult = loadFromCache();
      
      if (cachedResult) {
        console.log(`💾 Dati trovati in cache, età: ${cachedResult.shouldRefresh ? 'vecchi' : 'freschi'}`);
        setProfileUser(cachedResult.data);
        setLastUpdated(new Date().toLocaleString());
        
        // Carica dati aggiuntivi in parallelo
        const additionalDataPromises = [
          loadUserStats(),
          loadBadges()
        ];
        
        // Non aspettiamo che finiscano tutti per mostrare il profilo
        Promise.allSettled(additionalDataPromises).then(results => {
          const failedOperations = results.filter(r => r.status === 'rejected').length;
          if (failedOperations > 0) {
            console.warn(`⚠️ ${failedOperations} operazioni di caricamento fallite`);
          }
        });
        
        // Refresh in background se necessario
        if (cachedResult.shouldRefresh) {
          console.log(`🔄 Refresh in background...`);
          setTimeout(async () => {
            const freshProfile = await loadFreshProfile();
            if (freshProfile) {
              setProfileUser(freshProfile);
              setLastUpdated(new Date().toLocaleString());
            }
          }, 100);
        }
      } else {
        console.log(`🌐 Caricamento da database...`);
        // Carica dal database
        const freshProfile = await loadFreshProfile();
        if (freshProfile) {
          setProfileUser(freshProfile);
          setLastUpdated(new Date().toLocaleString());
          
          // Carica dati aggiuntivi
          await Promise.allSettled([
            loadUserStats(),
            loadBadges()
          ]);
        } else {
          throw new Error('Impossibile caricare il profilo dal database');
        }
      }

    } catch (error) {
      console.error('❌ Errore caricamento profilo completo:', error);
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
      
      // Usa il client diretto se disponibile, altrimenti fallback al wrapper
      const client = supabase.direct || supabase;
      if (client && typeof client.from === 'function') {
        const { error } = await client
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
      } else {
        console.warn('Client Supabase non disponibile per aggiornamento profilo');
        throw new Error('Client database non disponibile');
      }

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

  // Listener per eventi di sincronizzazione completata
  useEffect(() => {
    const handleSyncComplete = (event: any) => {
      if (event.detail?.userId === user?.id) {
        console.log('🔄 Sincronizzazione completata, ricarico profilo...');
        setTimeout(() => {
          loadUserProfile();
        }, 500); // Piccolo delay per assicurarsi che la sync sia propagata
      }
    };

    const handleXPUpdate = (event: any) => {
      if (event.detail?.userId === user?.id) {
        console.log('💎 XP aggiornato, ricarico statistiche...');
        loadUserStats();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('profile-sync-complete', handleSyncComplete);
      window.addEventListener('xp-updated', handleXPUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('profile-sync-complete', handleSyncComplete);
        window.removeEventListener('xp-updated', handleXPUpdate);
      }
    };
  }, [user?.id, loadUserProfile, loadUserStats]);

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