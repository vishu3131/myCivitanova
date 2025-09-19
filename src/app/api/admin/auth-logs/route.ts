import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

/**
 * POST /api/admin/auth-logs
 * Create a new authentication log entry
 */
export async function POST(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseIdToken(idToken);
    const supabase = getSupabaseAdmin();

    // Verify user exists
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('firebase_uid', decoded.uid)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const logData = await request.json();
    
    // Prepare log entry with security data
    const logEntry = {
      ...logData,
      firebase_uid: logData.firebase_uid || decoded.uid,
      user_id: logData.user_id || userProfile.id,
      ip_address: logData.ip_address || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: logData.user_agent || request.headers.get('user-agent') || 'unknown',
      created_at: logData.created_at || new Date().toISOString()
    };

    // Insert log into database
    const { error } = await supabase
      .from('auth_logs')
      .insert(logEntry);

    if (error) {
      console.error('Errore inserimento log:', error);
      return NextResponse.json({ error: 'Errore inserimento log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore API auth-logs POST:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

/**
 * GET /api/admin/auth-logs
 * Retrieve authentication logs (admin only)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const userId = searchParams.get('userId');

    // Verify authorization and admin role
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseIdToken(idToken);
    const supabase = getSupabaseAdmin();

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('firebase_uid', decoded.uid)
      .single();

    if (!adminProfile || !['admin', 'moderator'].includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from('auth_logs')
      .select(`
        *,
        profiles(email, full_name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (action) query = query.eq('action', action);
    if (status) query = query.eq('status', status);
    if (userId) query = query.eq('user_id', userId);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    const { data, error, count } = await query;

    if (error) {
      console.error('Errore recupero logs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      logs: data || [],
      totalCount: count,
      hasMore: (offset + limit) < (count || 0)
    });
  } catch (error) {
    console.error('Errore GET auth-logs:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}