/**
 * MYCIVITANOVA - HOOK SINCRONIZZAZIONE FIREBASE -> SUPABASE
 * 
 * Hook React per gestire automaticamente la sincronizzazione dei dati utente
 * quando cambia lo stato di autenticazione Firebase.
 */

import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { firebaseSupabaseSync, SyncResult, SyncStats } from '../services/firebaseSupabaseSync.ts';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebaseClient';

export interface SyncState {
  isLoading: boolean;
  lastSyncResult: SyncResult | null;
  error: string | null;
  stats: SyncStats | null;
}

export interface UseFirebaseSupabaseSyncReturn {
  syncState: SyncState;
  syncUser: (user?: User) => Promise<SyncResult | null>;
  syncAllUsers: () => Promise<{ success: number; errors: number; total: number } | null>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook per la sincronizzazione automatica Firebase -> Supabase
 */
export function useFirebaseSupabaseSync(options?: {
  autoSync?: boolean; // Sincronizzazione automatica al login (default: true)
  syncOnMount?: boolean; // Sincronizza al mount se l'utente è già loggato (default: true)
  refreshStatsInterval?: number; // Intervallo refresh statistiche in ms (default: 30000)
}): UseFirebaseSupabaseSyncReturn {
  const {
    autoSync = true,
    syncOnMount = true,
    refreshStatsInterval = 30000
  } = options || {};

  const [user, loading, authError] = useAuthState(auth);
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    lastSyncResult: null,
    error: null,
    stats: null
  });

  /**
   * Aggiorna le statistiche di sincronizzazione
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await firebaseSupabaseSync.getSyncStats();
      setSyncState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Errore nel recupero delle statistiche:', error);
    }
  }, []);

  /**
   * Sincronizza un utente specifico
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncUser = useCallback(async (targetUser?: User): Promise<SyncResult | null> => {
    const userToSync = targetUser || user;
    
    if (!userToSync) {
      console.warn('Nessun utente da sincronizzare');
      return null;
    }
  
    setSyncState(prev => ({ ...prev, isLoading: true, error: null }));
  
    try {
      console.log(`🔄 Inizio sincronizzazione utente: ${userToSync.email}`);
      const result = await firebaseSupabaseSync.syncUser(userToSync);
      
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncResult: result,
        error: result.success ? null : result.error || 'Errore sconosciuto'
      }));
  
      if (result.success) {
        console.log(`✅ Sincronizzazione completata: ${result.syncType}`);
        // Aggiorna le statistiche dopo una sincronizzazione riuscita
        await refreshStats();
      } else {
        console.error(`❌ Errore sincronizzazione: ${result.error}`);
      }
  
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error('Errore durante la sincronizzazione:', errorMessage);
      
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
  
      return null;
    }
  }, [user, refreshStats]);

  /**
   * Sincronizza tutti gli utenti (operazione batch)
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const syncAllUsers = useCallback(async (): Promise<{ success: number; errors: number; total: number } | null> => {
    if (firebaseSupabaseSync.isSyncInProgress()) {
      setSyncState(prev => ({ ...prev, error: 'Sincronizzazione già in corso' }));
      return null;
    }
  
    setSyncState(prev => ({ ...prev, isLoading: true, error: null }));
  
    try {
      console.log('🔄 Inizio sincronizzazione batch di tutti gli utenti');
      const result = await firebaseSupabaseSync.syncAllUsers();
      
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncResult: {
          success: result.errors === 0,
          syncType: 'update',
          duration: 0,
          error: result.errors > 0 ? `${result.errors} errori su ${result.total} utenti` : undefined
        }
      }));
  
      console.log(`✅ Sincronizzazione batch completata: ${result.success}/${result.total} utenti`);
      
      // Aggiorna le statistiche
      await refreshStats();
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error('Errore durante la sincronizzazione batch:', errorMessage);
      
      setSyncState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
  
      return null;
    }
  }, [refreshStats]);

  /**
   * Pulisce l'errore corrente
   */
  const clearError = useCallback((): void => {
    setSyncState(prev => ({ ...prev, error: null }));
  }, []);

  // Effetto per la sincronizzazione automatica al cambio di stato auth
  useEffect(() => {
    if (loading || authError) return;

    // Sincronizzazione automatica al login
    if (autoSync && user && !syncState.isLoading) {
      console.log('🔄 Sincronizzazione automatica al login');
      syncUser(user);
    }

    // Sincronizzazione al mount se l'utente è già loggato
    if (syncOnMount && user && !syncState.lastSyncResult && !syncState.isLoading) {
      console.log('🔄 Sincronizzazione al mount');
      syncUser(user);
    }
  }, [user, loading, authError, autoSync, syncOnMount, syncState.isLoading, syncState.lastSyncResult, syncUser]);

  // Effetto per il refresh periodico delle statistiche
  useEffect(() => {
    if (!refreshStatsInterval || refreshStatsInterval <= 0) return;

    // Carica le statistiche iniziali
    refreshStats();

    // Imposta l'intervallo per il refresh
    const interval = setInterval(refreshStats, refreshStatsInterval);

    return () => clearInterval(interval);
  }, [refreshStats, refreshStatsInterval]);

  // Effetto per gestire errori di autenticazione
  useEffect(() => {
    if (authError) {
      setSyncState(prev => ({
        ...prev,
        error: `Errore autenticazione: ${authError.message}`
      }));
    }
  }, [authError]);

  return {
    syncState,
    syncUser,
    syncAllUsers,
    refreshStats,
    clearError
  };
}

/**
 * Hook semplificato per ottenere solo le statistiche di sincronizzazione
 */
export function useSyncStats(refreshInterval = 30000): {
  stats: SyncStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newStats = await firebaseSupabaseSync.getSyncStats();
      setStats(newStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore nel recupero delle statistiche:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return { stats, isLoading, error, refresh };
}

export default useFirebaseSupabaseSync;