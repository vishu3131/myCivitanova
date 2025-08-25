/**
 * MYCIVITANOVA - SCRIPT DI VERIFICA VARIABILI D'AMBIENTE E CONNESSIONE SUPABASE
 * 
 * Questo script verifica le variabili d'ambiente e tenta di connettersi a Supabase
 * per verificare che le credenziali siano corrette.
 */

// Importa le dipendenze necessarie
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Funzione principale
async function main() {
  console.log('🔍 Verifica variabili d\'ambiente e connessione Supabase...');
  
  // Verifica variabili d'ambiente Firebase
  console.log('\n📋 Variabili Firebase:');
  const firebaseVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  let allFirebaseVarsSet = true;
  for (const varName of firebaseVars) {
    const value = process.env[varName];
    if (value) {
      const maskedValue = varName.includes('KEY') || varName.includes('ID') 
        ? value.substring(0, 4) + '***' + value.substring(value.length - 4)
        : value;
      console.log(`- ${varName}: ${maskedValue}`);
    } else {
      console.log(`- ${varName}: non impostato`);
      allFirebaseVarsSet = false;
    }
  }
  
  // Verifica variabili d'ambiente Supabase
  console.log('\n📋 Variabili Supabase:');
  const supabaseVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allSupabaseVarsSet = true;
  for (const varName of supabaseVars) {
    const value = process.env[varName];
    if (value) {
      const maskedValue = varName.includes('KEY') || varName.includes('URL')
        ? value.substring(0, 8) + '***' + value.substring(value.length - 4)
        : value;
      console.log(`- ${varName}: ${maskedValue}`);
    } else {
      console.log(`- ${varName}: non impostato`);
      allSupabaseVarsSet = false;
    }
  }
  
  // Verifica connessione a Supabase se tutte le variabili sono impostate
  if (allSupabaseVarsSet) {
    console.log('\n🔄 Verifica connessione a Supabase...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Verifica la connessione eseguendo una query semplice
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        console.error('❌ Errore nella connessione a Supabase:', error.message);
      } else {
        console.log('✅ Connessione a Supabase riuscita!');
        console.log(`ℹ️ Connessione riuscita! Trovati ${data.length} profili nel database.`);
      }
    } catch (error) {
      console.error('❌ Errore nella connessione a Supabase:', error.message);
    }
  } else {
    console.log('\n⚠️ Impossibile verificare la connessione a Supabase: variabili d\'ambiente mancanti.');
  }
  
  // Verifica se tutte le variabili sono impostate
  if (allFirebaseVarsSet && allSupabaseVarsSet) {
    console.log('\n✅ Tutte le variabili d\'ambiente sono impostate correttamente!');
  } else {
    console.log('\n⚠️ Alcune variabili d\'ambiente non sono impostate. Verifica il file .env.');
  }
}

// Esegui la funzione principale
main().catch(error => {
  console.error('Errore:', error);
  process.exit(1);
});