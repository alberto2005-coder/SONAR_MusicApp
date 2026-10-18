// SONAR — Service Worker mínimo
// Solo da "modo app" e interfaz sin conexión; la música siempre va por red.
const CACHE = 'sonar-shell-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    let url;
    try { url = new URL(req.url); } catch (e) { return; }
    if (url.origin !== self.location.origin) return;      // externos: sin tocar
    if (url.pathname.startsWith('/api/')) return;         // API y audio: siempre red

    // Navegación y estáticos: red primero, y si falla (sin conexión) la caché
    event.respondWith((async () => {
        try {
            const fresh = await fetch(req);
            const cache = await caches.open(CACHE);
            cache.put(req, fresh.clone()).catch(() => {});
            return fresh;
        } catch (err) {
            return (await caches.match(req)) || (await caches.match('/')) || Response.error();
        }
    })());
});
