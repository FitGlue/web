/// <reference lib="webworker" />
/**
 * Firebase Messaging Service Worker (TypeScript)
 * 
 * This service worker handles:
 * - Background push notifications from FCM
 * - Notification click events with deep linking to /app/ routes
 * 
 * Bundled via Vite as a separate entry point.
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

declare const self: ServiceWorkerGlobalScope;

// Firebase config will be fetched from the hosting environment
let messagingInitialized = false;

async function initializeMessaging() {
    if (messagingInitialized) return;

    try {
        // Fetch Firebase config from hosting
        const response = await fetch('/__/firebase/init.json');
        const config = await response.json();

        // Dev workaround: ensure appId exists
        if (!config.appId) {
            config.appId = '1:911679924866:web:33a1ae4ab3c00b2f41229b';
        }

        const app = initializeApp(config);
        const messaging = getMessaging(app);

        // Handle background messages
        onBackgroundMessage(messaging, (payload) => {
            console.log('[firebase-messaging-sw] Received background message:', payload);

            const notificationTitle = payload.notification?.title || 'FitGlue';
            // Use plain object - browser Notification API supports these properties
            // even though TypeScript's NotificationOptions type is incomplete
            const notificationOptions = {
                body: payload.notification?.body || '',
                icon: '/app/icons/icon-192.png',
                badge: '/app/icons/badge-72.png',
                tag: payload.data?.type || 'default',
                renotify: true,
                data: payload.data,
                vibrate: [100, 50, 100],
                // Keep notification visible until user interacts for important types
                requireInteraction: payload.data?.type === 'PENDING_INPUT',
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });

        messagingInitialized = true;
        console.log('[firebase-messaging-sw] Messaging initialized successfully');
    } catch (error) {
        console.error('[firebase-messaging-sw] Failed to initialize messaging:', error);
    }
}

// Initialize on service worker activation
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(), // Take control of pages immediately
            initializeMessaging(),
        ])
    );
});

// Also try to initialize on message (in case activate already fired)
self.addEventListener('message', (event) => {
    if (event.data?.type === 'INIT_MESSAGING') {
        initializeMessaging();
    }
});

// Handle notification clicks with deep linking
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw] Notification clicked:', event.notification.data);
    event.notification.close();

    const data = event.notification.data as Record<string, string> | undefined;
    const notificationType = data?.type;
    const activityId = data?.activity_id;

    // Build the target URL based on notification type
    let targetUrl = '/app/';

    if (notificationType && activityId) {
        const urlMap: Record<string, string> = {
            'PENDING_INPUT': `/app/pending/${activityId}`,
            'PIPELINE_SUCCESS': `/app/activities/${activityId}`,
            'PIPELINE_FAILED': `/app/activities/${activityId}`,
        };
        targetUrl = urlMap[notificationType] || '/app/';
    }

    // Focus existing window or open new one
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Try to find an existing FitGlue window
            for (const client of clientList) {
                if (client.url.includes('/app/') && 'focus' in client) {
                    client.focus();
                    // Navigate the existing window to the target URL
                    return client.navigate(targetUrl);
                }
            }
            // No existing window, open a new one
            return self.clients.openWindow(targetUrl);
        })
    );
});

// Native push handler - synchronous fallback that always fires
// This ensures notifications display even if Firebase messaging hasn't initialized
self.addEventListener('push', (event) => {
    const data = event.data?.json();
    console.log('[firebase-messaging-sw] Push event received:', data);

    // FCM wraps payload in 'notification' and 'data' fields
    const notification = data?.notification;
    const customData = data?.data;

    if (notification) {
        const notificationTitle = notification.title || 'FitGlue';
        const notificationOptions = {
            body: notification.body || '',
            icon: '/app/icons/icon-192.png',
            badge: '/app/icons/badge-72.png',
            tag: customData?.type || 'default',
            renotify: true,
            data: customData,
            vibrate: [100, 50, 100],
            requireInteraction: customData?.type === 'PENDING_INPUT',
        };

        event.waitUntil(
            self.registration.showNotification(notificationTitle, notificationOptions)
        );
    }
});

// Log service worker lifecycle events for debugging
self.addEventListener('install', () => {
    console.log('[firebase-messaging-sw] Service worker installed');
    // Skip waiting to activate immediately
    self.skipWaiting();
});
