import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

function generateCode(prefix = 'CIVI', length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let body = '';
  for (let i = 0; i < length; i++) body += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${body}`;
}

function isWithinTimeWindow(now: Date, coupon: any) {
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return false;
  if (coupon.expires_at && new Date(coupon.expires_at) < now) return false;
  if (coupon.days_of_week && coupon.days_of_week.length) {
    const dow = ((now.getDay() + 6) % 7) + 1; // Mon=1..Sun=7
    if (!coupon.days_of_week.includes(dow)) return false;
  }
  if (coupon.time_windows && coupon.time_windows.length) {
    const hhmm = now.toTimeString().slice(0, 5);
    const ok = coupon.time_windows.some((w: any) => w.start <= hhmm && hhmm <= w.end);
    if (!ok) return false;
  }
  return true;
}

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
    // Load coupon with merchant
    const { data: coupon, error: errCoupon } = await supabase
      .from('coupons')
      .select('*, merchant:merchants(id, name, slug)')
      .eq('id', couponId)
      .maybeSingle();
    if (errCoupon) throw errCoupon;
    if (!coupon || !coupon.is_active) return NextResponse.json({ error: 'Coupon non disponibile' }, { status: 400 });

    // Check time constraints
    const now = new Date();
    if (!isWithinTimeWindow(now, coupon)) {
      return NextResponse.json({ error: 'Coupon non valido in questo momento' }, { status: 400 });
    }

    // Check per-user limit: count redeemed + currently assigned instances
    const { count: redeemedCount, error: redeemedErr } = await supabase
      .from('coupon_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', couponId)
      .eq('user_id', uid);
    if (redeemedErr) throw redeemedErr;

    const { count: assignedCount, error: assignedErr } = await supabase
      .from('coupon_instances')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', couponId)
      .eq('assigned_to_user_id', uid)
      .in('status', ['assigned']);
    if (assignedErr) throw assignedErr;

    const totalUserCount = (redeemedCount || 0) + (assignedCount || 0);
    if (totalUserCount >= (coupon.max_per_user || 1)) {
      return NextResponse.json({ error: 'Hai già raggiunto il limite per questo coupon' }, { status: 400 });
    }

    // Check total stock
    if (coupon.max_total_redemptions) {
      const { count: totCount, error: totErr } = await supabase
        .from('coupon_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', couponId);
      if (totErr) throw totErr;
      if ((totCount || 0) >= coupon.max_total_redemptions) {
        return NextResponse.json({ error: 'Codici esauriti' }, { status: 400 });
      }
    }

    // Try to find a pre-generated available instance
    let { data: instance, error: instErr } = await supabase
      .from('coupon_instances')
      .select('*')
      .eq('coupon_id', couponId)
      .eq('status', 'available')
      .limit(1)
      .maybeSingle();
    if (instErr) throw instErr;

    // If none, generate a new one with unique code
    if (!instance) {
      const code = generateCode(coupon.code_prefix || 'CIVI', 8);
      const { data: created, error: createErr } = await supabase
        .from('coupon_instances')
        .insert({ coupon_id: couponId, code, status: 'available' })
        .select('*')
        .single();
      if (createErr) throw createErr;
      instance = created;
    }

    // Assign to user atomically (optimistic lock on status)
    const { data: assigned, error: assignErr } = await supabase
      .from('coupon_instances')
      .update({ status: 'assigned', assigned_to_user_id: uid, assigned_at: new Date().toISOString() })
      .eq('id', instance.id)
      .eq('status', 'available')
      .select('*')
      .single();

    if (assignErr) {
      // If conflict (already taken), retry once by creating a fresh code
      const code = generateCode(coupon.code_prefix || 'CIVI', 8);
      const { data: created2, error: createErr2 } = await supabase
        .from('coupon_instances')
        .insert({ coupon_id: couponId, code, status: 'assigned', assigned_to_user_id: uid, assigned_at: new Date().toISOString() })
        .select('*')
        .single();
      if (createErr2) throw createErr2;
      return NextResponse.json({ code: created2.code, coupon_id: couponId, assigned_at: created2.assigned_at }, { status: 200 });
    }

    return NextResponse.json({ code: assigned.code, coupon_id: couponId, assigned_at: assigned.assigned_at }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/coupons/[id]/claim error:', err);
    return NextResponse.json({ error: err.message || 'Impossibile ottenere il codice' }, { status: 400 });
  }
}
