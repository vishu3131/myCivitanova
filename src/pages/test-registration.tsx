import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function TestRegistration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult('Avvio test registrazione...');

    try {
      // Test 1: Verifica connessione Supabase
      setResult(prev => prev + '\n1. Test connessione Supabase...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        setResult(prev => prev + '\n❌ Errore connessione: ' + testError.message);
        return;
      }
      setResult(prev => prev + '\n✅ Connessione Supabase OK');

      // Test 2: Registrazione utente
      if (email && password && fullName) {
        setResult(prev => prev + '\n2. Test registrazione utente...');
        
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setResult(prev => prev + '\n❌ Errore registrazione: ' + error.message);
          return;
        }

        setResult(prev => prev + '\n✅ Utente creato: ' + data.user?.id);

        // Test 3: Verifica creazione profilo
        if (data.user) {
          setResult(prev => prev + '\n3. Verifica creazione profilo...');
          
          // Attendi un momento per il trigger
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            setResult(prev => prev + '\n⚠️ Profilo non trovato, tentativo creazione manuale...');
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: email,
                full_name: fullName,
              });

            if (insertError) {
              setResult(prev => prev + '\n❌ Errore creazione profilo: ' + insertError.message);
            } else {
              setResult(prev => prev + '\n✅ Profilo creato manualmente');
            }
          } else {
            setResult(prev => prev + '\n✅ Profilo creato automaticamente: ' + JSON.stringify(profileData, null, 2));
          }
        }
      }

      setResult(prev => prev + '\n\n🎉 Test completato!');
    } catch (err) {
      setResult(prev => prev + '\n💥 Errore imprevisto: ' + (err as Error).message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Test Registrazione Supabase</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email di test
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
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
              placeholder="password123"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mario Rossi"
            />
          </div>
        </div>

        <button
          onClick={testRegistration}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Test in corso...' : 'Avvia Test Registrazione'}
        </button>

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