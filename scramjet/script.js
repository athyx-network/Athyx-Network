

const JSDELIVR_WISP_URL = "https://cdn.jsdelivr.net/gh/athyx-network/Athyx-Network@main/wisp.txt";
const DEFAULT_WISP = window.SITE_CONFIG?.defaultWisp ?? "wss://lunarrr.eminescusm.ro/w/";
let WISP_SERVERS = [
    { name: "Escala Humana Wisp", url: "wss://math.soyescalahumana.cl/wisp/" },
    { name: "Gressvik BMX Wisp", url: "wss://school.gressvikbmx.no/wisp/" },
    { name: "Lervs Wisp", url: "wss://eyes.lervs.ro/wisp/" },
    { name: "SimplySweet Wisp", url: "wss://sp2.simplysweetcakesoc.com/wisp/" },
    { name: "TribeOfTwo Wisp", url: "wss://keep.tribeoftwo.com/wisp/" },
    { name: "BitDS Wisp", url: "wss://secure.bitds.eu/wisp/" },
    { name: "Sahur Wisp", url: "wss://sahur.anymor.org/wisp/" },
    { name: "Baylib Wisp", url: "wss://new-server.baylib.top/connection/" },
    { name: "Mercury Workshop Wisp", url: "wss://wisp.mercurywork.shop/" },
    { name: "Space Wisp", url: "wss://gointospace.app/wisp/" },
    { name: "Lunarr Wisp", url: "wss://lunarrr.eminescusm.ro/w/" }
];

function formatWispName(url) {
    try {
        const host = new URL(url.replace(/^wss:\/\//i, 'https://').replace(/^ws:\/\//i, 'http://')).hostname;
        if (host.includes('lunarrr')) return 'Lunarr Wisp';
        if (host.includes('gointospace')) return 'Space Wisp';
        if (host.includes('mercurywork')) return 'Mercury Workshop Wisp';
        if (host.includes('bitds')) return 'BitDS Wisp';
        if (host.includes('baylib')) return 'Baylib Wisp';
        if (host.includes('tribeoftwo')) return 'TribeOfTwo Wisp';
        if (host.includes('simplysweetcakesoc')) return 'SimplySweet Wisp';
        if (host.includes('lervs')) return 'Lervs Wisp';
        if (host.includes('gressvikbmx')) return 'Gressvik BMX Wisp';
        if (host.includes('soyescalahumana')) return 'Escala Humana Wisp';
        if (host.includes('anymor')) return 'Sahur Wisp';
        const parts = host.split('.');
        const label = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        return label + ' Wisp';
    } catch (e) {
        return url;
    }
}

async function loadWispServersFromTxt() {
    const sources = [
        JSDELIVR_WISP_URL,
        'wisp.txt',
        '../wisp.txt'
    ];
    for (const src of sources) {
        try {
            const res = await fetch(src + (src.includes('jsdelivr') ? '?v=' + Date.now() : ''));
            if (!res.ok) continue;
            const text = await res.text();
            const lines = text.split(/\r?\n/);
            const parsed = [];
            const seen = new Set();
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith('#') || !line.startsWith('ws')) continue;
                if (!seen.has(line)) {
                    seen.add(line);
                    parsed.push({
                        name: formatWispName(line),
                        url: line
                    });
                }
            }
            if (parsed.length > 0) {
                WISP_SERVERS = parsed;
                return parsed;
            }
        } catch(e) {}
    }
    return null;
}

// Auto-load on background
loadWispServersFromTxt().then(() => {
    if (localStorage.getItem('wispAutoswitch') === 'true') {
        initializeWithBestServer();
    }
});

const currentSavedWisp = localStorage.getItem("proxServer");
if (!currentSavedWisp || currentSavedWisp.includes("defschoolwork") || currentSavedWisp.includes("kutakutik") || currentSavedWisp.startsWith("https://lunarrr")) {
    localStorage.setItem("proxServer", DEFAULT_WISP);
}

try {
    let customList = JSON.parse(localStorage.getItem('customWisps') || '[]');
    customList = customList.filter(s => s && s.url && !s.url.includes('defschoolwork') && !s.url.includes('kutakutik'));
    localStorage.setItem('customWisps', JSON.stringify(customList));
} catch(e) {}

