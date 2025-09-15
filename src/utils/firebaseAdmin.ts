import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initFirebaseAdmin() {
  if (getApps().length) return;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';

  // Normalizza eventuali \n nella chiave privata
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey && privateKey.trim() !== '') {
    console.log('🔧 Inizializzazione Firebase Admin con credenziali certificate');
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    console.warn('⚠️ Credenziali Firebase Admin non configurate, tentativo con ADC');
    console.warn('📝 Per configurare: aggiungi FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY al file .env.local');
    try {
      // Fallback a ADC solo in ambienti locali dove configurato
      initializeApp({
        credential: applicationDefault(),
      });
      console.log('✅ Firebase Admin inizializzato con ADC');
    } catch (error) {
      console.error('❌ Impossibile inizializzare Firebase Admin:', error);
      throw new Error('Firebase Admin non configurato correttamente. Verifica le credenziali nel file .env.local');
    }
  }
}

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  initFirebaseAdmin();
  return getAuth().verifyIdToken(idToken);
}

export function adminAuth() {
  initFirebaseAdmin();
  return getAuth();
}

export function adminFirestore() {
  initFirebaseAdmin();
  return getFirestore();
}