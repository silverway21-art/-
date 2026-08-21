import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  projectId: firebaseConfigJson.projectId,
  appId: firebaseConfigJson.appId,
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connect to the specific named Firestore database provisioned for this applet
export const db = getFirestore(
  firebaseApp,
  firebaseConfigJson.firestoreDatabaseId || '(default)'
);

// Connection test on boot
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Connection verified successfully.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase] Offline or configuration error:', error);
    } else {
      console.log('[Firebase] Connected to Firestore endpoint.');
    }
    return false;
  }
}
