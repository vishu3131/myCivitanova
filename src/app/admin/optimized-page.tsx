'use client';

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { LazyWrapper, ProgressiveLoader } from '@/components/admin/LazyWrapper';
import { useCache, CACHE_KEYS, CacheHelpers } from '@/lib/cache';
import { OptimizedDatabaseService } from '@/lib/optimized-database';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';
import { DatabaseTest } from '@/components/admin/DatabaseTest';
import { supabase } from '@/utils/supabaseClient';
import { firebaseClient } from '@/utils/firebaseClient';

// Lazy load dei componenti non critici
const LazyAppStats = lazy(() => import('@/components/admin/AppStats'));
const LazyUserManagement = lazy(() => import('@/components/admin/UserManagement'));
const LazyEventsManagement = lazy(() => import('@/components/admin/EventsManagement'));

// Interfacce ottimizzate
interface OptimizedDashboardStats {
  users_count: number;
  news_count: number;
  events_count: number;
  comments_count: number;
  interactions_count: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'news_published' | 'event_created' | 'comment_posted';
  description: string;
  timestamp: string;
  user?: string;
}

// Componente per le statistiche principali (critico)
const DashboardStatsCard: React.FC<{ stats: OptimizedDashboardStats | null; loading: boolean }> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: 'Utenti Totali', value: stats.users_count, color: 'blue' },
    { title: 'Contenuti', value: stats.news_count + stats.events_count, color: 'green' },
    { title: 'Interazioni', value: stats.interactions_count, color: 'purple' },
    { title: 'Commenti', value: stats.comments_count, color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 bg-${card.color}-100 dark:bg-${card.color}-900/20 rounded-lg flex items-center justify-center`}>
              <div className={`w-6 h-6 bg-${card.color}-600 rounded`}></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Componente principale ottimizzato
const OptimizedAdminPage: React.FC = () => {
  const { user, loading: authLoading, hasRole } = useAuthWithRole(['admin', 'moderator']);
  const [showDatabaseTest, setShowDatabaseTest] = React.useState(false);
  const [dbStatus, setDbStatus] = React.useState<'checking' | 'connected' | 'error'>('checking');

  // Usa il sistema di cache per le statistiche
  const { 
    data: dashboardStats, 
    loading: statsLoading, 
    error: statsError,
    refresh: refreshStats 
  } = useCache(
    CACHE_KEYS.APP_STATISTICS,
    () => OptimizedDatabaseService.getOptimizedAppStatistics(),
    10 * 60 * 1000 // 10 minuti di cache
  );

  // Preload dei dati critici
  React.useEffect(() => {
    if (user && hasRole(['admin', 'moderator'])) {
      // Preload dei dati della dashboard in background
      OptimizedDatabaseService.preloadDashboardData().catch(console.error);
    }
  }, [user, hasRole]);

  // Controllo dello stato del database
  const checkDb = React.useCallback(async () => {
    setDbStatus('checking');
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      setDbStatus('connected');
    } catch (error) {
      console.error('Errore connessione DB:', error);
      setDbStatus('error');
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      checkDb();
    }
  }, [user, checkDb]);

  // Configurazione per il caricamento progressivo
  const adminSections = React.useMemo(() => [
    {
      id: 'stats',
      component: LazyAppStats,
      priority: 'high' as const,
      props: { stats: dashboardStats }
    },
    {
      id: 'users',
      component: LazyUserManagement,
      priority: 'medium' as const,
    },
    {
      id: 'events',
      component: LazyEventsManagement,
      priority: 'low' as const,
    },
  ], [dashboardStats]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Access denied
  if (!user || !hasRole(['admin', 'moderator'])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Accesso Negato
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Non hai i permessi necessari per accedere a questa sezione.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header della dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestisci la tua applicazione Civitanova
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Indicatore stato database */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                dbStatus === 'connected' ? 'bg-green-500' :
                dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                DB: {dbStatus === 'connected' ? 'Connesso' : dbStatus === 'error' ? 'Errore' : 'Controllo...'}
              </span>
            </div>
            
            {/* Pulsanti di controllo */}
            <button
              onClick={checkDb}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Controlla DB
            </button>
            
            <button
              onClick={() => setShowDatabaseTest(!showDatabaseTest)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Test DB
            </button>
            
            <button
              onClick={refreshStats}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Aggiorna
            </button>
          </div>
        </motion.div>

        {/* Test del database (se abilitato) */}
        {showDatabaseTest && (
          <LazyWrapper>
            <DatabaseTest />
          </LazyWrapper>
        )}

        {/* Statistiche principali (caricamento immediato) */}
        <DashboardStatsCard stats={dashboardStats} loading={statsLoading} />

        {/* Errore nel caricamento delle statistiche */}
        {statsError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <p className="text-red-800 dark:text-red-200">
              Errore nel caricamento delle statistiche: {statsError.message}
            </p>
            <button
              onClick={refreshStats}
              className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Riprova
            </button>
          </motion.div>
        )}

        {/* Sezioni admin con caricamento progressivo */}
        <Suspense fallback={
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        }>
          <ProgressiveLoader sections={adminSections} />
        </Suspense>

        {/* Link rapidi alle sezioni admin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8"
        >
          {[
            { name: 'Utenti', href: '/admin/users', icon: '👥' },
            { name: 'Contenuti', href: '/admin/content', icon: '📝' },
            { name: 'Eventi', href: '/admin/events', icon: '📅' },
            { name: 'POI', href: '/admin/pois', icon: '📍' },
            { name: 'Segnalazioni', href: '/admin/reports', icon: '🚨' },
            { name: 'Impostazioni', href: '/admin/settings', icon: '⚙️' },
          ].map((link) => (
            <motion.a
              key={link.name}
              href={link.href}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all
              "
            >
              <span className="text-2xl mb-2">{link.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {link.name}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default OptimizedAdminPage;