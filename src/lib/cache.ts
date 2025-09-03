'use client';

import { DatabaseService } from './database';

// Interfaccia per gli elementi della cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Configurazione della cache
const CACHE_CONFIG = {
  // TTL per diversi tipi di dati (in millisecondi)
  USER_STATS: 5 * 60 * 1000, // 5 minuti
  APP_STATISTICS: 10 * 60 * 1000, // 10 minuti
  USER_LIST: 3 * 60 * 1000, // 3 minuti
  NEWS_LIST: 5 * 60 * 1000, // 5 minuti
  EVENTS_LIST: 5 * 60 * 1000, // 5 minuti
  POIS_LIST: 15 * 60 * 1000, // 15 minuti
  SYSTEM_LOGS: 2 * 60 * 1000, // 2 minuti
  LEADERBOARD: 5 * 60 * 1000, // 5 minuti
};

// Chiavi per la cache
export const CACHE_KEYS = {
  APP_STATISTICS: 'app_statistics',
  USER_LIST: 'user_list',
  USER_COUNT: 'user_count',
  NEWS_LIST: 'news_list',
  EVENTS_LIST: 'events_list',
  POIS_LIST: 'pois_list',
  SYSTEM_LOGS: 'system_logs',
  LEADERBOARD: 'leaderboard',
  RECENT_ACTIVITY: 'recent_activity',
} as const;

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly maxMemoryItems = 100;

  // Ottieni un elemento dalla cache
  get<T>(key: string): T | null {
    // Prima controlla la cache in memoria
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Poi controlla localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const item: CacheItem<T> = JSON.parse(stored);
        if (this.isValid(item)) {
          // Ripristina nella cache in memoria
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          // Rimuovi elemento scaduto
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Errore nel recupero dalla cache:', error);
    }

    return null;
  }

  // Salva un elemento nella cache
  set<T>(key: string, data: T, ttl?: number): void {
    const defaultTtl = this.getDefaultTtl(key);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    };

    // Salva in memoria
    this.memoryCache.set(key, item);
    this.cleanupMemoryCache();

    // Salva in localStorage
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Errore nel salvataggio in cache:', error);
      // Se localStorage è pieno, prova a pulire
      this.cleanupLocalStorage();
    }
  }

  // Rimuovi un elemento dalla cache
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Errore nella rimozione dalla cache:', error);
    }
  }

  // Pulisci tutta la cache
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Errore nella pulizia della cache:', error);
    }
  }

  // Controlla se un elemento è ancora valido
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  // Ottieni il TTL di default per una chiave
  private getDefaultTtl(key: string): number {
    switch (key) {
      case CACHE_KEYS.APP_STATISTICS:
        return CACHE_CONFIG.APP_STATISTICS;
      case CACHE_KEYS.USER_LIST:
      case CACHE_KEYS.USER_COUNT:
        return CACHE_CONFIG.USER_STATS;
      case CACHE_KEYS.NEWS_LIST:
        return CACHE_CONFIG.NEWS_LIST;
      case CACHE_KEYS.EVENTS_LIST:
        return CACHE_CONFIG.EVENTS_LIST;
      case CACHE_KEYS.POIS_LIST:
        return CACHE_CONFIG.POIS_LIST;
      case CACHE_KEYS.SYSTEM_LOGS:
        return CACHE_CONFIG.SYSTEM_LOGS;
      case CACHE_KEYS.LEADERBOARD:
        return CACHE_CONFIG.LEADERBOARD;
      default:
        return 5 * 60 * 1000; // 5 minuti di default
    }
  }

  // Pulisci la cache in memoria se supera il limite
  private cleanupMemoryCache(): void {
    if (this.memoryCache.size > this.maxMemoryItems) {
      // Rimuovi gli elementi più vecchi
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.maxMemoryItems / 2);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  // Pulisci localStorage rimuovendo elementi scaduti
  private cleanupLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const item = JSON.parse(stored);
              if (!this.isValid(item)) {
                localStorage.removeItem(key);
              }
            } catch {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Errore nella pulizia di localStorage:', error);
    }
  }
}

// Istanza singleton del cache manager
export const cacheManager = new CacheManager();

// Hook per utilizzare la cache con React
export const useCache = <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      // Prima controlla la cache
      const cached = cacheManager.get<T>(key);
      if (cached) {
        setData(cached);
        return;
      }

      // Se non in cache, carica i dati
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetcher();
        cacheManager.set(key, result, ttl);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Errore nel caricamento'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, ttl]);

  const refresh = React.useCallback(async () => {
    cacheManager.remove(key);
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      cacheManager.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Errore nel caricamento'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  return { data, loading, error, refresh };
};

// Funzioni helper per operazioni comuni
export const CacheHelpers = {
  // Carica e cache le statistiche dell'app
  async getAppStatistics() {
    const cached = cacheManager.get(CACHE_KEYS.APP_STATISTICS);
    if (cached) return cached;

    const stats = await DatabaseService.getAppStatistics();
    cacheManager.set(CACHE_KEYS.APP_STATISTICS, stats);
    return stats;
  },

  // Carica e cache la lista utenti
  async getUserList() {
    const cached = cacheManager.get(CACHE_KEYS.USER_LIST);
    if (cached) return cached;

    const users = await DatabaseService.getUsers();
    cacheManager.set(CACHE_KEYS.USER_LIST, users);
    return users;
  },

  // Carica e cache le news
  async getNewsList() {
    const cached = cacheManager.get(CACHE_KEYS.NEWS_LIST);
    if (cached) return cached;

    const news = await DatabaseService.getNews();
    cacheManager.set(CACHE_KEYS.NEWS_LIST, news);
    return news;
  },

  // Invalida cache correlate quando i dati cambiano
  invalidateUserData() {
    cacheManager.remove(CACHE_KEYS.USER_LIST);
    cacheManager.remove(CACHE_KEYS.USER_COUNT);
    cacheManager.remove(CACHE_KEYS.APP_STATISTICS);
  },

  invalidateContentData() {
    cacheManager.remove(CACHE_KEYS.NEWS_LIST);
    cacheManager.remove(CACHE_KEYS.EVENTS_LIST);
    cacheManager.remove(CACHE_KEYS.APP_STATISTICS);
  },
};

export default cacheManager;