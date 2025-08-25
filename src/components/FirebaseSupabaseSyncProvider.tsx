/**
 * MYCIVITANOVA - PROVIDER SINCRONIZZAZIONE FIREBASE -> SUPABASE
 * 
 * Provider React per inizializzare e gestire il sistema di sincronizzazione
 * automatica tra Firebase e Supabase.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useFirebaseSupabaseSync, SyncState } from '../hooks/useFirebaseSupabaseSync';
import { SyncStats } from '../services/firebaseSupabaseSync';
import { useRealtimeSyncTriggers, RealtimeSyncOptions } from '../hooks/useRealtimeSyncTriggers';

// Interfaccia per il contesto di sincronizzazione
export interface SyncContextType {
  syncState: SyncState;
  stats: SyncStats | null;
  isInitialized: boolean;
  syncCurrentUser: () => Promise<void>;
  syncAllUsers: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
  forceSyncCurrentUser: () => Promise<boolean>;
  toggleRealtimeSync: (enabled: boolean) => void;
  realtimeSync: {
    isEnabled: boolean;
    isInitialized: boolean;
    activeListeners: number;
    queueSize: number;
    isProcessing: boolean;
  };
}

// Contesto di sincronizzazione
const SyncContext = createContext<SyncContextType | null>(null);

// Props del provider
export interface FirebaseSupabaseSyncProviderProps {
  children: ReactNode;
  autoSync?: boolean;
  syncOnMount?: boolean;
  refreshStatsInterval?: number;
  showNotifications?: boolean;
  realtimeSync?: boolean;
  realtimeSyncOptions?: Partial<RealtimeSyncOptions>;
}

/**
 * Provider per il sistema di sincronizzazione Firebase -> Supabase
 */
