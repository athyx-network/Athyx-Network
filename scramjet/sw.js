// Service Worker for Athyx Proxy (Powered by Scramjet + BareMux + Epoxy + Multi-Wisp Pool)

const ADBLOCK_LIST = [
    // Real Ad Networks & Trackers
    "doubleclick.net",
    "googleads.g.doubleclick.net",
    "pagead2.googlesyndication.com",
    "googlesyndication.com",
    "googleadservices.com",
    "adnxs.com",
    "rubiconproject.com",
    "pubmatic.com",
    "criteo.com",
    "criteo.net",
    "openx.net",
    "taboola.com",
    "outbrain.com",
    "moatads.com",
    "casalemedia.com",
    "unityads.unity3d.com",
    "adsafeprotected.com",
    "chartbeat.com",
    "scorecardresearch.com",
    "quantserve.com",
    "krxd.net",
    "demdex.net",
    "hotjar.com",
    "clarity.ms",
    "popads.net",
    "adcash.com",
    "propellerads.com",
    "monetag.com",
    "exoclick.com",
    "trafficjunky.com",
    "syndication.exdynsrv.com",
    "adroll.com",
    "serving-sys.com",
    "bidswitch.net",
    "smartadserver.com",
    "amazon-adsystem.com",
    "adtechus.com",
    "advertising.com",
    "ads-api.twitter.com",
    "graph.facebook.com/pixel",
    "connect.facebook.net/en_US/fbevents.js"
];

function isAdBlocked(url) {
    if (!url) return false;
    const urlStr = url.toString().toLowerCase();

    // Never block core media playback or API handlers
    if (urlStr.includes("videoplayback") || 
        urlStr.includes("youtubei/v1/player") || 
        urlStr.includes("tiktokcdn.com") || 
        urlStr.includes("googlevideo.com") ||
        urlStr.includes("discord.com/api") ||
        urlStr.includes("discordapp.net") ||
        urlStr.includes("spotify.com") ||
        urlStr.includes("scramjet/")) {
        return false;
    }

    for (const pattern of ADBLOCK_LIST) {
        if (urlStr.includes(pattern)) {
            return true;
        }
    }
    return false;
}

const swPath = self.location.pathname;
const basePath = swPath.substring(0, swPath.lastIndexOf('/') + 1);
self.basePath = self.basePath || basePath;

self.$scramjet = {
    files: {
        wasm: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.wasm.wasm",
        sync: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.sync.js",
    }
};

importScripts("https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.all.js");
importScripts("https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux/dist/index.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker({
    prefix: basePath + "scramjet/"
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

let wispConfig = {
    wispurl: "wss://lunarrr.eminescusm.ro/w/",
    servers: [
        { name: "Lunarr Wisp", url: "wss://lunarrr.eminescusm.ro/w/" },
        { name: "Space Wisp", url: "wss://gointospace.app/wisp/" },
        { name: "Mercury Workshop Wisp", url: "wss://wisp.mercurywork.shop/" },
        { name: "BitDS Wisp", url: "wss://secure.bitds.eu/wisp/" },
        { name: "Baylib Wisp", url: "wss://new-server.baylib.top/connection/" }
    ],
    autoswitch: true
};

let serverHealth = new Map();
let currentServerStartTime = null;
const MAX_CONSECUTIVE_FAILURES = 2;
const PING_TIMEOUT = 2500;

let resolveConfigReady;
const configReadyPromise = new Promise(resolve => resolveConfigReady = resolve);

async function pingServer(url) {
    return new Promise((resolve) => {
        const start = Date.now();
        try {
            const wsUrl = url.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
            const ws = new WebSocket(wsUrl);
            const timeout = setTimeout(() => {
                try { ws.close(); } catch {}
                resolve({ url, success: false, latency: null });
            }, PING_TIMEOUT);

            ws.onopen = () => {
                clearTimeout(timeout);
                const latency = Date.now() - start;
                try { ws.close(); } catch {}
                resolve({ url, success: true, latency });
            };

            ws.onerror = () => {
                clearTimeout(timeout);
                try { ws.close(); } catch {}
                resolve({ url, success: false, latency: null });
            };
        } catch {
            resolve({ url, success: false, latency: null });
        }
    });
}

function updateServerHealth(url, success) {
    const health = serverHealth.get(url) || { consecutiveFailures: 0, successes: 0, lastSuccess: 0 };
    if (success) {
        health.consecutiveFailures = 0;
        health.successes++;
        health.lastSuccess = Date.now();
    } else {
        health.consecutiveFailures++;
    }
    serverHealth.set(url, health);
    return health;
}

function switchToServer(url, latency = null) {
    if (!url || url === wispConfig.wispurl) return;
    
    console.log(`SW: Switching from ${wispConfig.wispurl} to ${url}`);
    wispConfig.wispurl = url;
    currentServerStartTime = Date.now();
    
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'wispChanged',
                url: url,
                name: wispConfig.servers.find(s => s.url === url)?.name || 'Auto-selected Server',
                latency: latency
            });
        });
    });

    if (scramjet && scramjet.client) {
        scramjet.client = null;
    }
}

