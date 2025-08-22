export type Listing = {
  id: string;
  user_id: string;
  type: 'beni' | 'servizi';
  title: string;
  description?: string | null;
  price_amount?: number | null;
  price_currency?: 'EUR' | 'USD' | 'GBP' | 'CHF' | 'JPY' | null;
  price_type?: 'fixed' | 'hourly' | 'free' | 'negotiable' | 'on_request' | null;
  status: 'active' | 'sold' | 'paused' | 'deleted';
  is_available: boolean;
  verified: boolean;
  category?: string | null;
  tags?: string[] | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  images_count: number;
  favorites_count: number;
  reviews_count: number;
  average_rating?: number | null;
  created_at: string;
  updated_at: string;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  url: string;
  position: number;
  created_at: string;
};

export type ListingFavorite = {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
};

export type ListingReview = {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number; // 1..5
  comment?: string | null;
  created_at: string;
};

export type ListingExpanded = Listing & {
  listing_images?: ListingImage[];
};

export type FetchListingsParams = {
  type: 'beni' | 'servizi';
  query?: string;
  category?: string | null;
  onlyAvailable?: boolean;
  onlyVerified?: boolean;
  sort?: 'recenti' | 'prezzo' | 'rating';
  limit?: number;
  offset?: number;
};

export type MarketplaceConversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: 'active' | 'closed';
  last_message?: string | null;
  last_message_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  listing?: Listing;
  buyer?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  seller?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
};

export type MarketplaceMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at?: string | null;
  created_at: string;
  sender?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
};

export type ImageUploadResult = {
  success: boolean;
  image?: ListingImage;
  error?: string;
};

export type ImageMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  position: number;
  created_at: string;
};
