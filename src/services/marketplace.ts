import { supabase } from '@/utils/supabaseClient';
import type { Listing, ListingExpanded, ListingImage, FetchListingsParams } from '@/types/marketplace';

export interface ListingReview {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface ListingFavorite {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
}

export interface MarketplaceConversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: 'active' | 'closed' | 'blocked';
  last_message_at: string;
  created_at: string;
  listing?: Listing;
  buyer?: { full_name: string; avatar_url?: string };
  seller?: { full_name: string; avatar_url?: string };
}

export interface MarketplaceMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'offer';
  offer_amount?: number;
  offer_currency?: string;
  is_read: boolean;
  created_at: string;
  sender?: { full_name: string; avatar_url?: string };
}

export async function fetchListings(params: FetchListingsParams) {
  const {
    type,
    query,
    category,
    onlyAvailable,
    onlyVerified,
    sort,
    limit = 24,
    offset = 0,
  } = params;

  let q = supabase.direct
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('type', type)
    .eq('status', 'active')
    .range(offset, offset + limit - 1);

  if (category) q = q.eq('category', category);
  if (onlyAvailable) q = q.eq('is_available', true);
  if (onlyVerified) q = q.eq('verified', true);
  if (query) {
    // Usa text search su title; valutare FTS su titolo+descrizione con indice GIN
    q = q.textSearch('title', query, { config: 'english' }); // 'websearch' is not a valid config, using 'english'
  }

  if (sort === 'prezzo') q = q.order('price_amount', { ascending: true });
  else if (sort === 'rating') q = q.order('average_rating', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  const { data, error, count } = await q;
  if (error) throw error;
  return { data: (data || []) as Listing[], count: count || 0 };
}

export async function fetchListingImages(listingId: string) {
  const { data, error } = await supabase.direct
    .from('listing_images')
    .select('*')
    .eq('listing_id', listingId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data || []) as ListingImage[];
}

export async function fetchListingsWithImages(params: FetchListingsParams) {
  const { data, count } = await fetchListings(params);
  const withImages: ListingExpanded[] = [];
  for (const l of data) {
    const imgs = await fetchListingImages(l.id);
    withImages.push({ ...l, listing_images: imgs });
  }
  return { data: withImages, count };
}

export async function createListing(payload: Partial<Listing>) {
  const { data, error } = await supabase.direct
    .from('listings')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as Listing;
}

export async function uploadListingImage(listingId: string, file: File, position?: number) {
  const bucket = 'marketplace';
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const path = `listings/${listingId}/${fileName}`;
  
  const { error: uploadErr } = await supabase.direct.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (uploadErr) throw uploadErr;
  
  const { data: publicUrl } = supabase.direct.storage.from(bucket).getPublicUrl(path);
  const url = publicUrl.publicUrl;

  // Get next position if not provided
  if (position === undefined) {
    const { data: existingImages } = await supabase.direct
      .from('listing_images')
      .select('position')
      .eq('listing_id', listingId)
      .order('position', { ascending: false })
      .limit(1);
    position = existingImages && existingImages.length > 0 ? existingImages[0].position + 1 : 0;
  }

  const { data: img, error: dbErr } = await supabase.direct
    .from('listing_images')
    .insert({ 
      listing_id: listingId, 
      url,
      position: position || 0
    })
    .select('*')
    .single();
  if (dbErr) throw dbErr;
  return img as ListingImage;
}

export async function uploadMultipleImages(listingId: string, files: File[]) {
  const uploadPromises = files.map((file, index) => 
    uploadListingImage(listingId, file, index)
  );
  
  const results = await Promise.allSettled(uploadPromises);
  const successful: ListingImage[] = [];
  const failed: { file: File; error: any }[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push({ file: files[index], error: result.reason });
    }
  });
  
  return { successful, failed };
}

// ===== LISTING CRUD OPERATIONS =====

export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase.direct
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data as Listing;
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const { data, error } = await supabase.direct
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Listing;
}

export async function deleteListing(id: string) {
  const { error } = await supabase.direct
    .from('listings')
    .update({ status: 'deleted' })
    .eq('id', id);
  if (error) throw error;
}

export async function fetchUserListings(userId: string, status?: string) {
  let query = supabase.direct
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Listing[];
}

// ===== FAVORITES OPERATIONS =====

export async function toggleFavorite(listingId: string, isFav: boolean) {
  if (isFav) {
    const { error } = await supabase.direct
      .from('listing_favorites')
      .delete()
      .eq('listing_id', listingId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.direct
      .from('listing_favorites')
      .insert({ 
        listing_id: listingId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
    if (error) throw error;
  }
}

export async function checkIsFavorite(listingId: string): Promise<boolean> {
  const { data, error } = await supabase.direct
    .from('listing_favorites')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

export async function fetchUserFavorites(userId: string) {
  const { data, error } = await supabase.direct
    .from('listing_favorites')
    .select(`
      *,
      listing:listings(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as (ListingFavorite & { listing: Listing })[];
}

// ===== REVIEWS OPERATIONS =====

export async function createReview(listingId: string, rating: number, comment?: string) {
  const { data, error } = await supabase.direct
    .from('listing_reviews')
    .insert({ 
      listing_id: listingId, 
      rating, 
      comment,
      reviewer_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as ListingReview;
}

export async function fetchListingReviews(listingId: string) {
  const { data, error } = await supabase.direct
    .from('listing_reviews')
    .select(`
      *,
      reviewer:profiles!listing_reviews_reviewer_id_fkey(
        full_name,
        avatar_url
      )
    `)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as ListingReview[];
}

export async function updateReview(reviewId: string, rating: number, comment?: string) {
  const { data, error } = await supabase.direct
    .from('listing_reviews')
    .update({ rating, comment })
    .eq('id', reviewId)
    .select('*')
    .single();
  if (error) throw error;
  return data as ListingReview;
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase.direct
    .from('listing_reviews')
    .delete()
    .eq('id', reviewId);
  if (error) throw error;
}

// ===== CONVERSATIONS & MESSAGES =====

export async function createOrGetConversation(listingId: string, sellerId: string): Promise<MarketplaceConversation> {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error('User not authenticated');
  
  // Check if conversation already exists
  const { data: existing, error: fetchError } = await supabase.direct
    .from('marketplace_conversations')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', currentUser.id)
    .eq('seller_id', sellerId)
    .single();
  
  if (existing) {
    return existing as MarketplaceConversation;
  }
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }
  
  // Create new conversation
  const { data, error } = await supabase.direct
    .from('marketplace_conversations')
    .insert({
      listing_id: listingId,
      buyer_id: currentUser.id,
      seller_id: sellerId
    })
    .select('*')
    .single();
  
  if (error) throw error;
  return data as MarketplaceConversation;
}

// Backwards compatible helper: createConversation expects an object payload in some callers
export async function createConversation(payload: { listing_id: string; buyer_id?: string; seller_id: string } ) : Promise<MarketplaceConversation> {
  // If buyer_id is provided use it, otherwise rely on current auth user
  const buyerId = payload.buyer_id ?? (await supabase.auth.getUser()).data.user?.id;
  if (!buyerId) throw new Error('User not authenticated');

  const { data, error } = await supabase.direct
    .from('marketplace_conversations')
    .insert({
      listing_id: payload.listing_id,
      buyer_id: buyerId,
      seller_id: payload.seller_id
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as MarketplaceConversation;
}

// Backwards compatible getter: can be called either with (id) or with (listingId, buyerId, sellerId)
export async function getConversation(idOrListingId: string, maybeBuyerId?: string, maybeSellerId?: string): Promise<MarketplaceConversation> {
  // If only one argument provided, treat as conversation id
  if (!maybeBuyerId && !maybeSellerId) {
    const { data, error } = await supabase.direct
      .from('marketplace_conversations')
      .select('*')
      .eq('id', idOrListingId)
      .single();
    if (error) throw error;
    return data as MarketplaceConversation;
  }

  // Otherwise fetch by listing/buyer/seller
  const listingId = idOrListingId;
  const buyerId = maybeBuyerId!;
  const sellerId = maybeSellerId!;

  const { data, error } = await supabase.direct
    .from('marketplace_conversations')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .single();

  if (error) throw error;
  return data as MarketplaceConversation;
}

export async function fetchUserConversations(userId: string) {
  const { data, error } = await supabase.direct
    .from('marketplace_conversations')
    .select(`
      *,
      listing:listings(*),
      buyer:profiles!marketplace_conversations_buyer_id_fkey(
        full_name,
        avatar_url
      ),
      seller:profiles!marketplace_conversations_seller_id_fkey(
        full_name,
        avatar_url
      )
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .eq('status', 'active')
    .order('last_message_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as MarketplaceConversation[];
}

export async function sendMessage(
  conversationId: string, 
  content: string, 
  messageType: 'text' | 'image' | 'offer' = 'text',
  offerAmount?: number,
  offerCurrency?: string
) {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error('User not authenticated');
  
  const { data, error } = await supabase.direct
    .from('marketplace_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content,
      message_type: messageType,
      offer_amount: offerAmount,
      offer_currency: offerCurrency
    })
    .select('*')
    .single();
  
  if (error) throw error;
  return data as MarketplaceMessage;
}

export async function fetchConversationMessages(conversationId: string) {
  const { data, error } = await supabase.direct
    .from('marketplace_messages')
    .select(`
      *,
      sender:profiles!marketplace_messages_sender_id_fkey(
        full_name,
        avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return (data || []) as MarketplaceMessage[];
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { error } = await supabase.direct
    .from('marketplace_messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);
  
  if (error) throw error;
}

// ===== IMAGE MANAGEMENT =====

export async function deleteListingImage(imageId: string) {
  // First get the image to delete from storage
  const { data: image, error: fetchError } = await supabase.direct
    .from('listing_images')
    .select('url, listing_id')
    .eq('id', imageId)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Extract path from URL and delete from storage
  if (image?.url) {
    try {
      const urlParts = image.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const path = `listings/${image.listing_id}/${fileName}`;
      await supabase.direct.storage.from('marketplace').remove([path]);
    } catch (storageError) {
      console.warn('Failed to delete from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }
  }
  
  // Delete from database
  const { error } = await supabase.direct
    .from('listing_images')
    .delete()
    .eq('id', imageId);
  
  if (error) throw error;
}

export async function updateImagePosition(imageId: string, position: number) {
  const { error } = await supabase.direct
    .from('listing_images')
    .update({ position })
    .eq('id', imageId);
  
  if (error) throw error;
}

export async function reorderImages(listingId: string, imageIds: string[]) {
  const updates = imageIds.map((imageId, index) => 
    supabase.direct
      .from('listing_images')
      .update({ position: index })
      .eq('id', imageId)
      .eq('listing_id', listingId)
  );
  
  const results = await Promise.allSettled(updates);
  const failed = results.filter(result => result.status === 'rejected');
  
  if (failed.length > 0) {
    throw new Error(`Failed to reorder ${failed.length} images`);
  }
}

export async function getImageMetadata(imageId: string) {
  const { data, error } = await supabase.direct
    .from('listing_images')
    .select('*')
    .eq('id', imageId)
    .single();
  
  if (error) throw error;
  return data as ListingImage;
}

export async function ensureStorageBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.direct.storage.listBuckets();
    const marketplaceBucket = buckets?.find(bucket => bucket.name === 'marketplace');
    
    if (!marketplaceBucket) {
      // Create bucket if it doesn't exist
      const { error } = await supabase.direct.storage.createBucket('marketplace', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('Failed to create storage bucket:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Storage bucket setup error:', error);
    // Don't throw here as the app should still work without storage
  }
}

export async function getImageUploadUrl(fileName: string, listingId: string) {
  const fileExt = fileName.split('.').pop();
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const path = `listings/${listingId}/${uniqueName}`;
  
  const { data, error } = await supabase.direct.storage
    .from('marketplace')
    .createSignedUploadUrl(path);
  
  if (error) throw error;
  return { uploadUrl: data.signedUrl, path };
}

// ===== SEARCH & FILTERS =====

export interface AdvancedSearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  locationRadius?: number;
  type?: string;
  condition?: string;
  tags?: string[];
  hasImages?: boolean;
  hasReviews?: boolean;
  dateFrom?: string;
  dateTo?: string;
  onlyAvailable?: boolean;
  onlyVerified?: boolean;
}

export async function searchListings(searchTerm: string, filters?: AdvancedSearchFilters) {
  let query = supabase.direct
    .from('listings')
    .select(`
      *,
      listing_images(id, image_url, position),
      listing_reviews(id, rating)
    `)
    .eq('status', 'active');
  
  // Apply availability filter
  if (filters?.onlyAvailable !== false) {
    query = query.eq('is_available', true);
  }
  
  // Apply verification filter
  if (filters?.onlyVerified) {
    query = query.eq('is_verified', true);
  }
  
  // Search term
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    // Tags are stored as text[], so ilike won't work directly.
    // For tags, you might need to use a different approach, e.g.,
    // query = query.contains('tags', [searchTerm]);
    // or fetch all and filter in client-side if performance allows.
  }
  
  // Basic filters
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }
  
  // Price range
  if (filters?.minPrice) {
    query = query.gte('price_amount', filters.minPrice);
  }
  
  if (filters?.maxPrice) {
    query = query.lte('price_amount', filters.maxPrice);
  }
  
  // Location
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  
  // Date range
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  
  // Tags filter
  if (filters?.tags && filters.tags.length > 0) {
    // For tags, using 'cs' (contains) operator for array types
    query = query.contains('tags', filters.tags);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  
  let results = (data || []) as any[];
  
  // Post-process filters that require client-side filtering
  if (filters?.hasImages) {
    results = results.filter(listing => listing.listing_images && listing.listing_images.length > 0);
  }
  
  if (filters?.hasReviews) {
    results = results.filter(listing => listing.listing_reviews && listing.listing_reviews.length > 0);
  }
  
  return results.map(listing => ({
    ...listing,
    images: listing.listing_images || [],
    reviews: listing.listing_reviews || [],
    average_rating: listing.listing_reviews?.length > 0 
      ? listing.listing_reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / listing.listing_reviews.length
      : 0
  })) as ListingExpanded[];
}
