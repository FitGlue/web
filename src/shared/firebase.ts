import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

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

  app = initializeApp(config);
  auth = getAuth(app);
  return { app, auth };
}

export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
