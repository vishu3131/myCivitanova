import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

// GET /api/coupons?merchant_slug=&category=&q=
// Returns active coupons with basic merchant info - requires auth
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const merchantSlug = url.searchParams.get('merchant_slug');
  const category = url.searchParams.get('category');
  const q = url.searchParams.get('q');

  // Require auth token
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    await verifyFirebaseIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Build dynamic filter
    let query = supabase
      .from('coupons')
      .select('*, merchant:merchants!inner(id, name, slug, category, logo_url, is_active)')
      .eq('is_active', true);

    const nowIso = new Date().toISOString();
    query = query.or(`starts_at.is.null,starts_at.lte.${nowIso}`);
    query = query.or(`expires_at.is.null,expires_at.gte.${nowIso}`);

    if (merchantSlug) query = query.eq('merchant.slug', merchantSlug as any);
    if (category) query = query.eq('category', category);
    if (q) {
      // Simple ILIKE filter on title/description
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ coupons: data || [] }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/coupons error:', err);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}
