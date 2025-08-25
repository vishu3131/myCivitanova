/**
 * MYCIVITANOVA - SERVIZIO SINCRONIZZAZIONE FIREBASE -> SUPABASE
 * 
 * Questo servizio gestisce la sincronizzazione automatica dei dati utente
 * da Firebase Auth/Firestore verso il database Supabase.
 */

import { User } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db as firestore } from '../utils/firebaseClient';
import { supabase } from '../utils/supabaseClient';
import { AuthUser, UserProfile } from '../utils/firebaseAuth';

// Interfacce per i dati di sincronizzazione
export interface SyncResult {
  success: boolean;
  profileId?: string;
  error?: string;
  syncType: 'create' | 'update';
  duration: number;
}

export interface SyncStats {
  totalUsers: number;
  syncedUsers: number;
  pendingUsers: number;
  errorUsers: number;
  lastSync: string | null;
}

export interface FirebaseProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  customClaims?: Record<string, any>;
}

export interface SupabaseProfile {
  id: string;
  firebase_uid: string;
  email: string;
  full_name?: string;
  username?: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  firebase_created_at?: string;
  firebase_last_sign_in?: string;
  last_sync_at: string;
  sync_status: 'synced' | 'pending' | 'error';
  created_at: string;
  updated_at: string;
}

class FirebaseSupabaseSync {
  private static instance: FirebaseSupabaseSync;
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;

  static getInstance(): FirebaseSupabaseSync {
    if (!FirebaseSupabaseSync.instance) {
      FirebaseSupabaseSync.instance = new FirebaseSupabaseSync();
    }
    return FirebaseSupabaseSync.instance;
  }

