/**
 * MYCIVITANOVA - SCRIPT DI VERIFICA VARIABILI D'AMBIENTE
 * 
 * Questo script verifica le variabili d'ambiente disponibili nel progetto.
 */

// Importa le dipendenze necessarie
require('dotenv').config();

console.log('🔍 Verifica variabili d\'ambiente...');

// Funzione per mascherare i valori sensibili
function maskValue(value, showChars = 4) {
  if (!value) return 'non impostato';
  if (value.length <= showChars * 2) return '*'.repeat(value.length);
  return value.substring(0, showChars) + '*'.repeat(value.length - showChars * 2) + value.substring(value.length - showChars);
}

// Verifica variabili Firebase
console.log('\n📋 Variabili Firebase:');
console.log(`- NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? maskValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) : 'non impostato'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'non impostato'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'non impostato'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'non impostato'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'non impostato'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_APP_ID: ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? maskValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) : 'non impostato'}`);

// Verifica variabili Firebase Admin
console.log('\n📋 Variabili Firebase Admin:');
console.log(`- FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? maskValue(process.env.FIREBASE_CLIENT_EMAIL) : 'non impostato'}`);
console.log(`- FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? 'impostato (valore nascosto)' : 'non impostato'}`);

// Verifica variabili Supabase
console.log('\n📋 Variabili Supabase:');
console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'non impostato'}`);
console.log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? maskValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) : 'non impostato'}`);
console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? maskValue(process.env.SUPABASE_SERVICE_ROLE_KEY) : 'non impostato'}`);

// Verifica altre variabili comuni
console.log('\n📋 Altre variabili:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'non impostato'}`);
console.log(`- NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'non impostato'}`);

// Mostra tutte le variabili che iniziano con NEXT_PUBLIC_ e non sono già state mostrate
console.log('\n📋 Altre variabili NEXT_PUBLIC_:');
const shownVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_API_URL'
];

let foundOtherPublicVars = false;

Object.keys(process.env).forEach(key => {
  if (key.startsWith('NEXT_PUBLIC_') && !shownVars.includes(key)) {
    console.log(`- ${key}: ${maskValue(process.env[key])}`);
    foundOtherPublicVars = true;
  }
});

if (!foundOtherPublicVars) {
  console.log('Nessuna altra variabile NEXT_PUBLIC_ trovata.');
}

console.log('\n✅ Verifica completata!');