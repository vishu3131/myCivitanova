const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili ambiente Supabase mancanti!');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Presente' : '❌ Mancante');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Presente' : '❌ Mancante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppStatistics() {
  try {
    console.log('🔍 Testando funzione get_app_statistics...');
    
    const { data, error } = await supabase.rpc('get_app_statistics');
    
    if (error) {
      console.error('❌ Errore chiamata RPC:', error);
      return;
    }
    
    console.log('✅ Dati statistiche app:');
    console.log(JSON.stringify(data, null, 2));
    
    // Verifica anche i dati grezzi dalla tabella profiles
    console.log('\n🔍 Verifica dati grezzi tabella profiles...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, status, created_at')
      .limit(10);
      
    if (profilesError) {
      console.error('❌ Errore lettura profiles:', profilesError);
    } else {
      console.log(`📊 Trovati ${profilesData.length} profili (primi 10):`);
      profilesData.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}, Status: ${profile.status}, Creato: ${profile.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

testAppStatistics();