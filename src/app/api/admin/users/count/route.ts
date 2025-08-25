import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const active = searchParams.get('active');
    const search = searchParams.get('search') || undefined;

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (active === 'true' || active === 'false') {
      query = query.eq('is_active', active === 'true');
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { count, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}