import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getMessaging, Messaging } from 'firebase/messaging';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let messaging: Messaging | undefined;

async function getFirebaseConfig() {
  try {
    const response = await fetch('/__/firebase/init.json');
    if (response.ok) {
      const config = await response.json();
      // Check if config is valid (has appId)
      if (config.appId) return config;
    }
  } catch (e) {
    console.warn('Could not load Firebase config from hosting.', e);
  }

  return null;
}

export async function initFirebase(): Promise<{ app: FirebaseApp; auth: Auth } | null> {
  if (app && auth) return { app, auth };

  const config = await getFirebaseConfig();
  if (!config) return null;

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
