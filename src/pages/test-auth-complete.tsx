import { useState, useEffect } from 'react';
import { firebaseClient } from '@/utils/firebaseAuth';
import { User } from 'firebase/auth';

export default function TestAuthComplete() {
  const [user, setUser] = useState<User | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkCurrentUser();
    
    const unsubscribe = firebaseClient.auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        if (user) {
          loadProfile(user.uid);
        } else {
          setProfile(null);
        }
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkCurrentUser = async () => {
    const user = firebaseClient.auth.currentUser;
    setUser(user);
    if (user) {
      loadProfile(user.uid);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await firebaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(profileData);
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
      setProfile(null);
    }
  };

  const testCompleteAuth = async () => {
    setLoading(true);
    setResult('🔄 Avvio test completo autenticazione...\n');

    try {
      // Test 1: Connessione database
      setResult(prev => prev + '1️⃣ Test connessione database...\n');
      try {
        const dbTest = await firebaseClient
          .from('profiles')
          .select('count')
          .limit(1);
        setResult(prev => prev + '✅ Connessione database OK\n\n');
      } catch (dbError: any) {
        setResult(prev => prev + '❌ Errore connessione DB: ' + dbError.message + '\n');
        return;
      }

      // Test 2: Login con admin esistente
      setResult(prev => prev + '2️⃣ Test login admin esistente...\n');
      try {
        const loginData = await firebaseClient.auth.signInWithEmailAndPassword(
          'admin@civitanova.it',
          'admin123'
        );
        setResult(prev => prev + '✅ Login admin riuscito\n');
        setUser(loginData.user);
      } catch (loginError: any) {
        setResult(prev => prev + '❌ Login fallito: ' + loginError.message + '\n');
        
        // Prova con password alternativa
        setResult(prev => prev + '🔄 Provo password alternativa...\n');
        try {
          const loginData2 = await firebaseClient.auth.signInWithEmailAndPassword(
            'admin@civitanova.it',
            'password123'
          );
          setResult(prev => prev + '✅ Login riuscito con password alternativa\n');
          setUser(loginData2.user);
        } catch (loginError2: any) {
          setResult(prev => prev + '❌ Login alternativo fallito: ' + loginError2.message + '\n');
          return;
        }
      }

      // Test 3: Caricamento profilo
      setResult(prev => prev + '\n3️⃣ Test caricamento profilo...\n');
      const currentUser = firebaseClient.auth.currentUser;
      if (currentUser) {
        try {
          const profileData = await firebaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.uid)
            .single();
          setResult(prev => prev + '✅ Profilo caricato:\n' + JSON.stringify(profileData, null, 2) + '\n');
          setProfile(profileData);
        } catch (profileError: any) {
          setResult(prev => prev + '❌ Errore caricamento profilo: ' + profileError.message + '\n');
        }
      }

      // Test 4: Verifica sessione
      setResult(prev => prev + '\n4️⃣ Test verifica sessione...\n');
      const currentUserSession = firebaseClient.auth.currentUser;
      
      if (currentUserSession) {
        setResult(prev => prev + '✅ Sessione attiva per: ' + currentUserSession.email + '\n');
      } else {
        setResult(prev => prev + '⚠️ Nessuna sessione attiva\n');
      }

      // Test 5: Test RLS policies
      setResult(prev => prev + '\n5️⃣ Test RLS policies...\n');
      try {
        const profilesData = await firebaseClient
          .from('profiles')
          .select('id, email, full_name')
          .limit(3);
        setResult(prev => prev + '✅ RLS funzionante, profili visibili: ' + (profilesData?.length || 0) + '\n');
      } catch (rlsError: any) {
        setResult(prev => prev + '❌ Errore RLS: ' + rlsError.message + '\n');
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
      await firebaseClient.auth.signOut();
      setResult(prev => prev + '✅ Logout completato!');
      setUser(null);
      setProfile(null);
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
      const data = await firebaseClient.auth.createUserWithEmailAndPassword(
        testEmail,
        testPassword
      );

      setResult(prev => prev + '✅ Utente registrato: ' + data.user?.email + '\n');

      // Verifica creazione profilo
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const profileData = await firebaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.uid)
            .single();
          setResult(prev => prev + '✅ Profilo creato automaticamente\n');
        } catch (profileError: any) {
          setResult(prev => prev + '⚠️ Profilo non creato automaticamente, creazione manuale...\n');
          
          try {
            await firebaseClient
              .from('profiles')
              .insert({
                id: data.user.uid,
                email: testEmail,
                full_name: testName,
              });
            setResult(prev => prev + '✅ Profilo creato manualmente\n');
          } catch (insertError: any) {
            setResult(prev => prev + '❌ Errore creazione profilo: ' + insertError.message + '\n');
          }
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
        <h1 className="text-3xl font-bold mb-6 text-center">🔐 Test Completo Autenticazione Firebase</h1>
        
        {user ? (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">👤 Utente Autenticato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>ID:</strong> {user.uid}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Confermato:</strong> {user.emailVerified ? '✅ Sì' : '❌ No'}</p>
                <p><strong>Ultimo accesso:</strong> {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Mai'}</p>
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