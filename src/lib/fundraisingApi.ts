// MyCivitanova - Fundraising API utilities
import { supabase } from '@/utils/supabaseClient';
import { safeSupabaseOperation } from '@/utils/supabaseHelpers';

// Types for fundraising system
export interface FundraisingCampaign {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  goal_amount: number;
  current_amount: number;
  creator_id: string;
  category: 'community' | 'environment' | 'culture' | 'sport' | 'education' | 'health' | 'infrastructure' | 'other';
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'rejected';
  featured_image?: string;
  images?: string[];
  start_date: string;
  end_date: string;
  is_featured: boolean;
  donors_count: number;
  likes_count: number;
  follows_count: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    email: string;
  };
}

export interface Donation {
  id: string;
  campaign_id: string;
  donor_id?: string;
  donor_name?: string;
  donor_email?: string;
  amount: number;
  is_anonymous: boolean;
  message?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  campaign?: FundraisingCampaign;
  donor?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CampaignUpdate {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  campaign?: FundraisingCampaign;
}

export interface CampaignLike {
  id: string;
  campaign_id: string;
  user_id: string;
  created_at: string;
}

export interface CampaignFollow {
  id: string;
  campaign_id: string;
  user_id: string;
  created_at: string;
}

// API functions for fundraising campaigns
export class FundraisingAPI {
  // Campaign CRUD operations
  static async getCampaigns(filters?: {
    status?: string;
    category?: string;
    creator_id?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    return safeSupabaseOperation(async () => {
      let query = supabase
        .from('fundraising_campaigns')
        .select(`
          *,
          creator:profiles!fundraising_campaigns_creator_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.creator_id) {
        query = query.eq('creator_id', filters.creator_id);
      }
      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FundraisingCampaign[];
    }, []);
  }

  static async getCampaignById(id: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('fundraising_campaigns')
        .select(`
          *,
          creator:profiles!fundraising_campaigns_creator_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as FundraisingCampaign;
    });
  }

  static async createCampaign(campaignData: Partial<FundraisingCampaign>) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('fundraising_campaigns')
        .insert({
          ...campaignData,
          status: 'pending', // All new campaigns start as pending for admin approval
          current_amount: 0,
          donors_count: 0,
          likes_count: 0,
          follows_count: 0,
          is_featured: false
        })
        .select(`
          *,
          creator:profiles!fundraising_campaigns_creator_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data as FundraisingCampaign;
    });
  }

  static async updateCampaign(id: string, updates: Partial<FundraisingCampaign>) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('fundraising_campaigns')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          creator:profiles!fundraising_campaigns_creator_id_fkey(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data as FundraisingCampaign;
    });
  }

  static async deleteCampaign(id: string) {
    return safeSupabaseOperation(async () => {
      const { error } = await supabase
        .from('fundraising_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    });
  }

  // Admin functions
  static async approveCampaign(id: string, adminNotes?: string) {
    return this.updateCampaign(id, {
      status: 'active',
      admin_notes: adminNotes
    });
  }

  static async rejectCampaign(id: string, adminNotes?: string) {
    return this.updateCampaign(id, {
      status: 'rejected',
      admin_notes: adminNotes
    });
  }

  static async toggleFeatured(id: string, featured: boolean) {
    return this.updateCampaign(id, { is_featured: featured });
  }

  // Donation functions
  static async getDonations(filters?: {
    campaign_id?: string;
    donor_id?: string;
    payment_status?: string;
    limit?: number;
    offset?: number;
  }) {
    return safeSupabaseOperation(async () => {
      let query = supabase
        .from('donations')
        .select(`
          *,
          campaign:fundraising_campaigns(
            id,
            title,
            featured_image
          ),
          donor:profiles!donations_donor_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }
      if (filters?.donor_id) {
        query = query.eq('donor_id', filters.donor_id);
      }
      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Donation[];
    }, []);
  }

