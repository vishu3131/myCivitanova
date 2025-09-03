const jwt = require('jsonwebtoken');
require('dotenv').config();

// Funzione per creare una chiave service_role JWT temporanea
function createServiceRoleJWT() {
  console.log('🔧 Creazione chiave service_role JWT temporanea...');
  
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!anonKey) {
    console.error('❌ Chiave anon non trovata nel file .env');
    return;
  }
  
  try {
    // Decodifica la chiave anon per ottenere il payload
    const payload = JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64').toString());
    console.log('📋 Payload originale (anon):');
    console.log(JSON.stringify(payload, null, 2));
    
    // Crea un nuovo payload per service_role
    const serviceRolePayload = {
      ...payload,
      role: 'service_role'
    };
    
    console.log('\n📋 Nuovo payload (service_role):');
    console.log(JSON.stringify(serviceRolePayload, null, 2));
    
    // Per creare un JWT valido, avremmo bisogno del JWT secret del progetto
    // Questo non è disponibile pubblicamente per motivi di sicurezza
    console.log('\n⚠️  NOTA IMPORTANTE:');
    console.log('Non posso creare un JWT service_role valido senza il JWT secret del progetto.');
    console.log('Il JWT secret è privato e non accessibile tramite API.');
    
    console.log('\n✅ SOLUZIONI ALTERNATIVE:');
    console.log('1. 🌐 Accedi alla dashboard Supabase per ottenere la chiave service_role esistente');
    console.log('2. 🔑 Crea una nuova "secret key" (sb_secret_...) dalla dashboard');
    console.log('3. 🔧 Usa la chiave anon con permessi limitati per ora');
    
    console.log('\n🔗 Link diretto alla dashboard API:');
    console.log(`https://supabase.com/dashboard/project/${payload.ref}/settings/api`);
    
  } catch (error) {
    console.error('❌ Errore nel processare la chiave anon:', error.message);
  }
}

createServiceRoleJWT();