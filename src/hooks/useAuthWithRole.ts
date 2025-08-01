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
      // Test di connessione: query dummy
      try {
        const testConn = await supabase.from('profiles').select('id').limit(1);
        if (testConn.error) {
          console.error('Errore di connessione al database Supabase:', testConn.error.message);
        } else {
          console.log('Connessione al database Supabase riuscita.');
        }
      } catch (err) {
        console.error('Errore imprevisto nella connessione Supabase:', err);
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
        setUser(null);
        setRole('guest');
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
