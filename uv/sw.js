// Ultraviolet Service Worker for Static Athyx Network with BareMux + Epoxy Transport

importScripts('uv.bundle.js');
importScripts('uv.config.js');
importScripts('https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux/dist/index.js');
importScripts('uv.sw.js');

const swPath = self.location.pathname;
const basePath = swPath.substring(0, swPath.indexOf('/uv/')) || '';
const bareWorkerPath = (basePath ? basePath : '') + '/scramjet/bareworker.js';

const uv = new UVServiceWorker();
const DEFAULT_WISP = "wss://lunarrr.eminescusm.ro/w/";

let currentWispUrl = DEFAULT_WISP;
let bareMuxClient = null;
let bareMuxInitPromise = null;

async function ensureBareMux() {
    if (bareMuxClient) return bareMuxClient;
    if (bareMuxInitPromise) return await bareMuxInitPromise;

    bareMuxInitPromise = (async () => {
        try {
            const connection = new BareMux.BareMuxConnection(bareWorkerPath);
            await connection.setTransport(
                "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@2.1.28/dist/index.mjs",
                [{ wisp: currentWispUrl }]
            );
            bareMuxClient = new BareMux.BareClient();
            uv.bareClient = bareMuxClient;
            return bareMuxClient;
        } catch (err) {
            console.error("UV SW: Failed to initialize Epoxy/BareMux transport:", err);
            throw err;
        } finally {
            bareMuxInitPromise = null;
        }
    })();

    return await bareMuxInitPromise;
}

// Hook UVServiceWorker fetch method to ensure BareMux transport is initialized before fetching
const originalFetch = uv.fetch.bind(uv);
uv.fetch = async function(event) {
    try {
        await ensureBareMux();
    } catch (e) {
        console.error("UV Transport initialization error:", e);
    }
    return await originalFetch(event);
};

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('message', ({ data }) => {
    if (!data) return;
    if (data.type === 'config' && data.wispurl) {
        if (currentWispUrl !== data.wispurl) {
            currentWispUrl = data.wispurl;
            bareMuxClient = null;
            ensureBareMux().catch(() => {});
        }
    }
});

self.addEventListener('fetch', (event) => {
    if (uv.route(event)) {
        event.respondWith(uv.fetch(event));
    }
});
