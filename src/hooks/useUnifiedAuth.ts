/**
 * MYCIVITANOVA - HOOK AUTENTICAZIONE UNIFICATO
 * 
 * Hook React per gestire l'autenticazione unificata con Firebase Auth
 * e Supabase Database, con sincronizzazione automatica.
 */

import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebaseClient';
import { unifiedAuthService, RegisterData, LoginData, ProfileUpdateData, AuthResult } from '../services/unifiedAuthService';
import { SyncedUserProfile } from '../utils/supabaseClient';

// Interfaccia per lo stato di autenticazione
export interface AuthState {
  // Stato caricamento
  isLoading: boolean;
  isInitialized: boolean;
  
  // Utenti
  firebaseUser: User | null;
  user: SyncedUserProfile | null;
  
  // Stato operazioni
  isAuthenticating: boolean;
  isUpdatingProfile: boolean;
  
  // Errori
  error: string | null;
  
  // Stato autenticazione
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

// Interfaccia per le azioni di autenticazione
export interface AuthActions {
  // Operazioni principali
  login: (data: LoginData) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<AuthResult>;
  
  // Gestione profilo
  updateProfile: (updates: ProfileUpdateData) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
  
  // Gestione password e verifica
  resetPassword: (email: string) => Promise<AuthResult>;
  resendVerificationEmail: () => Promise<AuthResult>;
  
  // Sincronizzazione
  forceSyncUser: () => Promise<boolean>;
  
  // Utility
  clearError: () => void;
  initialize: () => Promise<void>;
}

/**
 * Hook principale per l'autenticazione unificata
 */
export function useUnifiedAuth(): AuthState & AuthActions {
  // Stato del hook
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isInitialized: false,
    firebaseUser: null,
    user: null,
    isAuthenticating: false,
    isUpdatingProfile: false,
    error: null,
    isAuthenticated: false,
    isEmailVerified: false
  });

  /**
   * Aggiorna lo stato
   */
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Inizializza il servizio di autenticazione
   */
  const initialize = useCallback(async () => {
    try {
      await unifiedAuthService.initialize();
      updateState({ isInitialized: true });
    } catch (error) {
      console.error('Errore inizializzazione autenticazione:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Errore inizializzazione',
        isInitialized: false
      });
    }
  }, [updateState]);

  /**
   * Carica il profilo utente da Supabase
   */
  const loadUserProfile = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      updateState({
        user: null,
        isAuthenticated: false,
        isEmailVerified: false
      });
      return;
    }

    try {
      const profile = await unifiedAuthService.getCurrentUser();
      
      updateState({
        user: profile,
        isAuthenticated: true,
        isEmailVerified: firebaseUser.emailVerified,
        error: null
      });
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Errore caricamento profilo'
      });
    }
  }, [updateState]);

  /**
   * Effettua il login
   */
  const login = useCallback(async (data: LoginData): Promise<AuthResult> => {
    updateState({ isAuthenticating: true, error: null });
    
    try {
      const result = await unifiedAuthService.login(data);
      
      if (result.success && result.user) {
        updateState({
          user: result.user,
          isAuthenticated: true,
          isEmailVerified: result.firebaseUser?.emailVerified || false
        });
      } else {
        updateState({ error: result.error || 'Errore durante il login' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il login';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      updateState({ isAuthenticating: false });
    }
  }, [updateState]);

  /**
   * Effettua la registrazione
   */
  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    updateState({ isAuthenticating: true, error: null });
    
    try {
      const result = await unifiedAuthService.register(data);
      
      if (result.success && result.user) {
        updateState({
          user: result.user,
          isAuthenticated: true,
          isEmailVerified: result.firebaseUser?.emailVerified || false
        });
      } else {
        updateState({ error: result.error || 'Errore durante la registrazione' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante la registrazione';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      updateState({ isAuthenticating: false });
    }
  }, [updateState]);

  /**
   * Effettua il logout
   */
  const logout = useCallback(async (): Promise<AuthResult> => {
    updateState({ isAuthenticating: true, error: null });
    
    try {
      const result = await unifiedAuthService.logout();
      
      if (result.success) {
        updateState({
          firebaseUser: null,
          user: null,
          isAuthenticated: false,
          isEmailVerified: false
        });
      } else {
        updateState({ error: result.error || 'Errore durante il logout' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il logout';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      updateState({ isAuthenticating: false });
    }
  }, [updateState]);

  /**
   * Aggiorna il profilo utente
   */
  const updateProfile = useCallback(async (updates: ProfileUpdateData): Promise<AuthResult> => {
    updateState({ isUpdatingProfile: true, error: null });
    
    try {
      const result = await unifiedAuthService.updateProfile(updates);
      
      if (result.success && result.user) {
        updateState({ user: result.user });
      } else {
        updateState({ error: result.error || 'Errore durante l\'aggiornamento del profilo' });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'aggiornamento del profilo';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      updateState({ isUpdatingProfile: false });
    }
  }, [updateState]);

  /**
   * Ricarica il profilo utente
   */
  const refreshProfile = useCallback(async () => {
    if (!state.firebaseUser) return;
    
    try {
      await loadUserProfile(state.firebaseUser);
    } catch (error) {
      console.error('Errore refresh profilo:', error);
    }
  }, [state.firebaseUser, loadUserProfile]);

  /**
   * Invia email di reset password
   */
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    updateState({ error: null });
    
    try {
      return await unifiedAuthService.resetPassword(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il reset password';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [updateState]);

  /**
   * Reinvia email di verifica
   */
  const resendVerificationEmail = useCallback(async (): Promise<AuthResult> => {
    updateState({ error: null });
    
    try {
      return await unifiedAuthService.resendVerificationEmail();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il reinvio email';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [updateState]);

  /**
   * Forza la sincronizzazione dell'utente
   */
  const forceSyncUser = useCallback(async (): Promise<boolean> => {
    try {
      const success = await unifiedAuthService.forceSyncCurrentUser();
      
      if (success) {
        await refreshProfile();
      }
      
      return success;
    } catch (error) {
      console.error('Errore sincronizzazione forzata:', error);
      return false;
    }
  }, [refreshProfile]);

  /**
   * Pulisce gli errori
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Effetto per monitorare lo stato di autenticazione Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      updateState({ 
        firebaseUser,
        isLoading: false
      });
      
      // Carica il profilo se l'utente è autenticato
      await loadUserProfile(firebaseUser);
    });

    return unsubscribe;
  }, [loadUserProfile, updateState]);

  // Effetto per inizializzazione
  useEffect(() => {
    if (!state.isInitialized) {
      initialize();
    }
  }, [state.isInitialized, initialize]);

  return {
    // Stato
    ...state,
    
    // Azioni
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    resetPassword,
    resendVerificationEmail,
    forceSyncUser,
    clearError,
    initialize
  };
}

/**
 * Hook semplificato per ottenere solo lo stato di autenticazione
 */
export function useAuthState() {
  const { 
    isLoading, 
    isAuthenticated, 
    firebaseUser, 
    user, 
    isEmailVerified,
    error 
  } = useUnifiedAuth();

  return {
    isLoading,
    isAuthenticated,
    firebaseUser,
    user,
    isEmailVerified,
    error
  };
}

/**
 * Hook per ottenere solo le azioni di autenticazione
 */
export function useAuthActions() {
  const { 
    login, 
    register, 
    logout, 
    updateProfile, 
    resetPassword, 
    resendVerificationEmail,
    forceSyncUser,
    clearError 
  } = useUnifiedAuth();

  return {
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    resendVerificationEmail,
    forceSyncUser,
    clearError
  };
}

export default useUnifiedAuth;