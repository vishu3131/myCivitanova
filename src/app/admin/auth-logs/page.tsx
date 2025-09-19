/**
 * MYCIVITANOVA - ADMIN AUTH LOGS PAGE
 * 
 * Admin page dedicated to authentication monitoring and security analysis.
 * Provides comprehensive view of all authentication events and statistics.
 */

'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AuthMonitoringDashboard from '@/components/admin/AuthMonitoringDashboard';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';
import { Shield, RefreshCw } from 'lucide-react';

export default function AuthLogsPage() {
  const { user, role, loading } = useAuthWithRole();

  if (loading) {
    return (
      <AdminLayout>
        <div className=\"flex items-center justify-center py-12\">
          <RefreshCw className=\"w-8 h-8 animate-spin mr-3\" />
          <span className=\"text-gray-600 dark:text-gray-400\">Caricamento dashboard autenticazione...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !['admin', 'moderator'].includes(role)) {
    return (
      <AdminLayout>
        <div className=\"text-center py-12\">
          <Shield className=\"w-16 h-16 text-gray-400 mx-auto mb-4\" />
          <h2 className=\"text-2xl font-bold text-gray-900 dark:text-white mb-2\">Accesso Negato</h2>
          <p className=\"text-gray-500 dark:text-gray-400\">
            Solo amministratori e moderatori possono accedere ai logs di autenticazione
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className=\"space-y-6\">
        {/* Page Header */}
        <div className=\"bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6\">
          <div className=\"flex items-center gap-3\">
            <div className=\"p-3 bg-blue-500/10 rounded-lg\">
              <Shield className=\"w-6 h-6 text-blue-500\" />
            </div>
            <div>
              <h1 className=\"text-2xl font-bold text-gray-900 dark:text-white\">
                Logs di Autenticazione
              </h1>
              <p className=\"text-gray-600 dark:text-gray-400\">
                Monitoraggio completo delle attività di autenticazione e sicurezza del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Auth Monitoring Dashboard */}
        <AuthMonitoringDashboard />
      </div>
    </AdminLayout>
  );
}", "original_text": "", "replace_all": false}]