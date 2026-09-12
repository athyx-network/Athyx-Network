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
        wasm: basePath + "scramjet.wasm.wasm",
        sync: basePath + "scramjet.sync.js",
    }
};

importScripts(basePath + "scramjet.all.js");
importScripts("https://cdn.jsdelivr.net/npm/@mercuryworkshop/bare-mux/dist/index.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

let wispConfig = {
    wispurl: "wss://lunarrr.eminescusm.ro/w/",
    servers: [
        { name: "Lunarr Wisp", url: "wss://lunarrr.eminescusm.ro/w/" },
        { name: "Space Wisp", url: "wss://gointospace.app/wisp/" },
        { name: "Mercury Workshop Wisp", url: "wss://wisp.mercurywork.shop/" },
        { name: "Lervs Wisp", url: "wss://eyes.lervs.ro/wisp/" },
        { name: "Baylib Wisp", url: "wss://new-server.baylib.top/connection/" }
    ],
    autoswitch: true
};

let serverHealth = new Map();
let currentServerStartTime = null;
const MAX_CONSECUTIVE_FAILURES = 2;
const PING_TIMEOUT = 2500;
const FETCH_TIMEOUT_MS = 30000;

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
    wispConfig.activeClientUrl = null;
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
    const currentHealth = serverHealth.get(currentUrl);

    // Only initiate failover if the current server has repeatedly failed
    if (currentHealth && currentHealth.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        const currentCheck = await pingServer(currentUrl);
        if (currentCheck.success) {
            updateServerHealth(currentUrl, true);
            return;
        }

        const results = await Promise.all(
            wispConfig.servers.map(s => pingServer(s.url))
        );
        results.forEach(r => updateServerHealth(r.url, r.success));

        const bestWorking = results
            .filter(r => r.success && r.url !== currentUrl)
            .sort((a, b) => (a.latency || 9999) - (b.latency || 9999))[0];

        if (bestWorking) {
            switchToServer(bestWorking.url, bestWorking.latency);
        }
    }
}

self.addEventListener("message", ({ data }) => {
    if (!data) return;
    if (data.type === "config") {
        if (data.wispurl && data.wispurl !== wispConfig.wispurl) {
            wispConfig.wispurl = data.wispurl;
            wispConfig.activeClientUrl = null;
            if (scramjet && scramjet.client) scramjet.client = null;
            console.log("SW: Updated wispurl:", data.wispurl);
            currentServerStartTime = Date.now();
        }
        if (data.servers && data.servers.length > 0) {
            wispConfig.servers = data.servers;
        }
        if (typeof data.autoswitch !== 'undefined') {
            wispConfig.autoswitch = data.autoswitch;
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
    const url = event.request.url;

    // Check if the request is an Athyx UI shell static asset that should not be intercepted
    if (url.startsWith(self.location.origin)) {
        try {
            const pathname = new URL(url).pathname;
            const isLocalAppShell = (
                pathname === basePath ||
                pathname === basePath + "index.html" ||
                pathname === basePath + "NT.html" ||
                pathname === basePath + "embed.html" ||
                pathname === basePath + "style.css" ||
                pathname === basePath + "script.js" ||
                pathname === basePath + "sw.js" ||
                pathname === basePath + "bareworker.js" ||
                pathname === basePath + "scramjet.all.js" ||
                pathname === basePath + "scramjet.sync.js" ||
                pathname.startsWith("/themes.") ||
                pathname.startsWith("/settings.") ||
                pathname.startsWith("/home.") ||
                pathname.startsWith("/favicon.") ||
                pathname.startsWith("/assets/") ||
                pathname.startsWith("/scripts/") ||
                pathname.startsWith("/styles/")
            );

            // If it is a local Athyx UI shell file and NOT part of the scramjet proxy path, allow normal browser network fetch
            if (isLocalAppShell && !pathname.startsWith(basePath + "scramjet/")) {
                return;
            }
        } catch (e) {}
    }

    // Handle all proxied requests via Scramjet
    event.respondWith((async () => {
        if (isAdBlocked(url)) {
            return new Response("{}", {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*"
                }
            });
        }

        try {
            await scramjet.loadConfig();
            if (scramjet.route(event)) {
                return await scramjet.fetch(event);
            }
        } catch (err) {
            console.warn("SW fetch routing error:", err);
        }

        // If the request was NOT routed by scramjet, check if it's an external URL intercepted from a proxied page
        if (!url.startsWith(self.location.origin) && (url.startsWith("http://") || url.startsWith("https://"))) {
            try {
                // If it is a page navigation, redirect into Scramjet's prefix
                if (event.request.mode === 'navigate' || event.request.destination === 'document' || event.request.destination === 'iframe') {
                    const encodedUrl = encodeURIComponent(url);
                    return Response.redirect(self.location.origin + basePath + 'scramjet/' + encodedUrl, 302);
                }

                // For sub-resources (fetch, xhr, media, script, etc.), proxy through Wisp so client IP is never exposed
                const targetWisp = wispConfig.wispurl || "wss://lunarrr.eminescusm.ro/w/";
                const client = await ensureClient(targetWisp);
                const reqHeaders = sanitizeHeadersForHttp2(event.request.headers, url);
                const fetchOptions = {
                    method: event.request.method,
                    headers: reqHeaders,
                    credentials: "omit",
                    mode: event.request.mode === "cors" ? "cors" : "same-origin",
                    cache: event.request.cache || "default",
                    redirect: "manual"
                };
                if (event.request.body && event.request.method !== 'GET' && event.request.method !== 'HEAD') {
                    fetchOptions.body = event.request.body;
                    fetchOptions.duplex = "half";
                }
                const response = await fetchWithTimeout(client, url, fetchOptions, FETCH_TIMEOUT_MS);
                return response;
            } catch (proxyErr) {
                console.warn("SW external fetch proxy error for", url, proxyErr);
            }
        }

        try {
            return await fetch(event.request);
        } catch (err) {
            return new Response(null, { status: 204 });
        }
    })());
});

function sanitizeHeadersForHttp2(headers, targetUrlStr = "") {
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
            let strVal = String(value);
            // Browser Headers/Request requires byte string (ISO-8859-1 / char code <= 255)
            // Sanitize non-Latin-1 chars to prevent TypeError: String contains non ISO-8859-1 code point
            const safeValue = strVal.replace(/[^\x00-\xFF]/g, (c) => encodeURIComponent(c));
            sanitized[lower] = safeValue;
        }
    }

    const urlLower = (targetUrlStr || "").toLowerCase();
    const isGoogleOrYt = urlLower.includes("googlevideo.com") || urlLower.includes("youtube.com") || urlLower.includes("ytimg.com");

    if (isGoogleOrYt) {
        sanitized['origin'] = 'https://www.youtube.com';
        sanitized['referer'] = 'https://www.youtube.com/';
    } else if (targetUrlStr) {
        try {
            const parsedTarget = new URL(targetUrlStr);
            if (sanitized['origin'] && (sanitized['origin'].includes('localhost') || sanitized['origin'].includes('127.0.0.1'))) {
                sanitized['origin'] = parsedTarget.origin;
            }
            if (sanitized['referer'] && (sanitized['referer'].includes('localhost') || sanitized['referer'].includes('127.0.0.1') || sanitized['referer'].includes('/scramjet/'))) {
                sanitized['referer'] = parsedTarget.origin + '/';
            }
        } catch (e) {}
    }

    for (const k of Object.keys(sanitized)) {
        if (typeof sanitized[k] === 'string' && (sanitized[k].includes('localhost:3333') || sanitized[k].includes('127.0.0.1:3333'))) {
            if (k === 'origin' || k === 'referer') continue;
            delete sanitized[k];
        }
    }

    return sanitized;
}

