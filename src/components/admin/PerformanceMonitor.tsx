'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useSystemPerformance, 
  useRealTimeMonitoring, 
  useOptimizedAdmin 
} from '@/hooks/useOptimizedAdmin';
import { CacheManager } from '@/lib/cache';

// Interfacce
interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: { warning: number; critical: number };
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

// Componente per una singola metrica
const MetricCard: React.FC<{ metric: PerformanceMetric }> = ({ metric }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '📊';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {metric.label}
        </span>
        <span className="text-lg">{getStatusIcon(metric.status)}</span>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {metric.value.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {metric.unit}
        </span>
      </div>
      
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(metric.status)}`}>
        {metric.status.toUpperCase()}
      </div>
    </motion.div>
  );
};

// Componente per gli alert di sistema
const SystemAlerts: React.FC<{ alerts: SystemAlert[] }> = ({ alerts }) => {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <span className="text-4xl mb-2 block">✨</span>
        <p>Nessun alert di sistema</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getAlertIcon(alert.type)}</span>
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Componente per il grafico delle performance
const PerformanceChart: React.FC<{ data: number[]; label: string }> = ({ data, label }) => {
  const maxValue = Math.max(...data, 1);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        {label}
      </h3>
      
      <div className="flex items-end space-x-1 h-20">
        {data.map((value, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-blue-500 rounded-t flex-1 min-h-[2px]"
            title={`${value.toFixed(1)}`}
          />
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>-{data.length}min</span>
        <span>Ora</span>
      </div>
    </div>
  );
};

// Componente principale del monitor delle performance
const PerformanceMonitor: React.FC = () => {
  const { metrics, isLoading } = useOptimizedAdmin();
  const performance = useSystemPerformance();
  const realtimeData = useRealTimeMonitoring(true);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  // Aggiorna la cronologia delle performance
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceHistory(prev => {
        const newHistory = [...prev, performance.loadTime].slice(-20);
        return newHistory;
      });
      
      setMemoryHistory(prev => {
        const newHistory = [...prev, performance.memoryUsage * 100].slice(-20);
        return newHistory;
      });
    }, 30000); // Ogni 30 secondi

    return () => clearInterval(interval);
  }, [performance]);

  // Genera alert di sistema basati sulle metriche
  useEffect(() => {
    const newAlerts: SystemAlert[] = [];

    if (performance.memoryUsage > 0.8) {
      newAlerts.push({
        id: 'memory-high',
        type: 'warning',
        message: 'Uso memoria elevato (>80%)',
        timestamp: new Date(),
      });
    }

    if (performance.loadTime > 3000) {
      newAlerts.push({
        id: 'load-slow',
        type: 'warning',
        message: 'Tempo di caricamento lento (>3s)',
        timestamp: new Date(),
      });
    }

    if (metrics && metrics.systemHealth === 'error') {
      newAlerts.push({
        id: 'system-error',
        type: 'error',
        message: 'Errore di sistema rilevato',
        timestamp: new Date(),
      });
    }

    setSystemAlerts(newAlerts);
  }, [performance, metrics]);

  // Calcola le metriche di performance
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Tempo di Caricamento',
      value: performance.loadTime,
      unit: 'ms',
      status: performance.loadTime < 1000 ? 'good' : performance.loadTime < 3000 ? 'warning' : 'critical',
      threshold: { warning: 1000, critical: 3000 },
    },
    {
      label: 'Uso Memoria',
      value: performance.memoryUsage * 100,
      unit: '%',
      status: performance.memoryUsage < 0.6 ? 'good' : performance.memoryUsage < 0.8 ? 'warning' : 'critical',
      threshold: { warning: 60, critical: 80 },
    },
    {
      label: 'Cache Hit Rate',
      value: CacheManager.getHitRate() * 100,
      unit: '%',
      status: CacheManager.getHitRate() > 0.8 ? 'good' : CacheManager.getHitRate() > 0.6 ? 'warning' : 'critical',
      threshold: { warning: 60, critical: 40 },
    },
    {
      label: 'Utenti Attivi',
      value: realtimeData.activeUsers,
      unit: 'utenti',
      status: 'good',
      threshold: { warning: 100, critical: 200 },
    },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📊</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monitor Performance
          </h2>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {isExpanded ? 'Comprimi' : 'Espandi'}
        </button>
      </div>

      {/* Metriche principali */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {performanceMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Sezione espansa */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Grafici delle performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PerformanceChart 
                data={performanceHistory} 
                label="Tempo di Caricamento (ms)" 
              />
              <PerformanceChart 
                data={memoryHistory} 
                label="Uso Memoria (%)" 
              />
            </div>

            {/* Alert di sistema */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Alert di Sistema
              </h3>
              <SystemAlerts alerts={systemAlerts} />
            </div>

            {/* Statistiche cache */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Statistiche Cache
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {CacheManager.getStats().hits}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hit</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {CacheManager.getStats().misses}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Miss</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {CacheManager.getStats().size}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Elementi</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(CacheManager.getHitRate() * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PerformanceMonitor;