importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

// Cache static assets (JS, CSS, images, favicon)
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.url.includes('favicon.ico') ||
    request.url.includes('manifest.json'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 days
      }),
    ],
  })
);

// Cache API calls (e.g., memories from backend)
workbox.routing.registerRoute(
  /https:\/\/momentcraft-backend\.onrender\.com\/api\/.*/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-calls',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // Cache for 7 days
      }),
    ],
  })
);

// Cache Cloudinary media (images and video thumbnails)
workbox.routing.registerRoute(
  /https:\/\/res\.cloudinary\.com\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'cloudinary-media',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 days
      }),
    ],
  })
);

// Cache the root page for offline access
workbox.routing.registerRoute(
  ({ url }) => url.pathname === '/',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'app-shell',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Handle service worker updates
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate new service worker immediately
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

// Fallback for offline access
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});