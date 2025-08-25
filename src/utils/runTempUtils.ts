import { getFirebaseUidByEmail } from './tempUtils';

async function run() {
  const email = 'darkgamer751@gmailcom';
  const firebaseUid = await getFirebaseUidByEmail(email);

  if (firebaseUid) {
    console.log(`Firebase UID for ${email}: ${firebaseUid}`);
  } else {
    console.log(`Could not find Firebase UID for ${email}`);
  }
}

run();
