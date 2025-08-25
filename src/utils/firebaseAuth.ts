import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from './firebaseClient';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  phone?: string;
  date_of_birth?: string;
  role?: 'user' | 'moderator' | 'admin' | 'staff' | 'guest';
  name?: string;
  surname?: string;
  created_at?: string;
  updated_at?: string;
}

// Wrapper per compatibilità con l'API Supabase
export class FirebaseAuthWrapper {
  
  // Simula supabase.auth.signInWithPassword con ottimizzazioni
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Verifica iniziale rapida
    if (!email || !password) {
      return {
        data: { user: null, session: null },
        error: { message: 'Email e password sono obbligatorie', code: 'auth/missing-credentials' }
      };
    }

    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      // Cache locale per evitare chiamate ripetute
      const cacheKey = `auth_${email}`;
      const cachedSession = localStorage.getItem(cacheKey);
      
      if (cachedSession) {
        const parsedSession = JSON.parse(cachedSession);
        if (Date.now() < parsedSession.expires_at) {
          return {
            data: {
              user: parsedSession.user,
              session: parsedSession
            },
            error: null
          };
        }
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = this.convertFirebaseUser(userCredential.user);
      const access_token = await userCredential.user.getIdToken();
      
      // Salva in cache con scadenza di 1 ora
      const sessionData = {
        user,
        access_token,
        expires_at: Date.now() + 3600000 // 1 ora
      };
      localStorage.setItem(cacheKey, JSON.stringify(sessionData));
      
      return {
        data: {
          user,
          session: {
            user,
            access_token
          }
        },
        error: null
      };
    } catch (error: any) {
      // Gestione errori migliorata
      let errorMessage = error.message;
      let errorCode = error.code;
      
      // Mappatura errori specifici
      if (errorCode === 'auth/wrong-password') {
        errorMessage = 'Password non valida';
      } else if (errorCode === 'auth/user-not-found') {
        errorMessage = 'Utente non trovato';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Troppi tentativi falliti. Riprova più tardi';
      }
      
      return {
        data: { user: null, session: null },
        error: { message: errorMessage, code: errorCode }
      };
    }
  }

  // Simula supabase.auth.signUp
  async signUp({ 
    email, 
    password, 
    options 
  }: { 
    email: string; 
    password: string; 
    options?: { data?: any } 
  }) {
    try {
      if (!auth || !db) {
        throw new Error('Firebase not initialized');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Aggiorna il profilo Firebase se fornito
      if (options?.data?.full_name) {
        await updateProfile(user, {
          displayName: options.data.full_name
        });
      }

      // Crea il profilo utente in Firestore
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email!,
        full_name: options?.data?.full_name || '',
        username: options?.data?.username || '',
        phone: options?.data?.phone || '',
        date_of_birth: options?.data?.date_of_birth || '',
        role: options?.data?.role || 'user',
        name: options?.data?.name || '',
        surname: options?.data?.surname || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'profiles', user.uid), userProfile);

      const convertedUser = this.convertFirebaseUser(user);
      
      return {
        data: {
          user: convertedUser,
          session: {
            user: convertedUser,
            access_token: await user.getIdToken(),
          }
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: { message: error.message, code: error.code }
      };
    }
  }

  // Simula supabase.auth.signOut con ottimizzazioni
  async signOut() {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      // Pulisci la cache locale
      if (auth.currentUser?.email) {
        localStorage.removeItem(`auth_${auth.currentUser.email}`);
      }
      
      await signOut(auth);
      
      // Pulisci eventuali dati sensibili
      ['currentUser', 'authSession'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      return { error: null };
    } catch (error: any) {
      // Log dell'errore per debug
      console.error('Logout error:', error);
      
      return { 
        error: { 
          message: 'Errore durante il logout. Riprova più tardi.', 
          code: error.code || 'auth/logout-failed'
        } 
      };
    }
  }

  // Simula supabase.auth.getSession
  async getSession() {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const user = auth.currentUser;
      if (user) {
        const convertedUser = this.convertFirebaseUser(user);
        return {
          data: {
            session: {
              user: convertedUser,
              access_token: await user.getIdToken(),
            }
          },
          error: null
        };
      }
      
      return {
        data: { session: null },
        error: null
      };
    } catch (error: any) {
      return {
        data: { session: null },
        error: { message: error.message, code: error.code }
      };
    }
  }

  // Simula supabase.auth.getUser
  async getUser() {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }
      
      const user = auth.currentUser;
      if (user) {
        return {
          data: { user: this.convertFirebaseUser(user) },
          error: null
        };
      }
      
      return {
        data: { user: null },
        error: null
      };
    } catch (error: any) {
      return {
        data: { user: null },
        error: { message: error.message, code: error.code }
      };
    }
  }

  // Simula supabase.auth.onAuthStateChange
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!auth) {
      console.warn('Firebase Auth not initialized');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const convertedUser = this.convertFirebaseUser(user);
        const session = {
          user: convertedUser,
          access_token: await user.getIdToken(),
        };
        callback('SIGNED_IN', session);
      } else {
        callback('SIGNED_OUT', null);
      }
    });

    return {
      data: {
        subscription: {
          unsubscribe
        }
      }
    };
  }

  // Converte un utente Firebase nel formato compatibile con Supabase
  private convertFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
      phoneNumber: firebaseUser.phoneNumber,
      photoURL: firebaseUser.photoURL,
    };
  }
}

