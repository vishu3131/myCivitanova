/**
 * MYCIVITANOVA - SCRIPT DI SINCRONIZZAZIONE UTENTI FIREBASE AUTH -> SUPABASE
 * 
 * Questo script sincronizza tutti gli utenti da Firebase Auth (non Firestore) a Supabase.
 * Utilizza Firebase Admin SDK per ottenere tutti gli utenti registrati.
 */

// Importa le dipendenze necessarie
require('dotenv').config();
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inizializza Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Inizializza Firebase Admin
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Variabili d\'ambiente Firebase Admin mancanti');
  process.exit(1);
}

// Inizializza Firebase Admin con le credenziali
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n')
    })
  });
  console.log('✅ Firebase Admin inizializzato con successo');
} catch (error) {
  console.error('❌ Errore nell\'inizializzazione di Firebase Admin:', error.message);
  process.exit(1);
}

/**
 * Sincronizza un singolo utente Firebase Auth con Supabase
 */
async function syncUser(firebaseUser) {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 Sincronizzazione utente: ${firebaseUser.uid} (${firebaseUser.email})`);
    
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
      phone: firebaseUser.phoneNumber || '',
      role: 'user', // Ruolo di default
      is_active: true,
      is_verified: firebaseUser.emailVerified || false,
      firebase_created_at: firebaseUser.metadata.creationTime,
      firebase_last_sign_in: firebaseUser.metadata.lastSignInTime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
      sync_status: 'success'
    };
    
    let result;
    
    if (existingProfile) {
      // Aggiorna profilo esistente
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          created_at: existingProfile.created_at // Mantieni la data di creazione originale
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
      
      console.log(`   ✅ Aggiornato profilo esistente (ID: ${data.id})`);
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
      
      console.log(`   ✅ Creato nuovo profilo (ID: ${data.id})`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`   ❌ Errore: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      syncType: 'error',
      duration: Date.now() - startTime
    };
  }
}

/**
 * Sincronizza tutti gli utenti Firebase Auth con Supabase
 */
async function syncAllUsers() {
  const startTime = Date.now();
  const stats = { total: 0, success: 0, error: 0, duration: 0 };
  
  try {
    console.log('🔍 Recupero tutti gli utenti da Firebase Auth...');
    
    // Ottieni tutti gli utenti da Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;
    
    console.log(`📋 Trovati ${users.length} utenti in Firebase Auth`);
    
    if (users.length === 0) {
      console.log('ℹ️  Nessun utente da sincronizzare');
      return {
        success: true,
        stats: { total: 0, success: 0, error: 0, duration: Date.now() - startTime }
      };
    }
    
    console.log('\n🔄 Inizio sincronizzazione...');
    
    // Sincronizza ogni utente
    for (const user of users) {
      stats.total++;
      
      try {
        const result = await syncUser(user);
        
        if (result.success) {
          stats.success++;
        } else {
          stats.error++;
        }
      } catch (error) {
        stats.error++;
        console.error(`❌ Errore durante la sincronizzazione dell'utente ${user.uid}:`, error);
      }
      
      // Piccola pausa per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    stats.duration = Date.now() - startTime;
    
    return {
      success: stats.error === 0,
      stats
    };
  } catch (error) {
    console.error('❌ Errore durante la sincronizzazione batch:', error);
    
    stats.duration = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      stats
    };
  }
}

/**
 * Funzione principale
 */
async function main() {
  console.log('🚀 MYCIVITANOVA - Sincronizzazione utenti Firebase Auth -> Supabase');
  console.log('=' .repeat(70));
  
  try {
    // Verifica la connessione a Supabase
    console.log('🔗 Verifica connessione Supabase...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      throw new Error(`Errore connessione Supabase: ${error.message}`);
    }
    console.log('✅ Connessione Supabase OK');
    
    // Esegui la sincronizzazione
    const result = await syncAllUsers();
    
    console.log('\n' + '=' .repeat(70));
    
    if (result.success) {
      console.log('✅ Sincronizzazione completata con successo!');
    } else {
      console.log('⚠️  Sincronizzazione completata con errori');
      if (result.error) {
        console.log(`   Errore principale: ${result.error}`);
      }
    }
    
    console.log('\n📊 Risultati finali:');
    console.log(`   - Utenti totali processati: ${result.stats.total}`);
    console.log(`   - Sincronizzazioni riuscite: ${result.stats.success}`);
    console.log(`   - Sincronizzazioni fallite: ${result.stats.error}`);
    console.log(`   - Tempo totale: ${(result.stats.duration / 1000).toFixed(2)} secondi`);
    
    if (result.stats.success > 0) {
      console.log('\n🎉 Gli utenti sono stati importati con successo in Supabase!');
      console.log('   Ora puoi verificare i dati nella tabella "profiles" di Supabase.');
    }
    
  } catch (error) {
    console.error('❌ Errore fatale:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
main();