function getAllWispServers() {
    const customWisps = getStoredWisps();
    return [...WISP_SERVERS, ...customWisps];
}

async function pingWispServer(url, timeout = 2000) {
    return new Promise((resolve) => {
        const start = Date.now();
        try {
            const wsUrl = url.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
            const ws = new WebSocket(wsUrl);
            const timer = setTimeout(() => {
                try { ws.close(); } catch {}
                resolve({ url, success: false, latency: null });
            }, timeout);

            ws.onopen = () => {
                clearTimeout(timer);
                const latency = Date.now() - start;
                try { ws.close(); } catch {}
                resolve({ url, success: true, latency });
            };

            ws.onerror = () => {
                clearTimeout(timer);
                try { ws.close(); } catch {}
                resolve({ url, success: false, latency: null });
            };
        } catch {
            resolve({ url, success: false, latency: null });
        }
    });
}

async function findBestWispServer(servers, currentUrl) {
    if (!servers || servers.length === 0) return currentUrl;

    
    const results = await Promise.all(
        servers.map(s => pingWispServer(s.url, 2000))
    );

    
    const working = results
        .filter(r => r.success)
        .sort((a, b) => a.latency - b.latency);

    if (working.length > 0) {
        return working[0].url;
    }

    
    return currentUrl || servers[0]?.url;
}

async function initializeWithBestServer() {
    const autoswitch = localStorage.getItem('wispAutoswitch') === 'true';
    const allServers = getAllWispServers();

    if (!autoswitch || allServers.length <= 1) {
        return;
    }

    try {
        const currentUrl = localStorage.getItem("proxServer") || DEFAULT_WISP;
        const currentCheck = await pingWispServer(currentUrl, 1500);
        
        if (currentCheck.success) return;

        const best = await findBestWispServer(allServers, currentUrl);
        if (best && best !== currentUrl) {
            localStorage.setItem("proxServer", best);
            setWisp(best);
        }
    } catch(e) {}
}

const BareMux = window.BareMux ?? { BareMuxConnection: class { setTransport() {} } };

let sharedScramjet = null;
let sharedConnection = null;
let sharedConnectionReady = false;

let tabs = [];
let activeTabId = null;
let nextTabId = 1;

const getBasePath = () => {
    const basePath = location.pathname.replace(/[^/]*$/, '');
    return basePath.endsWith('/') ? basePath : basePath + '/';
};

const getStoredWisps = () => {
    try { return JSON.parse(localStorage.getItem('customWisps') ?? '[]'); }
    catch { return []; }
};

const getActiveTab = () => tabs.find(t => t.id === activeTabId);

const notify = (type, title, message) => {
    if (typeof Notify !== 'undefined' && Notify[type]) {
        Notify[type](title, message);
        return;
    }
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'notification';
    const icon = type === 'error' ? 'fa-circle-xmark' : type === 'warning' ? 'fa-triangle-exclamation' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check';
    const color = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'info' ? '#3b82f6' : '#10b981';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:${color}; font-size:16px;"></i><div><div style="font-weight:600;font-size:13px;">${title}</div><div style="color:var(--text-muted);font-size:12px;">${message}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
};

async function getSharedScramjet() {
    if (sharedScramjet) return sharedScramjet;

    const basePath = getBasePath();
    const { ScramjetController } = $scramjetLoadController();
    
    sharedScramjet = new ScramjetController({
        prefix: basePath + "scramjet/",
        files: {
            wasm: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.wasm.wasm",
            all: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.all.js",
            sync: "https://cdn.jsdelivr.net/gh/Destroyed12121/Staticsj@main/JS/scramjet.sync.js"
        }
    });
    
    try {
        await sharedScramjet.init();
    } catch (err) {
        
        if (err.message && err.message.includes('IDBDatabase') || err.message && err.message.includes('object stores')) {
            console.warn('Scramjet IndexedDB error, clearing cache and retrying...');
            
            
            try {
                const dbNames = ['scramjet-data', 'scrambase', 'ScramjetData'];
                for (const dbName of dbNames) {
                    const req = indexedDB.deleteDatabase(dbName);
                    req.onsuccess = () => console.log(`Cleared IndexedDB: ${dbName}`);
                    req.onerror = () => console.warn(`Failed to clear IndexedDB: ${dbName}`);
                }
            } catch (clearErr) {
                console.warn('Failed to clear IndexedDB:', clearErr);
            }
            
            
            sharedScramjet = null;
            return getSharedScramjet();
        }
        throw err;
    }
    
    return sharedScramjet;
}

