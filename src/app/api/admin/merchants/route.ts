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

// GET: list merchants
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const supabase = auth.supabase;

    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const active = url.searchParams.get('active');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let query = supabase.from('merchants').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    if (active === 'true' || active === 'false') query = query.eq('is_active', active === 'true');

    if (!Number.isNaN(limit)) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ merchants: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}

// POST: create merchant
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const supabase = auth.supabase;

    const body = await req.json();
    const { name, slug, description, category, address, phone, website, logo_url, is_active = true } = body || {};
    if (!name || !slug) {
      return NextResponse.json({ error: 'name e slug sono obbligatori' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('merchants')
      .insert([{ name, slug, description, category, address, phone, website, logo_url, is_active }])
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ merchant: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
