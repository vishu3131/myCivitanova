import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { db as firestore } from './firebaseClient';

// Explicitly cast db to Firestore to resolve implicit any type error
const typedFirestore: Firestore = firestore as Firestore;

export async function getFirebaseUidByEmail(email: string): Promise<string | null> {
  try {
    const profilesRef = collection(typedFirestore, 'profiles');
    const q = query(profilesRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.id; // The document ID in Firestore is the Firebase UID
    }
    return null;
  } catch (error) {
    console.error('Error getting Firebase UID by email:', error);
    return null;
  }
}