async function getSharedConnection() {
    if (sharedConnectionReady) return sharedConnection;

    const basePath = getBasePath();
    const wispUrl = localStorage.getItem("proxServer") ?? DEFAULT_WISP;
    
    try {
        sharedConnection = new BareMux.BareMuxConnection(basePath + "bareworker.js");
        await sharedConnection.setTransport(
            "https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-transport@2.1.28/dist/index.mjs",
            [{ wisp: wispUrl }]
        );
        sharedConnectionReady = true;
    } catch (e) {
        console.warn("Shared connection initialization warning:", e);
    }
    return sharedConnection;
}

if (localStorage.getItem('wispAutoswitch') === null) {
    localStorage.setItem('wispAutoswitch', 'true');
}

async function initializeBrowser() {
    const root = document.getElementById("app");
    root.innerHTML = `
        <div class="browser-container">
            <div class="flex tabs" id="tabs-container"></div>
            <div class="flex nav">
                <button id="back-btn" title="Back"><i class="fa-solid fa-chevron-left"></i></button>
                <button id="fwd-btn" title="Forward"><i class="fa-solid fa-chevron-right"></i></button>
                <button id="reload-btn" title="Reload"><i class="fa-solid fa-rotate-right"></i></button>
                <div class="address-wrapper">
                    <input class="bar" id="address-bar" autocomplete="off" placeholder="Search or enter URL">
                    <button id="home-btn-nav" title="Home"><i class="fa-solid fa-house"></i></button>
                </div>
                <button id="devtools-btn" title="Inspect / DevTools"><i class="fa-solid fa-code"></i></button>
                <button id="fullscreen-btn" title="Toggle Fullscreen"><i class="fa-solid fa-expand"></i></button>
                <button id="cloak-btn" title="Open in Cloaked Tab"><i class="fa-solid fa-mask"></i></button>
                <button id="wisp-settings-btn" title="Proxy Settings"><i class="fa-solid fa-gear"></i></button>
            </div>
            <div class="loading-bar-container"><div class="loading-bar" id="loading-bar"></div></div>
            <div class="iframe-container" id="iframe-container">
                <div id="loading" class="message-container" style="display: none;">
                    <div class="message-content">
                        <div class="spinner"></div>
                        <h1 id="loading-title">Connecting</h1>
                        <p id="loading-url">Initializing proxy...</p>
                        <button id="skip-btn">Skip</button>
                    </div>
                </div>
                <div id="error" class="message-container" style="display: none;">
                    <div class="message-content">
                        <h1>Connection Error</h1>
                        <p id="error-message">An error occurred.</p>
                    </div>
                </div>
            </div>
        </div>`;

    
    const elements = {
        backBtn: document.getElementById('back-btn'),
        fwdBtn: document.getElementById('fwd-btn'),
        reloadBtn: document.getElementById('reload-btn'),
        addrBar: document.getElementById('address-bar'),
        skipBtn: document.getElementById('skip-btn')
    };

    
    elements.backBtn.onclick = () => getActiveTab()?.frame.back();
    elements.fwdBtn.onclick = () => getActiveTab()?.frame.forward();
    elements.reloadBtn.onclick = () => getActiveTab()?.frame.reload();
    document.getElementById('home-btn-nav').onclick = () => window.location.href = '../index.html';
    document.getElementById('devtools-btn').onclick = toggleDevTools;
    document.getElementById('fullscreen-btn').onclick = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };
    document.getElementById('cloak-btn').onclick = () => {
        if (typeof cloakPage === 'function') cloakPage();
    };
    document.getElementById('wisp-settings-btn').onclick = openSettings;

    
    elements.skipBtn.onclick = () => {
        const tab = getActiveTab();
        if (tab) {
            tab.loading = false;
            showIframeLoading(false);
        }
    };

    
    elements.addrBar.onkeyup = (e) => e.key === 'Enter' && handleSubmit();
    elements.addrBar.onfocus = () => elements.addrBar.select();

    
    window.addEventListener('message', (e) => {
        if (e.data?.type === 'navigate') handleSubmit(e.data.url);
    });

    createTab(true);
    checkHashParameters();
}

function createTab(makeActive = true) {
    const frame = sharedScramjet.createFrame();
    const tab = {
        id: nextTabId++,
        title: "New Tab",
        url: "NT.html",
        frame,
        loading: false,
        favicon: null,
        skipTimeout: null,
        loadStartTime: null
    };

    frame.frame.src = "NT.html";

    frame.addEventListener("urlchange", (e) => {
        tab.url = e.url;
        tab.loading = true;
        tab.loadStartTime = Date.now();

        if (tab.id === activeTabId) {
            showIframeLoading(true, tab.url);
        }

        try {
            const urlObj = new URL(e.url);
            tab.title = urlObj.hostname;
            tab.favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
        } catch {
            tab.title = "Browsing";
            tab.favicon = null;
        }
        
        updateTabsUI();
        updateAddressBar();
        updateLoadingBar(tab, 10);

        if (tab.skipTimeout) clearTimeout(tab.skipTimeout);
        tab.skipTimeout = setTimeout(() => {
            if (tab.loading && tab.id === activeTabId) {
                document.getElementById('skip-btn')?.style.setProperty('display', 'inline-block');
            }
        }, 200);
    });

    frame.frame.addEventListener('load', () => {
        tab.loading = false;
        clearTimeout(tab.skipTimeout);

        if (tab.id === activeTabId) {
            showIframeLoading(false);
        }

        try {
            const title = frame.frame.contentWindow.document.title;
            if (title) tab.title = title;
        } catch { }

        if (frame.frame.contentWindow.location.href.includes('NT.html')) {
            tab.title = "New Tab";
            tab.url = "";
            tab.favicon = null;
        }

        updateTabsUI();
        updateAddressBar();
        updateLoadingBar(tab, 100);
    });

    tabs.push(tab);
    document.getElementById("iframe-container").appendChild(frame.frame);
    if (makeActive) switchTab(tab.id);
    return tab;
}

function showIframeLoading(show, url = '') {
    const loader = document.getElementById("loading");
    if (!loader) return;

    loader.style.display = show ? "flex" : "none";
    getActiveTab()?.frame.frame.classList.toggle('loading', show);

    if (show) {
        document.getElementById("loading-title").textContent = "Connecting";
        document.getElementById("loading-url").textContent = url || "Loading content...";
        document.getElementById("skip-btn").style.display = 'none';
    }
}

function switchTab(tabId) {
    activeTabId = tabId;
    const tab = getActiveTab();

    tabs.forEach(t => t.frame.frame.classList.toggle("hidden", t.id !== tabId));

    if (tab) {
        showIframeLoading(tab.loading, tab.url);
        
        const skipBtn = document.getElementById('skip-btn');
        if (tab.loading && tab.loadStartTime && skipBtn) {
            const elapsed = Date.now() - tab.loadStartTime;
            if (elapsed > 3000) skipBtn.style.display = 'inline-block';
        }
    }

    updateTabsUI();
    updateAddressBar();
}

function closeTab(tabId) {
    const idx = tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;

    const tab = tabs[idx];
    clearTimeout(tab.skipTimeout);
    
    if (tab.frame?.frame) {
        tab.frame.frame.src = 'about:blank';
        tab.frame.frame.remove();
    }
    
    tabs.splice(idx, 1);

    if (activeTabId === tabId) {
        if (tabs.length > 0) switchTab(tabs[Math.max(0, idx - 1)].id);
        else window.location.reload();
    } else {
        updateTabsUI();
    }
}

