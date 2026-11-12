const CACHE_NAME = 'smartbudget-cache-v1.7';
const assetsToCache = [
    './',
    './index.html',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Installazione del Service Worker e caching delle risorse base
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(assetsToCache);
        })
    );
    self.skipWaiting();
});

// Attivazione e pulizia delle vecchie cache obsolete
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
        })
    );
    self.clients.claim();
});

// Intercettazione delle richieste per il funzionamento offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    // Mette in cache le nuove richieste dinamiche valide
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            }).catch(() => {
                // Eventuale fallback offline se necessario
            });
        })
    );
});
