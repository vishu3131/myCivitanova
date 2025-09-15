import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import { verifyFirebaseIdToken, adminFirestore, adminAuth } from '@/utils/firebaseAdmin';
import { randomUUID } from 'crypto';
// Simple in-memory rate limiting per IP (best-effort, per runtime instance)
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000; // 1 minuto
const ipHits: Map<string, { count: number; windowStart: number }> = new Map();

export async function POST(req: Request) {
  try {
    // Rate limiting per IP
    const ipHeader = req.headers.get('x-forwarded-for') || '';
    const clientIp = ipHeader.split(',')[0]?.trim() || 'unknown';
    const nowMs = Date.now();
    const rec = ipHits.get(clientIp);
    if (!rec || nowMs - rec.windowStart > WINDOW_MS) {
      ipHits.set(clientIp, { count: 1, windowStart: nowMs });
    } else {
      rec.count += 1;
      ipHits.set(clientIp, rec);
      if (rec.count > RATE_LIMIT) {
        const res = NextResponse.json({ error: 'Troppi tentativi, riprova più tardi' }, { status: 429 });
        res.headers.set('Retry-After', '60');
        return res;
      }
    }

    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 401 });
    }

    const idToken = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseIdToken(idToken);

    const uid = decoded.uid;
    const email = decoded.email || '';
    const emailVerified = !!decoded.email_verified;
    const name = (decoded as any).name as string | undefined;
    const picture = (decoded as any).picture as string | undefined;
    const phoneNumber = (decoded as any).phone_number as string | undefined;

    // Recupera profilo aggiuntivo da Firestore (facoltativo)
    let firestoreProfile: Record<string, any> = {};
    try {
      const snap = await adminFirestore().doc(`profiles/${uid}`).get();
      if (snap.exists) firestoreProfile = snap.data() || {};
    } catch {
      // opzionale, ignora errori Firestore
    }

    const nowIso = new Date().toISOString();

    const supabase = getSupabaseAdmin();

    // Verifica esistenza profilo
    let existingProfile = null;
    try {
      const sel = await supabase.from('profiles').select('*').eq('firebase_uid', uid).maybeSingle();
      existingProfile = sel.data || null;
      if (sel.error && sel.error.code !== 'PGRST116') {
        throw sel.error;
      }
    } catch (err: any) {
      console.error('Errore lettura profilo:', err);
      return NextResponse.json({ error: 'Errore lettura profilo', details: err?.message || String(err) }, { status: 500 });
    }

    const baseData: any = {
      firebase_uid: uid,
      email,
      full_name: firestoreProfile.fullName || name || '',
      username: firestoreProfile.username || undefined,
      phone: firestoreProfile.phone || phoneNumber || undefined,
      // Non consentire escalation del ruolo da Firestore: mantieni il ruolo esistente o default 'user'
      role: existingProfile?.role || 'user',
      avatar_url: firestoreProfile.avatarUrl || picture || undefined,
      is_active: firestoreProfile.isActive ?? true,
      is_verified: emailVerified,
      firebase_created_at: firestoreProfile.metadata?.creationTime || undefined,
      firebase_last_sign_in: firestoreProfile.metadata?.lastSignInTime || undefined,
      last_sync_at: nowIso,
      sync_status: 'synced',
      updated_at: nowIso,
    };

    let profileId: string | null = null;
    let syncType: 'create' | 'update' = 'update';

    const startedAt = Date.now();
    const userAgent = req.headers.get('user-agent') || '';
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const trigger = req.headers.get('x-sync-trigger') || 'api/sync/user';

    // Esegui update o insert con retry su errori transitori
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (existingProfile) {
          const upd = await supabase.from('profiles').update(baseData).eq('id', existingProfile.id).select('id').single();
          if (upd.error) throw upd.error;
          profileId = upd.data.id;
          syncType = 'update';
        } else {
          // Genera sempre un UUID lato server per evitare id null se la colonna non ha default
          const insertData = { id: randomUUID(), ...baseData, created_at: nowIso };
          const ins = await supabase.from('profiles').insert(insertData).select('id').single();
          if (ins.error) throw ins.error;
          profileId = ins.data.id;
          syncType = 'create';
        }
        break; // successo
      } catch (err: any) {
        console.error(`Errore durante insert/update (attempt ${attempt}):`, err?.message || err);
        // se ultimo tentativo logga e rispondi
        if (attempt === maxAttempts) {
          await supabase.from('sync_logs').insert({
            firebase_uid: uid,
            sync_type: existingProfile ? 'update' : 'create',
            sync_status: 'error',
            error_message: err?.message || String(err),
            sync_duration_ms: Date.now() - startedAt,
            firebase_data: { uid, email, emailVerified },
            supabase_data: { op: existingProfile ? 'update' : 'create', userAgent, forwardedFor, trigger },
            created_at: nowIso,
          });
          return NextResponse.json({ error: existingProfile ? 'Errore aggiornamento profilo' : 'Errore creazione profilo', details: err?.message || String(err) }, { status: 500 });
        }
        // backoff semplice
        await new Promise(r => setTimeout(r, 200 * attempt));
      }
    }

    // Aggiorna mapping UID
    try {
      await supabase
        .from('firebase_user_mapping')
        .upsert({ firebase_uid: uid, supabase_uuid: profileId, updated_at: nowIso }, { onConflict: 'firebase_uid' });
    } catch {}

    // Log di sincronizzazione
    try {
      await supabase.from('sync_logs').insert({
        firebase_uid: uid,
        profile_id: profileId,
        sync_type: syncType,
        sync_status: 'success',
        firebase_data: {
          uid,
          email,
          emailVerified,
          hasFirestoreProfile: Object.keys(firestoreProfile).length > 0,
        },
        supabase_data: {
          profileId,
          syncType,
          userAgent,
          forwardedFor,
          trigger,
        },
        sync_duration_ms: Date.now() - startedAt,
        created_at: nowIso,
      });
    } catch {}

    // Aggiorna last login info nel profilo se disponibile da Admin SDK
    try {
      const userRecord = await adminAuth().getUser(uid);
      if (userRecord?.metadata) {
        await supabase.from('profiles')
          .update({ firebase_created_at: userRecord.metadata.creationTime, firebase_last_sign_in: userRecord.metadata.lastSignInTime })
          .eq('id', profileId as string);
      }
    } catch {}

    return NextResponse.json({ success: true, profileId, syncType });
  } catch (error: any) {
    const message = error?.message || 'Errore interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}