export function FirebaseSupabaseSyncProvider({
  children,
  autoSync = true,
  syncOnMount = true,
  refreshStatsInterval = 30000,
  showNotifications = false,
  realtimeSync = true,
  realtimeSyncOptions = {
    enableAuthSync: true,
    enableProfileSync: true,
    enableBatchSync: false,
    debounceDelay: 1000,
    maxRetries: 3
  }
}: FirebaseSupabaseSyncProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [realtimeSyncEnabled, setRealtimeSyncEnabled] = useState(realtimeSync);

  // Hook di sincronizzazione
  const {
    syncState,
    syncUser,
    syncAllUsers,
    refreshStats,
    clearError
  } = useFirebaseSupabaseSync({
    autoSync: autoSync && !realtimeSyncEnabled,
    syncOnMount: syncOnMount && !realtimeSyncEnabled,
    refreshStatsInterval
  });

  // Hook per trigger sincronizzazione tempo reale
  const realtimeTriggers = useRealtimeSyncTriggers({
    autoInitialize: realtimeSyncEnabled,
    syncOptions: realtimeSyncOptions,
    onSyncSuccess: (userId) => {
      if (showNotifications) {
        addNotification(`✅ Sincronizzazione automatica completata per ${userId}`);
      }
    },
    onSyncError: (error, userId) => {
      if (showNotifications) {
        addNotification(`❌ Errore sincronizzazione automatica per ${userId}: ${error.message}`);
      }
    },
    enableLogging: showNotifications
  });

  // Wrapper per sincronizzazione utente corrente
  const syncCurrentUser = async (): Promise<void> => {
    try {
      const result = await syncUser();
      if (result && showNotifications) {
        if (result.success) {
          addNotification(`✅ Sincronizzazione completata: ${result.syncType}`);
        } else {
          addNotification(`❌ Errore sincronizzazione: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Errore nella sincronizzazione utente:', error);
      if (showNotifications) {
        addNotification('❌ Errore nella sincronizzazione utente');
      }
    }
  };

  // Wrapper per sincronizzazione di tutti gli utenti
  const syncAllUsersWrapper = async (): Promise<void> => {
    try {
      const result = await syncAllUsers();
      if (result && showNotifications) {
        addNotification(`📊 Sincronizzazione batch: ${result.success}/${result.total} utenti`);
      }
    } catch (error) {
      console.error('Errore nella sincronizzazione batch:', error);
      if (showNotifications) {
        addNotification('❌ Errore nella sincronizzazione batch');
      }
    }
  };

  // Forza la sincronizzazione dell'utente corrente tramite trigger
  const forceSyncCurrentUser = async (): Promise<boolean> => {
    if (realtimeSyncEnabled && realtimeTriggers.isReady) {
      return await realtimeTriggers.forceSyncCurrentUser();
    } else {
      await syncCurrentUser();
      return true;
    }
  };

  // Attiva/disattiva la sincronizzazione in tempo reale
  const toggleRealtimeSync = (enabled: boolean): void => {
    setRealtimeSyncEnabled(enabled);
    
    if (enabled && !realtimeTriggers.isInitialized) {
      realtimeTriggers.initialize();
    } else if (!enabled && realtimeTriggers.isInitialized) {
      realtimeTriggers.cleanup();
    }
    
    if (showNotifications) {
      addNotification(`🔄 Sincronizzazione tempo reale ${enabled ? 'abilitata' : 'disabilitata'}`);
    }
  };

  // Funzione per aggiungere notifiche
  const addNotification = (message: string): void => {
    setNotifications(prev => [...prev, message]);
    // Rimuovi la notifica dopo 5 secondi
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  };

  // Inizializzazione del provider
  useEffect(() => {
    console.log('🚀 Inizializzazione FirebaseSupabaseSyncProvider');
    
    // Verifica che le variabili d'ambiente siano configurate
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Variabili d\'ambiente Supabase non configurate. La sincronizzazione potrebbe non funzionare.');
      if (showNotifications) {
        addNotification('⚠️ Configurazione Supabase mancante');
      }
    }
    
    setIsInitialized(true);
    console.log('✅ FirebaseSupabaseSyncProvider inizializzato');
  }, [showNotifications]);

  // Log degli stati di sincronizzazione
  useEffect(() => {
    if (syncState.lastSyncResult) {
      const { success, syncType, error } = syncState.lastSyncResult;
      if (success) {
        console.log(`✅ Sincronizzazione ${syncType} completata`);
      } else {
        console.error(`❌ Errore sincronizzazione ${syncType}:`, error);
      }
    }
  }, [syncState.lastSyncResult]);

  // Valore del contesto
  const contextValue: SyncContextType = {
    syncState: {
      ...syncState,
      isLoading: syncState.isLoading || realtimeTriggers.isProcessing,
      error: syncState.error || realtimeTriggers.error
    },
    stats: syncState.stats,
    isInitialized,
    syncCurrentUser,
    syncAllUsers: syncAllUsersWrapper,
    refreshStats,
    clearError,
    forceSyncCurrentUser,
    toggleRealtimeSync,
    realtimeSync: {
      isEnabled: realtimeSyncEnabled,
      isInitialized: realtimeTriggers.isInitialized,
      activeListeners: realtimeTriggers.activeListeners,
      queueSize: realtimeTriggers.queueSize,
      isProcessing: realtimeTriggers.isProcessing
    }
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
      
      {/* Notifiche di sincronizzazione */}
      {showNotifications && notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm"
            >
              {notification}
            </div>
          ))}
        </div>
      )}
      
      {/* Indicatore di sincronizzazione in corso */}
      {syncState.isLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Sincronizzazione in corso...</span>
          </div>
        </div>
      )}
      
      {/* Indicatore di errore */}
      {syncState.error && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <span>❌ {syncState.error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SyncContext.Provider>
  );
}

/**
 * Hook per utilizzare il contesto di sincronizzazione
 */
export function useSyncContext(): SyncContextType {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext deve essere utilizzato all\'interno di FirebaseSupabaseSyncProvider');
  }
  return context;
}

/**
 * Hook semplificato per ottenere solo lo stato di sincronizzazione
 */
export function useSyncState(): SyncState {
  const { syncState } = useSyncContext();
  return syncState;
}

/**
 * Hook semplificato per ottenere solo le statistiche
 */
export function useSyncStats(): SyncStats | null {
  const { stats } = useSyncContext();
  return stats;
}

/**
 * Componente per visualizzare le statistiche di sincronizzazione
 */
export function SyncStatsDisplay({ className = '' }: { className?: string }) {
  const { stats, refreshStats } = useSyncContext();

  if (!stats) {
    return (
      <div className={`text-gray-500 ${className}`}>
        Caricamento statistiche...
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 p-4 rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">Statistiche Sincronizzazione</h3>
        <button
          onClick={refreshStats}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          🔄 Aggiorna
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Totale utenti:</span>
          <span className="ml-2 font-medium">{stats.totalUsers}</span>
        </div>
        <div>
          <span className="text-gray-600">Sincronizzati:</span>
          <span className="ml-2 font-medium text-green-600">{stats.syncedUsers}</span>
        </div>
        <div>
          <span className="text-gray-600">In attesa:</span>
          <span className="ml-2 font-medium text-yellow-600">{stats.pendingUsers}</span>
        </div>
        <div>
          <span className="text-gray-600">Errori:</span>
          <span className="ml-2 font-medium text-red-600">{stats.errorUsers}</span>
        </div>
      </div>
      
      {stats.lastSync && (
        <div className="mt-2 text-xs text-gray-500">
          Ultima sincronizzazione: {new Date(stats.lastSync).toLocaleString('it-IT')}
        </div>
      )}
    </div>
  );
}

export default FirebaseSupabaseSyncProvider;