async function proactiveServerCheck() {
    if (!wispConfig.autoswitch || !wispConfig.servers || wispConfig.servers.length <= 1) return;

    const currentUrl = wispConfig.wispurl;
    const results = await Promise.all(
        wispConfig.servers.map(s => pingServer(s.url))
    );

    results.forEach(r => updateServerHealth(r.url, r.success));

    const currentHealth = serverHealth.get(currentUrl);
    if (currentHealth && currentHealth.consecutiveFailures > 0) {
        const bestWorking = results
            .filter(r => r.success && r.url !== currentUrl)
            .sort((a, b) => a.latency - b.latency)[0];

        if (bestWorking) {
            switchToServer(bestWorking.url, bestWorking.latency);
        }
    }
}

self.addEventListener("message", ({ data }) => {
    if (!data) return;
    if (data.type === "config") {
        if (data.wispurl) {
            wispConfig.wispurl = data.wispurl;
            console.log("SW: Configured wispurl:", data.wispurl);
            currentServerStartTime = Date.now();
        }
        if (data.servers && data.servers.length > 0) {
            wispConfig.servers = data.servers;
            if (wispConfig.autoswitch) {
                setTimeout(proactiveServerCheck, 400);
            }
        }
        if (typeof data.autoswitch !== 'undefined') {
            wispConfig.autoswitch = data.autoswitch;
            if (wispConfig.autoswitch && wispConfig.servers?.length > 0) {
                setTimeout(proactiveServerCheck, 400);
            }
        }
        
        if (wispConfig.wispurl && resolveConfigReady) {
            resolveConfigReady();
            resolveConfigReady = null;
        }
    } else if (data.type === "ping") {
        pingServer(wispConfig.wispurl).then(result => {
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({ type: 'pingResult', ...result });
                });
            });
        });
    }
});

self.addEventListener("fetch", (event) => {
    event.respondWith((async () => {
        if (isAdBlocked(event.request.url)) {
            return new Response(new ArrayBuffer(0), { status: 204 });
        }

        await scramjet.loadConfig();
        if (scramjet.route(event)) {
            return scramjet.fetch(event);
        }
        return fetch(event.request);
    })());
});

function sanitizeHeadersForHttp2(headers) {
    if (!headers) return {};
    const sanitized = {};
    const forbiddenHeaders = new Set([
        'connection',
        'keep-alive',
        'proxy-connection',
        'transfer-encoding',
        'upgrade',
        'http2-settings',
        'proxy-authorization',
        'proxy-authenticate',
        'host'
    ]);

    const entries = headers instanceof Headers
        ? Array.from(headers.entries())
        : Array.isArray(headers)
        ? headers
        : Object.entries(headers);

    for (const [key, value] of entries) {
        if (!key || typeof key !== 'string') continue;
        const lower = key.toLowerCase().trim();
        if (forbiddenHeaders.has(lower)) continue;
        if (lower.startsWith(':')) continue;
        if (lower === 'te' && String(value).toLowerCase().trim() !== 'trailers') continue;
        if (value !== undefined && value !== null) {
            sanitized[key] = String(value);
        }
    }

    return sanitized;
}

