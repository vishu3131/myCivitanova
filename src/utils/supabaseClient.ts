/**
 * MYCIVITANOVA - CLIENT SUPABASE UNIFICATO CON SINCRONIZZAZIONE
 * 
 * Client unificato che combina Firebase Auth e Supabase Database
 * con supporto per la sincronizzazione automatica dei profili utente.
 */

import { authClient } from './authClient';
import { firebase } from './firebaseAuth';
import { createClient } from '@supabase/supabase-js';
import { firebaseSupabaseSync } from '../services/firebaseSupabaseSync';
import { auth as firebaseAuthRaw } from './firebaseClient'; // Import Firebase auth directly and rename
import { Auth } from 'firebase/auth'; // Import Auth type

// Explicitly type the imported auth, handling potential null from firebaseClient.ts
const firebaseAuthInstance: Auth | null = firebaseAuthRaw as Auth | null;

// Configurazione Supabase diretta per operazioni di sincronizzazione
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let directSupabaseClient: any = null;

if (supabaseUrl && supabaseAnonKey) {
  directSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error('❌ Impossibile inizializzare Supabase client:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Impostato' : '❌ Mancante');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Impostato' : '❌ Mancante');
}

// Interfaccia per il profilo utente sincronizzato
export interface SyncedUserProfile {
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
  total_xp: number;
  current_level: number;
  level_progress: number;
  badges_count: number;
  badges_list: string[];
  created_at: string;
  updated_at: string;
  last_sync_at: string;
}

// Crea un client unificato che usa Firebase per auth e Supabase per database sincronizzato
export const supabase = {
  // Metodi di autenticazione da Firebase
  auth: authClient,
  
  // Metodi database: usa Supabase diretto se disponibile, altrimenti fallback a Firebase wrapper
  from: firebase.from.bind(firebase),
  
  // Client Supabase diretto per operazioni di sincronizzazione e funzionalità native Supabase
  direct: directSupabaseClient,
  
  // Espone rpc dal client Supabase diretto
  rpc: directSupabaseClient?.rpc?.bind(directSupabaseClient),

  // Espone storage dal client Supabase diretto
  storage: directSupabaseClient?.storage,

  // Espone channel dal client Supabase diretto
  channel: directSupabaseClient?.channel?.bind(directSupabaseClient),

  // Espone removeChannel dal client Supabase diretto
  removeChannel: directSupabaseClient?.removeChannel?.bind(directSupabaseClient),

  // Metodi per accedere ai dati sincronizzati
  sync: {
    /**
     * Ottiene il profilo utente corrente dal database sincronizzato
     */
    async getCurrentUserProfile(): Promise<SyncedUserProfile | null> {
      try {
        const { data: { session } } = await authClient.getSession();
        const currentUser = session?.user;

        if (!currentUser || !directSupabaseClient) {
          return null;
        }

        const { data, error } = await directSupabaseClient
          .from('profiles')
          .select('*')
          .eq('firebase_uid', currentUser.id) // Use currentUser.id from AuthUser
          .maybeSingle();

        if (error) {
          // Se l'errore è dovuto a nessuna riga trovata, ritorna semplicemente null senza rumore in console
          if ((error as any)?.code === 'PGRST116' || (error as any)?.details?.includes('Results contain 0 rows')) {
            return null;
          }
          console.error('Errore nel recupero profilo sincronizzato:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Errore nel recupero profilo utente:', error);
        return null;
      }
    },

    /**
     * Aggiorna il profilo utente corrente nel database sincronizzato
     */
    async updateCurrentUserProfile(updates: Partial<SyncedUserProfile>): Promise<boolean> {
      try {
        const { data: { session } } = await authClient.getSession();
        const currentUser = session?.user;

        if (!currentUser || !directSupabaseClient) {
          return false;
        }

        const { error } = await directSupabaseClient
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('firebase_uid', currentUser.id); // Use currentUser.id from AuthUser

        if (error) {
          console.error('Errore nell\'aggiornamento profilo:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Errore nell\'aggiornamento profilo utente:', error);
        return false;
      }
    },

    /**
     * Ottiene un profilo utente per Firebase UID
     */
    async getUserProfileByFirebaseUid(firebaseUid: string): Promise<SyncedUserProfile | null> {
      try {
        if (!directSupabaseClient) {
          return null;
        }

        const { data, error } = await directSupabaseClient
          .from('profiles')
          .select('*')
          .eq('firebase_uid', firebaseUid)
          .single();

        if (error) {
          console.error('Errore nel recupero profilo per UID:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Errore nel recupero profilo per Firebase UID:', error);
        return null;
      }
    },

    /**
     * Ottiene tutti i profili utente (solo per admin)
     */
    async getAllUserProfiles(limit = 50, offset = 0): Promise<SyncedUserProfile[]> {
      try {
        if (!directSupabaseClient) {
          return [];
        }

        const { data, error } = await directSupabaseClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Errore nel recupero di tutti i profili:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Errore nel recupero di tutti i profili utente:', error);
        return [];
      }
    },

    /**
     * Forza la sincronizzazione dell'utente corrente
     */
    async syncCurrentUser(): Promise<boolean> {
      try {
        // Get the actual Firebase User object from firebaseClient
        const firebaseUser = firebaseAuthInstance?.currentUser; // Use optional chaining

        if (!firebaseUser) {
          console.warn('Nessun utente Firebase autenticato per la sincronizzazione');
          return false;
        }

        console.log(`🔄 Sincronizzazione utente ${firebaseUser.uid} in corso...`);
        const result = await firebaseSupabaseSync.syncUser(firebaseUser);
        
        if (result.success) {
          console.log(`✅ Sincronizzazione completata con successo: ${result.syncType}`);
        } else {
          console.error(`❌ Errore nella sincronizzazione: ${result.error}`);
        }
        
        return result.success;
      } catch (error) {
        console.error('Errore nella sincronizzazione utente:', error);
        return false;
      }
    },

    /**
     * Ottiene le statistiche di sincronizzazione
     */
    async getStats() {
      return firebaseSupabaseSync.getSyncStats();
    }
  }
};

// Mantieni l'export per compatibilità
export default supabase;

// Export del client Supabase diretto per uso avanzato
export { directSupabaseClient };
