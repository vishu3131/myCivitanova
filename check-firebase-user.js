// Script per verificare se l'utente darkgamer752@gmail.com è presente in Firebase Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

// Configurazione Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirebaseUser() {
  console.log('🔍 Controllo utente darkgamer752@gmail.com in Firebase Firestore...');
  
  try {
    // Cerca l'utente nella collezione profiles
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('email', '==', 'darkgamer752@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('✅ Utente trovato in Firebase Firestore!');
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('📊 Dati utente:');
        console.log('   - Firebase UID:', doc.id);
        console.log('   - Email:', userData.email);
        console.log('   - Nome completo:', userData.fullName || userData.full_name || 'N/A');
        console.log('   - Username:', userData.username || 'N/A');
        console.log('   - Telefono:', userData.phone || 'N/A');
        console.log('   - Ruolo:', userData.role || 'N/A');
        console.log('   - Creato il:', userData.createdAt || userData.created_at || 'N/A');
        console.log('   - Verificato:', userData.isVerified || userData.is_verified || false);
        console.log('   - Attivo:', userData.isActive || userData.is_active || false);
      });
      
      return true;
    } else {
      console.log('❌ Utente NON trovato in Firebase Firestore');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Errore durante la ricerca:', error.message);
    return false;
  }
}

// Esegui la verifica
checkFirebaseUser().then((found) => {
  if (found) {
    console.log('\n✅ L\'utente è registrato in Firebase ma potrebbe non essere sincronizzato con Supabase.');
  } else {
    console.log('\n❌ L\'utente non è presente in Firebase Firestore.');
  }
  process.exit(0);
}).catch((error) => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});