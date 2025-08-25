/**
 * MYCIVITANOVA - SERVIZIO SINCRONIZZAZIONE FIREBASE -> SUPABASE
 * 
 * Questo servizio gestisce la sincronizzazione automatica dei dati utente
 * da Firebase Auth/Firestore verso il database Supabase.
 */

import { User } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db as firestore } from '../utils/firebaseClient';
import { supabase } from '../utils/supabaseClient.ts';
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

      return data;
    } catch (error) {
      console.error('Errore nel recupero profilo Supabase:', error);
      return null;
    }
  }

  /**
   * Crea un nuovo profilo in Supabase
   */
  private async createSupabaseProfile(firebaseProfile: FirebaseProfile): Promise<SyncResult> {
    try {
      const profileData = {
        firebase_uid: firebaseProfile.uid,
        email: firebaseProfile.email,
        full_name: firebaseProfile.displayName || null,
        phone: firebaseProfile.phoneNumber || null,
        avatar_url: firebaseProfile.photoURL || null,
        is_verified: firebaseProfile.emailVerified,
        firebase_created_at: firebaseProfile.metadata.creationTime || null,
        firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime || null,
        sync_status: 'synced' as const,
        last_sync_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .direct
        .from('profiles')
        .insert(profileData)
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        profileId: data.id,
        syncType: 'create',
        duration: 0 // Calcolato dal chiamante
      };
    } catch (error) {
      let errorMessage;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object") {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      throw new Error(`Errore creazione profilo: ${errorMessage}`);
    }
  }

  /**
   * Aggiorna un profilo esistente in Supabase
   */
  private async updateSupabaseProfile(
    firebaseProfile: FirebaseProfile, 
    existingProfile: SupabaseProfile
  ): Promise<SyncResult> {
    try {
      // Controlla se ci sono cambiamenti
      const hasChanges = 
        existingProfile.email !== firebaseProfile.email ||
        existingProfile.full_name !== firebaseProfile.displayName ||
        existingProfile.phone !== firebaseProfile.phoneNumber ||
        existingProfile.avatar_url !== firebaseProfile.photoURL ||
        existingProfile.is_verified !== firebaseProfile.emailVerified;

      if (!hasChanges) {
        // Aggiorna solo il timestamp di sincronizzazione
        await supabase
          .direct
          .from('profiles')
          .update({ 
            last_sync_at: new Date().toISOString(),
            firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime || null
          })
          .eq('firebase_uid', firebaseProfile.uid);

        return {
          success: true,
          profileId: existingProfile.id,
          syncType: 'update',
          duration: 0
        };
      }

      // Aggiorna i dati modificati
      const updateData = {
        email: firebaseProfile.email,
        full_name: firebaseProfile.displayName || null,
        phone: firebaseProfile.phoneNumber || null,
        avatar_url: firebaseProfile.photoURL || null,
        is_verified: firebaseProfile.emailVerified,
        firebase_last_sign_in: firebaseProfile.metadata.lastSignInTime || null,
        sync_status: 'synced' as const,
        last_sync_at: new Date().toISOString()
      };

      const { error } = await supabase
        .direct
        .from('profiles')
        .update(updateData)
        .eq('firebase_uid', firebaseProfile.uid);

      if (error) throw error;

      return {
        success: true,
        profileId: existingProfile.id,
        syncType: 'update',
        duration: 0
      };
    } catch (error) {
      throw new Error(`Errore aggiornamento profilo: ${error}`);
    }
  }

  /**
   * Aggiorna il mapping Firebase UID -> Supabase UUID
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
        });

      if (error) throw error;
    } catch (error) {
      console.error('Errore aggiornamento mapping:', error);
    }
  }

  /**
   * Registra l'operazione di sincronizzazione
   */
  private async logSync(logData: {
    firebase_uid: string;
    profile_id?: string;
    sync_type: 'create' | 'update' | 'delete';
    sync_status: 'success' | 'error' | 'pending';
    firebase_data?: any;
    supabase_data?: any;
    error_message?: string;
    sync_duration_ms: number;
  }): Promise<void> {
    try {
      await supabase
        .direct
        .from('sync_logs')
        .insert(logData);
    } catch (error) {
      console.error('Errore nel logging della sincronizzazione:', error);
    }
  }

  /**
   * Ottiene le statistiche di sincronizzazione
   */
  async getSyncStats(): Promise<SyncStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_sync_stats');

      if (error) throw error;

      return {
        totalUsers: parseInt(data[0]?.total_users || '0'),
        syncedUsers: parseInt(data[0]?.synced_users || '0'),
        pendingUsers: parseInt(data[0]?.pending_users || '0'),
        errorUsers: parseInt(data[0]?.error_users || '0'),
        lastSync: data[0]?.last_sync || null
      };
    } catch (error) {
      console.error('Errore nel recupero statistiche:', error);
      return {
        totalUsers: 0,
        syncedUsers: 0,
        pendingUsers: 0,
        errorUsers: 0,
        lastSync: null
      };
    }
  }

  /**
   * Sincronizza tutti gli utenti (per operazioni batch)
   */
  async syncAllUsers(): Promise<{ success: number; errors: number; total: number }> {
    if (this.syncInProgress) {
      throw new Error('Sincronizzazione già in corso');
    }

    this.syncInProgress = true;
    let success = 0;
    let errors = 0;
    let total = 0;

    try {
      console.log('🔄 Inizio sincronizzazione batch di tutti gli utenti');
      
      // Ottieni tutti i profili da Firestore
      const profilesQuery = query(collection(firestore, 'profiles'));
      const profilesSnapshot = await getDocs(profilesQuery);
      
      total = profilesSnapshot.size;
      console.log(`📊 Trovati ${total} profili da sincronizzare`);

      for (const profileDoc of profilesSnapshot.docs) {
        try {
          const profileData = profileDoc.data();
          const mockUser = {
            uid: profileDoc.id,
            email: profileData.email || '',
            displayName: profileData.displayName,
            photoURL: profileData.photoURL,
            phoneNumber: profileData.phoneNumber,
            emailVerified: profileData.emailVerified || false,
            metadata: {
              creationTime: profileData.createdAt,
              lastSignInTime: profileData.lastSignInTime
            }
          } as User;

          const result = await this.syncUser(mockUser);
          if (result.success) {
            success++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error(`Errore sincronizzazione ${profileDoc.id}:`, error);
          errors++;
        }
      }

      this.lastSyncTime = new Date();
      console.log(`✅ Sincronizzazione batch completata: ${success} successi, ${errors} errori`);
      
      return { success, errors, total };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Verifica se la sincronizzazione è in corso
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
}

// Esporta l'istanza singleton
export const firebaseSupabaseSync = FirebaseSupabaseSync.getInstance();
export default firebaseSupabaseSync;