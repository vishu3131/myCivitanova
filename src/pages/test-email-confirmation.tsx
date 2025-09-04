'use client';

import React, { useState } from 'react';
import { unifiedAuthService } from '../services/unifiedAuthService';
import { RegisterData } from '../services/unifiedAuthService';

export default function TestEmailConfirmationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testRegistration = async () => {
    setLoading(true);
    setResult('🔄 Test registrazione nuovo utente...\n');

    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';

    const registrationData: RegisterData = {
      email: testEmail,
      password: testPassword,
      fullName: testName,
    };

    try {
      const { success, firebaseUser, error } = await unifiedAuthService.register(registrationData);

      if (success && firebaseUser) {
        setResult(prev => prev + `✅ Utente registrato in Firebase: ${firebaseUser.email}\n`);
        setResult(prev => prev + `📧 Email di verifica inviata a ${firebaseUser.email}. Controlla la tua casella di posta.\n`);
        setResult(prev => prev + `ℹ️ Stato email verificata: ${firebaseUser.emailVerified}\n`);

        // Poll for email verification status
        const interval = setInterval(async () => {
          await firebaseUser.reload();
          if (firebaseUser.emailVerified) {
            setResult(prev => prev + '✅ Email verificata con successo!\n');
            clearInterval(interval);
            setLoading(false);
          } else {
            setResult(prev => prev + '⏳ In attesa di verifica email... Ricarica l\'utente...\n');
          }
        }, 5000);

      } else {
        setResult(prev => prev + `❌ Errore durante la registrazione: ${error}\n`);
        setLoading(false);
      }
    } catch (e: any) {
      setResult(prev => prev + `❌ Eccezione durante la registrazione: ${e.message}\n`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-extrabold text-center">
          Test Conferma Email
        </h2>
        <button
          onClick={testRegistration}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:bg-gray-500"
        >
          {loading ? 'Test in corso...' : 'Avvia Test Registrazione'}
        </button>
        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Risultati:</h3>
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      </div>
    </div>
  );
}