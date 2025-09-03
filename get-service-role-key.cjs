const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Funzione per testare se possiamo ottenere la chiave service_role
async function testServiceRoleAccess() {
  console.log('🔍 Tentativo di accesso con chiave service_role...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('URL Supabase:', supabaseUrl);
  console.log('Chiave anon disponibile:', anonKey ? 'Sì' : 'No');
  
  // La chiave service_role JWT dovrebbe essere simile alla chiave anon ma con ruolo diverso
  // Proviamo a decodificare la chiave anon per capire la struttura
  if (anonKey) {
    try {
      const payload = JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64').toString());
      console.log('\n📋 Payload della chiave anon:');
      console.log(JSON.stringify(payload, null, 2));
      
      // La chiave service_role dovrebbe avere la stessa struttura ma con role: "service_role"
      console.log('\n💡 La chiave service_role dovrebbe avere:');
      console.log('- Stesso iss (issuer):', payload.iss);
      console.log('- Stesso ref:', payload.ref);
      console.log('- Role: "service_role" invece di "anon"');
      console.log('- Stesso iat e exp');
      
    } catch (error) {
      console.error('❌ Errore nel decodificare la chiave anon:', error.message);
    }
  }
  
  console.log('\n📝 Per ottenere la chiave service_role:');
  console.log('1. Vai su https://supabase.com/dashboard');
  console.log('2. Seleziona il tuo progetto');
  console.log('3. Vai su Settings > API');
  console.log('4. Copia la chiave "service_role" (JWT)');
  console.log('5. Sostituisci __REPLACE_WITH_YOUR_SERVICE_ROLE_KEY__ nel file .env');
}

testServiceRoleAccess().catch(console.error);