const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configurazione Supabase mancante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configurazione Firebase Admin con approccio diretto
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

// Inizializza Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  }
  console.log('✅ Firebase Admin inizializzato con successo');
} catch (error) {
  console.error('❌ Errore nell\'inizializzazione di Firebase Admin:', error.message);
  process.exit(1);
}

// Funzione per sincronizzare un singolo utente
async function syncUser(firebaseUser) {
  try {
    const userData = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email || null,
      full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utente',
      phone: firebaseUser.phoneNumber || null,
      role: 'user',
      is_active: !firebaseUser.disabled,
      is_verified: firebaseUser.emailVerified || false,
      firebase_created_at: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).toISOString() : null,
      firebase_last_sign_in: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime).toISOString() : null,
      last_sync_at: new Date().toISOString(),
      sync_status: 'synced'
    };

    // Verifica se l'utente esiste già
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id, firebase_uid')
      .eq('firebase_uid', firebaseUser.uid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    if (existingUser) {
      // Aggiorna utente esistente
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', firebaseUser.uid)
        .select();
      
      if (error) throw error;
      result = { action: 'updated', data };
    } else {
      // Crea nuovo utente
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      result = { action: 'created', data };
    }

    console.log(`✅ Utente ${result.action}: ${userData.email} (${firebaseUser.uid})`);
    return { success: true, action: result.action, user: userData };

  } catch (error) {
    console.error(`❌ Errore sincronizzazione utente ${firebaseUser.uid}:`, error.message);
    return { success: false, error: error.message, user: firebaseUser };
  }
}

// Funzione per sincronizzare tutti gli utenti
async function syncAllUsers() {
  console.log('🔄 Inizio sincronizzazione utenti da Firebase Auth...');
  
  const stats = {
    total: 0,
    successful: 0,
    failed: 0,
    created: 0,
    updated: 0,
    errors: []
  };

  try {
    let nextPageToken;
    
    do {
      // Ottieni utenti da Firebase Auth
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      
      console.log(`📥 Trovati ${listUsersResult.users.length} utenti in questa pagina`);
      
      for (const user of listUsersResult.users) {
        stats.total++;
        
        const result = await syncUser(user);
        
        if (result.success) {
          stats.successful++;
          if (result.action === 'created') stats.created++;
          if (result.action === 'updated') stats.updated++;
        } else {
          stats.failed++;
          stats.errors.push({
            uid: user.uid,
            email: user.email,
            error: result.error
          });
        }
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
  } catch (error) {
    console.error('❌ Errore durante la sincronizzazione:', error.message);
    throw error;
  }

  return stats;
}

// Funzione principale
async function main() {
  const startTime = Date.now();
  
  try {
    // Verifica connessione Supabase
    console.log('🔍 Verifica connessione Supabase...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      throw new Error(`Errore connessione Supabase: ${error.message}`);
    }
    console.log('✅ Connessione Supabase verificata');

    // Esegui sincronizzazione
    const stats = await syncAllUsers();
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('\n📊 REPORT FINALE SINCRONIZZAZIONE');
    console.log('=====================================');
    console.log(`⏱️  Durata: ${duration} secondi`);
    console.log(`📈 Totale utenti processati: ${stats.total}`);
    console.log(`✅ Sincronizzazioni riuscite: ${stats.successful}`);
    console.log(`❌ Sincronizzazioni fallite: ${stats.failed}`);
    console.log(`🆕 Nuovi utenti creati: ${stats.created}`);
    console.log(`🔄 Utenti aggiornati: ${stats.updated}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ ERRORI:');
      stats.errors.forEach(err => {
        console.log(`   - ${err.email || err.uid}: ${err.error}`);
      });
    }
    
    console.log('\n🎉 Sincronizzazione completata!');
    
  } catch (error) {
    console.error('💥 Errore fatale:', error.message);
    process.exit(1);
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = { syncUser, syncAllUsers };