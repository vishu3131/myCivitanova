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
import { authLogger } from '@/lib/authLogger';
import type { FirebaseError } from 'firebase/app';

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

// Mapper per errori Firebase/Supabase -> messaggi utente (IT)
function mapAuthError(err: unknown): string {
  const fallback = 'Si è verificato un errore. Riprova più tardi.';
  const e = err as Partial<FirebaseError> & { message?: string; code?: string };
  const code = (e && typeof e.code === 'string') ? e.code : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Email non valida.';
    case 'auth/user-disabled':
      return 'Questo account è stato disabilitato.';
    case 'auth/user-not-found':
      return 'Utente non trovato. Verifica l\'email o registrati.';
    case 'auth/wrong-password':
      return 'Password errata. Riprova.';
    case 'auth/too-many-requests':
      return 'Troppi tentativi. Attendi qualche minuto e riprova.';
    case 'auth/email-already-in-use':
      return 'Questa email è già in uso.';
    case 'auth/weak-password':
      return 'Password troppo debole (minimo 6 caratteri).';
    case 'auth/popup-closed-by-user':
      return 'Finestra di accesso chiusa prima del completamento.';
    case 'auth/cancelled-popup-request':
      return 'Richiesta di accesso annullata.';
    case 'auth/network-request-failed':
      return 'Problema di rete. Controlla la connessione e riprova.';
    case 'auth/popup-blocked':
      return 'Popup bloccato dal browser. Abilita i popup e riprova.';
    case 'auth/operation-not-allowed':
      return 'Operazione non consentita. Contatta il supporto.';
    case 'auth/requires-recent-login':
      return 'Per questa operazione è richiesto un login recente.';
    default:
      return e?.message || fallback;
  }
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
    const startTime = Date.now();
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      if (!firestore) throw new Error('Firestore not initialized');
      
      console.log(`👤 Registrazione nuovo utente: ${data.email}`);
      
      // 1. Validazione dati lato server
      const validationResult = this.validateRegistrationData(data);
      if (!validationResult.isValid) {
        await authLogger.logRegistration('', '', false, `Validazione fallita: ${validationResult.errors.join(', ')}`);
        return {
          success: false,
          error: `Dati non validi: ${validationResult.errors.join(', ')}`
        };
      }
      
      // 2. Crea utente in Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // 3. Aggiorna il profilo Firebase con il nome
      await updateProfile(firebaseUser, {
        displayName: data.fullName
      });
      
      // 4. Crea il profilo in Firestore con dati più completi
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
        registrationSource: 'web',
        registrationMetadata: {
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
          timestamp: serverTimestamp(),
          validationPassed: true
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(firestore, 'profiles', firebaseUser.uid), firebaseProfileData);
      
      // 5. Sincronizza con Supabase (server-side via API con service_role)
      try {
        const idToken = await firebaseUser.getIdToken();
        const syncResponse = await fetch('/api/sync/user', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
            'X-Sync-Trigger': 'registration'
          },
        });
        
        if (!syncResponse.ok) {
          console.warn('⚠️ Errore sincronizzazione durante registrazione');
        }
      } catch (syncApiErr) {
        console.warn('⚠️ Errore chiamata API di sincronizzazione server-side:', syncApiErr);
      }
      
      // 6. Ottieni il profilo sincronizzato da Supabase
      const supabaseProfile = await supabase.sync.getCurrentUserProfile();
      
      // 7. Invia email di verifica con retry
      try {
        await sendEmailVerification(firebaseUser);
        console.log('📧 Email di verifica inviata');
        
        // Log successful email verification send
        await authLogger.logEmailVerification(supabaseProfile?.id || '', firebaseUser.uid, true);
      } catch (emailError) {
        console.warn('⚠️ Errore invio email verifica:', emailError);
        await authLogger.logEmailVerification(supabaseProfile?.id || '', firebaseUser.uid, false, 
          emailError instanceof Error ? emailError.message : 'Errore invio email');
      }
      
      // 8. Log della registrazione successful
      await authLogger.logRegistration(
        supabaseProfile?.id || '',
        firebaseUser.uid,
        true,
        undefined,
        {
          registrationDuration: Date.now() - startTime,
          hasUsername: !!data.username,
          hasPhone: !!data.phone,
          source: 'web'
        }
      );
      
      console.log(`✅ Registrazione completata per ${data.email} in ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        user: supabaseProfile || undefined,
        firebaseUser
      };
      
    } catch (error) {
      console.error('❌ Errore registrazione:', error);
      
      // Log dell'errore
      await authLogger.logRegistration(
        '',
        '',
        false,
        error instanceof Error ? error.message : 'Errore sconosciuto',
        {
          registrationDuration: Date.now() - startTime,
          email: data.email
        }
      );
      
      return {
        success: false,
        error: mapAuthError(error)
      };
    }
  }

  /**
   * Effettua il login
   */
  async login(data: LoginData): Promise<AuthResult> {
    const startTime = Date.now();
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
      
      // 2. Sincronizzazione potenziata con retry
      let syncSuccess = false;
      const maxSyncAttempts = 3;
      
      for (let attempt = 1; attempt <= maxSyncAttempts; attempt++) {
        try {
          console.log(`🔄 Tentativo sincronizzazione ${attempt}/${maxSyncAttempts}`);
          const idToken = await firebaseUser.getIdToken();
          const syncResponse = await fetch('/api/sync/user', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json',
              'X-Sync-Trigger': 'login'
            },
          });
          
          if (syncResponse.ok) {
            const syncResult = await syncResponse.json();
            console.log(`✅ Sincronizzazione completata:`, syncResult);
            syncSuccess = true;
            break;
          } else {
            const errorText = await syncResponse.text();
            console.warn(`⚠️ Errore sincronizzazione (tentativo ${attempt}):`, errorText);
            
            if (attempt < maxSyncAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        } catch (syncApiErr) {
          console.warn(`⚠️ Errore chiamata API sincronizzazione (tentativo ${attempt}):`, syncApiErr);
          
          if (attempt < maxSyncAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      // 3. Ottieni il profilo da Supabase con retry
      let supabaseProfile = null;
      const maxProfileAttempts = 3;
      
      for (let attempt = 1; attempt <= maxProfileAttempts; attempt++) {
        try {
          console.log(`👤 Tentativo caricamento profilo ${attempt}/${maxProfileAttempts}`);
          supabaseProfile = await supabase.sync.getCurrentUserProfile();
          
          if (supabaseProfile) {
            console.log(`✅ Profilo caricato:`, supabaseProfile);
            break;
          } else {
            console.warn(`⚠️ Profilo non trovato (tentativo ${attempt})`);
            if (attempt < maxProfileAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
            }
          }
        } catch (profileErr) {
          console.warn(`⚠️ Errore caricamento profilo (tentativo ${attempt}):`, profileErr);
          if (attempt < maxProfileAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
          }
        }
      }
      
      if (!supabaseProfile) {
        console.error('❌ Impossibile caricare il profilo dopo tutti i tentativi');
        throw new Error('Profilo utente non trovato in Supabase');
      }
      
      // 4. Aggiorna ultimo accesso in Firestore
      try {
        const loginCount = (supabaseProfile as any).loginCount || 0;
        await updateDoc(doc(firestore!, 'profiles', firebaseUser.uid), {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          loginCount: loginCount + 1,
          lastLoginMetadata: {
            timestamp: serverTimestamp(),
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
            duration: Date.now() - startTime,
            syncSuccess
          }
        });
      } catch (updateError) {
        console.warn('⚠️ Errore aggiornamento ultimo accesso:', updateError);
      }
      
      // 5. Log del login successful
      await authLogger.logLogin(supabaseProfile.id, firebaseUser.uid, true);
      
      // 6. Trigger evento per aggiornamento componenti
      if (typeof window !== 'undefined' && syncSuccess) {
        console.log(`🎯 Trigger evento profile-sync-complete`);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('profile-sync-complete', { 
            detail: { 
              userId: supabaseProfile.id,
              loginTime: Date.now(),
              syncDuration: Date.now() - startTime
            } 
          }));
        }, 500);
      }
      
      console.log(`✅ Login completato per ${data.email} in ${Date.now() - startTime}ms`);
      
      return {
        success: true,
        user: supabaseProfile,
        firebaseUser
      };
      
    } catch (error) {
      console.error('❌ Errore login:', error);
      
      // Log dell'errore
      await authLogger.logLogin(
        '',
        '',
        false,
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      
      return {
        success: false,
        error: mapAuthError(error)
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
        error: mapAuthError(error),
      };
    }
  }

  /**
   * Effettua il logout
   */
  async logout(): Promise<AuthResult> {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized');
      const currentUser = auth.currentUser;
      const userInfo = currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email
      } : null;
      
      console.log('🚪 Logout utente...');
      
      // Log logout before actually logging out
      if (userInfo) {
        const supabaseProfile = await supabase.sync.getCurrentUserProfile();
        await authLogger.logLogout(supabaseProfile?.id || '', userInfo.uid);
      }
      
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
        error: mapAuthError(error)
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
        error: mapAuthError(error)
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
      
      // Log successful password reset request
      await authLogger.logPasswordReset(email, true);
      
      console.log('✅ Email reset password inviata');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Errore reset password:', error);
      
      // Log failed password reset request
      await authLogger.logPasswordReset(
        email,
        false,
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      
      return {
        success: false,
        error: mapAuthError(error)
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
        error: mapAuthError(error)
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
   * Valida i dati di registrazione
   */
  private validateRegistrationData(data: RegisterData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email non valida');
    }
    
    // Validazione password
    if (data.password.length < 8) {
      errors.push('Password deve contenere almeno 8 caratteri');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.push('Password deve contenere almeno una lettera minuscola, una maiuscola e un numero');
    }
    
    // Validazione nome
    if (data.fullName.length < 2 || data.fullName.length > 100) {
      errors.push('Nome completo deve essere tra 2 e 100 caratteri');
    }
    
    // Validazione username opzionale
    if (data.username) {
      if (data.username.length < 3 || data.username.length > 30) {
        errors.push('Username deve essere tra 3 e 30 caratteri');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push('Username può contenere solo lettere, numeri e underscore');
      }
    }
    
    // Validazione telefono opzionale
    if (data.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{8,15}$/;
      const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.push('Formato telefono non valido');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
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