self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const itemId = event.notification.data ? event.notification.data.id : null;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if ('focus' in client) {
                    client.focus();
                    client.postMessage({ action: 'open_recurring_item', id: itemId });
                    return;
                }
            }
            if (clients.openWindow) {
                const targetUrl = itemId ? `./index.html?open_recurring=${itemId}` : `./index.html`;
                return clients.openWindow(targetUrl);
            }
        })
    );
});
