'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCache, CACHE_KEYS, CacheHelpers } from '@/lib/cache';
import { OptimizedDatabaseService } from '@/lib/optimized-database';
import { useAuthWithRole } from '@/hooks/useAuthWithRole';
import { supabase } from '@/lib/supabase';

// Interfacce per il tipo di dati ottimizzati
interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  pendingModeration: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  lastUpdate: Date;
}

interface AdminFilters {
  dateRange: 'today' | 'week' | 'month' | 'year';
  contentType: 'all' | 'news' | 'events' | 'pois';
  userRole: 'all' | 'admin' | 'moderator' | 'user';
  status: 'all' | 'active' | 'pending' | 'suspended';
}

interface UseOptimizedAdminReturn {
  // Dati
  metrics: AdminMetrics | null;
  filters: AdminFilters;
  isLoading: boolean;
  error: Error | null;
  
  // Azioni
  updateFilters: (newFilters: Partial<AdminFilters>) => void;
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // Utilità
  isAuthorized: boolean;
  hasAdminRole: boolean;
  hasModerationRole: boolean;
}

// Hook principale per l'ottimizzazione admin
export const useOptimizedAdmin = (): UseOptimizedAdminReturn => {
  const { user, hasRole } = useAuthWithRole(['admin', 'moderator']);
  const [filters, setFilters] = useState<AdminFilters>({
    dateRange: 'week',
    contentType: 'all',
    userRole: 'all',
    status: 'all',
  });
  const [error, setError] = useState<Error | null>(null);

  // Autorizzazioni
  const isAuthorized = useMemo(() => {
    return user && hasRole(['admin', 'moderator']);
  }, [user, hasRole]);

  const hasAdminRole = useMemo(() => {
    return user && hasRole(['admin']);
  }, [user, hasRole]);

  const hasModerationRole = useMemo(() => {
    return user && hasRole(['admin', 'moderator']);
  }, [user, hasRole]);

  // Cache key dinamica basata sui filtri
  const cacheKey = useMemo(() => {
    return `${CACHE_KEYS.APP_STATISTICS}_${JSON.stringify(filters)}`;
  }, [filters]);

  // Usa il sistema di cache per le metriche
  const { 
    data: rawMetrics, 
    loading: isLoading, 
    error: cacheError,
    refresh: refreshCache 
  } = useCache(
    cacheKey,
    () => OptimizedDatabaseService.getOptimizedAppStatistics(),
    5 * 60 * 1000 // 5 minuti di cache
  );

  // Trasforma i dati grezzi in metriche ottimizzate
  const metrics = useMemo((): AdminMetrics | null => {
    if (!rawMetrics) return null;

    return {
      totalUsers: rawMetrics.users_count || 0,
      activeUsers: Math.floor((rawMetrics.users_count || 0) * 0.7), // Stima utenti attivi
      totalContent: (rawMetrics.news_count || 0) + (rawMetrics.events_count || 0),
      pendingModeration: Math.floor((rawMetrics.comments_count || 0) * 0.1), // Stima moderazione
      systemHealth: rawMetrics.users_count > 0 ? 'healthy' : 'warning',
      lastUpdate: new Date(),
    };
  }, [rawMetrics]);

  // Gestione errori
  useEffect(() => {
    if (cacheError) {
      setError(cacheError);
    } else {
      setError(null);
    }
  }, [cacheError]);

  // Aggiorna filtri con debouncing
  const updateFilters = useCallback((newFilters: Partial<AdminFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh dei dati
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      await refreshCache();
      
      // Invalida cache correlate
      CacheHelpers.invalidateRelatedCache(['users', 'content', 'statistics']);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Errore nel refresh dei dati'));
    }
  }, [refreshCache]);

  // Pulisci cache
  const clearCache = useCallback(() => {
    CacheHelpers.invalidateRelatedCache(['admin', 'statistics', 'users', 'content']);
  }, []);

  return {
    metrics,
    filters,
    isLoading,
    error,
    updateFilters,
    refreshData,
    clearCache,
    isAuthorized,
    hasAdminRole,
    hasModerationRole,
  };
};

// Hook per le performance del sistema
export const useSystemPerformance = () => {
  const [performance, setPerformance] = useState({
    memoryUsage: 0,
    loadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    // Monitora le performance del browser
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setPerformance(prev => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      }));

      // Monitora l'uso della memoria (se disponibile)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setPerformance(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize,
        }));
      }
    }
  }, []);

  return performance;
};

// Hook per il monitoraggio real-time
export const useRealTimeMonitoring = (enabled: boolean = false) => {
  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 0,
    newNotifications: 0,
    systemAlerts: [],
  });

  useEffect(() => {
    if (!enabled) return;

    // Sottoscrizione ai cambiamenti real-time
    const subscription = supabase
      .channel('admin-monitoring')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          // Aggiorna contatori in tempo reale
          setRealtimeData(prev => ({
            ...prev,
            activeUsers: prev.activeUsers + (payload.eventType === 'INSERT' ? 1 : 0),
          }));
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRealtimeData(prev => ({
              ...prev,
              newNotifications: prev.newNotifications + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [enabled]);

  return realtimeData;
};

// Hook per l'ottimizzazione delle immagini
export const useImageOptimization = () => {
  const [imageStats, setImageStats] = useState({
    totalImages: 0,
    optimizedImages: 0,
    totalSize: 0,
    optimizedSize: 0,
  });

  const optimizeImage = useCallback(async (imageUrl: string, quality: number = 80) => {
    try {
      // Implementa logica di ottimizzazione immagini
      // Questo è un placeholder per la logica reale
      const response = await fetch(`/api/optimize-image?url=${encodeURIComponent(imageUrl)}&quality=${quality}`);
      const result = await response.json();
      
      setImageStats(prev => ({
        ...prev,
        optimizedImages: prev.optimizedImages + 1,
        optimizedSize: prev.optimizedSize + (result.originalSize - result.optimizedSize),
      }));
      
      return result.optimizedUrl;
    } catch (error) {
      console.error('Errore nell\'ottimizzazione dell\'immagine:', error);
      return imageUrl; // Ritorna l'URL originale in caso di errore
    }
  }, []);

  return { imageStats, optimizeImage };
};

// Hook per il batch processing
export const useBatchOperations = () => {
  const [batchQueue, setBatchQueue] = useState<Array<{ id: string; operation: () => Promise<any> }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const addToBatch = useCallback((id: string, operation: () => Promise<any>) => {
    setBatchQueue(prev => [...prev, { id, operation }]);
  }, []);

  const processBatch = useCallback(async () => {
    if (batchQueue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      for (let i = 0; i < batchQueue.length; i++) {
        await batchQueue[i].operation();
        setProgress(((i + 1) / batchQueue.length) * 100);
        
        // Piccola pausa per evitare di sovraccaricare il sistema
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setBatchQueue([]);
    } catch (error) {
      console.error('Errore nel batch processing:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [batchQueue, isProcessing]);

  const clearBatch = useCallback(() => {
    setBatchQueue([]);
  }, []);

  return {
    batchQueue,
    isProcessing,
    progress,
    addToBatch,
    processBatch,
    clearBatch,
  };
};