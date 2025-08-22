const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Funzione per caricare variabili d'ambiente
function loadEnvVariables() {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  return envVars;
}

async function createProductionAdmin() {
  console.log('🔧 Creazione admin per produzione - Inizio\n');
  
  try {
    // Carica variabili d'ambiente
    const env = loadEnvVariables();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variabili d\'ambiente Supabase mancanti');
    }
    
    // Inizializza client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('1. Registrazione nuovo utente admin...');
    
    // Registra l'utente admin usando Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@civitanova.it',
      password: 'AdminCivitanova2024!',
      options: {
        data: {
          full_name: 'Admin Civitanova',
          role: 'admin'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Errore registrazione:', authError.message);
      
      // Se l'utente esiste già, proviamo a fare login
      if (authError.message.includes('already registered')) {
        console.log('\n2. Utente già esistente, test login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'admin@civitanova.it',
          password: 'AdminCivitanova2024!'
        });
        
        if (loginError) {
          console.error('❌ Errore login:', loginError.message);
          return;
        }
        
        console.log('✅ Login riuscito con utente esistente!');
        console.log('📧 Email:', loginData.user?.email);
        console.log('🆔 ID:', loginData.user?.id);
        
        // Verifica/aggiorna il profilo
        await verifyAndUpdateProfile(supabase, loginData.user?.id);
        
        // Logout
        await supabase.auth.signOut();
        console.log('✅ Logout completato');
        
        return;
      }
      
      return;
    }
    
    console.log('✅ Utente admin registrato!');
    console.log('📧 Email:', authData.user?.email);
    console.log('🆔 ID:', authData.user?.id);
    console.log('📧 Email confermata:', authData.user?.email_confirmed_at ? 'Sì' : 'No');
    
    // Attendi un momento per il trigger
    console.log('\n3. Attendo creazione profilo...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verifica/crea il profilo
    await verifyAndUpdateProfile(supabase, authData.user?.id);
    
    // Test login
    console.log('\n5. Test login finale...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@civitanova.it',
      password: 'AdminCivitanova2024!'
    });
    
    if (loginError) {
      console.error('❌ Errore test login:', loginError.message);
    } else {
      console.log('✅ Test login riuscito!');
      
      // Logout
      await supabase.auth.signOut();
      console.log('✅ Logout completato');
    }
    
    console.log('\n🎉 ADMIN CREATO CON SUCCESSO!');
    console.log('📧 Email: admin@civitanova.it');
    console.log('🔑 Password: AdminCivitanova2024!');
    console.log('\n⚠️  IMPORTANTE: Usa queste credenziali per il login in produzione!');
    
  } catch (error) {
    console.error('💥 Errore imprevisto:', error);
  }
}

async function verifyAndUpdateProfile(supabase, userId) {
  console.log('\n4. Verifica/aggiornamento profilo...');
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.log('⚠️  Profilo non trovato, creazione manuale...');
    
    // Crea il profilo manualmente
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'admin@civitanova.it',
        full_name: 'Admin Civitanova',
        role: 'admin',
        is_active: true,
        is_verified: true
      });
    
    if (insertError) {
      console.error('❌ Errore creazione profilo:', insertError.message);
    } else {
      console.log('✅ Profilo creato manualmente');
    }
  } else {
    console.log('✅ Profilo trovato:');
    console.log('- Email:', profileData.email);
    console.log('- Nome:', profileData.full_name);
    console.log('- Ruolo:', profileData.role);
    
    // Aggiorna il ruolo se necessario
    if (profileData.role !== 'admin') {
      console.log('\n4.1 Aggiornamento ruolo a admin...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          is_active: true,
          is_verified: true,
          full_name: 'Admin Civitanova'
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Errore aggiornamento ruolo:', updateError.message);
      } else {
        console.log('✅ Ruolo aggiornato a admin');
      }
    }
  }
}

// Esegui la creazione
createProductionAdmin().then(() => {
  console.log('\n🏁 Processo completato');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Errore durante la creazione:', error);
  process.exit(1);
});