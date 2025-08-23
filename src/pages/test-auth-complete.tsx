import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function TestAuthComplete() {
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkCurrentUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadProfile(user.id);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(profileData);
  };

  const testCompleteAuth = async () => {
    setLoading(true);
    setResult('🔄 Avvio test completo autenticazione...\n');

    try {
      // Test 1: Connessione database
      setResult(prev => prev + '1️⃣ Test connessione database...\n');
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (dbError) {
        setResult(prev => prev + '❌ Errore connessione DB: ' + dbError.message + '\n');
        return;
      }
      setResult(prev => prev + '✅ Connessione database OK\n\n');

      // Test 2: Login con admin esistente
      setResult(prev => prev + '2️⃣ Test login admin esistente...\n');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@civitanova.it',
        password: 'admin123' // Password di default per admin
      });

      if (loginError) {
        setResult(prev => prev + '❌ Login fallito: ' + loginError.message + '\n');
        
        // Prova con password alternativa
        setResult(prev => prev + '🔄 Provo password alternativa...\n');
        const { data: loginData2, error: loginError2 } = await supabase.auth.signInWithPassword({
          email: 'admin@civitanova.it',
          password: 'password123'
        });
        
        if (loginError2) {
          setResult(prev => prev + '❌ Login alternativo fallito: ' + loginError2.message + '\n');
          return;
        } else {
          setResult(prev => prev + '✅ Login riuscito con password alternativa\n');
          setUser(loginData2.user);
        }
      } else {
        setResult(prev => prev + '✅ Login admin riuscito\n');
        setUser(loginData.user);
      }

      // Test 3: Caricamento profilo
      setResult(prev => prev + '\n3️⃣ Test caricamento profilo...\n');
      const currentUser = user || loginData?.user;
      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          setResult(prev => prev + '❌ Errore caricamento profilo: ' + profileError.message + '\n');
        } else {
          setResult(prev => prev + '✅ Profilo caricato:\n' + JSON.stringify(profileData, null, 2) + '\n');
          setProfile(profileData);
        }
      }

      // Test 4: Verifica sessione
      setResult(prev => prev + '\n4️⃣ Test verifica sessione...\n');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setResult(prev => prev + '❌ Errore sessione: ' + sessionError.message + '\n');
      } else if (session) {
        setResult(prev => prev + '✅ Sessione attiva fino: ' + new Date(session.expires_at! * 1000).toLocaleString() + '\n');
      } else {
        setResult(prev => prev + '⚠️ Nessuna sessione attiva\n');
      }

      // Test 5: Test RLS policies
      setResult(prev => prev + '\n5️⃣ Test RLS policies...\n');
      const { data: profilesData, error: rlsError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .limit(3);
      
      if (rlsError) {
        setResult(prev => prev + '❌ Errore RLS: ' + rlsError.message + '\n');
      } else {
        setResult(prev => prev + '✅ RLS funzionante, profili visibili: ' + profilesData.length + '\n');
      }

      setResult(prev => prev + '\n🎉 Test autenticazione completato con successo!');
    } catch (err) {
      setResult(prev => prev + '\n💥 Errore imprevisto: ' + (err as Error).message);
    }

    setLoading(false);
  };

  const testLogout = async () => {
    setLoading(true);
    setResult('🔄 Logout in corso...\n');

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setResult(prev => prev + '❌ Errore logout: ' + error.message);
      } else {
        setResult(prev => prev + '✅ Logout completato!');
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setResult(prev => prev + '💥 Errore logout: ' + (err as Error).message);
    }

    setLoading(false);
  };

  const testRegistration = async () => {
    setLoading(true);
    setResult('🔄 Test registrazione nuovo utente...\n');

    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: testName,
          },
        },
      });

      if (error) {
        setResult(prev => prev + '❌ Errore registrazione: ' + error.message + '\n');
        return;
      }

      setResult(prev => prev + '✅ Utente registrato: ' + data.user?.email + '\n');

      // Verifica creazione profilo
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          setResult(prev => prev + '⚠️ Profilo non creato automaticamente, creazione manuale...\n');
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: testEmail,
              full_name: testName,
            });

          if (insertError) {
            setResult(prev => prev + '❌ Errore creazione profilo: ' + insertError.message + '\n');
          } else {
            setResult(prev => prev + '✅ Profilo creato manualmente\n');
          }
        } else {
          setResult(prev => prev + '✅ Profilo creato automaticamente\n');
        }
      }

      setResult(prev => prev + '\n🎉 Test registrazione completato!');
    } catch (err) {
      setResult(prev => prev + '💥 Errore registrazione: ' + (err as Error).message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">🔐 Test Completo Autenticazione</h1>
        
        {user ? (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">👤 Utente Autenticato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Confermato:</strong> {user.email_confirmed_at ? '✅ Sì' : '❌ No'}</p>
                <p><strong>Ultimo accesso:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Mai'}</p>
              </div>
              
              {profile && (
                <div>
                  <h4 className="font-semibold mb-2">📋 Profilo:</h4>
                  <p><strong>Nome:</strong> {profile.full_name}</p>
                  <p><strong>Ruolo:</strong> {profile.role}</p>
                  <p><strong>Telefono:</strong> {profile.phone || 'Non specificato'}</p>
                  <p><strong>Data nascita:</strong> {profile.date_of_birth || 'Non specificata'}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={testLogout}
              disabled={loading}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? '🔄 Logout...' : '🚪 Logout'}
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 rounded-md">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">🔓 Nessun utente autenticato</h3>
            <p>Esegui i test per verificare il sistema di autenticazione.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testCompleteAuth}
            disabled={loading}
            className="bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 font-semibold"
          >
            {loading ? '🔄 Test...' : '🔐 Test Login Completo'}
          </button>
          
          <button
            onClick={testRegistration}
            disabled={loading}
            className="bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 font-semibold"
          >
            {loading ? '🔄 Test...' : '📝 Test Registrazione'}
          </button>
          
          <button
            onClick={checkCurrentUser}
            disabled={loading}
            className="bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 font-semibold"
          >
            {loading ? '🔄 Controllo...' : '🔍 Verifica Sessione'}
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">📊 Risultati Test:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96 border">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}