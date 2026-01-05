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
    console.warn('Could not load Firebase config from hosting, falling back to manual config.', e);
  }

  // Fallback to environment variables
  // Note: Vite uses import.meta.env
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  if (envConfig.appId) {
    return envConfig;
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
