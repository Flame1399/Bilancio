const CACHE_NAME = 'smartbudget-cache-v2';
const FILES_TO_CACHE = [
    './index.html',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Installazione del Service Worker e memorizzazione in cache dei file essenziali
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    // Forza l'attivazione immediata della nuova versione senza attendere la chiusura delle schede
    self.skipWaiting();
});

// Attivazione del Service Worker e pulizia delle vecchie cache obsolete
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    // Prende immediatamente il controllo di tutte le pagine aperte
    return self.clients.claim();
});

// Intercettazione delle richieste di rete (Strategia: Cache First, con fallback alla rete)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Se sei offline e richiedi la pagina principale, restituisce index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

// Ascolto del comando inviato dal pulsante "Aggiorna ora" dell'interfaccia
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
