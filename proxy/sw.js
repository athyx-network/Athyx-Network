// Calculate the dynamic base path for the Service Worker.
const swPath = self.location.pathname;
const basePath = swPath.substring(0, swPath.lastIndexOf('/') + 1);

// Fallback for basePath to ensure it's always defined
self.basePath = self.basePath || basePath;

self.$scramjet = {
    files: {
        wasm: `${basePath}JS/scramjet.wasm.wasm`,
        sync: `${basePath}JS/scramjet.sync.js`,
    }
};

// Load ALL required scripts at the top level.
importScripts(`${basePath}JS/scramjet.all.js`);
importScripts(`${basePath}B/index.js`);

const { ScramjetServiceWorker } = $scramjetLoadWorker();

const scramjet = new ScramjetServiceWorker({
    prefix: basePath + 'JS/scramjet/',
});

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});


self.addEventListener("fetch", (event) => {
    event.respondWith((async () => {
        // Wait for the scramjet config to be loaded before routing.
        // This can prevent race conditions on initial load.
        await scramjet.loadConfig();
        if (scramjet.route(event)) {
            return scramjet.fetch(event);
        }
        return fetch(event.request);
    })());
});

let wispConfig = {
    wispurl: "wss://lunarrr.eminescusm.ro/w/"
};

self.addEventListener("message", ({ data }) => {
	if (data && data.type === "config" && data.wispurl) {
		wispConfig.wispurl = data.wispurl;
        configureBareMux(data.wispurl);
	}
});

let transportReady = false;
async function configureBareMux(wispUrl) {
    try {
        const targetWisp = wispUrl || wispConfig.wispurl;
        const connection = new BareMux.BareMuxConnection(`${basePath}B/worker.js`);
        await connection.setTransport(`${basePath}Ep/index.mjs`, [{ wisp: targetWisp }]);
        transportReady = true;
    } catch (err) {
        console.warn("SW BareMux transport config warning:", err);
    }
}

// Initial configuration
configureBareMux(wispConfig.wispurl);