// Wrapper per le operazioni Firestore (simula le query Supabase)
export class FirestoreWrapper {
  
  // Simula supabase.from('profiles')
  from(tableName: string) {
    return new FirestoreQueryBuilder(tableName);
  }
}

class FirestoreQueryBuilder {
  private tableName: string;
  private selectFields: string[] = [];
  private whereConditions: Array<{ field: string; operator: any; value: any }> = [];
  private limitCount?: number;
  private singleResult = false;
  // Added for ordering and pagination compatibility
  private orderField?: string;
  private orderAscending: boolean = true;
  private rangeStart?: number;
  private rangeEnd?: number;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string /*, _options?: any */) {
    if (fields === '*') {
      this.selectFields = [];
    } else {
      this.selectFields = fields.split(',').map(f => f.trim());
    }
    return this;
  }

  eq(field: string, value: any) {
    this.whereConditions.push({ field, operator: '==', value });
    return this;
  }

  // Supabase-like order(field, { ascending })
  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending !== false; // default true
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  // Supabase-like range(start, end)
  range(start: number, end: number) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  // Make the builder thenable so `await query` works like Supabase
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ) {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }

  // Simula supabase.from().insert()
  async insert(data: any) {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      if (Array.isArray(data)) {
        // Inserimento multiplo
        const results = [];
        for (const item of data) {
          const docRef = doc(collection(db, this.tableName));
          await setDoc(docRef, { ...item, id: docRef.id });
          results.push({ ...item, id: docRef.id });
        }
        return { data: results, error: null };
      } else {
        // Inserimento singolo
        const docRef = doc(collection(db, this.tableName));
        const dataWithId = { ...data, id: docRef.id };
        await setDoc(docRef, dataWithId);
        return { data: dataWithId, error: null };
      }
    } catch (error: any) {
      return { data: null, error: { message: error.message, code: error.code } };
    }
  }

  async execute() {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Costruisci la query
      let q = collection(db, this.tableName);
      
      if (this.whereConditions.length > 0) {
        const queryConstraints = this.whereConditions.map(cond => 
          where(cond.field, cond.operator, cond.value)
        );
        q = query(collection(db, this.tableName), ...queryConstraints) as any;
      }
      
      const querySnapshot = await getDocs(q);
      let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Applica ordinamento (in-memory) se richiesto
      if (this.orderField) {
        const field = this.orderField;
        const asc = this.orderAscending;
        data.sort((a: any, b: any) => {
          const va = a[field];
          const vb = b[field];
          // Prova a interpretare ISO date
          const da = typeof va === 'string' && /\d{4}-\d{2}-\d{2}T/.test(va) ? new Date(va).getTime() : va;
          const dbv = typeof vb === 'string' && /\d{4}-\d{2}-\d{2}T/.test(vb) ? new Date(vb).getTime() : vb;
          if (da < dbv) return asc ? -1 : 1;
          if (da > dbv) return asc ? 1 : -1;
          return 0;
        });
      }

      // Applica paginazione: range ha priorità su limit
      if (this.rangeStart !== undefined && this.rangeEnd !== undefined) {
        const start = Math.max(0, this.rangeStart);
        const count = Math.max(0, this.rangeEnd - this.rangeStart + 1);
        data = data.slice(start, start + count);
      } else if (this.limitCount) {
        data = data.slice(0, this.limitCount);
      }

      // Se è richiesto un singolo risultato
      if (this.singleResult) {
        if (data.length === 0) {
          return { data: null, error: null };
        }
        return { data: data[0], error: null };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message, code: error.code } };
    }
  }
}

// Istanze globali per compatibilità
export const firebaseAuth = new FirebaseAuthWrapper();
export const firestore = new FirestoreWrapper();

// Oggetto principale che simula il client Supabase
export const firebase = {
  auth: firebaseAuth,
  from: (tableName: string) => firestore.from(tableName),
  
  // Simula supabase.channel() per compatibilità realtime
  channel(channelName: string) {
    return {
      on(event: string, config: any, callback: Function) {
        // Per ora, ritorna un oggetto mock che non fa nulla
        // In futuro si può implementare con Firebase Realtime Database o Firestore listeners
        console.log(`Firebase realtime channel '${channelName}' not implemented yet`);
        return this;
      },
      subscribe() {
        // Ritorna un oggetto mock
        return {
          unsubscribe: () => console.log('Unsubscribed from Firebase realtime channel')
        };
      }
    };
  },
  
  // Simula supabase.removeChannel()
  removeChannel(channel: any) {
    // Per ora, non fa nulla
    console.log('Firebase removeChannel called');
  }
};