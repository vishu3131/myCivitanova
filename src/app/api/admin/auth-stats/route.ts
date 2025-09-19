import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

/**
 * GET /api/admin/auth-stats
 * Get authentication statistics for admin dashboard
 */
export async function GET(request: Request) {
  try {
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get various statistics in parallel
    const [
      totalRegistrationsResult,
      todayRegistrationsResult,
      weekRegistrationsResult,
      successfulLoginsResult,
      failedLoginsResult,
      passwordResetsResult,
      verificationsSentResult,
      activeUsersResult,
      topFailureReasonsResult
    ] = await Promise.allSettled([
      // Total registrations
      supabase
        .from('auth_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'register')
        .eq('status', 'success'),

      // Today's registrations
      supabase
        .from('auth_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'register')
        .eq('status', 'success')
        .gte('created_at', today.toISOString()),

      // Week's registrations
      supabase
        .from('auth_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'register')
        .eq('status', 'success')
        .gte('created_at', weekAgo.toISOString()),

      // Successful logins (last 30 days)
      supabase
        .from('auth_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'login')
        .eq('status', 'success')
        .gte('created_at', monthAgo.toISOString()),

      // Failed logins (last 30 days)
      supabase
        .from('auth_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'failed_login')
        .gte('created_at', monthAgo.toISOString()),

      // Password resets (last 30 days)
      supabase
        .from('auth_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'password_reset')
        .gte('created_at', monthAgo.toISOString()),

      // Email verifications sent (last 30 days)
      supabase
        .from('auth_logs')
        .select('id', { count: 'exact' })
        .eq('action', 'email_verify')
        .gte('created_at', monthAgo.toISOString()),

      // Active users (users who logged in last 7 days)
      supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
        .gte('firebase_last_sign_in', weekAgo.toISOString()),

      // Top failure reasons
      supabase
        .from('auth_logs')
        .select('error_message')
        .eq('status', 'failed')
        .not('error_message', 'is', null)
        .gte('created_at', monthAgo.toISOString())
        .limit(1000)
    ]);

    // Process results safely
    const getCount = (result: PromiseSettledResult<any>) => {
      return result.status === 'fulfilled' && result.value.count !== null ? result.value.count : 0;
    };

    const getData = (result: PromiseSettledResult<any>) => {
      return result.status === 'fulfilled' ? result.value.data : [];
    };

    // Process top failure reasons
    const failureData = getData(topFailureReasonsResult);
    const failureReasons = failureData.reduce((acc: Record<string, number>, log: any) => {
      const reason = log.error_message || 'Errore sconosciuto';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    const topFailureReasons = Object.entries(failureReasons)
      .map(([reason, count]) => ({ reason, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const stats = {
      totalRegistrations: getCount(totalRegistrationsResult),
      todayRegistrations: getCount(todayRegistrationsResult),
      weekRegistrations: getCount(weekRegistrationsResult),
      successfulLogins: getCount(successfulLoginsResult),
      failedLogins: getCount(failedLoginsResult),
      passwordResets: getCount(passwordResetsResult),
      verificationsSent: getCount(verificationsSentResult),
      activeUsers: getCount(activeUsersResult),
      topFailureReasons
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Errore GET auth-stats:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}