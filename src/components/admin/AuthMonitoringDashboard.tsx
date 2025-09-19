/**
 * MYCIVITANOVA - ADMIN AUTH MONITORING DASHBOARD
 * 
 * Comprehensive authentication monitoring component for the admin dashboard.
 * Provides real-time statistics, logs visualization, and security monitoring.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter,
  Download,
  RefreshCw,
  Shield,
  TrendingUp,
  Eye,
  Calendar,
  Globe,
  Smartphone
} from 'lucide-react';
import { authLogger, AuthStats } from '@/lib/authLogger';

interface AuthLog {
  id: string;
  action: string;
  status: string;
  ip_address: string;
  user_agent: string;
  error_message?: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
  additional_data?: Record<string, any>;
}

interface FilterState {
  action: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  ipAddress: string;
}

export const AuthMonitoringDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [stats, setStats] = useState<AuthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    action: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    ipAddress: ''
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const logsPerPage = 50;

  // Load authentication statistics
  const loadStats = useCallback(async () => {
    try {
      const statsData = await authLogger.getAuthStats();
      setStats(statsData);
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    }
  }, []);

  // Load authentication logs
  const loadLogs = useCallback(async (page = 1) => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', logsPerPage.toString());
      params.set('offset', ((page - 1) * logsPerPage).toString());
      
      if (filter.action !== 'all') params.set('action', filter.action);
      if (filter.status !== 'all') params.set('status', filter.status);
      if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.set('dateTo', filter.dateTo);
      if (filter.ipAddress) params.set('ipAddress', filter.ipAddress);

      const response = await fetch(`/api/admin/auth-logs?${params.toString()}`);
      const data = await response.json();
      
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Errore caricamento logs:', error);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [filter]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadLogs(currentPage)]);
      setLoading(false);
    };
    
    loadData();
  }, [loadStats, loadLogs, currentPage]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadStats();
      loadLogs(currentPage);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, loadStats, loadLogs, currentPage]);

  // Filter change handler
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({
      action: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      ipAddress: ''
    });
    setCurrentPage(1);
  };

  // Export logs to CSV
  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '10000'); // Export more logs
      if (filter.action !== 'all') params.set('action', filter.action);
      if (filter.status !== 'all') params.set('status', filter.status);
      if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.set('dateTo', filter.dateTo);

      const response = await fetch(`/api/admin/auth-logs?${params.toString()}`);
      const data = await response.json();
      
      // Create CSV content
      const csvHeaders = ['Data', 'Azione', 'Stato', 'Email', 'IP', 'User Agent', 'Errore'];
      const csvRows = data.logs.map((log: AuthLog) => [
        new Date(log.created_at).toLocaleString('it-IT'),
        log.action,
        log.status,
        log.profiles?.email || 'N/A',
        log.ip_address || 'N/A',
        log.user_agent?.substring(0, 50) || 'N/A',
        log.error_message || ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `\"${field}\"`).join(','))
        .join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `auth-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Errore esportazione logs:', error);
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'register': return <Users className=\"w-4 h-4\" />;
      case 'login': return <CheckCircle className=\"w-4 h-4\" />;
      case 'logout': return <Activity className=\"w-4 h-4\" />;
      case 'password_reset': return <Shield className=\"w-4 h-4\" />;
      case 'email_verify': return <CheckCircle className=\"w-4 h-4\" />;
      case 'failed_login': return <AlertTriangle className=\"w-4 h-4\" />;
      case 'role_change': return <Shield className=\"w-4 h-4\" />;
      default: return <Clock className=\"w-4 h-4\" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  // Get device info from user agent
  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return { type: 'unknown', info: 'Sconosciuto' };
    
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    const browser = userAgent.match(/(Firefox|Chrome|Safari|Edge|Opera)/)?.[1] || 'Sconosciuto';
    
    return {
      type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      info: browser
    };
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / logsPerPage);
  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  if (loading) {
    return (
      <div className=\"flex items-center justify-center p-8\">
        <RefreshCw className=\"w-6 h-6 animate-spin mr-2\" />
        <span>Caricamento dashboard autenticazione...</span>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Header */}
      <div className=\"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4\">
        <div>
          <h2 className=\"text-2xl font-bold text-gray-900 dark:text-white\">
            Monitoraggio Autenticazioni
          </h2>
          <p className=\"text-gray-600 dark:text-gray-400\">
            Statistiche e logs delle attività di autenticazione
          </p>
        </div>
        
        <div className=\"flex items-center space-x-3\">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className=\"px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2\"
          >
            <Filter className=\"w-4 h-4\" />
            Filtri
          </button>
          
          <button
            onClick={exportLogs}
            className=\"px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2\"
          >
            <Download className=\"w-4 h-4\" />
            Esporta
          </button>
          
          <button
            onClick={() => {
              loadStats();
              loadLogs(currentPage);
            }}
            className=\"px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2\"
          >
            <RefreshCw className=\"w-4 h-4\" />
            Aggiorna
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className=\"bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700\"
          >
            <div className=\"flex items-center\">
              <Users className=\"w-8 h-8 text-blue-500 mr-3\" />
              <div>
                <div className=\"text-2xl font-bold text-gray-900 dark:text-white\">{stats.totalRegistrations}</div>
                <div className=\"text-sm text-gray-500 dark:text-gray-400\">Registrazioni Totali</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className=\"bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700\"
          >
            <div className=\"flex items-center\">
              <TrendingUp className=\"w-8 h-8 text-green-500 mr-3\" />
              <div>
                <div className=\"text-2xl font-bold text-gray-900 dark:text-white\">{stats.todayRegistrations}</div>
                <div className=\"text-sm text-gray-500 dark:text-gray-400\">Oggi</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className=\"bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700\"
          >
            <div className=\"flex items-center\">
              <CheckCircle className=\"w-8 h-8 text-emerald-500 mr-3\" />
              <div>
                <div className=\"text-2xl font-bold text-gray-900 dark:text-white\">{stats.successfulLogins}</div>
                <div className=\"text-sm text-gray-500 dark:text-gray-400\">Login Riusciti (30g)</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className=\"bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700\"
          >
            <div className=\"flex items-center\">
              <AlertTriangle className=\"w-8 h-8 text-red-500 mr-3\" />
              <div>
                <div className=\"text-2xl font-bold text-gray-900 dark:text-white\">{stats.failedLogins}</div>
                <div className=\"text-sm text-gray-500 dark:text-gray-400\">Login Falliti (30g)</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className=\"bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700\"
          >
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4\">
              <div>
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">
                  Azione
                </label>
                <select
                  value={filter.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white\"
                >
                  <option value=\"all\">Tutte</option>
                  <option value=\"register\">Registrazioni</option>
                  <option value=\"login\">Login</option>
                  <option value=\"failed_login\">Login Falliti</option>
                  <option value=\"logout\">Logout</option>
                  <option value=\"password_reset\">Reset Password</option>
                  <option value=\"email_verify\">Verifica Email</option>
                  <option value=\"role_change\">Cambio Ruolo</option>
                </select>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">
                  Stato
                </label>
                <select
                  value={filter.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white\"
                >
                  <option value=\"all\">Tutti</option>
                  <option value=\"success\">Successo</option>
                  <option value=\"failed\">Fallito</option>
                  <option value=\"pending\">In Attesa</option>
                </select>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">
                  Da Data
                </label>
                <input
                  type=\"date\"
                  value={filter.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1\">
                  A Data
                </label>
                <input
                  type=\"date\"
                  value={filter.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white\"
                />
              </div>

              <div className=\"flex items-end\">
                <button
                  onClick={clearFilters}
                  className=\"w-full px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors\"
                >
                  Pulisci Filtri
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-refresh toggle */}
      <div className=\"flex items-center justify-between\">
        <div className=\"flex items-center gap-2\">
          <input
            type=\"checkbox\"
            id=\"autoRefresh\"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className=\"rounded\"
          />
          <label htmlFor=\"autoRefresh\" className=\"text-sm text-gray-600 dark:text-gray-400\">
            Aggiornamento automatico (30s)
          </label>
        </div>
        
        <div className=\"text-sm text-gray-500 dark:text-gray-400\">
          {totalCount} eventi totali
        </div>
      </div>

      {/* Logs Table */}
      <div className=\"bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden\">
        <div className=\"overflow-x-auto\">
          <table className=\"w-full\">
            <thead className=\"bg-gray-50 dark:bg-gray-700\">
              <tr>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Data/Ora
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Azione
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Utente
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Stato
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  IP/Device
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Dettagli
                </th>
              </tr>
            </thead>
            <tbody className=\"divide-y divide-gray-200 dark:divide-gray-700\">
              {logsLoading ? (
                <tr>
                  <td colSpan={6} className=\"px-6 py-8 text-center\">
                    <RefreshCw className=\"w-6 h-6 animate-spin mx-auto mb-2\" />
                    <div className=\"text-gray-500 dark:text-gray-400\">Caricamento logs...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className=\"px-6 py-8 text-center text-gray-500 dark:text-gray-400\">
                    Nessun log trovato
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => {
                  const deviceInfo = getDeviceInfo(log.user_agent);
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className=\"hover:bg-gray-50 dark:hover:bg-gray-700\"
                    >
                      <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white\">
                        {new Date(log.created_at).toLocaleString('it-IT')}
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap\">
                        <div className=\"flex items-center\">
                          {getActionIcon(log.action)}
                          <span className=\"ml-2 text-sm text-gray-900 dark:text-white capitalize\">
                            {log.action.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap\">
                        <div className=\"text-sm text-gray-900 dark:text-white\">
                          {log.profiles?.full_name || 'N/A'}
                        </div>
                        <div className=\"text-sm text-gray-500 dark:text-gray-400\">
                          {log.profiles?.email || 'N/A'}
                        </div>
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap\">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className=\"px-6 py-4 whitespace-nowrap\">
                        <div className=\"flex items-center\">
                          {deviceInfo.type === 'mobile' ? (
                            <Smartphone className=\"w-4 h-4 text-gray-400 mr-1\" />
                          ) : (
                            <Globe className=\"w-4 h-4 text-gray-400 mr-1\" />
                          )}
                          <div>
                            <div className=\"text-sm text-gray-900 dark:text-white\">
                              {log.ip_address || 'N/A'}
                            </div>
                            <div className=\"text-xs text-gray-500 dark:text-gray-400\">
                              {deviceInfo.info}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className=\"px-6 py-4\">
                        <div className=\"text-sm text-gray-900 dark:text-white max-w-xs truncate\">
                          {log.error_message || 'Nessun errore'}
                        </div>
                        {log.additional_data && Object.keys(log.additional_data).length > 0 && (
                          <div className=\"text-xs text-gray-500 dark:text-gray-400\">
                            Dati aggiuntivi disponibili
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className=\"flex items-center justify-between\">
          <div className=\"text-sm text-gray-700 dark:text-gray-300\">
            Mostrando {((currentPage - 1) * logsPerPage) + 1} - {Math.min(currentPage * logsPerPage, totalCount)} di {totalCount} eventi
          </div>
          
          <div className=\"flex items-center space-x-2\">
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={!canPrevious}
              className=\"px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              Precedente
            </button>
            
            <span className=\"text-sm text-gray-700 dark:text-gray-300\">
              Pagina {currentPage} di {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!canNext}
              className=\"px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              Successiva
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthMonitoringDashboard;