'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmEmailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-xl shadow-lg">
        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Conferma la tua email
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Abbiamo inviato un link di conferma al tuo indirizzo email.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Controlla la tua casella di posta (e la cartella spam) per completare la registrazione.
        </p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
        >
          Torna al Login
        </button>
      </div>
    </div>
  );
}
