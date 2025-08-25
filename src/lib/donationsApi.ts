import { supabase } from '@/utils/supabaseClient.ts';

export interface Donation {
  id: string;
  campaign_id: string;
  donor_id?: string;
  amount: number;
  currency: string;
  donor_name?: string;
  donor_email?: string;
  is_anonymous: boolean;
  message?: string;
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference?: string;
  transaction_fee: number;
  net_amount: number;
  is_recurring: boolean;
  recurring_frequency?: string;
  next_payment_date?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDonationData {
  campaign_id: string;
  amount: number;
  donor_name?: string;
  donor_email?: string;
  is_anonymous?: boolean;
  message?: string;
  payment_method?: string;
  donor_id?: string;
}

export interface DonationStats {
  total_amount: number;
  total_donations: number;
  average_donation: number;
  recent_donations: Donation[];
}

/**
 * Crea una nuova donazione
 */
export async function createDonation(donationData: CreateDonationData) {
  try {
    // Calcola il net_amount (assumendo una commissione del 3%)
    const transactionFee = donationData.amount * 0.03;
    const netAmount = donationData.amount - transactionFee;

    const { data, error } = await supabase
      .from('donations')
      .insert({
        ...donationData,
        transaction_fee: transactionFee,
        net_amount: netAmount,
        payment_status: 'pending',
        currency: 'EUR'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating donation:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createDonation:', error);
    throw error;
  }
}

/**
 * Aggiorna lo stato di pagamento di una donazione
 */
export async function updateDonationStatus(
  donationId: string, 
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  paymentReference?: string
) {
  try {
    const updateData: any = {
      payment_status: status,
      updated_at: new Date().toISOString()
    };

    if (paymentReference) {
      updateData.payment_reference = paymentReference;
    }

    const { data, error } = await supabase
      .from('donations')
      .update(updateData)
      .eq('id', donationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating donation status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateDonationStatus:', error);
    throw error;
  }
}

/**
 * Ottiene le donazioni per una campagna specifica
 */
export async function getCampaignDonations(
  campaignId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching campaign donations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCampaignDonations:', error);
    throw error;
  }
}

/**
 * Ottiene le statistiche delle donazioni per una campagna
 */
export async function getCampaignDonationStats(campaignId: string): Promise<DonationStats> {
  try {
    // Ottieni tutte le donazioni completate per la campagna
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching donation stats:', error);
      throw error;
    }

    const donationsList = donations || [];
    const totalAmount = donationsList.reduce((sum, donation) => sum + donation.amount, 0);
    const totalDonations = donationsList.length;
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    return {
      total_amount: totalAmount,
      total_donations: totalDonations,
      average_donation: averageDonation,
      recent_donations: donationsList.slice(0, 10) // Ultime 10 donazioni
    };
  } catch (error) {
    console.error('Error in getCampaignDonationStats:', error);
    throw error;
  }
}

/**
 * Ottiene le donazioni pubbliche (non anonime) per una campagna
 */
export async function getPublicDonations(
  campaignId: string,
  limit: number = 20
) {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('amount, donor_name, message, created_at, is_anonymous')
      .eq('campaign_id', campaignId)
      .eq('payment_status', 'completed')
      .eq('is_anonymous', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching public donations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPublicDonations:', error);
    throw error;
  }
}

/**
 * Simula un pagamento (per testing)
 */
export async function simulatePayment(
  donationId: string,
  success: boolean = true
) {
  try {
    const status = success ? 'completed' : 'failed';
    const paymentReference = success ? `PAY_${Date.now()}` : undefined;

    return await updateDonationStatus(donationId, status, paymentReference);
  } catch (error) {
    console.error('Error in simulatePayment:', error);
    throw error;
  }
}