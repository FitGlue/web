// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// This will be replaced by the build process or just use a static config if fetched from /__/firebase/init.json
// But for service workers, it's often better to just fetch the init.json or hardcode a placeholder.
// Firebase Hosting provides /__/firebase/init.js which we can't easily importScripts (it's JS, not compatible with importScripts directly without workaround)

// Initialize the Firebase app in the service worker by fetching the config
// automatically provided by Firebase Hosting.
fetch('/__/firebase/init.json').then(async response => {
  const config = await response.json();
  firebase.initializeApp(config);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/favicon.ico',
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
});
