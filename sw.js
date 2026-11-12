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
    const targetUrl = new URL(
        itemId ? `./index.html?open_recurring=${encodeURIComponent(itemId)}` : './index.html',
        self.location.href
    ).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Cerca una finestra aperta dell'app
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if ('focus' in client) {
                    return client.focus().then(() => {
                        // Invia il messaggio alla finestra attiva
                        client.postMessage({ action: 'open_recurring_item', id: itemId });
                        // Se l'app era in background, forza anche il caricamento del parametro via URL se necessario
                        if (client.url.indexOf('open_recurring') === -1 && itemId) {
                            client.navigate(targetUrl);
                        }
                    });
                }
            }
            // Se nessuna finestra è aperta, aprila da zero passando l'id nell'URL
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
