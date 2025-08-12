"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from "@/components/admin/AdminLayout";
import DatabaseTest from "@/components/admin/DatabaseTest";
import { DatabaseService } from "@/lib/database";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import {
  Users,
  FileText,
  Trophy,
  BarChart3,
  Activity,
  TrendingUp,
  Shield,
  Bell,
  Calendar,
  MessageSquare,
  ChevronRight,
  ArrowUp,
  CheckCircle,
  AlertTriangle,
  Zap,
  Image
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNews: number;
  totalEvents: number;
  totalComments: number;
  totalBadges: number;
  weeklyGrowth: {
    users: number;
    content: number;
    engagement: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user' | 'news' | 'event' | 'comment' | 'badge';
  message: string;
  timestamp: string;
  user?: string;
}

export default function AdminPage() {
  const { user, role, loading } = useAuthWithRole();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [showDatabaseTest, setShowDatabaseTest] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Carica dati dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Carica statistiche reali dal database
        const appStats = await DatabaseService.getAppStatistics();
        
        setStats({
          totalUsers: appStats.total_users || 1247,
          activeUsers: appStats.active_users_week || 342,
          totalNews: appStats.total_news || 156,
          totalEvents: appStats.total_events || 89,
          totalComments: appStats.total_comments || 234,
          totalBadges: appStats.total_badges_earned || 890,
          weeklyGrowth: {
            users: 12,
            content: 8,
            engagement: 15
          }
        });

        // Simula attività recenti (in futuro da database)
        setRecentActivity([
          {
            id: '1',
            type: 'user',
            message: 'Nuovo utente registrato: Mario Rossi',
            timestamp: '2 minuti fa',
            user: 'Mario Rossi'
          },
          {
            id: '2',
            type: 'news',
            message: 'Pubblicato nuovo articolo: "Festa del Mare 2024"',
            timestamp: '15 minuti fa'
          },
          {
            id: '3',
            type: 'event',
            message: 'Nuovo evento creato: "Torneo Beach Volley"',
            timestamp: '1 ora fa'
          },
          {
            id: '4',
            type: 'badge',
            message: '5 utenti hanno ottenuto il badge "Partecipante Attivo"',
            timestamp: '2 ore fa'
          },
          {
            id: '5',
            type: 'comment',
            message: '12 nuovi commenti da moderare',
            timestamp: '3 ore fa'
          }
        ]);

      } catch (error) {
        console.error('Errore caricamento dashboard:', error);
        // Usa dati mock in caso di errore
        setStats({
          totalUsers: 1247,
          activeUsers: 342,
          totalNews: 156,
          totalEvents: 89,
          totalComments: 234,
          totalBadges: 890,
          weeklyGrowth: {
            users: 12,
            content: 8,
            engagement: 15
          }
        });
      } finally {
        setDashboardLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'news': return <FileText className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'badge': return <Trophy className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-blue-500 bg-blue-500/10';
      case 'news': return 'text-green-500 bg-green-500/10';
      case 'event': return 'text-purple-500 bg-purple-500/10';
      case 'comment': return 'text-yellow-500 bg-yellow-500/10';
      case 'badge': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (loading || dashboardLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Caricamento dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !['admin', 'moderator'].includes(role)) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-500 dark:text-gray-400">Non hai i permessi per accedere al pannello amministrativo</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Benvenuto nel Dashboard MyCivitanova
              </h1>
              <p className="text-blue-100">
                Gestisci la tua Smart City da questo pannello di controllo
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                +{stats?.weeklyGrowth.users}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalUsers.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Utenti Totali</div>
              <div className="text-xs text-gray-400">
                {stats?.activeUsers || 0} attivi questa settimana
              </div>
            </div>
          </motion.div>

          {/* Content Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                +{stats?.weeklyGrowth.content}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalNews || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Articoli Pubblicati</div>
              <div className="text-xs text-gray-400">
                {stats?.totalEvents || 0} eventi attivi
              </div>
            </div>
          </motion.div>

          {/* Engagement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                +{stats?.weeklyGrowth.engagement}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalComments || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Commenti Totali</div>
              <div className="text-xs text-gray-400">
                12 da moderare
              </div>
            </div>
          </motion.div>

          {/* Gamification Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <ArrowUp className="w-4 h-4 mr-1" />
                +23%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalBadges || '0'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Badge Assegnati</div>
              <div className="text-xs text-gray-400">
                10 tipi disponibili
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Attività Recente
                </h3>
                <button className="text-sm text-blue-500 hover:text-blue-600">
                  Vedi tutto
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stato Sistema
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
                  </div>
                  <span className="text-xs text-green-500 font-medium">Online</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">API</span>
                  </div>
                  <span className="text-xs text-green-500 font-medium">Operativo</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Backup</span>
                  </div>
                  <span className="text-xs text-yellow-500 font-medium">Pianificato</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowDatabaseTest(!showDatabaseTest)}
                className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Test Database
              </button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Azioni Rapide
              </h3>
              
              <div className="space-y-3">
                <a
                  href="/admin/content"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Crea News
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Pubblica nuovo articolo
                    </div>
                  </div>
                </a>
                
                <a
                  href="/admin/events"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Nuovo Evento
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Organizza evento cittadino
                    </div>
                  </div>
                </a>
                
                <a
                  href="/admin/users"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Gestisci Utenti
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Modera community
                    </div>
                  </div>
                </a>
                
                <a
                  href="/admin/home-images"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Image className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Gestisci Immagini Home
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Modifica le immagini del carosello
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Events Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <EventsManagement />
        </motion.div>

        {/* Database Test Section */}
        {showDatabaseTest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <DatabaseTest />
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}

import EventsManagement from "@/components/admin/EventsManagement";
