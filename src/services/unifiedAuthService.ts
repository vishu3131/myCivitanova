/**
 * MYCIVITANOVA - SERVIZIO AUTENTICAZIONE UNIFICATO
 * 
 * Servizio che utilizza Firebase per l'autenticazione e Supabase come database principale
 * per i profili utente, con sincronizzazione automatica e gestione unificata.
 */

import { User, UserCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db as firestore } from '../utils/firebaseClient';
import { supabase, SyncedUserProfile } from '../utils/supabaseClient';
import { firebaseSupabaseSync } from './firebaseSupabaseSync';
import { realtimeSyncTriggers } from './realtimeSyncTriggers';

// Interfaccia per i dati di registrazione
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  username?: string;
  phone?: string;
}

// Interfaccia per i dati di login
export interface LoginData {
  email: string;
  password: string;
}

// Interfaccia per l'aggiornamento del profilo
export interface ProfileUpdateData {
  fullName?: string;
  username?: string;
  phone?: string;
  avatarUrl?: string;
}

// Interfaccia per il risultato delle operazioni
export interface AuthResult {
  success: boolean;
  user?: SyncedUserProfile;
  firebaseUser?: User;
  error?: string;
}

class UnifiedAuthService {
  private static instance: UnifiedAuthService;
  private isInitialized = false;

