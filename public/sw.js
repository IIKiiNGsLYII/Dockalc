// Dockalc Offline Service Worker
const CACHE_NAME = 'dockalc-offline-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/Dockalc_Icon.png',
  '/yellow-button.png',
  '/favicon.png',
  '/manifest.json',
  '/fonts/chakra-petch-400.woff2',
  '/fonts/chakra-petch-600.woff2',
  '/fonts/chakra-petch-700.woff2',
  '/fonts/inter-400.woff2',
  '/fonts/inter-600.woff2',
  '/fonts/inter-700.woff2',
  '/fonts/jetbrains-mono-400.woff2',
  '/fonts/jetbrains-mono-600.woff2',
  '/fonts/jetbrains-mono-700.woff2',
  '/fonts/montserrat-400.woff2',
  '/fonts/montserrat-600.woff2',
  '/fonts/montserrat-700.woff2',
  '/fonts/montserrat-800.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Some precache assets failed to load:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET or chrome-extension schemes
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle navigation requests (SPA index.html fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Cache-first for same-origin static assets (fonts, images, scripts, styles)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback if offline and not in cache
          if (event.request.destination === 'image') {
            return caches.match('/Dockalc_Icon.png');
          }
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for cross-origin assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});
