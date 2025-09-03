"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from "@/components/admin/AdminLayout";
import DatabaseTest from "@/components/admin/DatabaseTest";
import { DatabaseService } from "../../lib/database";
import { OptimizedDatabaseService } from "../../lib/optimized-database";
import { useCache, CACHE_KEYS, CacheHelpers } from "../../lib/cache";
import { supabase } from "../../utils/supabaseClient";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { useOptimizedAdmin } from "@/hooks/useOptimizedAdmin";
import { firebaseClient } from "@/utils/firebaseAuth";
import { LazyWrapper, ComponentSkeleton } from "@/components/admin/LazyWrapper";
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
  Image as ImageIcon
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [showDatabaseTest, setShowDatabaseTest] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ online: boolean; latency?: number; error?: string; checking: boolean }>({
    online: false,
    checking: true
  });

  // Usa il caching per le statistiche dashboard
  const { data: stats, loading: dashboardLoading, refresh: refreshStats } = useCache(
    CACHE_KEYS.APP_STATISTICS,
    async () => {
      console.log('🔄 Caricando statistiche con cache...');
      const appStats = await OptimizedDatabaseService.getOptimizedStatistics();
      return {
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
        }
      };
    },
    10 * 60 * 1000 // Cache per 10 minuti
  );

  // Hook ottimizzato per metriche admin
  const { metrics, performance } = useOptimizedAdmin();

  const checkDb = useCallback(async () => {
    setDbStatus((s) => ({ ...s, checking: true }));
    const start = Date.now();
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .limit(1);
      if (error) throw error;
      setDbStatus({ online: true, latency: Date.now() - start, error: undefined, checking: false });
    } catch (e: any) {
      setDbStatus({ online: false, latency: undefined, error: e?.message || 'Errore sconosciuto', checking: false });
    }
  }, []);

  const loadRecentActivity = useCallback(async () => {
    try {
      // Carica attività recenti con cache
      const cachedActivity = await CacheHelpers.loadAndCache(
        CACHE_KEYS.SYSTEM_LOGS,
        async () => {
          // In futuro: query ottimizzata per attività recenti
          return [
            {
              id: '1',
              type: 'user' as const,
              message: 'Nuovo utente registrato: Mario Rossi',
              timestamp: '2 minuti fa',
              user: 'Mario Rossi'
            },
            {
              id: '2',
              type: 'news' as const,
              message: 'Pubblicato nuovo articolo: "Festa del Mare 2024"',
              timestamp: '15 minuti fa'
            },
            {
              id: '3',
              type: 'event' as const,
              message: 'Nuovo evento creato: "Torneo Beach Volley"',
              timestamp: '1 ora fa'
            },
            {
              id: '4',
              type: 'badge' as const,
              message: '5 utenti hanno ottenuto il badge "Partecipante Attivo"',
              timestamp: '2 ore fa'
            },
            {
              id: '5',
              type: 'comment' as const,
              message: '12 nuovi commenti da moderare',
              timestamp: '3 ore fa'
            }
          ];
        },
        5 * 60 * 1000 // Cache per 5 minuti
      );
      setRecentActivity(cachedActivity);
    } catch (error) {
      console.error('❌ Errore caricamento attività recenti:', error);
      setRecentActivity([]);
    }
  }, []);

  const handleRefreshData = useCallback(() => {
    refreshStats();
    loadRecentActivity();
    CacheHelpers.invalidateRelatedCache(['admin', 'statistics']);
          }
        });
      } finally {
        setDashboardLoading(false);
      }
    }, []);

  // Carica dati dashboard
  useEffect(() => {
    console.log('👤 Stato utente:', user ? 'Autenticato' : 'Non autenticato');
    if (user) {
      console.log('✅ Utente autenticato, caricando dati dashboard...');
      loadDashboardData();
    } else {
      console.log('❌ Utente non autenticato, saltando caricamento dati');
    }
  }, [user, loadDashboardData]);

  useEffect(() => {
    if (user) {
      checkDb();
    }
  }, [user, checkDb]);

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
          <div>Caricamento in corso...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || (role !== 'admin' && role !== 'superadmin')) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Accesso Negato</h1>
          <p>Non hai i permessi per visualizzare quest&apos;area.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Amministrazione</h1>
            <p className="text-gray-600 dark:text-gray-300">Panoramica generale dell&apos;app MyCivitanova</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={checkDb}
              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
            >
              <div className={`w-3 h-3 rounded-full ${dbStatus.checking ? 'animate-pulse bg-yellow-500' : dbStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">DB</span>
              {dbStatus.latency && <span className="text-xs text-gray-600 dark:text-gray-400">{dbStatus.latency}ms</span>}
            </button>
            <button
              onClick={() => setShowDatabaseTest(s => !s)}
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Test DB
            </button>
          </div>
        </div>

        {showDatabaseTest && <DatabaseTest />}

        {/* Statistiche Principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={<Users />} title="Utenti Totali" value={stats?.totalUsers} trend={stats?.weeklyGrowth.users} />
          <StatCard icon={<FileText />} title="Contenuti (News/Eventi)" value={(stats?.totalNews || 0) + (stats?.totalEvents || 0)} trend={stats?.weeklyGrowth.content} />
          <StatCard icon={<Trophy />} title="Interazioni (Commenti/Badge)" value={(stats?.totalComments || 0) + (stats?.totalBadges || 0)} trend={stats?.weeklyGrowth.engagement} />
        </div>

        {/* Attività Recenti e Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="font-bold text-gray-900 dark:text-white">Attività Recente</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Un riepilogo delle attività recenti, delle segnalazioni e dello stato generale dell&apos;applicazione.
              </p>
            </div>
            <div className="p-4 space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white/90 font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Azioni Rapide</h2>
            <div className="space-y-2">
              <QuickActionLink href="/admin/news" icon={<FileText />}>Gestisci News</QuickActionLink>
              <QuickActionLink href="/admin/events" icon={<Calendar />}>Gestisci Eventi</QuickActionLink>
              <QuickActionLink href="/admin/comments" icon={<MessageSquare />}>Modera Commenti</QuickActionLink>
              <QuickActionLink href="/admin/users" icon={<Users />}>Gestisci Utenti</QuickActionLink>
              <QuickActionLink href="/admin/settings" icon={<Shield />}>Impostazioni</QuickActionLink>
            </div>
          </div>
        </div>

        {/* Altre sezioni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Moderazione */}
          <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Da Moderare</h2>
            <div className="space-y-3">
              <ModerationItem count={12} label="Commenti in attesa" href="/admin/comments" />
              <ModerationItem count={3} label="Segnalazioni contenuti" href="/admin/reports" />
              <ModerationItem count={1} label="Richieste verifica utente" href="/admin/users?filter=verification" />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Stato del Sistema</h2>
            <div className="space-y-3">
              <SystemStatusItem
                label="Database Principale"
                status={dbStatus.online}
                okText="Online"
                failText="Offline"
                details={dbStatus.online ? `Latenza: ${dbStatus.latency}ms` : dbStatus.error}
              />
              <SystemStatusItem label="Servizio Notifiche Push" status={true} okText="Attivo" />
              <SystemStatusItem label="API Meteo" status={true} okText="Operativo" />
              <SystemStatusItem label="Job Schedulati" status={false} failText="1 job fallito" />
            </div>
          </div>
        </div>
        
        {/* Link a tutte le sezioni */}
        <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Tutte le Sezioni di Amministrazione</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AdminSectionLink href="/admin/stats" icon={<BarChart3 />} label="Statistiche Dettagliate" />
            <AdminSectionLink href="/admin/users" icon={<Users />} label="Gestione Utenti" />
            <AdminSectionLink href="/admin/content" icon={<FileText />} label="Gestione Contenuti" />
            <AdminSectionLink href="/admin/gamification" icon={<Trophy />} label="Gamification" />
            <AdminSectionLink href="/admin/reports" icon={<AlertTriangle />} label="Segnalazioni" />
            <AdminSectionLink href="/admin/logs" icon={<Activity />} label="Log di Sistema" />
            <AdminSectionLink href="/admin/settings" icon={<Shield />} label="Impostazioni" />
            <AdminSectionLink href="/admin/home-images" icon={<ImageIcon />} label="Immagini Home" />
          </div>
        </div>

      </motion.div>
    </AdminLayout>
  );
}

import EventsManagement from "@/components/admin/EventsManagement";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value?: number;
  trend?: number;
}

function StatCard({ icon, title, value, trend }: StatCardProps) {
  const trendColor = trend && trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const trendIcon = trend && trend > 0 ? <ArrowUp size={14} /> : <ArrowUp size={14} className="transform rotate-180" />;

  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 p-5 flex items-start justify-between shadow-sm">
      <div>
        <div className="p-2 bg-blue-100 dark:bg-gray-800 rounded-lg inline-block mb-3 text-blue-600 dark:text-blue-400">{icon}</div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value?.toLocaleString('it-IT') ?? '...'}</p>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-sm font-semibold ${trendColor}`}>
          {trendIcon}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}

