import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || undefined;
    const active = searchParams.get('active');
    const search = searchParams.get('search') || undefined;

    // Autorizzazione: richiede token Firebase e ruolo admin o moderator
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Token di autorizzazione mancante' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseIdToken(idToken);

    const supabase = getSupabaseAdmin();

    const { data: requester, error: reqErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('firebase_uid', decoded.uid)
      .single();
    if (reqErr || !requester || !['admin', 'moderator'].includes(requester.role)) {
      return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 });
    }

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