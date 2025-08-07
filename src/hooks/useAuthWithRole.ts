import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  [key: string]: any;
}

export type UserRole = 'user' | 'moderator' | 'admin' | 'staff' | 'guest';

export function useAuthWithRole() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;
    const getSessionAndRole = async () => {
      setLoading(true);
      
      // In modalità sviluppo, crea un utente admin fittizio se non c'è autenticazione
      if (process.env.NODE_ENV === 'development') {
        try {
          const testConn = await supabase.from('profiles').select('id').limit(1);
          if (testConn.error) {
            console.warn('Database Supabase non disponibile, usando utente admin di sviluppo');
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
          } else {
            console.log('Connessione al database Supabase riuscita.');
          }
        } catch (err) {
          console.warn('Database Supabase non disponibile, usando utente admin di sviluppo:', err);
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
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Adatta il tipo email per compatibilità
        const safeUser: AuthUser = {
          ...session.user,
          email: session.user.email || '',
        };
        setUser(safeUser);
        // Recupera il ruolo dal profilo
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error('Errore nel recupero del ruolo:', error.message);
            setRole('user'); // Default role if error
          } else {
            setRole(data?.role || 'user');
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
    subscription = supabase.auth.onAuthStateChange(() => {
      getSessionAndRole();
    });
    return () => {
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}
