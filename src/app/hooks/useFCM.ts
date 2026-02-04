import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../../shared/firebase';
import { useAtomValue } from 'jotai';
import { userAtom } from '../state/authState';
import { InputsService } from '../services/InputsService';
import { useNavigate } from 'react-router-dom';

const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Custom hook that manages Firebase Cloud Messaging (FCM) for push notifications.
 * 
 * Handles:
 * - Service worker registration for background notifications
 * - Permission requests and FCM token management
 * - Foreground message display with rich notification options
 * - Navigation on notification click
 */
export function useFCM() {
  const user = useAtomValue(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Register the service worker for push notifications
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/app/',
          });
          console.log('[useFCM] Service worker registered:', registration.scope);
          return registration;
        } catch (error) {
          console.error('[useFCM] Service worker registration failed:', error);
        }
      }
      return undefined;
    };

    const setupFCM = async () => {
      const messaging = getFirebaseMessaging();
      if (!messaging) {
        // App might not be initialized yet, or messaging not supported
        return;
      }

      // Register service worker first
      const swRegistration = await registerServiceWorker();

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, {
            vapidKey: FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
          });

          if (currentToken) {
            console.log('[useFCM] FCM Token obtained');
            await InputsService.setFCMToken(currentToken);
          } else {
            console.warn('[useFCM] No registration token available. Request permission to generate one.');
          }
        }
      } catch (err) {
        console.error('[useFCM] An error occurred while retrieving token:', err);
      }
    };

    setupFCM();

    // Foreground message handler
    const messaging = getFirebaseMessaging();
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('[useFCM] Foreground message received:', payload);

        if (payload.notification) {
          const notificationType = payload.data?.type;
          const activityId = payload.data?.activity_id;

          // Create notification with enhanced options
          const notification = new Notification(payload.notification.title || 'FitGlue', {
            body: payload.notification.body,
            icon: '/app/icons/icon-192.png',
            badge: '/app/icons/badge-72.png',
            tag: notificationType || 'default',
            data: payload.data,
            requireInteraction: notificationType === 'PENDING_INPUT',
          });

          // Handle click to navigate to the relevant page
          notification.onclick = () => {
            notification.close();
            window.focus();

            if (notificationType && activityId) {
              const urlMap: Record<string, string> = {
                'PENDING_INPUT': `/pending/${activityId}`,
                'PIPELINE_SUCCESS': `/activities/${activityId}`,
                'PIPELINE_FAILED': `/activities/${activityId}`,
              };
              const targetPath = urlMap[notificationType];
              if (targetPath) {
                navigate(targetPath);
              }
            }
          };
        }
      });

      return () => unsubscribe();
    }
  }, [user, navigate]);
}
