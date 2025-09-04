import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Ora utilizza Firebase tramite il wrapper

export interface AuthUser {
  id: string;
  email: string;
  [key: string]: any;
}

export type UserRole = 'user' | 'moderator' | 'admin' | 'staff' | 'guest';

export function useAuthWithRole(allowedRoles?: UserRole | UserRole[]) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  // Helper per verificare i ruoli
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(role);
    },
    [role]
  );

  // Comodo flag di autorizzazione in base ai ruoli richiesti (se forniti)
  const isAuthorized = useMemo(() => {
    if (!allowedRoles) return true;
    return hasRole(allowedRoles);
  }, [allowedRoles, hasRole]);

  useEffect(() => {
    let subscription: any;
    const getSessionAndRole = async () => {
      setLoading(true);
      
      // In modalità sviluppo, crea un utente admin fittizio se non c'è autenticazione
      if (process.env.NODE_ENV === 'development') {
        try {
          const testConn = await supabase.from('profiles').select('id').limit(1);
          if (testConn.error) {
            console.warn('Database Firebase non disponibile, usando utente admin di sviluppo');
            // Crea un utente admin fittizio per lo sviluppo
            const devUser: AuthUser = {
              id: 'dev-admin-123',
              email: 'admin@civitanova.dev',
              name: 'Admin Sviluppo'
            };
            setUser(devUser);
            setRole('admin');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Errore connessione database, usando utente admin di sviluppo');
          const devUser: AuthUser = {
            id: 'dev-admin-123',
            email: 'admin@civitanova.dev',
            name: 'Admin Sviluppo'
          };
          setUser(devUser);
          setRole('admin');
          setLoading(false);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Adatta il tipo email per compatibilità
        const safeUser: AuthUser = {
          ...session.user,
          email: session.user.email || '',
        };
        setUser(safeUser);
        // Recupera il ruolo dal profilo Firebase
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('firebase_uid', session.user.id);
            
          if (error) {
            console.error('Errore nel recupero del ruolo:', error.message);
            setRole('user'); // Default role if error
          } else {
            // data è ora un array, prendiamo il primo elemento
            const profile = Array.isArray(data) && data.length > 0 ? data[0] : null;
            setRole(profile?.role || 'user');
          }
        } catch (err) {
          console.error('Errore imprevisto nel recupero del ruolo:', err);
          setRole('user');
        }
      } else {
        // Se non c'è sessione e siamo in sviluppo, usa l'utente admin fittizio
        if (process.env.NODE_ENV === 'development') {
          const devUser: AuthUser = {
            id: 'dev-admin-123',
            email: 'admin@civitanova.dev',
            name: 'Admin Sviluppo'
          };
          setUser(devUser);
          setRole('admin');
        } else {
          setUser(null);
          setRole('guest');
        }
      }
      setLoading(false);
    };
    
    getSessionAndRole();
    
    // Ascolta i cambiamenti di autenticazione Firebase
    subscription = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      getSessionAndRole();
    });
    
    return () => {
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  return { user, role, loading, hasRole, isAuthorized };
}
