import 'dotenv/config';
import { supabase } from './src/utils/supabaseClient.ts';

async function checkFirebaseUsers() {
  console.log('🔍 Controllo tabella profiles (utenti Firebase)...');
  
  try {
    // Conta tutti gli utenti
    const { data, error, count } = await supabase.direct
      .from('profiles')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    console.log('📊 Totale utenti nella tabella profiles:', count);
    
    if (data && data.length > 0) {
      console.log('\n👥 Utenti trovati:');
      data.forEach((user, index) => {
        const createdDate = new Date(user.created_at).toLocaleDateString('it-IT');
        console.log(`${index + 1}. ${user.full_name || user.email} (${user.email})`);
        console.log(`   - Ruolo: ${user.role}`);
        console.log(`   - Firebase UID: ${user.firebase_uid}`);
        console.log(`   - Creato: ${createdDate}`);
        console.log(`   - Verificato: ${user.is_verified ? 'Sì' : 'No'}`);
        console.log('');
      });
      
      // Controlla utenti di oggi
      const today = new Date().toISOString().split('T')[0];
      const todayUsers = data.filter(user => 
        user.created_at && user.created_at.startsWith(today)
      );
      
      console.log(`📅 Utenti registrati oggi (${today}): ${todayUsers.length}`);
      
      if (todayUsers.length > 0) {
        console.log('Utenti di oggi:');
        todayUsers.forEach(user => {
          console.log(`- ${user.full_name || user.email} (${user.email})`);
        });
      }
    } else {
      console.log('❌ Nessun utente trovato nella tabella profiles');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkFirebaseUsers();