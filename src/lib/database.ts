// MyCivitanova - Database utilities and types
import { supabase } from '../utils/supabaseClient';

// Types per il database
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin' | 'staff';
  bio?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_verified: boolean;
  privacy_settings: {
    profile_public: boolean;
    email_public: boolean;
    phone_public: boolean;
  };
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
  };
  // Firebase sync fields
  firebase_uid?: string;
  firebase_created_at?: string;
  firebase_last_sign_in?: string;
  last_sync_at?: string;
  sync_status?: 'synced' | 'pending' | 'error';
  created_at: string;
  updated_at: string;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category: 'generale' | 'eventi' | 'servizi' | 'trasporti' | 'cultura' | 'sport' | 'amministrazione';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  author_id?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  featured_image?: string;
  category: 'culturale' | 'sportivo' | 'musicale' | 'gastronomico' | 'educativo' | 'sociale' | 'religioso' | 'commerciale';
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date?: string;
  is_all_day: boolean;
  max_participants?: number;
  current_participants: number;
  price: number;
  is_free: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer_id?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  organizer?: Profile;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  parent_id?: string;
  content_type: 'news' | 'event' | 'service';
  content_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  likes_count: number;
  reports_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'generale' | 'partecipazione' | 'contribuzione' | 'social' | 'esploratore' | 'veterano';
  xp_reward: number;
  requirements: Record<string, any>;
  is_active: boolean;
  rarity: 'comune' | 'raro' | 'epico' | 'leggendario';
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress: Record<string, any>;
  badge?: Badge;
}

export interface UserXP {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  weekly_xp: number;
  monthly_xp: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface XPActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'comment' | 'like' | 'share' | 'event_participation' | 'news_read' | 'profile_complete' | 'badge_earned';
  xp_earned: number;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'anagrafe' | 'tributi' | 'urbanistica' | 'sociale' | 'cultura' | 'sport' | 'ambiente' | 'trasporti';
  icon?: string;
  is_online: boolean;
  online_url?: string;
  office_address?: string;
  office_hours?: string;
  contact_phone?: string;
  contact_email?: string;
  required_documents: string[];
  processing_time?: string;
  cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'news' | 'badge';
  is_read: boolean;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: string;
  source?: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CityReport {
  id: string;
  reporter_id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'safety' | 'environment' | 'transport' | 'noise' | 'other';
  urgency: 'low' | 'medium' | 'high';
  location?: string;
  latitude?: number;
  longitude?: number;
  photos: string[];
  contact_info?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  assigned_to?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
}

export interface SiteImageSection {
  id: string;
  name: string;
  type: 'single' | 'carousel';
  description?: string;
}

export interface SiteImage {
  id: string;
  section_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Poi {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  audio_url?: string;
  icon_3d_url?: string;
  opening_hours?: any;
  created_at: string;
}


// Utility functions per il database
export class DatabaseService {
  // Site Images functions
  static async getSiteImageSections() {
    const { data, error } = await supabase
      .from('site_image_sections')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as SiteImageSection[];
  }

