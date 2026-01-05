import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../../shared/firebase';
import { useAtomValue } from 'jotai';
import { userAtom } from '../state/authState';
import { InputsService } from '../services/InputsService';

const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;


export function useFCM() {
  const user = useAtomValue(userAtom);

  useEffect(() => {
    if (!user) return;

    const setupFCM = async () => {
      const messaging = getFirebaseMessaging();
      if (!messaging) {
        // App might not be initialized yet, or messaging not supported
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Convert VAPID key from Base64URL to Base64 (handle -/_ and padding)
          // This prevents "InvalidCharacterError: Failed to execute 'atob'" issues
          const safeKey = FIREBASE_VAPID_KEY.replace(/-/g, '+').replace(/_/g, '/');
          const pad = safeKey.length % 4;
          const paddedKey = pad ? safeKey + '='.repeat(4 - pad) : safeKey;

          const currentToken = await getToken(messaging, {
            vapidKey: paddedKey,
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            await InputsService.setFCMToken(currentToken);
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    setupFCM();

    // Foreground message handler
    const messaging = getFirebaseMessaging();
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // You can use a toast library here or just native notifications
        if (payload.notification) {
          new Notification(payload.notification.title || 'Notification', {
            body: payload.notification.body,
            icon: '/favicon.ico',
          });
        }
      });

      return () => unsubscribe();
    }
  }, [user]);
}
