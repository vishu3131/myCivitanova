/**
 * MYCIVITANOVA - SCRIPT DI SINCRONIZZAZIONE UTENTI FIREBASE -> SUPABASE
 * 
 * Questo script sincronizza tutti gli utenti da Firebase a Supabase.
 * Utile per importare i dati degli utenti esistenti dopo aver sistemato il sistema di sincronizzazione.
 */

// Importa le dipendenze necessarie
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

// Crea un require per importare moduli CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Crea un wrapper per il modulo di sincronizzazione
const createSyncModule = async () => {
  try {
    // Copia le dipendenze necessarie in una posizione temporanea
    const fs = require('fs');
    const path = require('path');
    
    // Crea un modulo temporaneo che corregge i percorsi di importazione
    const tempModuleContent = `
      const firebaseClient = require('./src/utils/firebaseClient.cjs');
      const supabaseClient = require('./src/utils/supabaseClient.cjs');
      const { firebaseSupabaseSync } = require('./src/services/firebaseSupabaseSync.cjs');
      
      module.exports = { firebaseSupabaseSync };
    `;
    
    // Scrivi il modulo temporaneo
    const tempModulePath = path.join(__dirname, 'temp-sync-module.cjs');
    fs.writeFileSync(tempModulePath, tempModuleContent);
    
    // Importa il modulo temporaneo
    const syncModule = require('./temp-sync-module.cjs');
    
    // Rimuovi il file temporaneo dopo l'importazione
    fs.unlinkSync(tempModulePath);
    
    return syncModule.firebaseSupabaseSync;
  } catch (error) {
    console.error('Errore nella creazione del modulo di sincronizzazione:', error);
    throw error;
  }
};

async function syncAllFirebaseUsers() {
  console.log('🔄 Avvio sincronizzazione di tutti gli utenti Firebase con Supabase...');
  
  try {
    // Ottieni il modulo di sincronizzazione
    const firebaseSupabaseSync = await createSyncModule();
    
    // Ottieni le statistiche prima della sincronizzazione
    const statsBefore = await firebaseSupabaseSync.getSyncStats();
    console.log('📊 Statistiche prima della sincronizzazione:');
    console.log(`- Utenti totali: ${statsBefore.totalUsers}`);
    console.log(`- Utenti sincronizzati: ${statsBefore.syncedUsers}`);
    console.log(`- Utenti in attesa: ${statsBefore.pendingUsers}`);
    console.log(`- Utenti con errori: ${statsBefore.errorUsers}`);
    console.log(`- Ultima sincronizzazione: ${statsBefore.lastSync || 'Mai'}`);
    
    // Esegui la sincronizzazione di tutti gli utenti
    console.log('\n🔄 Avvio sincronizzazione batch...');
    const result = await firebaseSupabaseSync.syncAllUsers();
    
    if (result.success) {
      console.log('\n✅ Sincronizzazione completata con successo!');
      console.log('📊 Risultati:');
      console.log(`- Utenti totali processati: ${result.stats.total}`);
      console.log(`- Sincronizzazioni riuscite: ${result.stats.success}`);
      console.log(`- Sincronizzazioni fallite: ${result.stats.error}`);
      console.log(`- Tempo totale: ${(result.stats.duration / 1000).toFixed(2)} secondi`);
      
      // Ottieni le statistiche dopo la sincronizzazione
      const statsAfter = await firebaseSupabaseSync.getSyncStats();
      console.log('\n📊 Statistiche dopo la sincronizzazione:');
      console.log(`- Utenti totali: ${statsAfter.totalUsers}`);
      console.log(`- Utenti sincronizzati: ${statsAfter.syncedUsers}`);
      console.log(`- Utenti in attesa: ${statsAfter.pendingUsers}`);
      console.log(`- Utenti con errori: ${statsAfter.errorUsers}`);
      console.log(`- Ultima sincronizzazione: ${statsAfter.lastSync || 'Mai'}`);
    } else {
      console.error('\n❌ Sincronizzazione fallita o interrotta');
      console.log('📊 Risultati parziali:');
      console.log(`- Utenti totali processati: ${result.stats.total}`);
      console.log(`- Sincronizzazioni riuscite: ${result.stats.success}`);
      console.log(`- Sincronizzazioni fallite: ${result.stats.error}`);
      console.log(`- Tempo totale: ${(result.stats.duration / 1000).toFixed(2)} secondi`);
    }
  } catch (error) {
    console.error('❌ Errore durante la sincronizzazione:', error.message);
    console.error(error);
  }
}

// Esegui la sincronizzazione
syncAllFirebaseUsers();