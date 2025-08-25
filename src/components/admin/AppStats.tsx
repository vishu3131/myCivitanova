"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  Clock,
  Smartphone,
  Globe,
  X,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/utils/supabaseClient.ts';

interface AppStatsData {
  users: {
    total: number;
    active_today: number;
    active_week: number;
    active_month: number;
    new_today: number;
    new_week: number;
    new_month: number;
  };
  content: {
    total_news: number;
    published_news: number;
    total_events: number;
    active_events: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
  };
  engagement: {
    daily_active_users: number;
    session_duration_avg: number;
    pages_per_session: number;
    bounce_rate: number;
    retention_rate: number;
  };
  gamification: {
    total_xp_distributed: number;
    total_badges_earned: number;
    active_players: number;
    average_level: number;
  };
  technical: {
    app_version: string;
    platform_distribution: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
    performance_score: number;
    uptime_percentage: number;
  };
}

interface AppStatsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

export function AppStats({ isOpen, onClose, currentUser }: AppStatsProps) {
  const [stats, setStats] = useState<AppStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (isOpen && currentUser) {
      loadStats();
    }
  }, [isOpen, currentUser, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // In un'app reale, questi dati verrebbero da diverse query al database
      // Per ora uso dati demo realistici
      const mockStats: AppStatsData = {
        users: {
          total: 1247,
          active_today: 89,
          active_week: 342,
          active_month: 756,
          new_today: 12,
          new_week: 45,
          new_month: 123
        },
        content: {
          total_news: 156,
          published_news: 134,
          total_events: 89,
          active_events: 23,
          total_views: 15420,
          total_likes: 2341,
          total_comments: 567
        },
        engagement: {
          daily_active_users: 89,
          session_duration_avg: 8.5, // minuti
          pages_per_session: 4.2,
          bounce_rate: 32.1, // percentuale
          retention_rate: 68.9 // percentuale
        },
        gamification: {
          total_xp_distributed: 125000,
          total_badges_earned: 890,
          active_players: 234,
          average_level: 6.8
        },
        technical: {
          app_version: '1.2.3',
          platform_distribution: {
            mobile: 78,
            desktop: 18,
            tablet: 4
          },
          performance_score: 94.2,
          uptime_percentage: 99.8
        }
      };

      // Simula un caricamento realistico
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  // Verifica permessi
  const hasPermission = currentUser && ['admin', 'moderator'].includes(currentUser.role);

  if (!isOpen) return null;

  if (!hasPermission) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Accesso Negato</h2>
          <p className="text-gray-400 mb-6">Non hai i permessi per visualizzare le statistiche</p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg font-medium transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] border border-gray-700 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Statistiche App
            </h2>
            <p className="text-gray-400">Panoramica completa delle performance dell&apos;applicazione</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="today">Oggi</option>
              <option value="week">Questa Settimana</option>
              <option value="month">Questo Mese</option>
              <option value="year">Quest&apos;Anno</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={refreshStats}
              disabled={refreshing}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white">Caricamento statistiche...</span>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Utenti Totali"
                  value={stats.users.total.toLocaleString()}
                  change={`+${stats.users.new_month}`}
                  changeType="positive"
                  icon={<Users className="w-6 h-6" />}
                  color="blue"
                />
                <StatsCard
                  title="Utenti Attivi"
                  value={stats.users.active_month.toLocaleString()}
                  change={`${((stats.users.active_month / stats.users.total) * 100).toFixed(1)}%`}
                  changeType="neutral"
                  icon={<Activity className="w-6 h-6" />}
                  color="green"
                />
                <StatsCard
                  title="Contenuti Pubblicati"
                  value={stats.content.published_news.toLocaleString()}
                  change={`+${Math.floor(stats.content.published_news * 0.1)}`}
                  changeType="positive"
                  icon={<Eye className="w-6 h-6" />}
                  color="purple"
                />
                <StatsCard
                  title="XP Distribuiti"
                  value={stats.gamification.total_xp_distributed.toLocaleString()}
                  change={`+${Math.floor(stats.gamification.total_xp_distributed * 0.05)}`}
                  changeType="positive"
                  icon={<Star className="w-6 h-6" />}
                  color="yellow"
                />
              </div>

              {/* Detailed Stats Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Statistics */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Statistiche Utenti
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Utenti Totali</span>
                      <span className="text-white font-semibold">{stats.users.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Attivi Oggi</span>
                      <span className="text-white font-semibold">{stats.users.active_today}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Attivi Questa Settimana</span>
                      <span className="text-white font-semibold">{stats.users.active_week}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Attivi Questo Mese</span>
                      <span className="text-white font-semibold">{stats.users.active_month}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Nuovi Oggi</span>
                        <span className="text-green-400 font-semibold">+{stats.users.new_today}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Nuovi Questa Settimana</span>
                        <span className="text-green-400 font-semibold">+{stats.users.new_week}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Nuovi Questo Mese</span>
                        <span className="text-green-400 font-semibold">+{stats.users.new_month}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Statistics */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Statistiche Contenuti
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">News Totali</span>
                      <span className="text-white font-semibold">{stats.content.total_news}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">News Pubblicate</span>
                      <span className="text-white font-semibold">{stats.content.published_news}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Eventi Totali</span>
                      <span className="text-white font-semibold">{stats.content.total_events}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Eventi Attivi</span>
                      <span className="text-white font-semibold">{stats.content.active_events}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Visualizzazioni Totali</span>
                        <span className="text-blue-400 font-semibold">{stats.content.total_views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Like Totali</span>
                        <span className="text-red-400 font-semibold">{stats.content.total_likes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Commenti Totali</span>
                        <span className="text-green-400 font-semibold">{stats.content.total_comments.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement Statistics */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Engagement
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Utenti Attivi Giornalieri</span>
                      <span className="text-white font-semibold">{stats.engagement.daily_active_users}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Durata Sessione Media</span>
                      <span className="text-white font-semibold">{stats.engagement.session_duration_avg} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pagine per Sessione</span>
                      <span className="text-white font-semibold">{stats.engagement.pages_per_session}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Bounce Rate</span>
                      <span className="text-yellow-400 font-semibold">{stats.engagement.bounce_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Retention Rate</span>
                      <span className="text-green-400 font-semibold">{stats.engagement.retention_rate}%</span>
                    </div>
                  </div>
                </div>

                {/* Gamification Statistics */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Gamification
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">XP Totali Distribuiti</span>
                      <span className="text-white font-semibold">{stats.gamification.total_xp_distributed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Badge Ottenuti</span>
                      <span className="text-white font-semibold">{stats.gamification.total_badges_earned}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Giocatori Attivi</span>
                      <span className="text-white font-semibold">{stats.gamification.active_players}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Livello Medio</span>
                      <span className="text-white font-semibold">{stats.gamification.average_level}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Partecipazione</span>
                        <span className="text-blue-400 font-semibold">
                          {((stats.gamification.active_players / stats.users.active_month) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Platform Distribution */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Distribuzione Piattaforme
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mobile</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${stats.technical.platform_distribution.mobile}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-12 text-right">
                          {stats.technical.platform_distribution.mobile}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Desktop</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${stats.technical.platform_distribution.desktop}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-12 text-right">
                          {stats.technical.platform_distribution.desktop}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tablet</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${stats.technical.platform_distribution.tablet}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-12 text-right">
                          {stats.technical.platform_distribution.tablet}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Performance */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Performance Tecnica
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Versione App</span>
                      <span className="text-white font-semibold">{stats.technical.app_version}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Performance Score</span>
                      <span className="text-green-400 font-semibold">{stats.technical.performance_score}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Uptime</span>
                      <span className="text-green-400 font-semibold">{stats.technical.uptime_percentage}%</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="text-sm text-gray-400">
                        <p>Sistema stabile e performante</p>
                        <p>Ultima verifica: {new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>Errore nel caricamento delle statistiche</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Componente per le card delle statistiche
function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  color 
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400'
  };

  const changeColorClasses = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const changeIcon = {
    positive: <TrendingUp className="w-3 h-3" />,
    negative: <TrendingDown className="w-3 h-3" />,
    neutral: <Activity className="w-3 h-3" />
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm ${changeColorClasses[changeType]}`}>
          {changeIcon[changeType]}
          {change}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
      </div>
    </div>
  );
}