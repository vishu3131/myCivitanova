import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || undefined;

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role,
        is_active,
        is_verified,
        privacy_settings,
        notification_settings,
        firebase_uid,
        firebase_created_at,
        firebase_last_sign_in,
        last_sync_at,
        sync_status,
        total_xp,
        current_level,
        badges_count,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (active === 'true' || active === 'false') {
      query = query.eq('is_active', active === 'true');
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (!Number.isNaN(limit)) {
      const from = offset || 0;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}