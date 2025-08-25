/**
 * MYCIVITANOVA - SCRIPT DI SINCRONIZZAZIONE UTENTI FIREBASE -> SUPABASE (VERSIONE SEMPLIFICATA)
 * 
 * Questo script sincronizza tutti gli utenti da Firebase a Supabase utilizzando
 * direttamente le API di Firebase e Supabase senza dipendere dai moduli esistenti.
 */

// Importa le dipendenze necessarie
import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getAuth, listUsers } from 'firebase/auth/admin';
import { createClient } from '@supabase/supabase-js';

// Configurazione Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Richiede la chiave di servizio

// Inizializza Firebase e Supabase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Ottiene le statistiche di sincronizzazione
 */
async function getSyncStats() {
  try {
    const { data, error } = await supabase.rpc('get_sync_stats');
    
    if (error) throw error;
    
    return data || {
      totalUsers: 0,
      syncedUsers: 0,
      pendingUsers: 0,
      errorUsers: 0,
      lastSync: null
    };
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    return {
      totalUsers: 0,
      syncedUsers: 0,
      pendingUsers: 0,
      errorUsers: 0,
      lastSync: null
    };
  }
}

/**
 * Sincronizza un singolo utente Firebase con Supabase
 */
async function syncUser(firebaseUser) {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 Sincronizzazione utente: ${firebaseUser.uid}`);
    
    // Ottieni il profilo esistente da Supabase
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
      firebase_created_at: firebaseUser.metadata.creationTime,
      firebase_last_sign_in: firebaseUser.metadata.lastSignInTime,
      last_sync_at: new Date().toISOString(),
      sync_status: 'success'
    };
    
    let result;
    
    if (existingProfile) {
      // Aggiorna profilo esistente
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
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
    
    console.log(`✅ Sincronizzazione completata per ${firebaseUser.uid}: ${result.syncType}`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error(`❌ Errore sincronizzazione ${firebaseUser.uid}:`, errorMessage);
    
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
async function syncAllUsers() {
  const startTime = Date.now();
  const stats = { total: 0, success: 0, error: 0, duration: 0 };
  
  try {
    // Ottieni tutti gli utenti da Firebase
    const usersResult = await listUsers(auth);
    const users = usersResult.users;
    
    console.log(`📋 Trovati ${users.length} utenti in Firebase`);
    
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

async function main() {
  console.log('🔄 Avvio sincronizzazione di tutti gli utenti Firebase con Supabase...');
  
  try {
    // Ottieni le statistiche prima della sincronizzazione
    const statsBefore = await getSyncStats();
    console.log('📊 Statistiche prima della sincronizzazione:');
    console.log(`- Utenti totali: ${statsBefore.totalUsers}`);
    console.log(`- Utenti sincronizzati: ${statsBefore.syncedUsers}`);
    console.log(`- Utenti in attesa: ${statsBefore.pendingUsers}`);
    console.log(`- Utenti con errori: ${statsBefore.errorUsers}`);
    console.log(`- Ultima sincronizzazione: ${statsBefore.lastSync || 'Mai'}`);
    
    // Esegui la sincronizzazione di tutti gli utenti
    console.log('\n🔄 Avvio sincronizzazione batch...');
    const result = await syncAllUsers();
    
    if (result.success) {
      console.log('\n✅ Sincronizzazione completata con successo!');
      console.log('📊 Risultati:');
      console.log(`- Utenti totali processati: ${result.stats.total}`);
      console.log(`- Sincronizzazioni riuscite: ${result.stats.success}`);
      console.log(`- Sincronizzazioni fallite: ${result.stats.error}`);
      console.log(`- Tempo totale: ${(result.stats.duration / 1000).toFixed(2)} secondi`);
      
      // Ottieni le statistiche dopo la sincronizzazione
      const statsAfter = await getSyncStats();
      console.log('\n📊 Statistiche dopo la sincronizzazione:');
      console.log(`- Utenti totali: ${statsAfter.totalUsers}`);
      console.log(`- Utenti sincronizzati: ${statsAfter.syncedUsers}`);
      console.log(`- Utenti in attesa: ${statsAfter.pendingUsers}`);
      console.log(`- Utenti con errori: ${statsAfter.errorUsers}`);
      console.log(`- Ultima sincronizzazione: ${statsAfter.lastSync || 'Mai'}`);
    } else {
      console.error('\n❌ Sincronizzazione fallita o interrotta');
      console.log('📊 Risultati parziali:');
      console.log(`- Utenti totali processati: ${result.stats.total}`);
      console.log(`- Sincronizzazioni riuscite: ${result.stats.success}`);
      console.log(`- Sincronizzazioni fallite: ${result.stats.error}`);
      console.log(`- Tempo totale: ${(result.stats.duration / 1000).toFixed(2)} secondi`);
    }
  } catch (error) {
    console.error('❌ Errore durante la sincronizzazione:', error);
  }
}

// Esegui la sincronizzazione
main();