let clientInitPromise = null;
async function ensureClient(wispUrl) {
    if (scramjet.client && wispConfig.activeClientUrl === wispUrl) {
        return scramjet.client;
    }
    if (clientInitPromise) {
        return await clientInitPromise;
    }

    clientInitPromise = (async () => {
        try {
            const connection = new BareMux.BareMuxConnection(basePath + "bareworker.js");
            await connection.setTransport(
                "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@2.1.28/dist/index.mjs",
                [{ wisp: wispUrl }]
            );
            scramjet.client = new BareMux.BareClient();
            wispConfig.activeClientUrl = wispUrl;
            return scramjet.client;
        } finally {
            clientInitPromise = null;
        }
    })();

    return await clientInitPromise;
}

async function fetchWithTimeout(client, url, options, timeoutMs = FETCH_TIMEOUT_MS) {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Request to ${url} timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    try {
        const res = await Promise.race([
            client.fetch(url, options),
            timeoutPromise
        ]);
        clearTimeout(timer);
        return res;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

scramjet.addEventListener("request", async (e) => {
    e.response = (async () => {
        const targetWisp = wispConfig.wispurl || "wss://lunarrr.eminescusm.ro/w/";

        try {
            await ensureClient(targetWisp);
        } catch (connErr) {
            console.error("SW: Failed to initialize BareClient:", connErr);
            return new Response("Wisp Connection Error: " + connErr.message, { status: 503 });
        }

        const reqHeaders = sanitizeHeadersForHttp2(e.requestHeaders, e.url ? e.url.href : "");
        const fetchOptions = {
            method: e.method || "GET",
            headers: reqHeaders,
            credentials: "omit",
            mode: e.mode || "cors",
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
                const response = await fetchWithTimeout(scramjet.client, e.url, fetchOptions, FETCH_TIMEOUT_MS);
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
                    errMsg.includes("timeout") ||
                    errMsg.includes("broken pipe");

                if (!isRetryable || i === MAX_RETRIES) break;

                console.warn(`Scramjet retry ${i + 1}/${MAX_RETRIES} for ${e.url} (Attempt ${i + 1}): ${err.message}`);
                if (i === 0) {
                    try {
                        scramjet.client = null;
                        wispConfig.activeClientUrl = null;
                        await ensureClient(targetWisp);
                    } catch (_) {}
                }
                await new Promise(r => setTimeout(r, 200 * Math.pow(2, i)));
            }
        }

        updateServerHealth(wispConfig.wispurl, false);
        console.error("Scramjet Final Fetch Error:", lastErr);
        return new Response("Scramjet Fetch Error: " + (lastErr ? lastErr.message : "Network Error"), { status: 502 });
    })();
});