function updateTabsUI() {
    const container = document.getElementById("tabs-container");
    container.innerHTML = "";

    tabs.forEach(tab => {
        const el = document.createElement("div");
        el.className = `tab ${tab.id === activeTabId ? "active" : ""}`;

        const iconHtml = tab.loading 
            ? `<div class="tab-spinner"></div>`
            : tab.favicon 
                ? `<img src="${tab.favicon}" class="tab-favicon" onerror="this.style.display='none'">`
                : '';

        el.innerHTML = `${iconHtml}<span class="tab-title">${tab.title}</span><span class="tab-close">&times;</span>`;
        el.onclick = () => switchTab(tab.id);
        el.querySelector(".tab-close").onclick = (e) => { e.stopPropagation(); closeTab(tab.id); };
        container.appendChild(el);
    });

    const newBtn = document.createElement("button");
    newBtn.className = "new-tab";
    newBtn.innerHTML = "<i class='fa-solid fa-plus'></i>";
    newBtn.onclick = () => createTab(true);
    container.appendChild(newBtn);
}

function updateAddressBar() {
    const bar = document.getElementById("address-bar");
    const tab = getActiveTab();
    if (bar && tab) {
        bar.value = (tab.url && !tab.url.includes("NT.html")) ? tab.url : "";
    }
}

function handleSubmit(url) {
    const tab = getActiveTab();
    let input = url ?? document.getElementById("address-bar").value.trim();
    if (!input) return;

    if (!input.startsWith('http')) {
        input = input.includes('.') && !input.includes(' ') 
            ? `https://${input}`
            : `https://search.brave.com/search?q=${encodeURIComponent(input)}`;
    }
    
    tab.loading = true;
    showIframeLoading(true, input);
    updateLoadingBar(tab, 10);
    tab.frame.go(input);
}

function updateLoadingBar(tab, percent) {
    if (tab.id !== activeTabId) return;
    const bar = document.getElementById("loading-bar");
    bar.style.width = percent + "%";
    bar.style.opacity = percent === 100 ? "0" : "1";
    if (percent === 100) setTimeout(() => { bar.style.width = "0%"; }, 200);
}

function openSettings() {
    const modal = document.getElementById('wisp-settings-modal');
    modal.classList.remove('hidden');

    document.getElementById('close-wisp-modal').onclick = () => modal.classList.add('hidden');
    
    const saveBtn = document.getElementById('save-custom-wisp');
    if (saveBtn) saveBtn.onclick = saveCustomWisp;

    const urlInput = document.getElementById('custom-wisp-input');
    if (urlInput) {
        urlInput.onkeydown = (e) => {
            if (e.key === 'Enter') saveCustomWisp();
        };
    }
    const nameInput = document.getElementById('custom-wisp-name');
    if (nameInput) {
        nameInput.onkeydown = (e) => {
            if (e.key === 'Enter') saveCustomWisp();
        };
    }

    modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
    renderServerList();
}

function renderServerList() {
    const list = document.getElementById('server-list');
    list.innerHTML = '';

    const currentUrl = localStorage.getItem('proxServer') ?? DEFAULT_WISP;
    const allWisps = [...WISP_SERVERS, ...getStoredWisps()];

    allWisps.forEach((server, index) => {
        const isActive = server.url === currentUrl;
        const isCustom = index >= WISP_SERVERS.length;

        const item = document.createElement('div');
        item.className = `wisp-option ${isActive ? 'active' : ''}`;

        const deleteBtn = isCustom
            ? `<button class="delete-wisp-btn" title="Remove Server" onclick="event.stopPropagation(); deleteCustomWisp('${server.url}')"><i class="fa-solid fa-trash"></i></button>`
            : '';

        item.innerHTML = `
            <div class="wisp-option-header">
                <div class="wisp-option-name">
                    ${server.name}
                    ${isCustom ? '<span style="font-size:10px; padding:2px 6px; border-radius:4px; background:var(--accent-dim); color:var(--accent); margin-left:6px; font-weight:600;">CUSTOM</span>' : ''}
                    ${isActive ? '<i class="fa-solid fa-check" style="margin-left:8px; font-size: 0.75em; color: var(--accent);"></i>' : ''}
                </div>
                <div class="server-status">
                    <span class="ping-badge" id="modal-ping-${index}">
                        <span class="ping-dot"></span>
                        <span class="ping-text">...</span>
                    </span>
                    ${deleteBtn}
                </div>
            </div>
            <div class="wisp-option-url">${server.url}</div>
        `;

        item.onclick = () => setWisp(server.url);
        list.appendChild(item);

        // Ping test in background
        pingWispServer(server.url, 2000).then(res => {
            const badge = document.getElementById(`modal-ping-${index}`);
            if (badge) {
                const dot = badge.querySelector('.ping-dot');
                const text = badge.querySelector('.ping-text');
                if (res.success) {
                    dot.className = 'ping-dot online';
                    text.textContent = `${res.latency}ms`;
                } else {
                    dot.className = 'ping-dot offline';
                    text.textContent = 'Offline';
                }
            }
        });
    });

    
    const isAutoswitch = localStorage.getItem('wispAutoswitch') === 'true';
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'wisp-option';
    toggleContainer.style.cssText = 'margin-top: 10px; cursor: default;';
    toggleContainer.innerHTML = `
        <div class="wisp-option-header" style="justify-content: space-between;">
            <div class="wisp-option-name"><i class="fa-solid fa-rotate" style="margin-right:8px"></i> Auto-switch on failure</div>
            <div class="toggle-switch ${isAutoswitch ? 'active' : ''}" id="autoswitch-toggle">
                <div class="toggle-knob"></div>
            </div>
        </div>
    `;

    toggleContainer.onclick = () => {
        const currentVal = localStorage.getItem('wispAutoswitch') === 'true';
        const newState = !currentVal;
        localStorage.setItem('wispAutoswitch', newState ? 'true' : 'false');
        document.getElementById('autoswitch-toggle').classList.toggle('active', newState);

        navigator.serviceWorker.controller?.postMessage({ type: 'config', autoswitch: newState });
        notify('success', 'Settings Saved', `Auto-switch ${newState ? 'Enabled' : 'Disabled'}`);
    };

    list.appendChild(toggleContainer);
}

