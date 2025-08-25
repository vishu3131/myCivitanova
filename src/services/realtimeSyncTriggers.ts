/**
 * MYCIVITANOVA - TRIGGER AUTOMATICI SINCRONIZZAZIONE TEMPO REALE
 * 
 * Sistema di trigger per la sincronizzazione automatica in tempo reale
 * tra Firebase e Supabase quando si verificano cambiamenti nei dati utente.
 */

import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db as firestore } from '../utils/firebaseClient';
import { firebaseSupabaseSync } from './firebaseSupabaseSync.ts';
import { supabase } from '../utils/supabaseClient.ts';

// Interfaccia per i listener attivi
interface ActiveListener {
  id: string;
  type: 'auth' | 'profile' | 'batch';
  unsubscribe: () => void;
  userId?: string;
  createdAt: Date;
}

// Interfaccia per le opzioni di configurazione
export interface RealtimeSyncOptions {
  enableAuthSync: boolean; // Sincronizzazione al cambio stato auth
  enableProfileSync: boolean; // Sincronizzazione al cambio profilo
  enableBatchSync: boolean; // Sincronizzazione batch periodica
  batchSyncInterval: number; // Intervallo batch in ms
  maxRetries: number; // Numero massimo di tentativi
  retryDelay: number; // Ritardo tra i tentativi in ms
  debounceDelay: number; // Ritardo per debounce in ms
}

class RealtimeSyncTriggers {
  private static instance: RealtimeSyncTriggers;
  private activeListeners: Map<string, ActiveListener> = new Map();
  private syncQueue: Set<string> = new Set();
  private isProcessingQueue = false;
  private batchSyncTimer: NodeJS.Timeout | null = null;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  
  private options: RealtimeSyncOptions = {
    enableAuthSync: true,
    enableProfileSync: true,
    enableBatchSync: false,
    batchSyncInterval: 300000, // 5 minuti
    maxRetries: 3,
    retryDelay: 2000,
    debounceDelay: 1000
  };

  static getInstance(): RealtimeSyncTriggers {
    if (!RealtimeSyncTriggers.instance) {
      RealtimeSyncTriggers.instance = new RealtimeSyncTriggers();
    }
    return RealtimeSyncTriggers.instance;
  }

  /**
   * Inizializza i trigger di sincronizzazione
   */
  initialize(options?: Partial<RealtimeSyncOptions>): void {
    console.log('🚀 Inizializzazione trigger sincronizzazione tempo reale');
    
    // Aggiorna le opzioni
    this.options = { ...this.options, ...options };
    
    // Pulisci listener esistenti
    this.cleanup();
    
    // Avvia i trigger abilitati
    if (this.options.enableAuthSync) {
      this.setupAuthStateListener();
    }
    
    if (this.options.enableBatchSync) {
      this.setupBatchSyncTimer();
    }
    
    console.log('✅ Trigger sincronizzazione inizializzati', this.options);
  }

