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
        '/fallback-image.jpg', // Added fallback image
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
          return caches.match('/fallback-image.jpg').then((fallback) => {
            if (fallback) return fallback;
            // Fallback to a default Response if image isn't cached
            return new Response(
              new Blob([new Uint8Array([])], { type: 'image/jpeg' }),
              { status: 404, statusText: 'Image Not Found' }
            );
          });
        }
        return caches.match('/offline.html');
      });
    })
  );
});

self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Invalid push payload:', error);
    data = {
      title: 'MomentCraft Update',
      body: 'New content is available!',
    };
  }
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {
      url: '/',
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