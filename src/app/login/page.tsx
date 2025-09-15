"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUnifiedAuth from '@/hooks/useUnifiedAuth';
import { FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const {
    user,
    isLoading,
    isAuthenticating,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    error: authError,
  } = useUnifiedAuth();

  useEffect(() => {
    if (user) {
      // Se l'utente è già autenticato, reindirizza al profilo
      router.replace('/profilo');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const res = await login({ email: formData.email, password: formData.password });
        if (!res.success) throw new Error(res.error || 'Errore durante il login');
        setSuccessMessage('Accesso effettuato! Reindirizzamento in corso...');
        setTimeout(() => router.push('/profilo'), 800);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Le password non coincidono.');
          return;
        }
        const res = await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          username: formData.username,
          phone: formData.phone,
        });
        if (!res.success) throw new Error(res.error || 'Errore durante la registrazione');

        // Facoltativo: eventuale aggiornamento profilo aggiuntivo
        if (formData.username || formData.phone) {
          await updateProfile({ username: formData.username, phone: formData.phone });
        }

        setSuccessMessage('Registrazione completata! Reindirizzamento al profilo...');
        setTimeout(() => router.push('/profilo'), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success) throw new Error(res.error || 'Errore durante il login con Google');
      setSuccessMessage('Accesso effettuato con Google! Reindirizzamento in corso...');
      setTimeout(() => router.push('/profilo'), 800);
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore con Google.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-teal-400">
          {isLogin ? 'Accedi' : 'Registrati'}
        </h2>
        {!user ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nome Completo"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefono"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </>
            )}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            {!isLogin && (
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Conferma Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            )}

            {(error || authError) && (
              <p className="text-red-500 text-sm">{error || authError}</p>
            )}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

            {isLogin && (
              <div className="text-right">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-teal-400 hover:text-teal-300 hover:underline"
                >
                  Password dimenticata?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isAuthenticating}
              className="w-full px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {isLoading || isAuthenticating ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p>Sei già autenticato. Reindirizzamento in corso...</p>
          </div>
        )}

        {!user && (
          <div className="flex items-center justify-center">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading || isAuthenticating}
              className="flex items-center justify-center w-full px-4 py-2 mt-4 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <FaGoogle className="mr-2" />
              Accedi con Google
            </button>
          </div>
        )}

        <p className="text-sm text-center">
          {isLogin ? "Non hai un account?" : "Hai già un account?"}{' '}
          <button onClick={toggleMode} className="font-medium text-teal-400 hover:underline">
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </p>
        <div className="text-center">
          <a href="/" className="text-sm text-gray-400 hover:underline">
            Torna alla home
          </a>
        </div>
      </div>
    </div>
  );
}