  /**
   * Configura il listener per i cambiamenti di stato di autenticazione
   */
  private setupAuthStateListener(): void {
    const listenerId = 'auth-state-listener';
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Cambio stato autenticazione rilevato:', user?.uid || 'logout');
      
      if (user) {
        // Utente loggato - avvia sincronizzazione
        await this.handleUserLogin(user);
        
        // Configura listener per il profilo utente
        if (this.options.enableProfileSync) {
          this.setupProfileListener(user.uid);
        }
      } else {
        // Utente sloggato - pulisci listener profilo
        this.removeProfileListener();
      }
    });
    
    this.activeListeners.set(listenerId, {
      id: listenerId,
      type: 'auth',
      unsubscribe,
      createdAt: new Date()
    });
  }

  /**
   * Gestisce il login dell'utente
   */
  private async handleUserLogin(user: User): Promise<void> {
    try {
      console.log(`👤 Gestione login utente: ${user.email}`);
      
      // Aggiungi alla coda di sincronizzazione con debounce
      this.addToSyncQueue(user.uid);
      
    } catch (error) {
      console.error('Errore nella gestione del login:', error);
    }
  }

  /**
   * Configura il listener per i cambiamenti del profilo utente
   */
  private setupProfileListener(userId: string): void {
    // Rimuovi listener esistente per questo utente
    this.removeProfileListener(userId);
    
    const listenerId = `profile-listener-${userId}`;
    
    try {
      const profileRef = doc(firestore, 'profiles', userId);
      
      const unsubscribe = onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
          console.log(`📝 Cambio profilo rilevato per ${userId}`);
          
          // Aggiungi alla coda di sincronizzazione con debounce
          this.addToSyncQueue(userId);
        }
      }, (error) => {
        console.error(`Errore nel listener profilo per ${userId}:`, error);
      });
      
      this.activeListeners.set(listenerId, {
        id: listenerId,
        type: 'profile',
        unsubscribe,
        userId,
        createdAt: new Date()
      });
      
      console.log(`✅ Listener profilo configurato per ${userId}`);
    } catch (error) {
      console.error(`Errore nella configurazione listener profilo per ${userId}:`, error);
    }
  }

  /**
   * Rimuove il listener del profilo
   */
  private removeProfileListener(userId?: string): void {
    if (userId) {
      const listenerId = `profile-listener-${userId}`;
      const listener = this.activeListeners.get(listenerId);
      if (listener) {
        listener.unsubscribe();
        this.activeListeners.delete(listenerId);
        console.log(`🗑️ Listener profilo rimosso per ${userId}`);
      }
    } else {
      // Rimuovi tutti i listener profilo
      for (const [id, listener] of this.activeListeners) {
        if (listener.type === 'profile') {
          listener.unsubscribe();
          this.activeListeners.delete(id);
        }
      }
      console.log('🗑️ Tutti i listener profilo rimossi');
    }
  }

  /**
   * Aggiunge un utente alla coda di sincronizzazione con debounce
   */
  private addToSyncQueue(userId: string): void {
    // Cancella timer esistente per questo utente
    const existingTimer = this.debounceTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Imposta nuovo timer con debounce
    const timer = setTimeout(() => {
      this.syncQueue.add(userId);
      this.debounceTimers.delete(userId);
      this.processQueue();
    }, this.options.debounceDelay);
    
    this.debounceTimers.set(userId, timer);
  }

  /**
   * Processa la coda di sincronizzazione
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.size === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    console.log(`🔄 Processamento coda sincronizzazione: ${this.syncQueue.size} utenti`);
    
    const usersToSync = Array.from(this.syncQueue);
    this.syncQueue.clear();
    
    for (const userId of usersToSync) {
      await this.syncUserWithRetry(userId);
    }
    
    this.isProcessingQueue = false;
    console.log('✅ Coda sincronizzazione processata');
  }

  /**
   * Sincronizza un utente con retry automatico
   */
  private async syncUserWithRetry(userId: string, attempt = 1): Promise<void> {
    try {
      // Ottieni l'utente corrente
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== userId) {
        console.warn(`Utente ${userId} non più autenticato, skip sincronizzazione`);
        return;
      }
      
      const result = await firebaseSupabaseSync.syncUser(currentUser);
      
      if (result.success) {
        console.log(`✅ Sincronizzazione completata per ${userId}: ${result.syncType}`);
      } else {
        throw new Error(result.error || 'Errore sconosciuto');
      }
    } catch (error) {
      console.error(`❌ Errore sincronizzazione ${userId} (tentativo ${attempt}):`, error);
      
      if (attempt < this.options.maxRetries) {
        console.log(`🔄 Nuovo tentativo per ${userId} in ${this.options.retryDelay}ms`);
        setTimeout(() => {
          this.syncUserWithRetry(userId, attempt + 1);
        }, this.options.retryDelay);
      } else {
        console.error(`💥 Sincronizzazione fallita per ${userId} dopo ${this.options.maxRetries} tentativi`);
      }
    }
  }

  /**
   * Configura il timer per la sincronizzazione batch
   */
  private setupBatchSyncTimer(): void {
    if (this.batchSyncTimer) {
      clearInterval(this.batchSyncTimer);
    }
    
    this.batchSyncTimer = setInterval(async () => {
      console.log('🔄 Avvio sincronizzazione batch periodica');
      
      try {
        const result = await firebaseSupabaseSync.syncAllUsers();
        console.log(`✅ Sincronizzazione batch completata: ${result.success}/${result.total}`);
      } catch (error) {
        console.error('❌ Errore sincronizzazione batch:', error);
      }
    }, this.options.batchSyncInterval);
    
    const listenerId = 'batch-sync-timer';
    this.activeListeners.set(listenerId, {
      id: listenerId,
      type: 'batch',
      unsubscribe: () => {
        if (this.batchSyncTimer) {
          clearInterval(this.batchSyncTimer);
          this.batchSyncTimer = null;
        }
      },
      createdAt: new Date()
    });
    
    console.log(`✅ Timer sincronizzazione batch configurato (${this.options.batchSyncInterval}ms)`);
  }

  /**
   * Forza la sincronizzazione immediata dell'utente corrente
   */
  async forceSyncCurrentUser(): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('Nessun utente autenticato per la sincronizzazione forzata');
      return false;
    }
    
    console.log(`🚀 Sincronizzazione forzata per ${currentUser.uid}`);
    
    try {
      const result = await firebaseSupabaseSync.syncUser(currentUser);
      return result.success;
    } catch (error) {
      console.error('Errore nella sincronizzazione forzata:', error);
      return false;
    }
  }

  /**
   * Ottiene lo stato dei trigger
   */
  getStatus(): {
    activeListeners: number;
    queueSize: number;
    isProcessing: boolean;
    options: RealtimeSyncOptions;
  } {
    return {
      activeListeners: this.activeListeners.size,
      queueSize: this.syncQueue.size,
      isProcessing: this.isProcessingQueue,
      options: this.options
    };
  }

  /**
   * Pulisce tutti i listener e timer
   */
  cleanup(): void {
    console.log('🧹 Pulizia trigger sincronizzazione');
    
    // Pulisci listener attivi
    for (const listener of this.activeListeners.values()) {
      listener.unsubscribe();
    }
    this.activeListeners.clear();
    
    // Pulisci timer debounce
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    
    // Pulisci timer batch
    if (this.batchSyncTimer) {
      clearInterval(this.batchSyncTimer);
      this.batchSyncTimer = null;
    }
    
    // Pulisci coda
    this.syncQueue.clear();
    this.isProcessingQueue = false;
    
    console.log('✅ Pulizia trigger completata');
  }

  /**
   * Aggiorna le opzioni di configurazione
   */
  updateOptions(newOptions: Partial<RealtimeSyncOptions>): void {
    const oldOptions = { ...this.options };
    this.options = { ...this.options, ...newOptions };
    
    console.log('⚙️ Opzioni trigger aggiornate:', {
      old: oldOptions,
      new: this.options
    });
    
    // Reinizializza se necessario
    if (newOptions.enableBatchSync !== oldOptions.enableBatchSync ||
        newOptions.batchSyncInterval !== oldOptions.batchSyncInterval) {
      if (this.options.enableBatchSync) {
        this.setupBatchSyncTimer();
      } else {
        const batchListener = this.activeListeners.get('batch-sync-timer');
        if (batchListener) {
          batchListener.unsubscribe();
          this.activeListeners.delete('batch-sync-timer');
        }
      }
    }
  }
}

// Esporta l'istanza singleton
export const realtimeSyncTriggers = RealtimeSyncTriggers.getInstance();
export default realtimeSyncTriggers;