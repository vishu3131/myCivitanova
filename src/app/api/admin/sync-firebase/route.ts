import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabaseServer';
import admin from 'firebase-admin';
import { verifyFirebaseIdToken } from '@/utils/firebaseAdmin';

// Rate limiting semplice per IP (endpoint admin pesante)
const ADMIN_RATE_LIMIT = 5;
const ADMIN_WINDOW_MS = 60_000; // 1 minuto
const adminIpHits: Map<string, { count: number; windowStart: number }> = new Map();

// Inizializza Firebase Admin se non già fatto
if (!admin.apps.length) {
  try {
    const firebaseConfig = {
      type: "service_account",
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } catch (error) {
    console.error('Errore inizializzazione Firebase Admin:', error);
  }
}

interface SyncResult {
  success: boolean;
  profileId?: string;
  error?: string;
  syncType: 'create' | 'update';
  duration: number;
}

interface SyncStats {
  total: number;
  successful: number;
  failed: number;
  created: number;
  updated: number;
  errors: Array<{ uid: string; email?: string; error: string }>;
}

/**
 * Sincronizza un singolo utente Firebase con Supabase
 */
async function syncUser(firebaseUser: admin.auth.UserRecord): Promise<SyncResult> {
  const startTime = Date.now();
  const supabase = getSupabaseAdmin();
  
  try {
    // Controlla se l'utente esiste già in Supabase
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('firebase_uid', firebaseUser.uid)
      .maybeSingle();
    
    // Prepara i dati del profilo
    const profileData = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      full_name: firebaseUser.displayName || '',
      avatar_url: firebaseUser.photoURL || null,
      phone: firebaseUser.phoneNumber || null,
      is_verified: firebaseUser.emailVerified,
      firebase_created_at: firebaseUser.metadata.creationTime,
      firebase_last_sign_in: firebaseUser.metadata.lastSignInTime,
      last_sync_at: new Date().toISOString(),
      sync_status: 'success',
      role: 'user', // Ruolo di default
      is_active: true
    };
    
    let result: SyncResult;
    
    if (existingProfile) {
      // Aggiorna profilo esistente
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          role: existingProfile.role // Mantieni il ruolo esistente
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      
      result = {
        success: true,
        profileId: data.id,
        syncType: 'update',
        duration: Date.now() - startTime
      };
    } else {
      // Crea nuovo profilo
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      
      result = {
        success: true,
        profileId: data.id,
        syncType: 'create',
        duration: Date.now() - startTime
      };
      
      // Aggiorna mapping Firebase UID -> Supabase UUID
      await supabase
        .from('firebase_user_mapping')
        .upsert({
          firebase_uid: firebaseUser.uid,
          supabase_uuid: data.id,
          created_at: new Date().toISOString()
        }, { onConflict: 'firebase_uid' });
    }
    
    // Log della sincronizzazione
    await supabase
      .from('sync_logs')
      .insert({
        firebase_uid: firebaseUser.uid,
        profile_id: result.profileId,
        sync_type: result.syncType,
        sync_status: 'success',
        sync_duration_ms: result.duration,
        created_at: new Date().toISOString()
      });
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    
    // Log dell'errore
    await supabase
      .from('sync_logs')
      .insert({
        firebase_uid: firebaseUser.uid,
        sync_type: 'update',
        sync_status: 'error',
        error_message: errorMessage,
        sync_duration_ms: Date.now() - startTime,
        created_at: new Date().toISOString()
      });
    
    return {
      success: false,
      error: errorMessage,
      syncType: 'update',
      duration: Date.now() - startTime
    };
  }
}

/**
 * Sincronizza tutti gli utenti Firebase con Supabase
 */
async function syncAllUsers(): Promise<SyncStats> {
  const stats: SyncStats = {
    total: 0,
    successful: 0,
    failed: 0,
    created: 0,
    updated: 0,
    errors: []
  };
  
  try {
    // Ottieni tutti gli utenti da Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;
    
    stats.total = users.length;
    
    // Sincronizza ogni utente
    for (const user of users) {
      const result = await syncUser(user);
      
      if (result.success) {
        stats.successful++;
        if (result.syncType === 'create') {
          stats.created++;
        } else {
          stats.updated++;
        }
      } else {
        stats.failed++;
        stats.errors.push({
          uid: user.uid,
          email: user.email,
          error: result.error || 'Errore sconosciuto'
        });
      }
    }
    
    return stats;
  } catch (error) {
    throw new Error(`Errore durante la sincronizzazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit per IP
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const clientIp = ipHeader.split(',')[0]?.trim() || 'unknown';
    const nowMs = Date.now();
    const rec = adminIpHits.get(clientIp);
    if (!rec || nowMs - rec.windowStart > ADMIN_WINDOW_MS) {
      adminIpHits.set(clientIp, { count: 1, windowStart: nowMs });
    } else {
      rec.count += 1;
      adminIpHits.set(clientIp, rec);
      if (rec.count > ADMIN_RATE_LIMIT) {
        const res = NextResponse.json({ error: 'Troppi tentativi, riprova più tardi' }, { status: 429 });
        res.headers.set('Retry-After', '60');
        return res;
      }
    }

    // Verifica che l'utente sia autenticato e abbia i permessi admin
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Token di autorizzazione mancante' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseIdToken(idToken);

    const supabase = getSupabaseAdmin();
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

    console.log('🔄 Avvio sincronizzazione Firebase -> Supabase...');
    
    const startTime = Date.now();
    const result = await syncAllUsers();
    const duration = Date.now() - startTime;
    
    console.log('✅ Sincronizzazione completata:', result);
    
    return NextResponse.json({
      success: true,
      stats: result,
      duration: duration,
      message: `Sincronizzazione completata: ${result.successful}/${result.total} utenti sincronizzati con successo`
    });
    
  } catch (error) {
    console.error('❌ Errore durante la sincronizzazione:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno del server'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Rate limit per IP (più permissivo per GET)
    const ipHeader = request.headers.get('x-forwarded-for') || '';
    const clientIp = ipHeader.split(',')[0]?.trim() || 'unknown';
    const nowMs = Date.now();
    const rec = adminIpHits.get(clientIp);
    if (!rec || nowMs - rec.windowStart > ADMIN_WINDOW_MS) {
      adminIpHits.set(clientIp, { count: 1, windowStart: nowMs });
    } else {
      rec.count += 1;
      adminIpHits.set(clientIp, rec);
      if (rec.count > ADMIN_RATE_LIMIT) {
        const res = NextResponse.json({ error: 'Troppi tentativi, riprova più tardi' }, { status: 429 });
        res.headers.set('Retry-After', '60');
        return res;
      }
    }

    // Verifica autenticazione e ruolo admin
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Token di autorizzazione mancante' }, { status: 401 });
    }
    const idToken = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseIdToken(idToken);

    const supabase = getSupabaseAdmin();
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

    // Ottieni statistiche di sincronizzazione
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, firebase_uid, last_sync_at, sync_status')
      .not('firebase_uid', 'is', null);
    
    if (profilesError) throw profilesError;
    
    const { data: syncLogs, error: logsError } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (logsError) throw logsError;
    
    const stats = {
      totalSyncedUsers: profiles?.length || 0,
      successfulSyncs: profiles?.filter(p => p.sync_status === 'success').length || 0,
      failedSyncs: profiles?.filter(p => p.sync_status === 'error').length || 0,
      lastSync: syncLogs?.[0]?.created_at || null,
      recentLogs: syncLogs || []
    };
    
    return NextResponse.json({ stats });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Errore interno del server'
    }, { status: 500 });
  }
}