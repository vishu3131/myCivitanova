'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // Redirect se già autenticato
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email e password sono obbligatori');
      return false;
    }

    if (!isLogin) {
      if (formData.password.trim() !== formData.confirmPassword.trim()) {
        setError('Le password non coincidono');
        return false;
      }
      if (formData.password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri');
        return false;
      }
      if (!formData.fullName.trim()) {
        setError('Il nome completo è obbligatorio');
        return false;
      }
      if (!formData.phoneNumber.trim()) {
        setError('Il numero di telefono è obbligatorio');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        setSuccess('Login effettuato con successo!');

        // Wait for the auth session to be available before redirecting to home.
        // This avoids a race where the app redirects before auth hooks have initialized.
        const waitForSession = async (timeoutMs = 4000) => {
          const start = Date.now();
          while (Date.now() - start < timeoutMs) {
            try {
              const res = await supabase.auth.getSession();
              if (res && res.data && res.data.session && res.data.session.user) {
                return res.data.session;
              }
            } catch (e) {
              // ignore and retry
            }
            await new Promise((r) => setTimeout(r, 200));
          }
          return null;
        };

        await waitForSession(4000);
        router.push('/');
      } else {
        // Registrazione
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              username: formData.username || formData.email.split('@')[0],
              name: formData.fullName.split(' ')[0],
              surname: formData.fullName.split(' ').slice(1).join(' '),
              phone: formData.phoneNumber // Pass phone number within data
            }
          }
        });

        if (error) throw error;

        setSuccess('Registrazione completata con successo! Controlla la tua email per la conferma.');
        router.push('/auth/confirm-email'); // Reindirizza a una pagina di conferma email
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      username: '',
      phoneNumber: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Benvenuto di nuovo su MyCivitanova!' : 'Unisciti alla community di Civitanova'}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            
            {/* Nome completo (solo registrazione) */}
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="Mario Rossi"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Username (solo registrazione) */}
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username (opzionale)
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="mario.rossi"
                />
                <p className="mt-1 text-xs text-gray-500">Se non specificato, verrà usata la parte prima della @ dell'email</p>
              </div>
            )}

            {/* Numero di telefono (solo registrazione) */}
            {!isLogin && (
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Numero di telefono *
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="Es. +39 333 1234567"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="mario@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">Minimo 6 caratteri</p>
              )}
            </div>

            {/* Conferma Password (solo registrazione) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Conferma Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="••••••••"
                  required={!isLogin}
                  minLength={6}
                />
              </div>
            )}

            {/* Messaggi di errore e successo */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Accesso in corso...' : 'Registrazione in corso...'}
                </div>
              ) : (
                isLogin ? 'Accedi' : 'Registrati'
              )}
            </button>

            {/* Toggle Mode */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {isLogin 
                  ? 'Non hai un account? Registrati qui' 
                  : 'Hai già un account? Accedi qui'
                }
              </button>
            </div>

            {/* Link Home */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors flex items-center justify-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Torna alla home
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
