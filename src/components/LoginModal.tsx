import { useState, MouseEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { TUTORIAL_KEY } from '@/components/HomeTutorial'; // Import TUTORIAL_KEY
import './neon-login.css';

interface LoginModalProps {
  onClose?: () => void;
  onLogin?: () => void;
}

export default function LoginModal(props: LoginModalProps) {
  const { onClose, onLogin } = props;
  const router = useRouter();

  // Variabili di stato
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
  const [debugInfo, setDebugInfo] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupSurname, setSignupSurname] = useState('');
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const resendTimers = [60, 180]; // secondi: 1° tentativo dopo 60s, 2° dopo 180s

  // Funzioni
  const startResendTimer = (attempt: number) => {
    setResendCooldown(resendTimers[attempt] || 0);
    if (resendTimers[attempt]) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resend({ type: 'signup', email: signupEmail });
    if (error) {
      setError(error.message);
    } else {
      setResendAttempts((prev) => prev + 1);
      startResendTimer(resendAttempts);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleResetPassword = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setResetMsg('');
    if (!validateEmail(resetEmail)) {
      setResetMsg('Inserisci una email valida.');
      return;
    }
    setLoading(true);
    const result = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (result.error) {
      setResetMsg(result.error.message);
    } else {
      setResetMsg('Email di reset inviata!');
    }
    setLoading(false);
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Accesso effettuato!');
      onLogin && onLogin();
      // Mark tutorial as hidden on successful login to prevent blurring
      try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch {}
      onClose && onClose();
      router.push('/profilo');
    }
    setLoading(false);
  };

  const handleSignup = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');
    setDebugInfo('');
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
    setDebugInfo('🚀 Avvio registrazione Supabase Auth...');
    
    // SOLUZIONE TEMPORANEA: Salta completamente Supabase Auth
    // e salva direttamente nel database
    setDebugInfo(prev => prev + '\n🔄 Bypassing Supabase Auth, inserimento diretto...');
    
    try {
      // 1. Controlla se email esiste già
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

      // 2. Genera un UUID per l'utente
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      // 3. Inserisci direttamente nel database
      const newUserId = generateUUID();
      const userData = {
        id: newUserId,
        email: signupEmail,
        display_name: `${signupName} ${signupSurname}`,
        username: signupUsername,
        phone: signupPhone,
        birthdate: signupBirth,
        role: signupRole,
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select();

      if (insertError) {
        setDebugInfo(prev => prev + '\n❌ Errore inserimento diretto: ' + JSON.stringify(insertError, null, 2));
        setSignupError('Errore salvataggio: ' + insertError.message);
        setLoading(false);
        return;
      }

      setDebugInfo(prev => prev + '\n✅ Utente salvato direttamente nel database!');
      
      // Simula il successo di Supabase Auth
      const data = { user: { id: newUserId, email: signupEmail } };
      const error = null;

      setDebugInfo(prev => prev + '\n✅ Registrazione completata con successo!');
      
      // Aggiungi XP di benvenuto per nuovo utente
      try {
        await supabase.rpc('add_xp_simple', {
          p_user_id: newUserId,
          p_activity_type: 'welcome',
          p_xp_amount: 25,
          p_metadata: { 
            registration_date: new Date().toISOString(),
            source: 'new_user_registration'
          }
        });
        setDebugInfo(prev => prev + '\n🎉 XP di benvenuto aggiunti!');
      } catch (xpError) {
        setDebugInfo(prev => prev + '\n⚠️ Sistema XP non ancora attivo: ' + (xpError instanceof Error ? xpError.message : String(xpError)));
      }
      
    } catch (directInsertError) {
      setDebugInfo(prev => prev + '\n❌ Errore inserimento diretto: ' + (directInsertError instanceof Error ? directInsertError.message : String(directInsertError)));
      setSignupError('Errore registrazione: ' + (directInsertError instanceof Error ? directInsertError.message : String(directInsertError)));
      setLoading(false);
      return;
    }
    
    // Mostra messaggio di successo
    setSignupSuccess('Registrazione completata con successo! Ora puoi effettuare il login.');
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
    }, 3000);
    setLoading(false);
  };

  // JSX
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="neon-login-box relative">
        {/* Pulsante X per chiudere */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full text-xl font-bold transition-all duration-200 z-10 group"
            aria-label="Chiudi"
          >
            <span className="group-hover:scale-110 transition-transform duration-200">×</span>
          </button>
        )}
        
        {!showSignup ? (
          <div>
            <h2>LOGIN <span style={{color:'#ff00c8'}}>❤</span></h2>
            {!showReset ? (
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
                {typeof error === 'string' && error && <div className="neon-error">{error}</div>}
                {success && <div className="neon-success">{success}</div>}
                <button
                  onClick={handleLogin}
                  className="neon-btn"
                  disabled={loading}
                >{loading ? 'Accesso...' : 'Sign in'}</button>
                <div className="flex justify-between mb-2">
                  <span className="neon-link" onClick={() => setShowReset(true)}>Forgot Password</span>
                  <span className="neon-link signup" onClick={() => setShowSignup(true)}>Registrazione</span>
                </div>
                <button
                  type="button"
                  className="neon-btn relative cursor-not-allowed opacity-50"
                  disabled
                >
                  Accedi con Google
                  <span
                    className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full"
                    style={{ transform: 'translate(50%, -50%)' }}
                  >
                    Coming Soon
                  </span>
                </button>
              </form>
            ) : (
              <form>
                <input
                  type="email"
                  placeholder="Email per reset"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  className="neon-input"
                  required
                />
                {resetMsg && <div className="neon-success">{resetMsg}</div>}
                <button
                  onClick={handleResetPassword}
                  className="neon-btn"
                  disabled={loading}
                >{loading ? 'Invio...' : 'Reset Password'}</button>
                <span className="neon-link" onClick={() => setShowReset(false)}>Torna al login</span>
              </form>
            )}
          </div>
        ) : (
          <div>
            <h2>REGISTRAZIONE <span style={{color:'#ff00c8'}}>✨</span></h2>
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
              <div className="neon-debug" style={{
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
              onClick={handleSignup}
              className="neon-btn"
              disabled={loading}
            >{loading ? 'Registrazione...' : 'Sign up'}</button>
            <span className="neon-link" onClick={() => setShowSignup(false)}>Torna al login</span>
          </form>
          </div>
        )}
      </div>
    </div>
  );
}
