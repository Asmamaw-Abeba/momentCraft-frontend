importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'image' ||
    request.url.includes('favicon.ico') ||
    request.url.includes('manifest.json'),
  new workbox.strategies.CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /https:\/\/momentcraft-backend\.onrender\.com\/api\/.*/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-calls',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  /https:\/\/res\.cloudinary\.com\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'cloudinary-media',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.pathname === '/',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'app-shell',
  })
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('static-resources').then((cache) => {
      return cache.addAll([
        '/favicon.ico',
        '/icon-192x192.png',
        '/icon-512x512.png',
        '/manifest.json',
        '/offline.html',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== 'static-resources' && cacheName !== 'api-calls' && cacheName !== 'cloudinary-media' && cacheName !== 'app-shell')
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/fallback-image.jpg');
        }
        return caches.match('/offline.html');
      });
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: '/', // Redirect to app on click
    },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});