  static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }

  /**
   * Inizializza il servizio di autenticazione
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Inizializzazione servizio autenticazione unificato...');
      
      // Inizializza i trigger di sincronizzazione
      realtimeSyncTriggers.initialize({
        enableAuthSync: true,
        enableProfileSync: true,
        enableBatchSync: false,
        debounceDelay: 1000,
        maxRetries: 3,
        retryDelay: 2000
      });
      
      this.isInitialized = true;
      console.log('✅ Servizio autenticazione unificato inizializzato');
    } catch (error) {
      console.error('❌ Errore inizializzazione servizio autenticazione:', error);
      throw error;
    }
  }

  /**
   * Registra un nuovo utente
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      if (!firestore) throw new Error('Firestore not initialized');
      console.log(`👤 Registrazione nuovo utente: ${data.email}`);
      
      // 1. Crea utente in Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // 2. Aggiorna il profilo Firebase con il nome
      await updateProfile(firebaseUser, {
        displayName: data.fullName
      });
      
      // 3. Crea il profilo in Firestore
      const firebaseProfileData = {
        email: data.email,
        fullName: data.fullName,
        username: data.username || '',
        phone: data.phone || '',
        role: 'user',
        isActive: true,
        isVerified: false,
        totalXp: 0,
        currentLevel: 1,
        levelProgress: 0,
        badgesCount: 0,
        badgesList: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(firestore, 'profiles', firebaseUser.uid), firebaseProfileData);
      
      // 4. Sincronizza con Supabase (server-side via API con service_role)
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetch('/api/sync/user', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
      } catch (syncApiErr) {
        console.warn('⚠️ Errore chiamata API di sincronizzazione server-side:', syncApiErr);
      }
      
      // 5. Ottieni il profilo sincronizzato da Supabase
      const supabaseProfile = await supabase.sync.getCurrentUserProfile();
      
      // 6. Invia email di verifica
      try {
        await sendEmailVerification(firebaseUser);
        console.log('📧 Email di verifica inviata');
      } catch (emailError) {
        console.warn('⚠️ Errore invio email verifica:', emailError);
      }
      
      console.log(`✅ Registrazione completata per ${data.email}`);
      
      return {
        success: true,
        user: supabaseProfile || undefined,
        firebaseUser
      };
      
    } catch (error) {
      console.error('❌ Errore registrazione:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante la registrazione'
      };
    }
  }

  /**
   * Effettua il login
   */
  async login(data: LoginData): Promise<AuthResult> {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      if (!firestore) console.warn('Firestore not initialized; profile update will be skipped');
      console.log(`🔐 Login utente: ${data.email}`);
      
      // 1. Autentica con Firebase
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // 2. Verifica e sincronizza il profilo (server-side via API con service_role)
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetch('/api/sync/user', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
      } catch (syncApiErr) {
        console.warn('⚠️ Errore chiamata API di sincronizzazione server-side:', syncApiErr);
      }
      
      // 3. Ottieni il profilo da Supabase
      const supabaseProfile = await supabase.sync.getCurrentUserProfile();
      
      if (!supabaseProfile) {
        throw new Error('Profilo utente non trovato in Supabase');
      }
      
      // 4. Aggiorna ultimo accesso in Firestore
      try {
  await updateDoc(doc(firestore!, 'profiles', firebaseUser.uid), {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (updateError) {
        console.warn('⚠️ Errore aggiornamento ultimo accesso:', updateError);
      }
      
      console.log(`✅ Login completato per ${data.email}`);
      
      return {
        success: true,
        user: supabaseProfile,
        firebaseUser
      };
      
    } catch (error) {
      console.error('❌ Errore login:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il login'
      };
    }
  }

  /**
   * Effettua il login con Google
   */
  async loginWithGoogle(): Promise<AuthResult> {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      if (!firestore) throw new Error('Firestore not initialized');
      console.log('🚀 Tentativo di login con Google...');

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      console.log(`✅ Login con Google riuscito per ${firebaseUser.email}`);

      // Controlla se l'utente esiste già in Firestore
      const userDocRef = doc(firestore, 'profiles', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Utente nuovo, crea profilo
        console.log(`✨ Utente nuovo da Google. Creazione profilo per ${firebaseUser.email}`);
        const firebaseProfileData = {
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          username: firebaseUser.email?.split('@')[0] || '',
          phone: firebaseUser.phoneNumber || '',
          avatarUrl: firebaseUser.photoURL || '',
          role: 'user',
          isActive: true,
          isVerified: firebaseUser.emailVerified,
          totalXp: 0,
          currentLevel: 1,
          levelProgress: 0,
          badgesCount: 0,
          badgesList: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };
        await setDoc(userDocRef, firebaseProfileData);
      } else {
        // Utente esistente, aggiorna l'ultimo login
        console.log(`👋 Bentornato ${firebaseUser.email}. Aggiorno ultimo accesso.`);
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Potremmo voler aggiornare anche avatar e nome se cambiati su Google
          avatarUrl: firebaseUser.photoURL || userDoc.data().avatarUrl,
          fullName: firebaseUser.displayName || userDoc.data().fullName,
        });
      }
      
      // Sincronizza con Supabase (server-side via API con service_role)
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetch('/api/sync/user', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
      } catch (syncApiErr) {
        console.warn('⚠️ Errore chiamata API di sincronizzazione server-side:', syncApiErr);
      }

      const supabaseProfile = await supabase.sync.getCurrentUserProfile();

      return {
        success: true,
        user: supabaseProfile || undefined,
        firebaseUser,
      };

    } catch (error) {
      console.error('❌ Errore login con Google:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il login con Google',
      };
    }
  }

  /**
   * Effettua il logout
   */
  async logout(): Promise<AuthResult> {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      console.log('🚪 Logout utente...');
      
      // Pulisci i trigger di sincronizzazione
      realtimeSyncTriggers.cleanup();
      
      // Effettua logout da Firebase
      await signOut(auth);
      
      console.log('✅ Logout completato');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Errore logout:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il logout'
      };
    }
  }

  /**
   * Aggiorna il profilo utente
   */
  async updateProfile(updates: ProfileUpdateData): Promise<AuthResult> {
    try {
  if (!auth) throw new Error('Firebase Auth not initialized');
  if (!firestore) throw new Error('Firestore not initialized');
  const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Nessun utente autenticato');
      }
      
      console.log(`📝 Aggiornamento profilo per ${currentUser.email}`);
      
      // 1. Aggiorna Firebase Auth se necessario
      if (updates.fullName) {
        await updateProfile(currentUser, {
          displayName: updates.fullName
        });
      }
      
      // 2. Prepara i dati per Firestore
      const firestoreUpdates: any = {
        updatedAt: serverTimestamp()
      };
      
      if (updates.fullName) firestoreUpdates.fullName = updates.fullName;
      if (updates.username) firestoreUpdates.username = updates.username;
      if (updates.phone) firestoreUpdates.phone = updates.phone;
      if (updates.avatarUrl) firestoreUpdates.avatarUrl = updates.avatarUrl;
      
      // 3. Aggiorna Firestore
      await updateDoc(doc(firestore, 'profiles', currentUser.uid), firestoreUpdates);
      
      // 4. Sincronizza con Supabase
      const syncResult = await firebaseSupabaseSync.syncUser(currentUser);
      
      if (!syncResult.success) {
        console.warn('⚠️ Sincronizzazione fallita durante aggiornamento profilo:', syncResult.error);
      }
      
      // 5. Ottieni il profilo aggiornato
      const updatedProfile = await supabase.sync.getCurrentUserProfile();
      
      console.log('✅ Profilo aggiornato con successo');
      
      return {
        success: true,
        user: updatedProfile || undefined,
        firebaseUser: currentUser
      };
      
    } catch (error) {
      console.error('❌ Errore aggiornamento profilo:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante l\'aggiornamento del profilo'
      };
    }
  }

  /**
   * Invia email di reset password
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
  console.log(`📧 Invio email reset password per: ${email}`);
  if (!auth) throw new Error('Firebase Auth not initialized');
  await sendPasswordResetEmail(auth, email);
      
      console.log('✅ Email reset password inviata');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Errore reset password:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante l\'invio dell\'email di reset'
      };
    }
  }

  /**
   * Reinvia email di verifica
   */
  async resendVerificationEmail(): Promise<AuthResult> {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Nessun utente autenticato');
      }
      
      console.log(`📧 Reinvio email verifica per: ${currentUser.email}`);
      
      await sendEmailVerification(currentUser);
      
      console.log('✅ Email verifica reinviata');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Errore reinvio email verifica:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante il reinvio dell\'email di verifica'
      };
    }
  }

  /**
   * Ottiene il profilo utente corrente da Supabase
   */
  async getCurrentUser(): Promise<SyncedUserProfile | null> {
    try {
      return await supabase.sync.getCurrentUserProfile();
    } catch (error) {
      console.error('❌ Errore recupero profilo corrente:', error);
      return null;
    }
  }

  /**
   * Verifica se l'utente è autenticato
   */
  isAuthenticated(): boolean {
  if (!auth) return false;
  return !!auth.currentUser;
  }

  /**
   * Ottiene l'utente Firebase corrente
   */
  getCurrentFirebaseUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
  }

  /**
   * Forza la sincronizzazione dell'utente corrente
   */
  async forceSyncCurrentUser(): Promise<boolean> {
    try {
  if (!auth) throw new Error('Firebase Auth not initialized');
  const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('Nessun utente autenticato per la sincronizzazione');
        return false;
      }
      
      const result = await firebaseSupabaseSync.syncUser(currentUser);
      return result.success;
    } catch (error) {
      console.error('❌ Errore sincronizzazione forzata:', error);
      return false;
    }
  }

  /**
   * Pulisce il servizio
   */
  cleanup(): void {
    console.log('🧹 Pulizia servizio autenticazione unificato...');
    
    realtimeSyncTriggers.cleanup();
    this.isInitialized = false;
    
    console.log('✅ Servizio autenticazione pulito');
  }
}

// Esporta l'istanza singleton
export const unifiedAuthService = UnifiedAuthService.getInstance();
export default unifiedAuthService;