'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useSyncContext } from '@/components/FirebaseSupabaseSyncProvider';
import { SyncDashboard } from '@/components/SyncDashboard';

/**
 * MYCIVITANOVA - PAGINA TEST SINCRONIZZAZIONE
 * 
 * Componente React per testare l'integrazione frontend del sistema di
 * sincronizzazione tra Firebase e Supabase.
 */

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const SyncTestPage: React.FC = () => {
  const {
    user,
    syncedProfile,
    loading,
    authLoading,
    updateLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    sendEmailVerification,
    forceSyncUser
  } = useUnifiedAuth();

  const {
    syncState,
    syncStats,
    realtimeSync,
    syncAllUsers,
    refreshStats,
    forceSyncCurrentUser,
    toggleRealtimeSync
  } = useSyncContext();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testEmail, setTestEmail] = useState('test@mycivitanova.com');
  const [testPassword, setTestPassword] = useState('TestPassword123!');

  // Test functions
  const updateTestResult = (testName: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.test === testName);
      if (existing) {
        return prev.map(t => t.test === testName ? { ...t, status, message, duration } : t);
      } else {
        return [...prev, { test: testName, status, message, duration }];
      }
    });
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTestResult(testName, 'running');
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'success', 'Test completato con successo', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'error', error instanceof Error ? error.message : 'Errore sconosciuto', duration);
    }
  };

  const testAuthenticationFlow = async () => {
    // Test registrazione
    await register(testEmail, testPassword, {
      full_name: 'Test User',
      username: 'testuser' + Date.now()
    });
    
    // Attendi un momento per la sincronizzazione
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!user) {
      throw new Error('Registrazione fallita: utente non creato');
    }
    
    if (!syncedProfile) {
      throw new Error('Sincronizzazione fallita: profilo Supabase non creato');
    }
  };

  const testProfileUpdate = async () => {
    if (!user) {
      throw new Error('Nessun utente autenticato');
    }
    
    const updatedData = {
      full_name: 'Test User Updated',
      bio: 'Bio di test aggiornata'
    };
    
    await updateProfile(updatedData);
    
    // Attendi sincronizzazione
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!syncedProfile || syncedProfile.full_name !== updatedData.full_name) {
      throw new Error('Aggiornamento profilo non sincronizzato');
    }
  };

  const testRealtimeSync = async () => {
    if (!realtimeSync) {
      throw new Error('Sincronizzazione real-time non attiva');
    }
    
    // Test forzatura sincronizzazione
    await forceSyncCurrentUser();
    
    // Attendi un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (realtimeSync.status !== 'active') {
      throw new Error('Sincronizzazione real-time non funzionante');
    }
  };

  const testSyncStats = async () => {
    await refreshStats();
    
    if (!syncStats) {
      throw new Error('Statistiche di sincronizzazione non disponibili');
    }
    
    if (typeof syncStats.total_users !== 'number') {
      throw new Error('Formato statistiche non valido');
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      await runTest('Flusso di Autenticazione', testAuthenticationFlow);
      await runTest('Aggiornamento Profilo', testProfileUpdate);
      await runTest('Sincronizzazione Real-time', testRealtimeSync);
      await runTest('Statistiche Sincronizzazione', testSyncStats);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'running': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test Sistema Sincronizzazione
          </h1>
          <p className="text-gray-600">
            Verifica il funzionamento dell&apos;integrazione Firebase ↔ Supabase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pannello Test */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔬 Test Automatici
            </h2>
            
            {/* Configurazione Test */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configurazione Test</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email Test</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={isRunningTests}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Password Test</label>
                  <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={isRunningTests}
                  />
                </div>
              </div>
            </div>

            {/* Pulsante Avvio Test */}
            <button
              onClick={runAllTests}
              disabled={isRunningTests || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isRunningTests ? '🔄 Test in corso...' : '🚀 Avvia Test Completi'}
            </button>

            {/* Risultati Test */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Risultati Test</h3>
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nessun test eseguito</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getStatusIcon(result.status)} {result.test}
                      </span>
                      <span className={`text-xs ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                    {result.message && (
                      <p className={`text-xs ${result.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                        {result.message}
                      </p>
                    )}
                    {result.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        Durata: {result.duration}ms
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dashboard Sincronizzazione */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Dashboard Sincronizzazione
            </h2>
            <SyncDashboard />
          </div>
        </div>

        {/* Stato Utente */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👤 Stato Utente Corrente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Firebase User */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">🔥 Firebase User</h3>
              {loading || authLoading ? (
                <p className="text-gray-500 text-sm">Caricamento...</p>
              ) : user ? (
                <div className="bg-gray-50 rounded-md p-3 text-sm">
                  <p><strong>UID:</strong> {user.uid}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Verificato:</strong> {user.emailVerified ? '✅' : '❌'}</p>
                  <p><strong>Creato:</strong> {user.metadata.creationTime}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nessun utente autenticato</p>
              )}
            </div>

            {/* Supabase Profile */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">🗄️ Supabase Profile</h3>
              {loading ? (
                <p className="text-gray-500 text-sm">Caricamento...</p>
              ) : syncedProfile ? (
                <div className="bg-gray-50 rounded-md p-3 text-sm">
                  <p><strong>ID:</strong> {syncedProfile.id}</p>
                  <p><strong>Nome:</strong> {syncedProfile.full_name}</p>
                  <p><strong>Username:</strong> {syncedProfile.username}</p>
                  <p><strong>Ruolo:</strong> {syncedProfile.role}</p>
                  <p><strong>Livello:</strong> {syncedProfile.current_level}</p>
                  <p><strong>XP:</strong> {syncedProfile.total_xp}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Profilo non sincronizzato</p>
              )}
            </div>
          </div>

          {/* Azioni Rapide */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => forceSyncUser()}
              disabled={!user || loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              🔄 Forza Sincronizzazione
            </button>
            
            <button
              onClick={() => refreshStats()}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              📊 Aggiorna Statistiche
            </button>
            
            <button
              onClick={() => toggleRealtimeSync()}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm ${
                realtimeSync?.enabled
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {realtimeSync?.enabled ? '⏸️ Disabilita Real-time' : '▶️ Abilita Real-time'}
            </button>
            
            {user && (
              <button
                onClick={() => logout()}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
              >
                🚪 Logout
              </button>
            )}
          </div>
        </div>

        {/* Errori */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">❌ Errore</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncTestPage;