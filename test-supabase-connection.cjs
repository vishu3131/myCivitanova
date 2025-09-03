/**
 * MYCIVITANOVA - TEST CONNESSIONE SUPABASE
 * 
 * Questo script testa la connessione a Supabase con la chiave anonima.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase con chiave anonima
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Configurazione Supabase mancante:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Impostato' : '❌ Mancante');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Impostato' : '❌ Mancante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Test connessione Supabase con chiave anonima...');
  console.log('📡 URL:', supabaseUrl);
  console.log('🔑 Chiave anonima:', supabaseAnonKey.substring(0, 20) + '...');
  
  try {
    // Test di connessione base
    console.log('\n🔄 Test connessione base...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Errore nella connessione:', error);
      return false;
    }
    
    console.log('✅ Connessione riuscita!');
    
    // Test conteggio profili
    console.log('\n📊 Test conteggio profili...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Errore nel conteggio profili:', countError);
    } else {
      console.log(`✅ Trovati ${count || 0} profili nella tabella`);
    }
    
    // Test lettura profili (primi 5)
    console.log('\n👥 Test lettura profili...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Errore nella lettura profili:', profilesError);
    } else {
      console.log(`✅ Lettura profili riuscita! Trovati ${profiles.length} profili:`);
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email} (${profile.full_name || 'Senza nome'}) - Ruolo: ${profile.role} - Attivo: ${profile.is_active}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error);
    return false;
  }
}

async function main() {
  const success = await testConnection();
  
  if (success) {
    console.log('\n🎉 Test completato con successo!');
    console.log('✅ La connessione a Supabase funziona correttamente con la chiave anonima.');
  } else {
    console.log('\n❌ Test fallito!');
    console.log('🔧 Verifica la configurazione delle chiavi API in .env');
    process.exit(1);
  }
}

main();