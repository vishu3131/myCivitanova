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

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Fallback a ADC solo in ambienti locali dove configurato
    initializeApp({
      credential: applicationDefault(),
    });
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