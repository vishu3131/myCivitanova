const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leggi il file .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createNewAdmin() {
  console.log('🔄 Creazione nuovo admin - Inizio\n');
  
  try {
    console.log('1. Registrazione nuovo utente admin...');
    
    // Registra nuovo utente admin con email valida
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'AdminPass123!',
      options: {
        data: {
          full_name: 'Administrator',
          role: 'admin'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Errore nella registrazione:', signUpError.message);
      return;
    }
    
    console.log('✅ Utente admin registrato con successo!');
    console.log('🆔 ID:', signUpData.user?.id);
    console.log('📧 Email:', signUpData.user?.email);
    
    // Logout dopo la registrazione
    await supabase.auth.signOut();
    
    console.log('\n2. Test login con nuovo admin...');
    
    // Test login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'AdminPass123!'
    });
    
    if (loginError) {
      console.error('❌ Errore login:', loginError.message);
      console.log('⚠️  Potrebbe essere necessario confermare l\'email prima del login');
      return;
    }
    
    console.log('✅ Login admin riuscito!');
    console.log('📧 Email:', loginData.user.email);
    console.log('🆔 ID:', loginData.user.id);
    
    console.log('\n3. Aggiornamento ruolo admin nel profilo...');
    
    // Aggiorna il ruolo nel profilo
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', loginData.user.id);
    
    if (updateError) {
      console.error('❌ Errore aggiornamento ruolo:', updateError.message);
    } else {
      console.log('✅ Ruolo admin aggiornato nel profilo!');
    }
    
    // Logout
    await supabase.auth.signOut();
    console.log('✅ Logout completato');
    
    console.log('\n🎉 Admin creato con successo!');
    console.log('📝 Credenziali admin:');
    console.log('   Email: admin@example.com');
    console.log('   Password: AdminPass123!');
    console.log('   Ruolo: admin');
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

createNewAdmin();