function saveCustomWisp() {
    const nameInput = document.getElementById('custom-wisp-name');
    const urlInput = document.getElementById('custom-wisp-input');

    let name = nameInput ? nameInput.value.trim() : '';
    let url = urlInput ? urlInput.value.trim() : '';

    if (!url) {
        notify('error', 'Missing URL', 'Please enter a Wisp WebSocket URL.');
        return;
    }

    if (url.startsWith('http://')) {
        url = 'ws://' + url.slice(7);
    } else if (url.startsWith('https://')) {
        url = 'wss://' + url.slice(8);
    } else if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
        url = 'wss://' + url;
    }

    try {
        const parsed = new URL(url);
        if (!name) {
            name = `Custom (${parsed.hostname})`;
        }
    } catch (e) {
        notify('error', 'Invalid URL', 'Please enter a valid WebSocket URL (e.g. wss://example.com/wisp/)');
        return;
    }

    const customWisps = getStoredWisps();
    if (customWisps.some(w => w.url.toLowerCase() === url.toLowerCase()) || WISP_SERVERS.some(w => w.url.toLowerCase() === url.toLowerCase())) {
        notify('warning', 'Already Exists', 'This server is already in the list.');
        return;
    }

    const newServer = { name, url };
    customWisps.push(newServer);
    localStorage.setItem('customWisps', JSON.stringify(customWisps));

    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';

    notify('success', 'Server Added', `Added ${name}`);
    renderServerList();
    setWisp(url);
}

window.deleteCustomWisp = function (urlToDelete) {
    if (!confirm("Remove this custom server?")) return;

    let customWisps = getStoredWisps().filter(w => w.url !== urlToDelete);
    localStorage.setItem('customWisps', JSON.stringify(customWisps));

    notify('info', 'Server Removed', 'Custom server was removed.');

    if (localStorage.getItem('proxServer') === urlToDelete) {
        setWisp(DEFAULT_WISP);
    } else {
        renderServerList();
    }
};

async function checkServerHealth(url, element) {
    const dot = element.querySelector('.status-indicator');
    const text = element.querySelector('.ping-text');
    const start = Date.now();

    const markOffline = () => {
        dot.classList.add('status-error');
        text.textContent = "Offline";
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        
        await fetch(url.replace('wss://', 'https://').replace('/wisp/', '/health') || url, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors'
        });
        
        clearTimeout(timeout);
        dot.classList.add('status-success');
        text.textContent = `${Date.now() - start}ms`;
    } catch {
        
        try {
            const wsTest = new WebSocket(url);
            wsTest.onopen = () => {
                dot.classList.add('status-success');
                text.textContent = `${Date.now() - start}ms`;
                wsTest.close();
            };
            wsTest.onerror = markOffline;
            
            setTimeout(() => {
                if (wsTest.readyState !== WebSocket.OPEN) {
                    wsTest.close();
                    markOffline();
                }
            }, 1000);
        } catch { markOffline(); }
    }
}

