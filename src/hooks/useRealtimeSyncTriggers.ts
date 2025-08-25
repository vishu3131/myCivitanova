/**
 * MYCIVITANOVA - HOOK TRIGGER SINCRONIZZAZIONE TEMPO REALE
 * 
 * Hook React per gestire i trigger automatici di sincronizzazione
 * in tempo reale tra Firebase e Supabase.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { realtimeSyncTriggers, RealtimeSyncOptions } from '../services/realtimeSyncTriggers';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebaseClient.ts';

// Interfaccia per lo stato dei trigger
export interface SyncTriggersState {
  isInitialized: boolean;
  activeListeners: number;
  queueSize: number;
  isProcessing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

// Interfaccia per le opzioni del hook
export interface UseRealtimeSyncTriggersOptions {
  autoInitialize?: boolean; // Inizializza automaticamente al mount
  syncOptions?: Partial<RealtimeSyncOptions>; // Opzioni per i trigger
  onSyncSuccess?: (userId: string) => void; // Callback successo
  onSyncError?: (error: Error, userId?: string) => void; // Callback errore
  enableLogging?: boolean; // Abilita logging dettagliato
}

/**
 * Hook per gestire i trigger di sincronizzazione in tempo reale
 */
export function useRealtimeSyncTriggers(options: UseRealtimeSyncTriggersOptions = {}) {
  const {
    autoInitialize = true,
    syncOptions = {},
    onSyncSuccess,
    onSyncError,
    enableLogging = false
  } = options;

  // Stato del hook
  const [state, setState] = useState<SyncTriggersState>({
    isInitialized: false,
    activeListeners: 0,
    queueSize: 0,
    isProcessing: false,
    lastSyncTime: null,
    error: null
  });

  // Stato autenticazione Firebase
  const [user, loading, authError] = useAuthState(auth);
  
  // Ref per evitare re-inizializzazioni
  const initializationRef = useRef(false);
  const statusUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Aggiorna lo stato dei trigger
   */
  const updateStatus = useCallback(() => {
    try {
      const status = realtimeSyncTriggers.getStatus();
      
      setState(prev => ({
        ...prev,
        activeListeners: status.activeListeners,
        queueSize: status.queueSize,
        isProcessing: status.isProcessing,
        error: null
      }));
      
      if (enableLogging) {
        console.log('📊 Stato trigger sincronizzazione:', status);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (onSyncError) {
        onSyncError(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  }, [enableLogging, onSyncError]);

  /**
   * Inizializza i trigger di sincronizzazione
   */
  const initialize = useCallback(async () => {
    if (initializationRef.current) {
      if (enableLogging) {
        console.log('⚠️ Trigger già inizializzati, skip');
      }
      return;
    }

    try {
      if (enableLogging) {
        console.log('🚀 Inizializzazione trigger sincronizzazione...');
      }

      // Configura opzioni predefinite ottimizzate
      const defaultOptions: Partial<RealtimeSyncOptions> = {
        enableAuthSync: true,
        enableProfileSync: true,
        enableBatchSync: false, // Disabilitato di default per performance
        batchSyncInterval: 300000, // 5 minuti
        maxRetries: 3,
        retryDelay: 2000,
        debounceDelay: 1000
      };

      const finalOptions = { ...defaultOptions, ...syncOptions };
      
      // Inizializza i trigger
      realtimeSyncTriggers.initialize(finalOptions);
      
      initializationRef.current = true;
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        error: null
      }));

      // Avvia aggiornamento stato periodico
      if (statusUpdateIntervalRef.current) {
        clearInterval(statusUpdateIntervalRef.current);
      }
      
      statusUpdateIntervalRef.current = setInterval(updateStatus, 2000);
      
      // Aggiornamento iniziale
      updateStatus();
      
      if (enableLogging) {
        console.log('✅ Trigger sincronizzazione inizializzati');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore inizializzazione';
      
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: errorMessage
      }));
      
      if (onSyncError) {
        onSyncError(error instanceof Error ? error : new Error(errorMessage));
      }
      
      console.error('❌ Errore inizializzazione trigger:', error);
    }
  }, [syncOptions, enableLogging, onSyncError, updateStatus]);

  /**
   * Pulisce i trigger
   */
  const cleanup = useCallback(() => {
    try {
      if (enableLogging) {
        console.log('🧹 Pulizia trigger sincronizzazione...');
      }
      
      realtimeSyncTriggers.cleanup();
      
      if (statusUpdateIntervalRef.current) {
        clearInterval(statusUpdateIntervalRef.current);
        statusUpdateIntervalRef.current = null;
      }
      
      initializationRef.current = false;
      
      setState({
        isInitialized: false,
        activeListeners: 0,
        queueSize: 0,
        isProcessing: false,
        lastSyncTime: null,
        error: null
      });
      
      if (enableLogging) {
        console.log('✅ Trigger sincronizzazione puliti');
      }
    } catch (error) {
      console.error('❌ Errore pulizia trigger:', error);
    }
  }, [enableLogging]);

  /**
   * Forza la sincronizzazione dell'utente corrente
   */
  const forceSyncCurrentUser = useCallback(async (): Promise<boolean> => {
    try {
      if (!user) {
        throw new Error('Nessun utente autenticato');
      }
      
      if (enableLogging) {
        console.log('🚀 Sincronizzazione forzata utente corrente...');
      }
      
      const success = await realtimeSyncTriggers.forceSyncCurrentUser();
      
      if (success) {
        setState(prev => ({
          ...prev,
          lastSyncTime: new Date(),
          error: null
        }));
        
        if (onSyncSuccess) {
          onSyncSuccess(user.uid);
        }
        
        if (enableLogging) {
          console.log('✅ Sincronizzazione forzata completata');
        }
      } else {
        throw new Error('Sincronizzazione fallita');
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sincronizzazione';
      
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (onSyncError) {
        onSyncError(error instanceof Error ? error : new Error(errorMessage), user?.uid);
      }
      
      console.error('❌ Errore sincronizzazione forzata:', error);
      return false;
    }
  }, [user, enableLogging, onSyncSuccess, onSyncError]);

  /**
   * Aggiorna le opzioni dei trigger
   */
  const updateOptions = useCallback((newOptions: Partial<RealtimeSyncOptions>) => {
    try {
      realtimeSyncTriggers.updateOptions(newOptions);
      updateStatus();
      
      if (enableLogging) {
        console.log('⚙️ Opzioni trigger aggiornate:', newOptions);
      }
    } catch (error) {
      console.error('❌ Errore aggiornamento opzioni:', error);
    }
  }, [updateStatus, enableLogging]);

  // Effetto per inizializzazione automatica
  useEffect(() => {
    if (autoInitialize && !loading && !authError && user && !initializationRef.current) {
      initialize();
    }
  }, [autoInitialize, loading, authError, user, initialize]);

  // Effetto per pulizia al dismount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Effetto per gestire logout
  useEffect(() => {
    if (!loading && !user && initializationRef.current) {
      if (enableLogging) {
        console.log('👤 Utente sloggato, pulizia trigger...');
      }
      cleanup();
    }
  }, [loading, user, cleanup, enableLogging]);

  return {
    // Stato
    ...state,
    isUserAuthenticated: !!user && !loading,
    authLoading: loading,
    authError,
    
    // Azioni
    initialize,
    cleanup,
    forceSyncCurrentUser,
    updateOptions,
    updateStatus,
    
    // Utility
    isReady: state.isInitialized && !!user && !loading,
    hasError: !!state.error || !!authError
  };
}

/**
 * Hook semplificato per il solo stato dei trigger
 */
export function useSyncTriggersState() {
  const [status, setStatus] = useState({
    activeListeners: 0,
    queueSize: 0,
    isProcessing: false
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const currentStatus = realtimeSyncTriggers.getStatus();
        setStatus({
          activeListeners: currentStatus.activeListeners,
          queueSize: currentStatus.queueSize,
          isProcessing: currentStatus.isProcessing
        });
      } catch (error) {
        console.error('Errore aggiornamento stato trigger:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

export default useRealtimeSyncTriggers;