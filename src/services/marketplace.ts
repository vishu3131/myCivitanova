import { supabase } from '@/utils/supabaseClient';
import type { Listing, ListingExpanded, ListingImage, FetchListingsParams } from '@/types/marketplace';

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

  let q = supabase
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
    q = q.textSearch('title', query, { type: 'websearch' });
  }

  if (sort === 'prezzo') q = q.order('price_amount', { ascending: true, nullsFirst: false });
  else if (sort === 'rating') q = q.order('average_rating', { ascending: false, nullsFirst: true });
  else q = q.order('created_at', { ascending: false });

  const { data, error, count } = await q;
  if (error) throw error;
  return { data: (data || []) as Listing[], count: count || 0 };
}

export async function fetchListingImages(listingId: string) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('listings')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as Listing;
}

export async function uploadListingImage(listingId: string, file: File) {
  const bucket = 'marketplace';
  const path = `${listingId}/${Date.now()}_${file.name}`;
  const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file);
  if (uploadErr) throw uploadErr;
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
  const url = publicUrl.publicUrl;

  const { data: img, error: dbErr } = await supabase
    .from('listing_images')
    .insert({ listing_id: listingId, url })
    .select('*')
    .single();
  if (dbErr) throw dbErr;
  return img as ListingImage;
}

export async function toggleFavorite(listingId: string, isFav: boolean) {
  if (isFav) {
    const { error } = await supabase.from('listing_favorites').delete().eq('listing_id', listingId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('listing_favorites').insert({ listing_id: listingId });
    if (error) throw error;
  }
}

export async function createReview(listingId: string, rating: number, comment?: string) {
  const { error } = await supabase
    .from('listing_reviews')
    .insert({ listing_id: listingId, rating, comment });
  if (error) throw error;
}
