import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, role } = body || {};

    if ((!id && !email) || !role) {
      return NextResponse.json({ error: 'Provide user id or email, and role' }, { status: 400 });
    }

    // Valida ruolo richiesto
    const allowedRoles = new Set(['user', 'moderator', 'admin', 'staff']);
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 });
    }

    // Autorizzazione: richiede token Firebase e ruolo admin
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Token di autorizzazione mancante' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseIdToken(idToken);

    const supabase = getSupabaseAdmin();

    // Recupera profilo del richiedente
    const { data: requesterProfile, error: requesterError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('firebase_uid', decoded.uid)
      .single();

    if (requesterError || !requesterProfile) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }
    if (requesterProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Permessi insufficienti' }, { status: 403 });
    }

    let userId = id as string | undefined;

    if (!userId && email) {
      const { data: profileByEmail, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .single();

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 404 });
      }

      userId = profileByEmail?.id;

      if (!userId) {
        return NextResponse.json({ error: `User with email ${email} not found.` }, { status: 404 });
      }
    }

    // Impedisci auto-downgrade dell'admin
    if (userId === requesterProfile.id && role !== 'admin') {
      return NextResponse.json({ error: 'Non puoi modificare il tuo ruolo di amministratore' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId as string)
      .select('id, email, role')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: `Role updated`, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}