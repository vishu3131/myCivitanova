'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthActions } from '@/hooks/useUnifiedAuth'; // Importa solo le azioni
import { AuthResult } from '@/services/unifiedAuthService'; // Importa il tipo

// Definisci uno stato per la pagina
type PageStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<PageStatus>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const { resetPassword } = useAuthActions(); // Usa l'hook per le azioni

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setFeedbackMessage('Inserisci un indirizzo email valido');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    const result: AuthResult = await resetPassword(email);

    if (result.success) {
      setStatus('success');
      setFeedbackMessage('Email di recupero inviata con successo!');
    } else {
      setStatus('error');
      setFeedbackMessage(result.error || "Errore durante l'invio dell'email di recupero");
    }
  };

  const handleReset = () => {
    setEmail('');
    setStatus('idle');
    setFeedbackMessage('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-teal-400 mb-2">
            Recupera Password
          </h1>
          <p className="text-gray-400 text-lg">
            {status !== 'success'
              ? 'Inserisci la tua email per ricevere il link di recupero'
              : 'Controlla la tua casella di posta'
            }
          </p>
        </div>

        {/* Form o Messaggio di Successo */}
        <div className="space-y-6">
          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Inserisci la tua email"
                  className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  disabled={status === 'loading'}
                />
              </div>

              {/* Error Message */}
              {status === 'error' && feedbackMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center">
                  <svg className="h-5 w-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {feedbackMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="w-full px-4 py-3 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'loading' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Invio in corso...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Invia Link di Recupero
                  </div>
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="mx-auto h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Email Inviata!</h3>
                <p className="text-gray-400">
                  {feedbackMessage}<br />
                  Controlla anche la cartella spam.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
              >
                Invia un'altra email
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="pt-6 border-t border-gray-700/50 space-y-4">
            <div className="text-center">
              <Link
                href="/login"
                className="text-teal-400 hover:text-teal-300 transition-colors font-medium inline-flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Torna al Login
              </Link>
            </div>
            <div className="text-center">
              <Link
                href="/"
                className="text-gray-400 hover:text-gray-300 transition-colors text-sm inline-flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Torna alla Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Hai bisogno di aiuto? <a href="mailto:support@mycivitanova.com" className="text-teal-400 hover:text-teal-300 transition-colors">Contattaci</a></p>
        </div>
      </div>
    </div>
  );
}