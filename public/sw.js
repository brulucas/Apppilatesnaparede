/* Pilates 21 · Service Worker — self-unregistering (nuke stale caches) */
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll();
    clients.forEach(c => c.navigate(c.url));
  })());
});

self.addEventListener('fetch', (e) => {
  // Bypass cache entirely — always go to network
  e.respondWith(fetch(e.request));
});
