// Script per creare correttamente l'utente admin usando Supabase Auth

const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://mrtxaubsdqxofumrwftm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydHhhdWJzZHF4b2Z1bXJ3ZnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTIxMDcsImV4cCI6MjA2OTY2ODEwN30.nWNMcfUM4kQ9v3KD3plUlebcglPrMReAXR2DWNdNFKg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('🔧 Creazione utente admin - Inizio');
  
  try {
    // Step 1: Registra l'utente admin usando Supabase Auth
    console.log('\n1. Registrazione utente admin...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@admin.it',
      password: 'AdminPass123!',
      options: {
        data: {
          full_name: 'Amministratore Sistema',
          role: 'admin'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Errore registrazione:', authError);
      return;
    }
    
    console.log('✅ Utente admin registrato!');
    console.log('User ID:', authData.user?.id);
    console.log('Email confermata:', authData.user?.email_confirmed_at ? 'Sì' : 'No');
    
    // Step 2: Attendi un momento per il trigger
    console.log('\n2. Attendo creazione profilo...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Verifica che il profilo sia stato creato
    console.log('\n3. Verifica profilo creato...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    if (profileError) {
      console.error('❌ Errore verifica profilo:', profileError);
      
      // Se il profilo non esiste, crealo manualmente
      console.log('\n4. Creazione manuale profilo...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          email: 'admin@admin.it',
          full_name: 'Amministratore Sistema',
          role: 'admin',
          is_active: true,
          is_verified: true
        });
      
      if (insertError) {
        console.error('❌ Errore creazione profilo manuale:', insertError);
        return;
      }
      
      console.log('✅ Profilo creato manualmente');
    } else {
      console.log('✅ Profilo trovato:');
      console.log('- Email:', profileData.email);
      console.log('- Nome:', profileData.full_name);
      console.log('- Ruolo:', profileData.role);
      
      // Aggiorna il ruolo se necessario
      if (profileData.role !== 'admin') {
        console.log('\n5. Aggiornamento ruolo a admin...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', authData.user?.id);
        
        if (updateError) {
          console.error('❌ Errore aggiornamento ruolo:', updateError);
        } else {
          console.log('✅ Ruolo aggiornato a admin');
        }
      }
    }
    
    // Step 4: Test login
    console.log('\n6. Test login admin...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.it',
      password: 'AdminPass123!'
    });
    
    if (loginError) {
      console.error('❌ Errore test login:', loginError);
    } else {
      console.log('✅ Test login riuscito!');
      
      // Logout
      await supabase.auth.signOut();
      console.log('✅ Logout completato');
    }
    
  } catch (error) {
    console.error('💥 Errore imprevisto:', error);
  }
}

// Esegui la creazione
createAdminUser().then(() => {
  console.log('\n🏁 Creazione admin completata');
  console.log('📋 Credenziali admin:');
  console.log('Email: admin@admin.it');
  console.log('Password: AdminPass123!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Errore durante la creazione:', error);
  process.exit(1);
});