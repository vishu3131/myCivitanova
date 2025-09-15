import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

function generateCode(prefix = 'CIVI', length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let body = '';
  for (let i = 0; i < length; i++) body += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${body}`;
}

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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const supabase = auth.supabase;

    const body = await req.json().catch(() => ({}));
    const count = Math.max(1, Math.min(parseInt(body?.count || '50', 10), 500));

    // Load coupon to get prefix
    const { data: coupon, error: cErr } = await supabase
      .from('coupons')
      .select('id, code_prefix')
      .eq('id', params.id)
      .single();
    if (cErr) throw cErr;

    const rows = Array.from({ length: count }).map(() => ({
      coupon_id: coupon.id,
      code: generateCode(coupon.code_prefix || 'CIVI', 8),
      status: 'available'
    }));

    const { error: insErr } = await supabase.from('coupon_instances').insert(rows);
    if (insErr) throw insErr;

    return NextResponse.json({ success: true, generated: rows.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
