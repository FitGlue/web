// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by fetching the config
// automatically provided by Firebase Hosting.
fetch('/__/firebase/init.json').then(async response => {
  const config = await response.json();

  // Dev isn't returning an appId for some reason - so add it here
  if (config.appId == undefined || config.appId == "" || config.appId == null) {
    config.appId = "1:911679924866:web:33a1ae4ab3c00b2f41229b"
  }

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