  static async getImagesBySection(sectionId: string) {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .eq('section_id', sectionId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as SiteImage[];
  }

  static async createSiteImage(image: Partial<SiteImage>) {
    const { data, error } = await supabase
      .from('site_images')
      .insert(image)
      .select()
      .single();

    if (error) throw error;
    return data as SiteImage;
  }

  static async updateSiteImage(id: string, updates: Partial<SiteImage>) {
    const { data, error } = await supabase
      .from('site_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SiteImage;
  }

  static async deleteSiteImage(id: string) {
    const { error } = await supabase
      .from('site_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async updateSectionType(sectionId: string, type: 'single' | 'carousel') {
    const { data, error } = await supabase
      .from('site_image_sections')
      .update({ type })
      .eq('id', sectionId)
      .select()
      .single();

    if (error) throw error;
    return data as SiteImageSection;
  }

  // POI functions
  static async getPois() {
    const { data, error } = await supabase
      .from('pois')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Poi[];
  }

  static async createPoi(poi: Partial<Poi>) {
    const { data, error } = await supabase
      .from('pois')
      .insert(poi)
      .select()
      .single();

    if (error) throw error;
    return data as Poi;
  }

  static async updatePoi(id: string, updates: Partial<Poi>) {
    const { data, error } = await supabase
      .from('pois')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Poi;
  }

  static async deletePoi(id: string) {
    const { error } = await supabase
      .from('pois')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // News functions
  static async getNews(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('news')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url)
      `)
      .order('published_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.featured !== undefined) {
      query = query.eq('is_featured', filters.featured);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as News[];
  }

  static async getNewsById(id: string) {
    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as News;
  }

  static async createNews(news: Partial<News>) {
    const { data, error } = await supabase
      .from('news')
      .insert(news)
      .select()
      .single();

    if (error) throw error;
    return data as News;
  }

  static async updateNews(id: string, updates: Partial<News>) {
    const { data, error } = await supabase
      .from('news')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as News;
  }

  // Events functions
  static async getEvents(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    upcoming?: boolean;
    limit?: number;
    offset?: number;
  }) {
    // Preferisci il client Supabase diretto se disponibile (server-side), fallback al wrapper
    const client: any = (supabase as any).direct ?? supabase;

    let query = client
      .from('events')
      .select(`
        *,
        organizer:profiles(id, full_name, avatar_url)
      `)
      .order('start_date', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.featured !== undefined) {
      query = query.eq('is_featured', filters.featured);
    }
    if (filters?.upcoming) {
      query = query.gte('start_date', new Date().toISOString());
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Event[];
  }

  static async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Event;
  }

  static async createEvent(event: Partial<Event>) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select(`
          *,
          organizer:profiles(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data as Event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async updateEvent(id: string, updates: Partial<Event>) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          organizer:profiles(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data as Event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(id: string) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Users functions
  static async getUsers(filters?: {
    role?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    if (filters?.active !== undefined) {
      query = query.eq('is_active', filters.active);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Profile[];
  }

  static async getUsersCount() {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    return { count: count || 0 };
  }

  static async updateUserRole(userId: string, role: Profile['role']) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  }

  // Comments functions
  static async getComments(contentType: string, contentId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url)
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Comment[];
  }

  static async createComment(comment: Partial<Comment>) {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  }

  static async moderateComment(commentId: string, status: Comment['status']) {
    const { data, error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  }

  // XP and Badges functions
  static async getUserXP(userId: string) {
    const { data, error } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserXP | null;
  }

  static async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data as UserBadge[];
  }

  static async getLeaderboard(limit: number = 10) {
    const { data, error } = await supabase
      .rpc('get_leaderboard', { limit_count: limit });

    if (error) throw error;
    return data;
  }

  // Statistics functions
  static async getAppStatistics() {
    const { data, error } = await supabase
      .rpc('get_app_statistics');

    if (error) throw error;
    return data;
  }

  // Notifications functions
  static async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Notification[];
  }

  static async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }

  // Search function
  static async searchContent(searchTerm: string, contentTypes: string[] = ['news', 'events']) {
    const { data, error } = await supabase
      .rpc('search_content', { 
        search_term: searchTerm, 
        content_types: contentTypes 
      });

    if (error) throw error;
    return data;
  }

  // System logs
  static async getSystemLogs(filters?: {
    level?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.level) {
      query = query.eq('level', filters.level);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as SystemLog[];
  }

  static async createSystemLog(log: Partial<SystemLog>) {
    const { data, error } = await supabase
      .from('system_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data as SystemLog;
  }

  // City Reports methods
  static async getCityReports(filters?: {
    status?: string;
    category?: string;
    urgency?: string;
    reporter_id?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('city_reports')
        .select(`
          *,
          reporter:profiles!city_reports_reporter_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.urgency && filters.urgency !== 'all') {
        query = query.eq('urgency', filters.urgency);
      }
      if (filters?.reporter_id) {
        query = query.eq('reporter_id', filters.reporter_id);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CityReport[];
    } catch (error) {
      console.error('Error fetching city reports:', error);
      throw error;
    }
  }

  static async getCityReportById(id: string) {
    try {
      const { data, error } = await supabase
        .from('city_reports')
        .select(`
          *,
          reporter:profiles!city_reports_reporter_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CityReport;
    } catch (error) {
      console.error('Error fetching city report:', error);
      throw error;
    }
  }

  static async createCityReport(report: Partial<CityReport>) {
    try {
      const { data, error } = await supabase
        .from('city_reports')
        .insert([report])
        .select()
        .single();

      if (error) throw error;
      return data as CityReport;
    } catch (error) {
      console.error('Error creating city report:', error);
      throw error;
    }
  }

  static async updateCityReport(id: string, updates: Partial<CityReport>) {
    try {
      const { data, error } = await supabase
        .from('city_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CityReport;
    } catch (error) {
      console.error('Error updating city report:', error);
      throw error;
    }
  }

  static async getCityReportsStats() {
    try {
      const { data, error } = await supabase
        .from('city_reports')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        in_progress: data?.filter(r => r.status === 'in_progress').length || 0,
        resolved: data?.filter(r => r.status === 'resolved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching city reports stats:', error);
      throw error;
    }
  }

  static async searchCityReports(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('city_reports')
        .select(`
          *,
          reporter:profiles!city_reports_reporter_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CityReport[];
    } catch (error) {
      console.error('Error searching city reports:', error);
      throw error;
    }
  }
}