  /**
   * Sincronizza un singolo utente Firebase con Supabase
   */
  async syncUser(firebaseUser: User): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Inizio sincronizzazione utente: ${firebaseUser.uid}`);
      
      // 1. Ottieni il profilo Firebase completo
      const firebaseProfile = await this.getFirebaseProfile(firebaseUser);
      if (!firebaseProfile) {
        throw new Error('Impossibile ottenere il profilo Firebase');
      }

      // 2. Controlla se l'utente esiste già in Supabase
      const existingProfile = await this.getSupabaseProfile(firebaseUser.uid);
      
      let result: SyncResult;
      
      if (existingProfile) {
        // Aggiorna profilo esistente
        result = await this.updateSupabaseProfile(firebaseProfile, existingProfile);
      } else {
        // Crea nuovo profilo
        result = await this.createSupabaseProfile(firebaseProfile);
      }

      // 3. Aggiorna il mapping Firebase UID -> Supabase UUID
      if (result.success && result.profileId) {
        await this.updateUserMapping(firebaseUser.uid, result.profileId);
      }

      // 4. Log della sincronizzazione
      await this.logSync({
        firebase_uid: firebaseUser.uid,
        profile_id: result.profileId,
        sync_type: result.syncType,
        sync_status: result.success ? 'success' : 'error',
        firebase_data: firebaseProfile,
        error_message: result.error,
        sync_duration_ms: Date.now() - startTime
      });

      console.log(`✅ Sincronizzazione completata per ${firebaseUser.uid}: ${result.syncType}`);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error(`❌ Errore sincronizzazione ${firebaseUser.uid}:`, errorMessage);
      
      // Log dell'errore
      await this.logSync({
        firebase_uid: firebaseUser.uid,
        sync_type: 'update',
        sync_status: 'error',
        error_message: errorMessage,
        sync_duration_ms: Date.now() - startTime
      });

      return {
        success: false,
        error: errorMessage,
        syncType: 'update',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Ottiene il profilo completo da Firebase
   */
  private async getFirebaseProfile(user: User): Promise<FirebaseProfile | null> {
    try {
      // Ottieni dati base da Firebase Auth
      const baseProfile: FirebaseProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        phoneNumber: user.phoneNumber || undefined,
        emailVerified: user.emailVerified,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      };

      // Prova a ottenere dati aggiuntivi da Firestore
      try {
        const profileDoc = await getDoc(doc(firestore, 'profiles', user.uid));
        if (profileDoc.exists()) {
          const firestoreData = profileDoc.data();
          return {
            ...baseProfile,
            ...firestoreData
          };
        }
      } catch (firestoreError) {
        console.warn('Impossibile ottenere dati Firestore:', firestoreError);
      }

      return baseProfile;
    } catch (error) {
      console.error('Errore nel recupero profilo Firebase:', error);
      return null;
    }
  }

  /**
   * Ottiene il profilo da Supabase
   */
  private async getSupabaseProfile(firebaseUid: string): Promise<SupabaseProfile | null> {
    try {
      const { data, error } = await supabase
        .direct
        .from('profiles')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Errore nel recupero profilo Supabase:', error);
      return null;
    }
  }

  /**
   * Crea un nuovo profilo in Supabase
   */
  private async createSupabaseProfile(firebaseProfile: FirebaseProfile): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      // Prepara i dati per l'inserimento
      const newProfile = {
        firebase_uid: firebaseProfile.uid,
        email: firebaseProfile.email,
        full_name: firebaseProfile.displayName || '',
        username: this.generateUsername(firebaseProfile),
        phone: firebaseProfile.phoneNumber || '',
        role: firebaseProfile.customClaims?.role || 'user',
        avatar_url: firebaseProfile.photoURL || '',
        is_active: true,
        is_verified: firebaseProfile.emailVerified,
        firebase_created_at: firebaseProfile.metadata.creationTime,
        firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime,
        last_sync_at: new Date().toISOString(),
        sync_status: 'synced'
      };

      // Inserisci il nuovo profilo
      const { data, error } = await supabase
        .direct
        .from('profiles')
        .insert(newProfile)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        profileId: data.id,
        syncType: 'create',
        duration: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error('Errore nella creazione profilo Supabase:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        syncType: 'create',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Aggiorna un profilo esistente in Supabase
   */
  private async updateSupabaseProfile(firebaseProfile: FirebaseProfile, existingProfile: SupabaseProfile): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      // Prepara i dati per l'aggiornamento
      const updates: Record<string, any> = {
        email: firebaseProfile.email,
        full_name: firebaseProfile.displayName || existingProfile.full_name,
        phone: firebaseProfile.phoneNumber || existingProfile.phone,
        role: firebaseProfile.customClaims?.role || existingProfile.role,
        avatar_url: firebaseProfile.photoURL || existingProfile.avatar_url,
        is_verified: firebaseProfile.emailVerified,
        firebase_created_at: firebaseProfile.metadata.creationTime,
        firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime,
        last_sync_at: new Date().toISOString(),
        sync_status: 'synced'
      };

      // Verifica se ci sono effettivamente modifiche
      let hasChanges = false;
      for (const [key, value] of Object.entries(updates)) {
        if (existingProfile[key as keyof SupabaseProfile] !== value) {
          hasChanges = true;
          break;
        }
      }

      // Se non ci sono modifiche, aggiorna solo il timestamp di sincronizzazione
      if (!hasChanges) {
        const { error } = await supabase
          .direct
          .from('profiles')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', existingProfile.id);

        if (error) {
          throw error;
        }

        return {
          success: true,
          profileId: existingProfile.id,
          syncType: 'update',
          duration: Date.now() - startTime
        };
      }

      // Aggiorna il profilo con tutte le modifiche
      const { error } = await supabase
        .direct
        .from('profiles')
        .update(updates)
        .eq('id', existingProfile.id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        profileId: existingProfile.id,
        syncType: 'update',
        duration: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      console.error('Errore nell\'aggiornamento profilo Supabase:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        syncType: 'update',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Aggiorna il mapping tra Firebase UID e Supabase UUID
   */
  private async updateUserMapping(firebaseUid: string, supabaseUuid: string): Promise<void> {
    try {
      const { error } = await supabase
        .direct
        .from('firebase_user_mapping')
        .upsert({
          firebase_uid: firebaseUid,
          supabase_uuid: supabaseUuid,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'firebase_uid'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento mapping utente:', error);
    }
  }

  /**
   * Genera un username basato sul profilo Firebase
   */
  private generateUsername(profile: FirebaseProfile): string {
    // Usa il displayName se disponibile
    if (profile.displayName) {
      return profile.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15);
    }
    
    // Altrimenti usa l'email senza dominio
    const emailUsername = profile.email.split('@')[0];
    return emailUsername.substring(0, 15);
  }

  /**
   * Registra un'operazione di sincronizzazione
   */
  private async logSync(logData: {
    firebase_uid: string;
    profile_id?: string;
    sync_type: 'create' | 'update';
    sync_status: 'success' | 'error';
    firebase_data?: any;
    error_message?: string;
    sync_duration_ms: number;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .direct
        .from('sync_logs')
        .insert({
          ...logData,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Errore nel log sincronizzazione:', error);
      }
    } catch (error) {
      console.error('Errore nel log sincronizzazione:', error);
    }
  }

  /**
   * Sincronizza tutti gli utenti da Firestore a Supabase
   */
  async syncAllUsers(): Promise<{
    success: boolean;
    stats: {
      total: number;
      success: number;
      error: number;
      duration: number;
    };
  }> {
    if (this.syncInProgress) {
      return {
        success: false,
        stats: { total: 0, success: 0, error: 0, duration: 0 }
      };
    }

    this.syncInProgress = true;
    this.lastSyncTime = new Date();
    const startTime = Date.now();
    
    const stats = {
      total: 0,
      success: 0,
      error: 0,
      duration: 0
    };

    try {
      // Ottieni tutti i profili da Firestore
      const profilesSnapshot = await getDocs(collection(firestore, 'profiles'));
      stats.total = profilesSnapshot.size;

      // Sincronizza ogni profilo
      for (const doc of profilesSnapshot.docs) {
        const profileData = doc.data();
        const uid = doc.id;

        try {
          // Crea un oggetto User fittizio per la sincronizzazione
          const mockUser: User = {
            uid,
            email: profileData.email || '',
            displayName: profileData.displayName || '',
            photoURL: profileData.photoURL || null,
            phoneNumber: profileData.phoneNumber || null,
            emailVerified: profileData.emailVerified || false,
            isAnonymous: false,
            metadata: {
              creationTime: profileData.createdAt || '',
              lastSignInTime: profileData.lastSignInTime || '',
              createdAt: profileData.createdAt || '',
              lastLoginAt: profileData.lastSignInTime || ''
            },
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => '',
            getIdTokenResult: async () => ({
              token: '',
              authTime: '',
              issuedAtTime: '',
              expirationTime: '',
              signInProvider: null,
              signInSecondFactor: null,
              claims: {}
            }),
            reload: async () => {},
            toJSON: () => ({}),
            providerId: '',
          };

          // Sincronizza l'utente
          const result = await this.syncUser(mockUser);
          if (result.success) {
            stats.success++;
          } else {
            stats.error++;
          }
        } catch (error) {
          console.error(`Errore nella sincronizzazione utente ${uid}:`, error);
          stats.error++;
        }
      }

      stats.duration = Date.now() - startTime;
      return { success: true, stats };
    } catch (error) {
      console.error('Errore nella sincronizzazione di tutti gli utenti:', error);
      stats.duration = Date.now() - startTime;
      return { success: false, stats };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Verifica se è in corso una sincronizzazione
   */
  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  /**
   * Ottiene il timestamp dell'ultima sincronizzazione
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Ottiene le statistiche di sincronizzazione
   */
  async getSyncStats(): Promise<SyncStats> {
    try {
      // Verifica che il client Supabase sia disponibile
      if (!supabase.rpc) {
        console.warn('Client Supabase non disponibile. Verifica le variabili d\'ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        return this.getFallbackStats();
      }

      // Usa la funzione RPC di Supabase per ottenere le statistiche
      const { data, error } = await supabase.rpc('get_sync_stats');

      if (error) {
        console.error('Errore nella chiamata RPC get_sync_stats:', error);
        // Se la funzione RPC non esiste, prova a calcolare le statistiche manualmente
        if (error.code === '42883') {
          console.warn('La funzione RPC get_sync_stats non esiste. Calcolo statistiche manualmente...');
          return this.calculateStatsManually();
        }
        throw error;
      }

      return data || this.getFallbackStats();
    } catch (error) {
      console.error('Errore nel recupero statistiche sincronizzazione:', error);
      return this.getFallbackStats();
    }
  }

  /**
   * Restituisce statistiche di fallback quando il sistema principale non è disponibile
   */
  private getFallbackStats(): SyncStats {
    return {
      totalUsers: 0,
      syncedUsers: 0,
      pendingUsers: 0,
      errorUsers: 0,
      lastSync: null
    };
  }

  /**
   * Calcola le statistiche manualmente quando la funzione RPC non è disponibile
   */
  private async calculateStatsManually(): Promise<SyncStats> {
    try {
      // Prova a ottenere i dati direttamente dalla tabella profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('sync_status, last_sync_at');

      if (error) {
        console.error('Errore nel recupero manuale delle statistiche:', error);
        return this.getFallbackStats();
      }

      const totalUsers = profiles?.length || 0;
      const syncedUsers = profiles?.filter(p => p.sync_status === 'synced').length || 0;
      const pendingUsers = profiles?.filter(p => p.sync_status === 'pending').length || 0;
      const errorUsers = profiles?.filter(p => p.sync_status === 'error').length || 0;
      const lastSync = profiles?.reduce((latest, profile) => {
        if (!profile.last_sync_at) return latest;
        if (!latest) return profile.last_sync_at;
        return new Date(profile.last_sync_at) > new Date(latest) ? profile.last_sync_at : latest;
      }, null as string | null);

      return {
        totalUsers,
        syncedUsers,
        pendingUsers,
        errorUsers,
        lastSync
      };
    } catch (error) {
      console.error('Errore nel calcolo manuale delle statistiche:', error);
      return this.getFallbackStats();
    }
  }
}

// Esporta un'istanza singleton
export const firebaseSupabaseSync = FirebaseSupabaseSync.getInstance();