function setWisp(url) {
    const oldUrl = localStorage.getItem('proxServer');
    localStorage.setItem('proxServer', url);

    if (oldUrl !== url) {
        const serverName = [...WISP_SERVERS, ...getStoredWisps()].find(s => s.url === url)?.name ?? 'Custom Server';
        notify('success', 'Proxy Changed', `Switching to ${serverName}...`);
    }

    navigator.serviceWorker.controller?.postMessage({ type: 'config', wispurl: url });
    setTimeout(() => location.reload(), 600);
}

function toggleDevTools() {
    const frame = getActiveTab()?.frame?.frame;
    if (!frame) return;
    try {
        const win = frame.contentWindow;
        if (!win) return;
        if (win.eruda) {
            if (win.eruda._isInit) {
                const entry = win.document.querySelector('.eruda-entry-btn');
                if (entry && entry.style.display === 'none') {
                    win.eruda.show();
                } else {
                    win.eruda.hide();
                }
            } else {
                win.eruda.init();
                win.eruda.show();
            }
            return;
        }
        const script = win.document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/eruda";
        script.onload = () => {
            if (win.eruda) {
                win.eruda.init();
                win.eruda.show();
                notify('info', 'DevTools', 'Eruda DevTools injected.');
            }
        };
        win.document.head.appendChild(script);
    } catch (e) {
        notify('warning', 'DevTools', 'Could not access frame content directly.');
    }
}

async function checkHashParameters() {
    if (window.location.hash) {
        const hash = decodeURIComponent(window.location.hash.substring(1));
        if (hash) handleSubmit(hash);
        history.replaceState(null, null, location.pathname);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    try {
        
        initializeWithBestServer();
        
        await getSharedScramjet();
        await getSharedConnection();

        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.register(getBasePath() + 'sw.js', { scope: getBasePath() });
            
            
            await navigator.serviceWorker.ready;
            
            const wispUrl = localStorage.getItem("proxServer") ?? DEFAULT_WISP;
            const allServers = getAllWispServers();
            const autoswitch = localStorage.getItem('wispAutoswitch') === 'true';
            
            const swConfig = {
                type: "config",
                wispurl: wispUrl,
                servers: allServers,
                autoswitch: autoswitch
            };

            
            const sendConfig = async () => {
                const sw = reg.active || navigator.serviceWorker.controller;
                if (sw) {
                    console.log("Sending config to SW:", swConfig);
                    sw.postMessage(swConfig);
                }
            };

            
            sendConfig();
            setTimeout(sendConfig, 500);
            setTimeout(sendConfig, 1500);

            navigator.serviceWorker.addEventListener('message', (event) => {
                const { type, url, name, message } = event.data;
                if (type === 'wispChanged') {
                    console.log("SW reported Wisp Change:", event.data);
                    localStorage.setItem("proxServer", url);
                    notify('info', 'Autoswitched Proxy', `Now using ${name} because the previous server was slow or offline.`);
                } else if (type === 'wispError') {
                    console.error("SW reported Wisp Error:", event.data);
                    notify('error', 'Proxy Error', message);
                }
            });

            reg.update();
        }

        await initializeBrowser();
    } catch (err) {
        console.error("Initialization error:", err);
        
        const root = document.getElementById('app');
        if (root) {
            root.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background: #0a0a0a; color: #e4e4e7;">
                    <div style="text-align: center; max-width: 600px; padding: 20px;">
                        <h1 style="color: #ef4444; margin-bottom: 20px;">Initialization Error</h1>
                        <p style="margin-bottom: 20px; line-height: 1.6;">${err.message || 'An unknown error occurred during initialization'}</p>
                        <p style="color: #a1a1a1; font-size: 14px; margin-bottom: 20px;">Check the browser console (F12) for more details.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
                    </div>
                </div>
            `;
        }
    }
});
