import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getMessaging, Messaging } from 'firebase/messaging';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let messaging: Messaging | undefined;

async function getFirebaseConfig() {
  try {
    const response = await fetch('/__/firebase/init.json');
    if (!response.ok) throw new Error('Failed to fetch firebase config');
    return await response.json();
  } catch (e) {
    console.error('Could not load Firebase config.', e);
    return null;
  }
}

export async function initFirebase(): Promise<{ app: FirebaseApp; auth: Auth } | null> {
  if (app && auth) return { app, auth };

  const config = await getFirebaseConfig();
  if (!config) return null;
  console.log('Firebase Config Loaded:', config); // Debugging

  app = initializeApp(config);
  auth = getAuth(app);

  // Messaging only works in browser with SW support
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.warn('Messaging not supported in this environment', e);
  }

  return { app, auth };
}

export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirebaseMessaging = () => messaging;
