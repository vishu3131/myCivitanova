// SOLUZIONE ALTERNATIVA - Sostituisci temporaneamente il contenuto di LoginModal.tsx
// Questo bypassa Supabase Auth e usa solo il database per la registrazione

import { useState, MouseEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import './neon-login.css';

interface LoginModalProps {
  onClose?: () => void;
  onLogin?: () => void;
}

export default function LoginModal(props: LoginModalProps) {
  const { onClose, onLogin } = props;
  const router = useRouter();

  // Stati esistenti...
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupBirth, setSignupBirth] = useState('');
  const [signupRole, setSignupRole] = useState<'utente' | 'turista'>('utente');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupSurname, setSignupSurname] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Funzione di hash semplice per la password (SOLO PER TEST - non sicura per produzione)
  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  // Genera un UUID semplice
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // REGISTRAZIONE ALTERNATIVA - Solo database
  const handleAlternativeSignup = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    setDebugInfo('');

    // Validazioni
    if (!validateEmail(signupEmail)) {
      setSignupError('Inserisci una email valida.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('La password deve essere di almeno 6 caratteri.');
      return;
    }
    if (!signupUsername || signupUsername.length < 3) {
      setSignupError('Inserisci uno username di almeno 3 caratteri.');
      return;
    }
    if (!signupName || signupName.length < 2) {
      setSignupError('Inserisci il nome.');
      return;
    }
    if (!signupSurname || signupSurname.length < 2) {
      setSignupError('Inserisci il cognome.');
      return;
    }
    if (!signupPhone.match(/^\+?\d{8,15}$/)) {
      setSignupError('Inserisci un numero di telefono valido.');
      return;
    }
    if (!signupBirth) {
      setSignupError('Inserisci la data di nascita.');
      return;
    }

    setLoading(true);
    setDebugInfo('🚀 Avvio registrazione alternativa...');

    try {
      // 1. Controlla se email esiste già
      setDebugInfo(prev => prev + '\n🔍 Controllo email esistente...');
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', signupEmail)
        .single();

      if (existingUser) {
        setSignupError('Email già registrata');
        setLoading(false);
        return;
      }

      if (checkError && checkError.code !== 'PGRST116') {
        setDebugInfo(prev => prev + '\n❌ Errore controllo email: ' + checkError.message);
        setSignupError('Errore controllo database');
        setLoading(false);
        return;
      }

      // 2. Controlla se username esiste già
      setDebugInfo(prev => prev + '\n🔍 Controllo username esistente...');
      const { data: existingUsername, error: usernameError } = await supabase
        .from('users')
        .select('username')
        .eq('username', signupUsername)
        .single();

      if (existingUsername) {
        setSignupError('Username già esistente');
        setLoading(false);
        return;
      }

      // 3. Inserisci nuovo utente
      setDebugInfo(prev => prev + '\n📝 Inserimento nuovo utente...');
      const newUserId = generateUUID();
      const hashedPassword = simpleHash(signupPassword); // ATTENZIONE: non sicuro per produzione

      const userData = {
        id: newUserId,
        email: signupEmail,
        display_name: `${signupName} ${signupSurname}`,
        username: signupUsername,
        phone: signupPhone,
        birthdate: signupBirth,
        role: signupRole,
        password_hash: hashedPassword, // Campo che dovrai aggiungere alla tabella
        email_confirmed: false,
        created_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select();

      if (insertError) {
        setDebugInfo(prev => prev + '\n❌ Errore inserimento: ' + JSON.stringify(insertError, null, 2));
        setSignupError('Errore salvataggio utente: ' + insertError.message);
        setLoading(false);
        return;
      }

      setDebugInfo(prev => prev + '\n✅ Utente registrato con successo!');
      setSignupSuccess('Registrazione completata! Puoi ora effettuare il login.');
      
      // Pulisci il form dopo 3 secondi
      setTimeout(() => {
        setShowSignup(false);
        setSignupEmail('');
        setSignupPassword('');
        setSignupUsername('');
        setSignupName('');
        setSignupSurname('');
        setSignupPhone('');
        setSignupBirth('');
        setSignupRole('utente');
        setSignupSuccess('');
        setDebugInfo('');
      }, 3000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setDebugInfo(prev => prev + '\n❌ ERRORE CATCH: ' + errorMsg);
      setSignupError('Errore generico: ' + errorMsg);
    }

    setLoading(false);
  };

  // LOGIN ALTERNATIVO - Solo database
  const handleAlternativeLogin = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Inserisci una email valida.');
      return;
    }
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.');
      return;
    }

    setLoading(true);

    try {
      const hashedPassword = simpleHash(password);
      
      const { data: user, error: loginError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', hashedPassword)
        .single();

      if (loginError || !user) {
        setError('Email o password non corretti');
        setLoading(false);
        return;
      }

      setSuccess('Accesso effettuato!');
      
      // Salva i dati utente in localStorage per simulare la sessione
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      onLogin && onLogin();
      setTimeout(() => {
        onClose && onClose();
        router.push('/profilo');
      }, 1000);

    } catch (err) {
      setError('Errore di connessione');
    }

    setLoading(false);
  };

  // Resto del JSX uguale, ma cambia i gestori degli eventi:
  // onClick={handleAlternativeLogin} per il login
  // onClick={handleAlternativeSignup} per la registrazione

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="neon-login-box">
        {!showSignup ? (
          <div>
            <h2>LOGIN ALTERNATIVO <span style={{color:'#ff00c8'}}>❤</span></h2>
            <form>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="neon-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="neon-input"
                required
              />
              {error && <div className="neon-error">{error}</div>}
              {success && <div className="neon-success">{success}</div>}
              <button
                onClick={handleAlternativeLogin}
                className="neon-btn"
                disabled={loading}
              >{loading ? 'Accesso...' : 'Sign in'}</button>
              <div className="flex justify-between mb-2">
                <span className="neon-link signup" onClick={() => setShowSignup(true)}>Registrazione</span>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h2>REGISTRAZIONE ALTERNATIVA</h2>
            <form>
              <input
                type="text"
                placeholder="Nome"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                className="neon-input"
                required
              />
              <input
                type="text"
                placeholder="Cognome"
                value={signupSurname}
                onChange={e => setSignupSurname(e.target.value)}
                className="neon-input"
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={signupUsername}
                onChange={e => setSignupUsername(e.target.value)}
                className="neon-input"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                className="neon-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                className="neon-input"
                required
              />
              <input
                type="tel"
                placeholder="Numero di telefono"
                value={signupPhone}
                onChange={e => setSignupPhone(e.target.value)}
                className="neon-input"
                required
              />
              <input
                type="date"
                placeholder="Data di nascita"
                value={signupBirth}
                onChange={e => setSignupBirth(e.target.value)}
                className="neon-input"
                required
              />
              <select
                value={signupRole}
                onChange={e => setSignupRole(e.target.value as 'utente' | 'turista')}
                className="neon-input"
              >
                <option value="utente">Utente</option>
                <option value="turista">Turista</option>
              </select>
              {signupError && <div className="neon-error">{signupError}</div>}
              {signupSuccess && <div className="neon-success">{signupSuccess}</div>}
              {debugInfo && (
                <div style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '10px',
                  margin: '10px 0',
                  fontSize: '12px',
                  color: '#ccc',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <strong>Debug Info:</strong><br/>
                  {debugInfo}
                </div>
              )}
              <button
                onClick={handleAlternativeSignup}
                className="neon-btn"
                disabled={loading}
              >{loading ? 'Registrazione...' : 'Sign up'}</button>
              <span className="neon-link" onClick={() => setShowSignup(false)}>Torna al login</span>
            </form>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
}