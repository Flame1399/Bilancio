// Versione Service Worker: 1.4 - Apertura URL nativa per Home Screen
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const itemId = event.notification.data ? event.notification.data.id : null;
    
    // Costruiamo l'URL con il parametro esatto della spesa ricorrente
    const targetUrl = new URL(
        itemId ? `./index.html?open_recurring=${encodeURIComponent(itemId)}` : './index.html',
        self.location.href
    ).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Se l'app è già aperta in background, la mettiamo a fuoco e navighiamo direttamente all'URL con il parametro
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if ('focus' in client) {
                    return client.focus().then(() => {
                        return client.navigate(targetUrl);
                    });
                }
            }
            // Se l'app era completamente chiusa, apriamo una nuova finestra con l'URL mirato
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
