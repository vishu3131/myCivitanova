"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from "@/components/admin/AdminLayout";
import DatabaseTest from "@/components/admin/DatabaseTest";
import { DatabaseService } from "../../lib/database";
import { supabase } from "../../utils/supabaseClient";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { firebaseClient } from "@/utils/firebaseAuth";
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [showDatabaseTest, setShowDatabaseTest] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ online: boolean; latency?: number; error?: string; checking: boolean }>({
    online: false,
    checking: true
  });

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

  const loadDashboardData = useCallback(async () => {
      console.log('🔄 Iniziando caricamento dati dashboard...');
      try {
        // Carica statistiche reali dal database
        console.log('📞 Chiamando DatabaseService.getAppStatistics()...');
        const appStats = await DatabaseService.getAppStatistics();
        console.log('📊 Dati statistiche ricevuti:', appStats);
        console.log('📊 Tipo di dati ricevuti:', typeof appStats);
        console.log('📊 Chiavi disponibili:', Object.keys(appStats || {}));
        
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
        console.error('❌ Errore caricamento dashboard:', error);
        // Usa valori 0 in caso di errore per evidenziare il problema
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalNews: 0,
          totalEvents: 0,
          totalComments: 0,
          totalBadges: 0,
          weeklyGrowth: {
            users: 0,
            content: 0,
            engagement: 0
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
            <h1 className="text-3xl font-bold text-white">Dashboard Amministrazione</h1>
            <p className="text-gray-400">Panoramica generale dell&apos;app MyCivitanova</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={checkDb}
              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className={`w-3 h-3 rounded-full ${dbStatus.checking ? 'animate-pulse bg-yellow-500' : dbStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>DB</span>
              {dbStatus.latency && <span className="text-xs text-gray-400">{dbStatus.latency}ms</span>}
            </button>
            <button
              onClick={() => setShowDatabaseTest(s => !s)}
              className="px-3 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
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
          <div className="lg:col-span-2 bg-gray-900/50 rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-bold text-white">Attività Recente</h2>
              <p className="text-sm text-gray-500">
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
                    <p className="text-sm text-white/90">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl border border-white/10 p-4">
            <h2 className="font-bold text-white mb-3">Azioni Rapide</h2>
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
          <div className="bg-gray-900/50 rounded-xl border border-white/10 p-4">
            <h2 className="font-bold text-white mb-3">Da Moderare</h2>
            <div className="space-y-3">
              <ModerationItem count={12} label="Commenti in attesa" href="/admin/comments" />
              <ModerationItem count={3} label="Segnalazioni contenuti" href="/admin/reports" />
              <ModerationItem count={1} label="Richieste verifica utente" href="/admin/users?filter=verification" />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-900/50 rounded-xl border border-white/10 p-4">
            <h2 className="font-bold text-white mb-3">Stato del Sistema</h2>
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
        <div className="bg-gray-900/50 rounded-xl border border-white/10 p-4">
          <h2 className="font-bold text-white mb-3">Tutte le Sezioni di Amministrazione</h2>
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
  const trendColor = trend && trend > 0 ? 'text-green-500' : 'text-red-500';
  const trendIcon = trend && trend > 0 ? <ArrowUp size={14} /> : <ArrowUp size={14} className="transform rotate-180" />;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-white/10 p-5 flex items-start justify-between">
      <div>
        <div className="p-2 bg-gray-800 rounded-lg inline-block mb-3">{icon}</div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value?.toLocaleString('it-IT') ?? '...'}</p>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-sm ${trendColor}`}>
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
    <a href={href} className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-white/90">{children}</span>
      </div>
      <ChevronRight size={16} className="text-gray-500" />
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
    <a href={href} className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors">
      <span className="text-white/80">{label}</span>
      <span className="px-2 py-0.5 text-sm font-bold bg-red-600 text-white rounded-full">{count}</span>
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
        <p className="text-white/80">{label}</p>
      </div>
      <div>
        <p className={`text-sm font-semibold ${status ? 'text-green-500' : 'text-red-500'}`}>{status ? okText : failText}</p>
        {details && <p className="text-xs text-gray-500 text-right">{details}</p>}
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
    <a href={href} className="flex flex-col items-center justify-center p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-center">
      <div className="mb-2">{icon}</div>
      <span className="text-sm text-white/80">{label}</span>
    </a>
  );
}
