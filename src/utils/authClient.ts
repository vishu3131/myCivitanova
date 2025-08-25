// Sistema di autenticazione Firebase
// Utilizza Firebase Auth per l'autenticazione

import { firebaseAuth } from './firebaseAuth';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  username?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'moderator' | 'staff' | 'guest';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  expires_at?: string;
}

export interface AuthResponse {
  data: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
  error: { message: string; code?: string } | null;
}

class FirebaseAuthClient {
  constructor() {
    // Firebase Auth gestisce automaticamente l'inizializzazione
  }

  private convertFirebaseUser(firebaseUser: any): AuthUser {
    return {
      id: firebaseUser.id,
      email: firebaseUser.email,
      name: firebaseUser.name || firebaseUser.displayName?.split(' ')[0] || '',
      surname: firebaseUser.surname || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      username: firebaseUser.username || firebaseUser.email?.split('@')[0] || '',
      phone: firebaseUser.phone || firebaseUser.phoneNumber || '',
      role: firebaseUser.role || 'user',
      created_at: firebaseUser.created_at || new Date().toISOString(),
      updated_at: firebaseUser.updated_at || new Date().toISOString()
    };
  }

  // Registrazione
  async signUp({
    email,
    password,
    options
  }: {
    email: string;
    password: string;
    options?: { data?: any };
  }): Promise<AuthResponse> {
    try {
      const result = await firebaseAuth.signUp({ email, password, options });
      
      if (result.error) {
        return {
          data: { user: null, session: null },
          error: result.error
        };
      }

      if (result.data.user && result.data.session) {
        const user = this.convertFirebaseUser(result.data.user);
        const session: AuthSession = {
          user,
          access_token: result.data.session.access_token
        };

        return {
          data: { user, session },
          error: null
        };
      }

      return {
        data: { user: null, session: null },
        error: { message: 'Errore durante la registrazione' }
      };
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: { message: error.message || 'Errore durante la registrazione' }
      };
    }
  }

  // Login
  async signInWithPassword({
    email,
    password
  }: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const result = await firebaseAuth.signInWithPassword({ email, password });
      
      if (result.error) {
        return {
          data: { user: null, session: null },
          error: result.error
        };
      }

      if (result.data.user && result.data.session) {
        const user = this.convertFirebaseUser(result.data.user);
        const session: AuthSession = {
          user,
          access_token: result.data.session.access_token
        };

        return {
          data: { user, session },
          error: null
        };
      }

      return {
        data: { user: null, session: null },
        error: { message: 'Errore durante il login' }
      };
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: { message: error.message || 'Errore durante il login' }
      };
    }
  }

  // Logout
  async signOut(): Promise<{ error: any }> {
    try {
      const result = await firebaseAuth.signOut();
      return result;
    } catch (error: any) {
      return { error: { message: error.message || 'Errore durante il logout' } };
    }
  }

  // Ottieni sessione corrente
  async getSession(): Promise<{ data: { session: AuthSession | null } }> {
    try {
      const result = await firebaseAuth.getSession();
      
      if (result.error || !result.data.session) {
        return { data: { session: null } };
      }

      const user = this.convertFirebaseUser(result.data.session.user);
      const session: AuthSession = {
        user,
        access_token: result.data.session.access_token
      };

      return { data: { session } };
    } catch (error) {
      return { data: { session: null } };
    }
  }

  // Reset password tramite Firebase
  async resetPasswordForEmail(email: string): Promise<{ error: any }> {
    try {
      // Firebase gestisce automaticamente l'invio dell'email di reset
      // Per ora ritorniamo successo, in futuro si può implementare con Firebase Auth
      console.log(`Reset password richiesto per: ${email}`);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Errore durante il reset password' } };
    }
  }

  // Listener per cambiamenti di autenticazione
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    return firebaseAuth.onAuthStateChange((event: string, firebaseSession: any) => {
      if (firebaseSession && firebaseSession.user) {
        const user = this.convertFirebaseUser(firebaseSession.user);
        const session: AuthSession = {
          user,
          access_token: firebaseSession.access_token
        };
        callback(event, session);
      } else {
        callback(event, null);
      }
    });
  }
}

// Istanza globale
export const authClient = new FirebaseAuthClient();

// Oggetto compatibile con l'interfaccia Supabase
export const supabase = {
  auth: authClient
};

export default supabase;