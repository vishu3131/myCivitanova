/**
 * MYCIVITANOVA - SCRIPT DI TEST POLICY RLS SUPABASE
 * 
 * Questo script testa se le policy RLS per il ruolo di servizio funzionano correttamente.
 */

// Importa le dipendenze necessarie
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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
 * Verifica le policy RLS esistenti
 */
async function checkRlsPolicies() {
  try {
    console.log('🔄 Verifica policy RLS esistenti...');
    
    // Verifica se possiamo leggere dalla tabella profiles
    console.log('ℹ️ Verifica accesso in lettura alla tabella profiles...');
    const { data: readData, error: readError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (readError) {
      console.log('❌ Errore di accesso in lettura alla tabella profiles:', readError);
      console.log('ℹ️ Questo potrebbe indicare problemi con le policy RLS per la lettura');
    } else {
      console.log('✅ Accesso in lettura alla tabella profiles riuscito');
    }
    
    // Verifica se possiamo inserire nella tabella profiles
    console.log('\nℹ️ Verifica accesso in scrittura alla tabella profiles...');
    
    // Genera un UUID casuale per il test
    const testId = crypto.randomUUID();
    const testFirebaseUid = 'test-' + Math.random().toString(36).substring(2, 15);
    
    // Prova a inserire un record (fallirà probabilmente per vincoli di chiave esterna)
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testId,
        firebase_uid: testFirebaseUid,
        email: `test-${testFirebaseUid}@example.com`,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      if (insertError.code === '23503') { // Foreign key violation
        console.log('ℹ️ Errore di vincolo di chiave esterna:', insertError.message);
        console.log('ℹ️ Questo è previsto poiché l\'ID deve esistere nella tabella users');
        console.log('✅ Le policy RLS sembrano permettere l\'inserimento (errore di chiave esterna, non di permessi)');
      } else if (insertError.code === '42501') { // Permission denied
        console.log('❌ Errore di permessi nell\'inserimento:', insertError.message);
        console.log('ℹ️ Questo indica problemi con le policy RLS per l\'inserimento');
        console.log('ℹ️ È necessario creare una policy RLS per permettere l\'inserimento al ruolo di servizio');
      } else {
        console.log('❌ Errore nell\'inserimento:', insertError);
      }
    } else {
      console.log('✅ Inserimento riuscito (inaspettato):', insertData);
      
      // Elimina il record inserito
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testId);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Errore nella verifica delle policy RLS:', error);
    console.log('ℹ️ Continuiamo comunque con il test...');
    return true;
  }
}

/**
 * Verifica i permessi del ruolo di servizio
 */
async function checkServiceRolePermissions() {
  try {
    console.log('🔄 Verifica permessi del ruolo di servizio...');
    
    // Verifica se esistono policy per il ruolo di servizio
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .like('roles', '%service_role%');
    
    if (error) {
      console.error('❌ Errore nella verifica dei permessi del ruolo di servizio:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Trovate ${data.length} policy per il ruolo di servizio:`);
      data.forEach((policy, index) => {
        console.log(`\nPolicy #${index + 1}:`);
        console.log(`- Tabella: ${policy.tablename}`);
        console.log(`- Nome: ${policy.policyname}`);
        console.log(`- Comando: ${policy.cmd}`);
      });
      return true;
    } else {
      console.log('❌ Nessuna policy trovata per il ruolo di servizio');
      return false;
    }
  } catch (error) {
    console.error('❌ Errore nella verifica dei permessi del ruolo di servizio:', error);
    return false;
  }
}

async function main() {
  console.log('🔍 Avvio test policy RLS Supabase...');
  
  try {
    // Verifica connessione a Supabase
    console.log('🔄 Verifica connessione a Supabase...');
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Errore nella connessione a Supabase:', error);
      process.exit(1);
    }
    
    console.log(`✅ Connessione a Supabase riuscita! Trovati ${data.length} profili.`);
    
    // Verifica policy RLS esistenti
    const policiesSuccess = await checkRlsPolicies();
    if (!policiesSuccess) {
      console.log('❌ Verifica policy RLS fallita');
      process.exit(1);
    }
    
    // Verifica permessi del ruolo di servizio
    const serviceRoleSuccess = await checkServiceRolePermissions();
    if (!serviceRoleSuccess) {
      console.log('⚠️ Attenzione: potrebbero mancare policy per il ruolo di servizio');
      console.log('ℹ️ Suggerimento: creare policy RLS specifiche per il ruolo di servizio');
    } else {
      console.log('✅ Policy per il ruolo di servizio verificate');
    }
    
    // Verifica se ci sono errori nei log di check-supabase-users.cjs
    console.log('\n🔍 Suggerimenti per risolvere gli errori RLS:');
    console.log('1. Assicurarsi che esistano policy RLS per il ruolo di servizio sulla tabella "profiles"');
    console.log('2. Le policy dovrebbero permettere INSERT, UPDATE e DELETE per il ruolo di servizio');
    console.log('3. Esempio di policy per INSERT: CREATE POLICY "service_role can insert profiles" ON profiles FOR INSERT TO service_role WITH CHECK (true);');
    console.log('4. Esempio di policy per UPDATE: CREATE POLICY "service_role can update profiles" ON profiles FOR UPDATE TO service_role USING (true);');
    console.log('5. Esempio di policy per DELETE: CREATE POLICY "service_role can delete profiles" ON profiles FOR DELETE TO service_role USING (true);');
    console.log('6. Verificare che lo script di sincronizzazione utilizzi la chiave SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('\n✅ Verifica delle policy RLS completata!');
  } catch (error) {
    console.error('❌ Errore durante i test:', error);
    process.exit(1);
  }
}

// Esegui il test
main();