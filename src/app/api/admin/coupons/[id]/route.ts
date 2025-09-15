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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const supabase = auth.supabase;

    const body = await req.json();
    const updates: any = { ...body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ coupon: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const supabase = auth.supabase;

    const { error } = await supabase.from('coupons').delete().eq('id', params.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
