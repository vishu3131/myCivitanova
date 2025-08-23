const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Funzione per caricare variabili d'ambiente
function loadEnvVariables(envFile = '.env.production') {
  try {
    const envPath = path.join(__dirname, envFile);
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      // Ignora commenti e linee vuote
      if (line.startsWith('#') || !line.trim()) return;
      
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('='); // Gestisce valori che contengono '='
      
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });

    return envVars;
  } catch (error) {
    console.error(`❌ Errore nel caricamento del file ${envFile}:`, error.message);
    console.log(`⚠️ Assicurati che il file ${envFile} esista nella directory principale.`);
    process.exit(1);
  }
}

// Funzione per input utente
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function createProductionAdmin() {
  console.log('🔧 CREAZIONE ADMIN PER PRODUZIONE - INIZIO\n');
  console.log('⚠️  Questo script creerà un utente admin per l\'ambiente di produzione.\n');
  
  // Interfaccia per input utente
  const rl = createInterface();
  
  try {
    // Chiedi quale file env usare
    const envFile = await askQuestion(rl, '📁 File di configurazione da usare (.env.production): ');
    const envToUse = envFile || '.env.production';
    console.log(`\n🔍 Utilizzo file di configurazione: ${envToUse}\n`);
    
    // Carica variabili d'ambiente
    const env = loadEnvVariables(envToUse);
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(`Variabili d'ambiente Supabase mancanti nel file ${envToUse}`);
    }
    
    // Chiedi credenziali admin
    console.log('\n📝 CONFIGURAZIONE CREDENZIALI ADMIN\n');
    const defaultEmail = 'admin@civitanova.it';
    const defaultPassword = 'CivitanovaAdmin2024!';
    const defaultName = 'Admin Civitanova';
    
    const email = await askQuestion(rl, `📧 Email admin (${defaultEmail}): `);
    const password = await askQuestion(rl, `🔑 Password admin (${defaultPassword}): `);
    const fullName = await askQuestion(rl, `👤 Nome completo (${defaultName}): `);
    
    const adminEmail = email || defaultEmail;
    const adminPassword = password || defaultPassword;
    const adminFullName = fullName || defaultName;
    
    // Conferma dati
    console.log('\n📋 RIEPILOGO DATI:\n');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Nome: ${adminFullName}`);
    console.log(`🌐 URL Supabase: ${supabaseUrl}`);
    
    const confirm = await askQuestion(rl, '\n⚠️  Confermi la creazione dell\'utente admin? (s/n): ');
    if (confirm.toLowerCase() !== 's') {
      console.log('\n❌ Operazione annullata dall\'utente');
      rl.close();
      return;
    }
    
    // Inizializza client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n1. Registrazione nuovo utente admin...');
    
    // Registra l'utente admin usando Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: adminFullName,
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
          email: adminEmail,
          password: adminPassword
        });
        
        if (loginError) {
          console.error('❌ Errore login:', loginError.message);
          rl.close();
          return;
        }
        
        console.log('✅ Login riuscito con utente esistente!');
        console.log('📧 Email:', loginData.user?.email);
        console.log('🆔 ID:', loginData.user?.id);
        
        // Verifica/aggiorna il profilo
        await verifyAndUpdateProfile(supabase, loginData.user?.id, adminEmail, adminFullName);
        
        // Logout
        await supabase.auth.signOut();
        console.log('✅ Logout completato');
        
        rl.close();
        return;
      }
      
      rl.close();
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
    await verifyAndUpdateProfile(supabase, authData.user?.id, adminEmail, adminFullName);
    
    // Test login
    console.log('\n5. Test login finale...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
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
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('\n⚠️  IMPORTANTE: Usa queste credenziali per il login in produzione!');
    
    // Salva le credenziali in un file sicuro (solo per riferimento)
    const credentialsPath = path.join(__dirname, 'admin-credentials.txt');
    const credentialsContent = `
===============================================
CREDENZIALI ADMIN MYCIVITANOVA - PRODUZIONE
===============================================
Data creazione: ${new Date().toLocaleString()}
Email: ${adminEmail}
Password: ${adminPassword}
Nome: ${adminFullName}
===============================================

IMPORTANTE: Conserva questo file in un luogo sicuro!
`;
    
    try {
      fs.writeFileSync(credentialsPath, credentialsContent);
      console.log(`\n📝 Credenziali salvate in ${credentialsPath}`);
      console.log('⚠️  ATTENZIONE: Conserva questo file in un luogo sicuro e rimuovilo dal server dopo l\'uso!');
    } catch (error) {
      console.error('❌ Errore nel salvataggio delle credenziali:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Errore imprevisto:', error);
  } finally {
    // Chiudi l'interfaccia readline se è stata creata
    if (rl) {
      rl.close();
    }
  }
}

async function verifyAndUpdateProfile(supabase, userId, email, fullName) {
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
        email: email,
        full_name: fullName,
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
    
    // Aggiorna il profilo se necessario
    if (profileData.role !== 'admin' || profileData.email !== email || profileData.full_name !== fullName) {
      console.log('\n4.1 Aggiornamento profilo admin...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          is_active: true,
          is_verified: true,
          email: email,
          full_name: fullName
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Errore aggiornamento profilo:', updateError.message);
      } else {
        console.log('✅ Profilo aggiornato correttamente');
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