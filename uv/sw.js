// Ultraviolet Service Worker for Static Athyx Network

importScripts('uv.bundle.js');
importScripts('uv.config.js');
importScripts('https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux/dist/index.js');
importScripts('uv.sw.js');

const uv = new UVServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
    if (uv.route(event)) {
        event.respondWith(uv.fetch(event));
    }
});
