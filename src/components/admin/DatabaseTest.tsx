'use client';

import React, { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/database.ts';
import { supabase } from '@/utils/supabaseClient.ts';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  duration?: number;
}

export default function DatabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'pending'>('pending');

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    setOverallStatus('pending');

    const testResults: TestResult[] = [];

    // Test 1: Connessione base
    const startTime1 = Date.now();
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      testResults.push({
        name: 'Connessione Database',
        status: 'success',
        message: 'Connessione a Supabase stabilita con successo',
        duration: Date.now() - startTime1
      });
    } catch (error: any) {
      testResults.push({
        name: 'Connessione Database',
        status: 'error',
        message: `Errore connessione: ${error.message}`,
        duration: Date.now() - startTime1
      });
    }
    setTests([...testResults]);

    // Test 2: Lettura tabelle principali
    const startTime2 = Date.now();
    try {
      const news = await DatabaseService.getNews({ limit: 1 });
      testResults.push({
        name: 'Lettura News',
        status: 'success',
        message: `${news.length} articoli trovati`,
        duration: Date.now() - startTime2
      });
    } catch (error: any) {
      testResults.push({
        name: 'Lettura News',
        status: 'error',
        message: `Errore lettura news: ${error.message}`,
        duration: Date.now() - startTime2
      });
    }
    setTests([...testResults]);

    // Test 3: Lettura eventi
    const startTime3 = Date.now();
    try {
      const events = await DatabaseService.getEvents({ limit: 1 });
      testResults.push({
        name: 'Lettura Eventi',
        status: 'success',
        message: `${events.length} eventi trovati`,
        duration: Date.now() - startTime3
      });
    } catch (error: any) {
      testResults.push({
        name: 'Lettura Eventi',
        status: 'error',
        message: `Errore lettura eventi: ${error.message}`,
        duration: Date.now() - startTime3
      });
    }
    setTests([...testResults]);

    // Test 4: Lettura utenti
    const startTime4 = Date.now();
    try {
      const users = await DatabaseService.getUsers({ limit: 1 });
      testResults.push({
        name: 'Lettura Utenti',
        status: 'success',
        message: `${users.length} utenti trovati`,
        duration: Date.now() - startTime4
      });
    } catch (error: any) {
      testResults.push({
        name: 'Lettura Utenti',
        status: 'error',
        message: `Errore lettura utenti: ${error.message}`,
        duration: Date.now() - startTime4
      });
    }
    setTests([...testResults]);

    // Test 5: Funzioni personalizzate
    const startTime5 = Date.now();
    try {
      const stats = await DatabaseService.getAppStatistics();
      testResults.push({
        name: 'Funzioni Personalizzate',
        status: 'success',
        message: 'Statistiche app ottenute correttamente',
        duration: Date.now() - startTime5
      });
    } catch (error: any) {
      testResults.push({
        name: 'Funzioni Personalizzate',
        status: 'error',
        message: `Errore funzioni: ${error.message}`,
        duration: Date.now() - startTime5
      });
    }
    setTests([...testResults]);

    // Test 6: Classifica utenti
    const startTime6 = Date.now();
    try {
      const leaderboard = await DatabaseService.getLeaderboard(3);
      testResults.push({
        name: 'Classifica Utenti',
        status: 'success',
        message: `${leaderboard?.length || 0} utenti in classifica`,
        duration: Date.now() - startTime6
      });
    } catch (error: any) {
      testResults.push({
        name: 'Classifica Utenti',
        status: 'error',
        message: `Errore classifica: ${error.message}`,
        duration: Date.now() - startTime6
      });
    }
    setTests([...testResults]);

    // Determina stato generale
    const hasErrors = testResults.some(test => test.status === 'error');
    setOverallStatus(hasErrors ? 'error' : 'success');
    setIsRunning(false);
  };

  useEffect(() => {
    // Esegui test automaticamente al caricamento
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Test Connessione Database
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Verifica che il database Supabase sia configurato correttamente
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            overallStatus === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : overallStatus === 'error'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {overallStatus === 'success' && '✅ Tutto OK'}
            {overallStatus === 'error' && '❌ Errori Rilevati'}
            {overallStatus === 'pending' && '⏳ In Corso...'}
          </div>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? 'Testing...' : 'Riprova Test'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tests.map((test, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(test.status)}</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {test.name}
                </h3>
                <p className={`text-sm ${getStatusColor(test.status)}`}>
                  {test.message}
                </p>
              </div>
            </div>
            
            {test.duration && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {test.duration}ms
              </div>
            )}
          </div>
        ))}
        
        {tests.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Clicca &quot;Riprova Test&quot; per verificare la connessione al database
          </div>
        )}
      </div>

      {overallStatus === 'error' && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            🚨 Problemi Rilevati
          </h4>
          <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <p>• Verifica che le credenziali in .env.local siano corrette</p>
            <p>• Assicurati di aver eseguito tutti gli script SQL in Supabase</p>
            <p>• Controlla i log in Supabase Dashboard &gt; Logs</p>
            <p>• Consulta la guida SETUP_GUIDE.md per assistenza</p>
          </div>
        </div>
      )}

      {overallStatus === 'success' && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            🎉 Database Configurato Correttamente!
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Tutti i test sono passati con successo. Il database MyCivitanova è pronto per l&apos;uso.
          </p>
        </div>
      )}
    </div>
  );
}