interface QuickActionLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function QuickActionLink({ href, icon, children }: QuickActionLinkProps) {
  return (
    <a href={href} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
      <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
        {icon}
        <span className="text-gray-900 dark:text-white/90 font-medium">{children}</span>
      </div>
      <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
    </a>
  );
}

interface ModerationItemProps {
  count: number;
  label: string;
  href: string;
}

function ModerationItem({ count, label, href }: ModerationItemProps) {
  return (
    <a href={href} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
      <span className="text-gray-900 dark:text-white/80 font-medium">{label}</span>
      <span className="px-2 py-0.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors">{count}</span>
    </a>
  );
}

interface SystemStatusItemProps {
  label: string;
  status: boolean;
  okText?: string;
  failText?: string;
  details?: string;
}

function SystemStatusItem({ label, status, okText = 'OK', failText = 'Problema', details }: SystemStatusItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className={`w-2.5 h-2.5 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <p className="text-gray-900 dark:text-white/80 font-medium">{label}</p>
      </div>
      <div>
        <p className={`text-sm font-semibold ${status ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{status ? okText : failText}</p>
        {details && <p className="text-xs text-gray-600 dark:text-gray-400 text-right">{details}</p>}
      </div>
    </div>
  );
}

interface AdminSectionLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function AdminSectionLink({ href, icon, label }: AdminSectionLinkProps) {
  return (
    <a href={href} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-center group">
      <div className="mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">{icon}</div>
      <span className="text-sm text-gray-900 dark:text-white/80 font-medium">{label}</span>
    </a>
  );
}