  static async createDonation(donationData: Partial<Donation>) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('donations')
        .insert({
          ...donationData,
          payment_status: 'pending' // Start as pending, will be updated by payment processor
        })
        .select(`
          *,
          campaign:fundraising_campaigns(
            id,
            title,
            featured_image
          ),
          donor:profiles!donations_donor_id_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data as Donation;
    });
  }

  static async updateDonationStatus(id: string, status: Donation['payment_status'], transactionId?: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('donations')
        .update({
          payment_status: status,
          transaction_id: transactionId
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Donation;
    });
  }

  // Campaign updates
  static async getCampaignUpdates(campaignId: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('campaign_updates')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CampaignUpdate[];
    }, []);
  }

  static async createCampaignUpdate(updateData: Partial<CampaignUpdate>) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('campaign_updates')
        .insert(updateData)
        .select()
        .single();

      if (error) throw error;
      return data as CampaignUpdate;
    });
  }

  // Like/Follow functions
  static async toggleLike(campaignId: string, userId: string) {
    return safeSupabaseOperation(async () => {
      // Check if like exists
      const { data: existingLike, error: fetchError } = await supabase
        .from('campaign_likes')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingLike) {
        // Remove like
        const { error: deleteError } = await supabase
          .from('campaign_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;
        return { liked: false };
      } else {
        // Add like
        const { error: insertError } = await supabase
          .from('campaign_likes')
          .insert({ campaign_id: campaignId, user_id: userId });

        if (insertError) throw insertError;
        return { liked: true };
      }
    });
  }

  static async toggleFollow(campaignId: string, userId: string) {
    return safeSupabaseOperation(async () => {
      // Check if follow exists
      const { data: existingFollow, error: fetchError } = await supabase
        .from('campaign_follows')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingFollow) {
        // Remove follow
        const { error: deleteError } = await supabase
          .from('campaign_follows')
          .delete()
          .eq('id', existingFollow.id);

        if (deleteError) throw deleteError;
        return { following: false };
      } else {
        // Add follow
        const { error: insertError } = await supabase
          .from('campaign_follows')
          .insert({ campaign_id: campaignId, user_id: userId });

        if (insertError) throw insertError;
        return { following: true };
      }
    });
  }

  static async getUserLikeStatus(campaignId: string, userId: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('campaign_likes')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { liked: !!data };
    }, { liked: false });
  }

  static async getUserFollowStatus(campaignId: string, userId: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('campaign_follows')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { following: !!data };
    }, { following: false });
  }

  // Statistics
  static async getCampaignStats(campaignId: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('fundraising_campaigns')
        .select('current_amount, goal_amount, donors_count, likes_count, follows_count')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return {
        ...data,
        progress_percentage: data.goal_amount > 0 ? (data.current_amount / data.goal_amount) * 100 : 0
      };
    });
  }

  static async getTotalFundraisingStats() {
    return safeSupabaseOperation(async () => {
      // Get total campaigns count
      const { count: totalCampaigns } = await supabase
        .from('fundraising_campaigns')
        .select('*', { count: 'exact', head: true });

      // Get active campaigns count
      const { count: activeCampaigns } = await supabase
        .from('fundraising_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total raised amount
      const { data: campaigns } = await supabase
        .from('fundraising_campaigns')
        .select('current_amount');

      const totalRaised = campaigns?.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0) || 0;

      // Get total unique donors count
      const { count: totalDonors } = await supabase
        .from('donations')
        .select('donor_email', { count: 'exact', head: true });

      return {
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns: activeCampaigns || 0,
        totalRaised: totalRaised,
        activeDonors: totalDonors || 0
      };
    }, {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalRaised: 0,
      activeDonors: 0
    });
  }

  // Campaign Updates
  static async getCampaignUpdates(campaignId: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('campaign_updates')
        .select(`
          *,
          fundraising_campaigns!inner(creator_name)
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(update => ({
        ...update,
        author_name: update.fundraising_campaigns.creator_name
      }));
    }, []);
  }

  static async createCampaignUpdate(updateData: {
    campaign_id: string;
    title: string;
    content: string;
    is_milestone?: boolean;
  }) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('campaign_updates')
        .insert([updateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
   }

  // Donor Notifications
  static async getDonorNotifications(userId: string) {
    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('donor_notifications')
        .select(`
          *,
          fundraising_campaigns!inner(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data.map(notification => ({
         ...notification,
         campaign_title: notification.fundraising_campaigns.title
       }));
     }, []);
   }

  static async markNotificationAsRead(notificationId: string) {
    return safeSupabaseOperation(async () => {
      const { error } = await supabase
        .from('donor_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    });
  }

  static async markAllNotificationsAsRead(userId: string) {
    return safeSupabaseOperation(async () => {
      const { error } = await supabase
        .from('donor_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    });
  }

  // Alias methods for compatibility
  static async getApprovedCampaigns(filters?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.getCampaigns({
      ...filters,
      status: 'active'
    });
  }

  static async getStats() {
    return this.getTotalFundraisingStats();
  }
}

// Helper functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const calculateProgress = (current: number, goal: number): number => {
  if (goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

export const getCampaignStatusColor = (status: FundraisingCampaign['status']) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'completed':
      return 'text-blue-600 bg-blue-100';
    case 'cancelled':
    case 'rejected':
      return 'text-red-600 bg-red-100';
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getCampaignStatusText = (status: FundraisingCampaign['status']) => {
  switch (status) {
    case 'active':
      return 'Attiva';
    case 'pending':
      return 'In attesa';
    case 'completed':
      return 'Completata';
    case 'cancelled':
      return 'Annullata';
    case 'rejected':
      return 'Rifiutata';
    case 'draft':
      return 'Bozza';
    default:
      return 'Sconosciuto';
  }
};