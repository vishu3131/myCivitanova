/**
 * MYCIVITANOVA - SCRIPT DI VERIFICA UTENTI SUPABASE
 * 
 * Questo script verifica gli utenti esistenti in Supabase senza richiedere Firebase Admin.
 */

// Importa le dipendenze necessarie
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Richiede la chiave di servizio

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Errore: Variabili d\'ambiente Supabase mancanti.');
  console.error('Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Ottiene le statistiche di sincronizzazione
 */
async function getSyncStats() {
  try {
    const { data, error } = await supabase.rpc('get_sync_stats');
    
    if (error) {
      console.error('Errore nella chiamata RPC get_sync_stats:', error);
      return {
        totalUsers: 0,
        syncedUsers: 0,
        pendingUsers: 0,
        errorUsers: 0,
        lastSync: null
      };
    }
    
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
 * Ottiene tutti i profili utente da Supabase
 */
async function getAllProfiles() {
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    console.log(`📋 Trovati ${count} profili in Supabase`);
    return { profiles: data, count };
  } catch (error) {
    console.error('Errore nel recupero dei profili:', error);
    return { profiles: [], count: 0 };
  }
}

/**
 * Ottiene tutti i log di sincronizzazione
 */
async function getSyncLogs(limit = 10) {
  try {
    const { data, error, count } = await supabase
      .from('sync_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    console.log(`📋 Trovati ${count} log di sincronizzazione in Supabase`);
    return { logs: data, count };
  } catch (error) {
    console.error('Errore nel recupero dei log di sincronizzazione:', error);
    return { logs: [], count: 0 };
  }
}

/**
 * Ottiene tutti i mapping Firebase UID -> Supabase UUID
 */
async function getUserMappings() {
  try {
    const { data, error, count } = await supabase
      .from('firebase_user_mapping')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    console.log(`📋 Trovati ${count} mapping utente in Supabase`);
    return { mappings: data, count };
  } catch (error) {
    console.error('Errore nel recupero dei mapping utente:', error);
    return { mappings: [], count: 0 };
  }
}

/**
 * Verifica se la funzione RPC esiste
 */
async function checkRpcFunction(functionName) {
  try {
    // Esegue una query per verificare se la funzione esiste nello schema pg_proc
    const { data, error } = await supabase.rpc('check_function_exists', { function_name: functionName });
    
    if (error) {
      // Se la funzione check_function_exists non esiste, proviamo un approccio alternativo
      console.log(`La funzione RPC check_function_exists non esiste. Verifichiamo direttamente ${functionName}...`);
      
      // Proviamo a chiamare direttamente la funzione per vedere se esiste
      const { data: testData, error: testError } = await supabase.rpc(functionName);
      
      if (testError && testError.code === '42883') { // Codice PostgreSQL per "function does not exist"
        return false;
      }
      
      // Se non abbiamo ricevuto un errore specifico di "function does not exist", assumiamo che esista
      return true;
    }
    
    return data;
  } catch (error) {
    console.error(`Errore nella verifica della funzione RPC ${functionName}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔍 Avvio verifica utenti Supabase...');
  
  try {
    // Verifica connessione a Supabase
    console.log('🔄 Verifica connessione a Supabase...');
    const { data: healthCheck, error: healthError } = await supabase.rpc('get_service_status');
    
    if (healthError) {
      if (healthError.code === '42883') { // Function does not exist
        console.log('ℹ️ La funzione RPC get_service_status non esiste. Continuiamo comunque...');
      } else {
        console.error('❌ Errore nella connessione a Supabase:', healthError);
      }
    } else {
      console.log('✅ Connessione a Supabase stabilita:', healthCheck);
    }
    
    // Verifica funzione RPC get_sync_stats
    console.log('\n🔄 Verifica funzione RPC get_sync_stats...');
    const syncStatsExists = await checkRpcFunction('get_sync_stats');
    
    if (syncStatsExists) {
      console.log('✅ La funzione RPC get_sync_stats esiste');
      
      // Ottieni le statistiche
      const stats = await getSyncStats();
      console.log('\n📊 Statistiche di sincronizzazione:');
      console.log(`- Utenti totali: ${stats.totalUsers}`);
      console.log(`- Utenti sincronizzati: ${stats.syncedUsers}`);
      console.log(`- Utenti in attesa: ${stats.pendingUsers}`);
      console.log(`- Utenti con errori: ${stats.errorUsers}`);
      console.log(`- Ultima sincronizzazione: ${stats.lastSync || 'Mai'}`);
    } else {
      console.log('❌ La funzione RPC get_sync_stats non esiste');
    }
    
    // Ottieni tutti i profili
    console.log('\n🔄 Recupero profili utente...');
    const { profiles, count: profileCount } = await getAllProfiles();
    
    if (profileCount > 0) {
      console.log('✅ Profili recuperati con successo');
      console.log(`📊 Numero totale di profili: ${profileCount}`);
      
      // Mostra alcuni dettagli sui primi 5 profili
      console.log('\n📋 Dettagli dei primi 5 profili:');
      profiles.slice(0, 5).forEach((profile, index) => {
        console.log(`\nProfilo #${index + 1}:`);
        console.log(`- ID: ${profile.id}`);
        console.log(`- Firebase UID: ${profile.firebase_uid || 'Non impostato'}`);
        console.log(`- Email: ${profile.email || 'Non impostata'}`);
        console.log(`- Nome completo: ${profile.full_name || 'Non impostato'}`);
        console.log(`- Stato sincronizzazione: ${profile.sync_status || 'Non impostato'}`);
        console.log(`- Ultima sincronizzazione: ${profile.last_sync_at || 'Mai'}`);
      });
    } else {
      console.log('ℹ️ Nessun profilo trovato in Supabase');
    }
    
    // Ottieni i mapping utente
    console.log('\n🔄 Recupero mapping utente...');
    const { mappings, count: mappingCount } = await getUserMappings();
    
    if (mappingCount > 0) {
      console.log('✅ Mapping utente recuperati con successo');
      console.log(`📊 Numero totale di mapping: ${mappingCount}`);
      
      // Mostra alcuni dettagli sui primi 5 mapping
      console.log('\n📋 Dettagli dei primi 5 mapping:');
      mappings.slice(0, 5).forEach((mapping, index) => {
        console.log(`\nMapping #${index + 1}:`);
        console.log(`- Firebase UID: ${mapping.firebase_uid}`);
        console.log(`- Supabase UUID: ${mapping.supabase_uuid}`);
        console.log(`- Creato il: ${mapping.created_at}`);
      });
    } else {
      console.log('ℹ️ Nessun mapping utente trovato in Supabase');
    }
    
    // Ottieni i log di sincronizzazione
    console.log('\n🔄 Recupero log di sincronizzazione...');
    const { logs, count: logCount } = await getSyncLogs();
    
    if (logCount > 0) {
      console.log('✅ Log di sincronizzazione recuperati con successo');
      console.log(`📊 Numero totale di log: ${logCount}`);
      
      // Mostra alcuni dettagli sui primi 5 log
      console.log('\n📋 Dettagli degli ultimi 5 log:');
      logs.slice(0, 5).forEach((log, index) => {
        console.log(`\nLog #${index + 1}:`);
        console.log(`- Firebase UID: ${log.firebase_uid}`);
        console.log(`- Profilo ID: ${log.profile_id || 'Non impostato'}`);
        console.log(`- Tipo sincronizzazione: ${log.sync_type}`);
        console.log(`- Stato sincronizzazione: ${log.sync_status}`);
        console.log(`- Durata (ms): ${log.sync_duration_ms}`);
        console.log(`- Messaggio errore: ${log.error_message || 'Nessuno'}`);
        console.log(`- Creato il: ${log.created_at}`);
      });
    } else {
      console.log('ℹ️ Nessun log di sincronizzazione trovato in Supabase');
    }
    
    console.log('\n✅ Verifica completata con successo!');
  } catch (error) {
    console.error('❌ Errore durante la verifica:', error);
  }
}

// Esegui la verifica
main();