async function ensureClient(wispUrl) {
    const connection = new BareMux.BareMuxConnection(basePath + "bareworker.js");
    await connection.setTransport(
        "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@2.1.28/dist/index.mjs",
        [{ wisp: wispUrl }]
    );
    scramjet.client = new BareMux.BareClient();
    return scramjet.client;
}

scramjet.addEventListener("request", async (e) => {
    e.response = (async () => {
        await configReadyPromise;
        
        if (!wispConfig.wispurl) {
            return new Response("Wisp URL not configured", { status: 500 });
        }

        if (!scramjet.client) {
            await ensureClient(wispConfig.wispurl);
        }

        const reqHeaders = sanitizeHeadersForHttp2(e.requestHeaders);
        const fetchOptions = {
            method: e.method || "GET",
            headers: reqHeaders,
            credentials: "include",
            mode: e.mode === "cors" ? e.mode : "same-origin",
            cache: e.cache || "default",
            redirect: "manual"
        };
        if (e.body && e.method !== 'GET' && e.method !== 'HEAD') {
            fetchOptions.body = e.body;
            fetchOptions.duplex = "half";
        }

        const MAX_RETRIES = 2;
        let lastErr;

        for (let i = 0; i <= MAX_RETRIES; i++) {
            try {
                const response = await scramjet.client.fetch(e.url, fetchOptions);
                updateServerHealth(wispConfig.wispurl, true);
                return response;
            } catch (err) {
                lastErr = err;
                const errMsg = (err.message || "").toLowerCase();
                const isRetryable = errMsg.includes("connect") ||
                    errMsg.includes("eof") ||
                    errMsg.includes("handshake") ||
                    errMsg.includes("reset") ||
                    errMsg.includes("http2") ||
                    errMsg.includes("protocol") ||
                    errMsg.includes("closed") ||
                    errMsg.includes("broken pipe");

                if (!isRetryable || i === MAX_RETRIES) break;

                console.warn(`Scramjet retry ${i + 1}/${MAX_RETRIES} for ${e.url} due to: ${err.message}`);

                // Try quick failover to next active server in pool on retry
                if (wispConfig.autoswitch && wispConfig.servers && wispConfig.servers.length > 1) {
                    const nextServer = wispConfig.servers.find(s => s.url !== wispConfig.wispurl);
                    if (nextServer) {
                        try {
                            console.log(`SW: Retrying with failover server ${nextServer.url}`);
                            switchToServer(nextServer.url);
                            await ensureClient(nextServer.url);
                        } catch {}
                    }
                }

                await new Promise(r => setTimeout(r, 300 * (i + 1)));
            }
        }

        updateServerHealth(wispConfig.wispurl, false);

        // Background failover check
        if (wispConfig.autoswitch && wispConfig.servers && wispConfig.servers.length > 1) {
            const currentHealth = serverHealth.get(wispConfig.wispurl);
            if (currentHealth && currentHealth.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                for (const server of wispConfig.servers) {
                    if (server.url === wispConfig.wispurl) continue;
                    const serverH = serverHealth.get(server.url);
                    if (!serverH || serverH.consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
                        const pingResult = await pingServer(server.url);
                        if (pingResult.success) {
                            console.log(`SW: Auto-switching to ${server.url} due to repeated failures`);
                            switchToServer(server.url, pingResult.latency);
                            break;
                        }
                    }
                }
            }
        }

        console.error("Scramjet Final Fetch Error:", lastErr);
        return new Response("Scramjet Fetch Error: " + (lastErr ? lastErr.message : "Network Error"), { status: 502 });
    })();
});