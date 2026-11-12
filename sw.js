// Versione Service Worker: 1.6 - Gestione Cache & Fix Definitivo Ricorrenti
const CACHE_NAME = 'smartbudget-v1.6';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Eliminazione vecchia cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

// Intercettazione delle richieste per evitare blocchi di caricamento e cache obsoleta
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const itemId = event.notification.data ? event.notification.data.id : null;
    const targetUrl = new URL(
        itemId ? `./index.html?open_recurring=${encodeURIComponent(itemId)}` : './index.html',
        self.location.href
    ).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if ('focus' in client) {
                    return client.focus().then(() => {
                        return client.navigate(targetUrl);
                    });
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
