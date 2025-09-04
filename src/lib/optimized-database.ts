'use client';

import { supabase } from '@/utils/supabaseClient';
import { DatabaseService } from './database';
import type { Profile, News, Event, Comment, SystemLog, CityReport } from './database';

// Interfacce per la paginazione
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interfacce per i filtri
export interface UserFilters {
  role?: string;
  isActive?: boolean;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ContentFilters {
  status?: 'published' | 'draft' | 'archived';
  category?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LogFilters {
  level?: 'info' | 'warning' | 'error';
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Classe per le query ottimizzate
export class OptimizedDatabaseService {
  // Utenti con paginazione e filtri
  static async getUsersPaginated(
    pagination: PaginationOptions,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<Profile>> {
    const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Applica filtri
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.searchTerm) {
      query = query.or(`full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Applica ordinamento e paginazione
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero utenti paginati:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // News con paginazione e filtri
  static async getNewsPaginated(
    pagination: PaginationOptions,
    filters: ContentFilters = {}
  ): Promise<PaginatedResponse<News>> {
    const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('news')
      .select(`
        *,
        profiles:author_id(full_name, avatar_url)
      `, { count: 'exact' });

    // Applica filtri
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,content.ilike.%${filters.searchTerm}%`);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero news paginate:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Eventi con paginazione e filtri
  static async getEventsPaginated(
    pagination: PaginationOptions,
    filters: ContentFilters = {}
  ): Promise<PaginatedResponse<Event>> {
    const { page, limit, sortBy = 'event_date', sortOrder = 'asc' } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('events')
      .select(`
        *,
        profiles:created_by(full_name, avatar_url)
      `, { count: 'exact' });

    // Applica filtri
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }
    if (filters.dateFrom) {
      query = query.gte('event_date', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('event_date', filters.dateTo);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero eventi paginati:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Commenti con paginazione e filtri
  static async getCommentsPaginated(
    pagination: PaginationOptions,
    filters: { contentType?: string; contentId?: string; needsModeration?: boolean } = {}
  ): Promise<PaginatedResponse<Comment>> {
    const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `, { count: 'exact' });

    // Applica filtri
    if (filters.contentType) {
      query = query.eq('content_type', filters.contentType);
    }
    if (filters.contentId) {
      query = query.eq('content_id', filters.contentId);
    }
    if (filters.needsModeration !== undefined) {
      query = query.eq('needs_moderation', filters.needsModeration);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero commenti paginati:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Log di sistema con paginazione e filtri
  static async getSystemLogsPaginated(
    pagination: PaginationOptions,
    filters: LogFilters = {}
  ): Promise<PaginatedResponse<SystemLog>> {
    const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('system_logs')
      .select(`
        *,
        profiles:user_id(full_name)
      `, { count: 'exact' });

    // Applica filtri
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    if (filters.action) {
      query = query.ilike('action', `%${filters.action}%`);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero log paginati:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Segnalazioni con paginazione e filtri
  static async getCityReportsPaginated(
    pagination: PaginationOptions,
    filters: { status?: string; category?: string; priority?: string } = {}
  ): Promise<PaginatedResponse<CityReport>> {
    const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('city_reports')
      .select(`
        *,
        profiles:user_id(full_name, avatar_url)
      `, { count: 'exact' });

    // Applica filtri
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero segnalazioni paginate:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Statistiche ottimizzate con aggregazioni
  static async getOptimizedAppStatistics() {
    try {
      // Usa una stored procedure per ottenere tutte le statistiche in una sola query
      const { data, error } = await supabase.rpc('get_optimized_app_statistics');
      
      if (error) {
        console.error('Errore nel recupero statistiche ottimizzate:', error);
        // Fallback alle query individuali se la stored procedure non esiste
        return await this.getFallbackStatistics();
      }
      
      return data;
    } catch (error) {
      console.error('Errore nelle statistiche ottimizzate:', error);
      return await this.getFallbackStatistics();
    }
  }

  // Fallback per le statistiche se la stored procedure non è disponibile
  private static async getFallbackStatistics() {
    const [usersCount, newsCount, eventsCount, commentsCount] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
    ]);

    return {
      users_count: usersCount.count || 0,
      news_count: newsCount.count || 0,
      events_count: eventsCount.count || 0,
      comments_count: commentsCount.count || 0,
      interactions_count: (commentsCount.count || 0) * 2, // Stima
    };
  }

  // Ricerca ottimizzata con full-text search
  static async searchContentOptimized(
    searchTerm: string,
    contentTypes: string[] = ['news', 'events'],
    pagination: PaginationOptions
  ) {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    try {
      const { data, error } = await supabase.rpc('search_content_optimized', {
        search_term: searchTerm,
        content_types: contentTypes,
        limit_count: limit,
        offset_count: offset,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Errore nella ricerca ottimizzata:', error);
      // Fallback alla ricerca normale
      return await DatabaseService.searchContent(searchTerm, contentTypes);
    }
  }

  // Batch operations per aggiornamenti multipli
  static async batchUpdateUsers(updates: Array<{ id: string; data: Partial<Profile> }>) {
    const promises = updates.map(({ id, data }) =>
      supabase.from('profiles').update(data).eq('id', id)
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { successful, failed, total: updates.length };
  }

  // Preload dei dati critici per la dashboard
  static async preloadDashboardData() {
    const promises = [
      this.getOptimizedAppStatistics(),
      this.getUsersPaginated({ page: 1, limit: 5, sortBy: 'created_at', sortOrder: 'desc' }),
      this.getNewsPaginated({ page: 1, limit: 5, sortBy: 'created_at', sortOrder: 'desc' }),
      this.getSystemLogsPaginated({ page: 1, limit: 10, sortBy: 'created_at', sortOrder: 'desc' }),
    ];

    const [statistics, recentUsers, recentNews, recentLogs] = await Promise.allSettled(promises);

    return {
      statistics: statistics.status === 'fulfilled' ? statistics.value : null,
      recentUsers: recentUsers.status === 'fulfilled' ? recentUsers.value : null,
      recentNews: recentNews.status === 'fulfilled' ? recentNews.value : null,
      recentLogs: recentLogs.status === 'fulfilled' ? recentLogs.value : null,
    };
  }
}

export default OptimizedDatabaseService;