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
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY // Usa la chiave anonima per ora
);

async function resetAdminPassword() {
  console.log('🔄 Reset password admin - Inizio\n');
  
  try {
    console.log('1. Tentativo di reset password tramite email...');
    
    // Invia email di reset password
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      'admin@civitanova.it',
      {
        redirectTo: 'http://localhost:3000/reset-password'
      }
    );
    
    if (error) {
      console.error('❌ Errore nel reset password:', error.message);
      console.log('\n2. Provo approccio alternativo - aggiornamento diretto database...');
      
      // Approccio alternativo: aggiorna direttamente la password nel database
      // Nota: questo richiede di conoscere l'hash della password
      console.log('⚠️  Per resettare la password, devi:');
      console.log('   1. Andare nel dashboard Supabase');
      console.log('   2. Sezione Authentication > Users');
      console.log('   3. Trovare admin@civitanova.it');
      console.log('   4. Cliccare "Reset Password" o modificare direttamente');
      
      return;
    }
    
    console.log('✅ Email di reset inviata con successo!');
    console.log('📧 Controlla la casella email di admin@civitanova.it');
    
    console.log('\n2. Test login con password corrente...');
    
    // Prova alcune password comuni
    const passwords = ['AdminPass123!', 'admin123', 'password', 'admin', '123456'];
    
    for (const password of passwords) {
      console.log(`Provo password: ${password}`);
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@civitanova.it',
        password: password
      });
      
      if (!loginError) {
        console.log('✅ Login admin riuscito!');
        console.log('📧 Email:', loginData.user.email);
        console.log('🆔 ID:', loginData.user.id);
        console.log('🔑 Password corretta:', password);
        
        // Logout
        await supabase.auth.signOut();
        console.log('✅ Logout completato');
        
        console.log('\n🎉 Password trovata!');
        console.log('📝 Credenziali admin:');
        console.log('   Email: admin@civitanova.it');
        console.log('   Password:', password);
        return;
      } else {
        console.log(`❌ Password ${password} non funziona:`, loginError.message);
      }
    }
    
    console.log('\n❌ Nessuna password funziona. Usa il link di reset inviato via email.');
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

resetAdminPassword();