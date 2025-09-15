import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let uid: string;
  try {
    const decoded = await verifyFirebaseIdToken(token);
    uid = decoded.uid;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const couponId = params.id;
  const supabase = getSupabaseAdmin();

  try {
    const body = await req.json().catch(() => ({}));
    const code: string | undefined = body.code;
    if (!code) return NextResponse.json({ error: 'Codice richiesto' }, { status: 400 });

    // Load coupon & instance by code
    const { data: instance, error: instErr } = await supabase
      .from('coupon_instances')
      .select('*, coupon:coupons(id, merchant_id, is_active, expires_at)')
      .eq('coupon_id', couponId)
      .eq('code', code)
      .maybeSingle();
    if (instErr) throw instErr;
    if (!instance) return NextResponse.json({ error: 'Codice non valido' }, { status: 400 });
    if (!instance.coupon?.is_active) return NextResponse.json({ error: 'Coupon non attivo' }, { status: 400 });

    // Ownership & status
    if (instance.assigned_to_user_id !== uid) {
      return NextResponse.json({ error: 'Codice non assegnato a te' }, { status: 403 });
    }
    if (instance.status === 'redeemed') {
      return NextResponse.json({ error: 'Codice già utilizzato' }, { status: 400 });
    }
    if (instance.coupon.expires_at && new Date(instance.coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Coupon scaduto' }, { status: 400 });
    }

    // Mark instance redeemed
    const nowIso = new Date().toISOString();
    const { data: updatedInst, error: updErr } = await supabase
      .from('coupon_instances')
      .update({ status: 'redeemed', redeemed_at: nowIso })
      .eq('id', instance.id)
      .eq('status', 'assigned')
      .select('*')
      .single();
    if (updErr) throw updErr;

    // Insert redemption row
    const { error: insErr } = await supabase
      .from('coupon_redemptions')
      .insert({
        coupon_id: instance.coupon.id,
        coupon_instance_id: instance.id,
        user_id: uid,
        merchant_id: instance.coupon.merchant_id,
        redeemed_at: nowIso,
      });
    if (insErr) throw insErr;

    return NextResponse.json({ success: true, redeemed_at: nowIso });
  } catch (err: any) {
    console.error('POST /api/coupons/[id]/redeem error:', err);
    return NextResponse.json({ error: err.message || 'Impossibile redimere il codice' }, { status: 400 });
  }
}
