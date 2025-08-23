import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function TestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Controlla se l'utente è già loggato
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Carica il profilo
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };
    
    checkUser();

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Carica il profilo quando l'utente si logga
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => setProfile(data));
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const testLogin = async () => {
    setLoading(true);
    setResult('Avvio test login...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setResult('❌ Errore login: ' + error.message);
        return;
      }

      setResult('✅ Login riuscito! Utente: ' + data.user.email);
      setUser(data.user);

      // Carica il profilo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        setResult(prev => prev + '\n⚠️ Profilo non trovato: ' + profileError.message);
      } else {
        setResult(prev => prev + '\n✅ Profilo caricato: ' + JSON.stringify(profileData, null, 2));
        setProfile(profileData);
      }
    } catch (err) {
      setResult('💥 Errore imprevisto: ' + (err as Error).message);
    }

    setLoading(false);
  };

  const testLogout = async () => {
    setLoading(true);
    setResult('Logout in corso...');

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setResult('❌ Errore logout: ' + error.message);
      } else {
        setResult('✅ Logout riuscito!');
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setResult('💥 Errore logout: ' + (err as Error).message);
    }

    setLoading(false);
  };

  const testSession = async () => {
    setLoading(true);
    setResult('Controllo sessione...');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult('❌ Errore sessione: ' + error.message);
      } else if (session) {
        setResult('✅ Sessione attiva: ' + JSON.stringify({
          user_id: session.user.id,
          email: session.user.email,
          expires_at: session.expires_at
        }, null, 2));
      } else {
        setResult('ℹ️ Nessuna sessione attiva');
      }
    } catch (err) {
      setResult('💥 Errore controllo sessione: ' + (err as Error).message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test Autenticazione Supabase</h1>
        
        {user ? (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Utente Loggato</h3>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Confermato:</strong> {user.email_confirmed_at ? 'Sì' : 'No'}</p>
            
            {profile && (
              <div className="mt-4">
                <h4 className="font-semibold">Profilo:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm mt-2">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </div>
            )}
            
            <button
              onClick={testLogout}
              disabled={loading}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Logout...' : 'Logout'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@civitanova.it"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="password"
              />
            </div>
            
            <button
              onClick={testLogin}
              disabled={loading || !email || !password}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Login...' : 'Test Login'}
            </button>
          </div>
        )}

        <div className="space-y-2 mb-6">
          <button
            onClick={testSession}
            disabled={loading}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Controllo...' : 'Controlla Sessione'}
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Risultati Test:</h3>
            <pre className="bg-gray-100 p-4 rounded-md text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}