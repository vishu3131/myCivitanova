"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/admin/AppLayout";
import { useAuthWithRole } from "@/hooks/useAuthWithRole";
import { Shield, FileText, Download, Search, Filter, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

export default function LogsPage() {
  const { user, role, loading } = useAuthWithRole();
  const [activeTab, setActiveTab] = useState<'all' | 'errors' | 'warnings' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white">Caricamento...</span>
        </div>
      </AppLayout>
    );
  }

  if (!user || role !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-400">Solo gli amministratori possono accedere ai log di sistema</p>
        </div>
      </AppLayout>
    );
  }

  // Mock log data
  const mockLogs = [
    {
      id: 1,
      timestamp: '2024-03-15 14:30:25',
      level: 'error',
      message: 'Database connection failed',
      details: 'Connection timeout after 30 seconds',
      source: 'database.js:45',
      user: 'system'
    },
    {
      id: 2,
      timestamp: '2024-03-15 14:25:12',
      level: 'warning',
      message: 'High memory usage detected',
      details: 'Memory usage: 85% of available RAM',
      source: 'monitor.js:23',
      user: 'system'
    },
    {
      id: 3,
      timestamp: '2024-03-15 14:20:08',
      level: 'info',
      message: 'User login successful',
      details: 'User mario.rossi@email.com logged in',
      source: 'auth.js:67',
      user: 'mario.rossi@email.com'
    },
    {
      id: 4,
      timestamp: '2024-03-15 14:15:33',
      level: 'info',
      message: 'News article published',
      details: 'Article "Festa del Paese 2024" published by admin',
      source: 'news.js:89',
      user: 'admin@civitanova.it'
    },
    {
      id: 5,
      timestamp: '2024-03-15 14:10:45',
      level: 'warning',
      message: 'Failed login attempt',
      details: 'Multiple failed login attempts from IP 192.168.1.100',
      source: 'auth.js:34',
      user: 'unknown'
    },
    {
      id: 6,
      timestamp: '2024-03-15 14:05:17',
      level: 'info',
      message: 'System backup completed',
      details: 'Daily backup completed successfully (2.3GB)',
      source: 'backup.js:12',
      user: 'system'
    }
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'border-l-red-500 bg-red-500/5';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'info':
        return 'border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-green-500 bg-green-500/5';
    }
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesTab = activeTab === 'all' || log.level === activeTab;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const logCounts = {
    all: mockLogs.length,
    errors: mockLogs.filter(log => log.level === 'error').length,
    warnings: mockLogs.filter(log => log.level === 'warning').length,
    info: mockLogs.filter(log => log.level === 'info').length
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Log di Sistema</h1>
            <p className="text-gray-400">Monitora l&apos;attività e gli errori del sistema</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Esporta Log
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{logCounts.all}</div>
                <div className="text-sm text-gray-400">Totali</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{logCounts.errors}</div>
                <div className="text-sm text-gray-400">Errori</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{logCounts.warnings}</div>
                <div className="text-sm text-gray-400">Avvisi</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{logCounts.info}</div>
                <div className="text-sm text-gray-400">Info</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-lg">
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'Tutti' },
              { id: 'errors', label: 'Errori' },
              { id: 'warnings', label: 'Avvisi' },
              { id: 'info', label: 'Info' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca nei log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Log Recenti ({filteredLogs.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-700">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border-l-4 ${getLogColor(log.level)}`}
                >
                  <div className="flex items-start gap-3">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{log.message}</span>
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                          {log.level.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{log.timestamp}</span>
                        <span>•</span>
                        <span>{log.source}</span>
                        <span>•</span>
                        <span>Utente: {log.user}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Nessun log trovato per i filtri selezionati</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stato Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <div className="text-white font-medium">Database</div>
                <div className="text-sm text-gray-400">Operativo</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <div className="text-white font-medium">API Server</div>
                <div className="text-sm text-gray-400">Operativo</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div>
                <div className="text-white font-medium">Storage</div>
                <div className="text-sm text-gray-400">85% utilizzato</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}