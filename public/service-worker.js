const CACHE_NAME = 'tradelink-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/auth.html',
  '/consumer-dashboard.html',
  '/retailer-dashboard.html',
  '/wholesaler-dashboard.html',
  '/supplier-dashboard.html',
  '/admin-dashboard.html',
  '/manifest.json',
  '/assets/responsive.css',
  '/js/otp-handler.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // Optional: return a fallback page if network fails and resource not in cache
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
