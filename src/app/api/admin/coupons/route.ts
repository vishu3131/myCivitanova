import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const idToken = authHeader.split(' ')[1];
  const decoded = await verifyFirebaseIdToken(idToken);
  const supabase = getSupabaseAdmin();
  const { data: requester } = await supabase
    .from('profiles')
    .select('role')
    .eq('firebase_uid', decoded.uid)
    .single();
  if (!requester || !['admin', 'moderator'].includes(requester.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { supabase };
}

// GET list coupons
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const supabase = auth.supabase;

    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const merchant_id = url.searchParams.get('merchant_id') || undefined;
    const active = url.searchParams.get('active');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let query: any = supabase
      .from('coupons')
      .select('*, merchant:merchants(id, name, slug)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    if (merchant_id) query = query.eq('merchant_id', merchant_id);
    if (active === 'true' || active === 'false') query = query.eq('is_active', active === 'true');

    if (!Number.isNaN(limit)) query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ coupons: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}

// POST create coupon
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const supabase = auth.supabase;

    const body = await req.json();
    const {
      merchant_id, title, description, category,
      type, discount_percent, fixed_price, currency,
      code_type, code_prefix, generic_code,
      max_total_redemptions, max_per_user,
      starts_at, expires_at, days_of_week, time_windows,
      terms, is_featured, is_active, visibility, targeting_tags
    } = body || {};

    if (!merchant_id || !title || !type) {
      return NextResponse.json({ error: 'merchant_id, title e type sono obbligatori' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        merchant_id, title, description, category,
        type, discount_percent, fixed_price, currency,
        code_type, code_prefix, generic_code,
        max_total_redemptions, max_per_user,
        starts_at, expires_at, days_of_week, time_windows,
        terms, is_featured, is_active, visibility, targeting_tags
      }])
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ coupon: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
