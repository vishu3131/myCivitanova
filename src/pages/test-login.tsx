import { useState, useEffect } from 'react';
import { firebaseClient } from '@/utils/firebaseAuth';
import { User } from 'firebase/auth';

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
      const user = firebaseClient.auth.currentUser;
      setUser(user);
      
      if (user) {
        // Carica il profilo Firebase
        const profileData = await firebaseClient.from('profiles').select('*').eq('id', user.uid).single();
        setProfile(profileData);
      }
    };
    
    checkUser();

    // Ascolta i cambiamenti di autenticazione Firebase
    const unsubscribe = firebaseClient.auth.onAuthStateChanged(
      (user) => {
        setUser(user);
        if (user) {
          // Carica il profilo quando l'utente si logga
          firebaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.uid)
            .single()
            .then((data) => setProfile(data));
        } else {
          setProfile(null);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const testLogin = async () => {
    setLoading(true);
    setResult('Avvio test login...');

    try {
      const userCredential = await firebaseClient.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      setResult('✅ Login riuscito! Utente: ' + user.email);
      setUser(user);

      // Carica il profilo Firebase
      try {
        const profileData = await firebaseClient.from('profiles').select('*').eq('id', user.uid).single();
        setResult(prev => prev + '\n✅ Profilo caricato: ' + JSON.stringify(profileData, null, 2));
        setProfile(profileData);
      } catch (profileError) {
        setResult(prev => prev + '\n⚠️ Profilo non trovato: ' + (profileError as Error).message);
      }
    } catch (err) {
      setResult('💥 Errore login: ' + (err as Error).message);
    }

    setLoading(false);
  };

  const testLogout = async () => {
    setLoading(true);
    setResult('Logout in corso...');

    try {
      await firebaseClient.auth.signOut();
      setResult('✅ Logout riuscito!');
      setUser(null);
      setProfile(null);
    } catch (err) {
      setResult('💥 Errore logout: ' + (err as Error).message);
    }

    setLoading(false);
  };

  const testSession = async () => {
    setLoading(true);
    setResult('Controllo sessione...');

    try {
      const user = firebaseClient.auth.currentUser;
      
      if (user) {
        setResult('✅ Sessione attiva: ' + JSON.stringify({
          user_id: user.uid,
          email: user.email,
          email_verified: user.emailVerified
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
        <h1 className="text-2xl font-bold mb-6">Test Autenticazione Firebase</h1>
        
        {user ? (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-md">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Utente Loggato</h3>
            <p><strong>ID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Confermato:</strong> {user.emailVerified ? 'Sì' : 'No'}</p>
            
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