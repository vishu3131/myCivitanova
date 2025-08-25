'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { DatabaseService } from '@/lib/database.ts';
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare,
  Trophy,
  Activity,
  Eye,
  Heart,
  Share2,
  Download,
  Shield
} from 'lucide-react';

interface StatsData {
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
  topContent: Array<{
    title: string;
    views: number;
    type: 'news' | 'event';
  }>;
}

export default function StatsPage() {
  const { user, role, loading: authLoading } = useAuthWithRole();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [timeRange, user]);

  const loadStats = async () => {
    try {
      const appStats = await DatabaseService.getAppStatistics();
      
      setStats({
        totalUsers: appStats.total_users || 0,
        activeUsers: appStats.active_users_week || 0,
        totalNews: appStats.total_news || 0,
        totalEvents: appStats.total_events || 0,
        totalComments: appStats.total_comments || 0,
        totalBadges: appStats.total_badges_earned || 0,
        weeklyGrowth: {
          users: 12,
          content: 8,
          engagement: 15
        },
        topContent: [
          { title: 'Festa del Mare 2024', views: 1250, type: 'news' },
          { title: 'Torneo Beach Volley', views: 890, type: 'event' },
          { title: 'Nuovo Parco Giochi', views: 650, type: 'news' },
          { title: 'Mercatino Antiquariato', views: 420, type: 'event' }
        ]
      });
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
      // Valori 0 in caso di errore per evidenziare il problema
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalNews: 0,
        totalEvents: 0,
        totalComments: 0,
        totalBadges: 0,
        weeklyGrowth: {
          users: 12,
          content: 8,
          engagement: 15
        },
        topContent: [
          { title: 'Festa del Mare 2024', views: 1250, type: 'news' },
          { title: 'Torneo Beach Volley', views: 890, type: 'event' },
          { title: 'Nuovo Parco Giochi', views: 650, type: 'news' },
          { title: 'Mercatino Antiquariato', views: 420, type: 'event' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Caricamento statistiche...</span>
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
          <p className="text-gray-500 dark:text-gray-400">Non hai i permessi per accedere a questa sezione</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Statistiche e Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitora le performance della tua Smart City
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Ultimi 7 giorni</option>
              <option value="30d">Ultimi 30 giorni</option>
              <option value="90d">Ultimi 3 mesi</option>
              <option value="1y">Ultimo anno</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Download className="w-4 h-4" />
              Esporta
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats?.weeklyGrowth.users}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Utenti Totali</div>
              <div className="text-xs text-gray-400">
                {stats?.activeUsers} attivi questa settimana
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats?.weeklyGrowth.content}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalNews}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Articoli Pubblicati</div>
              <div className="text-xs text-gray-400">
                {stats?.totalEvents} eventi attivi
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats?.weeklyGrowth.engagement}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalComments}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Commenti Totali</div>
              <div className="text-xs text-gray-400">
                12 da moderare
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                +23%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalBadges}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Badge Assegnati</div>
              <div className="text-xs text-gray-400">
                10 tipi disponibili
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attività Utenti
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Utenti Attivi</span>
              </div>
            </div>
            
            {/* Placeholder per grafico */}
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Grafico Attività Utenti</p>
                <p className="text-xs text-gray-400">Integrazione con libreria grafici</p>
              </div>
            </div>
          </motion.div>

          {/* Engagement Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Engagement
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Commenti</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Like</span>
                </div>
              </div>
            </div>
            
            {/* Placeholder per grafico */}
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Grafico Engagement</p>
                <p className="text-xs text-gray-400">Commenti, like e condivisioni</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Contenuti Più Popolari
          </h3>
          
          <div className="space-y-4">
            {stats?.topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    content.type === 'news' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    {content.type === 'news' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {content.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {content.type === 'news' ? 'Articolo' : 'Evento'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{content.views.toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">342</div>
                <div className="text-blue-100">Utenti Attivi</div>
              </div>
            </div>
            <p className="text-blue-100 text-sm">
              +12% rispetto alla settimana scorsa
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">89%</div>
                <div className="text-green-100">Soddisfazione</div>
              </div>
            </div>
            <p className="text-green-100 text-sm">
              Basato sui feedback degli utenti
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-purple-100">Condivisioni</div>
              </div>
            </div>
            <p className="text-purple-100 text-sm">
              Contenuti condivisi sui social
            </p>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}