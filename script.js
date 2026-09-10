// ==========================================
// CONTROLLER
// ==========================================

// DOM Elements
const dockItems = document.querySelectorAll('.dock-item');
const tabPanels = document.querySelectorAll('.tab-panel');
const dockGlider = document.getElementById('dockGlider');
const pageTitle = document.getElementById('pageTitle');
const pageFavicon = document.getElementById('pageFavicon');

// 1. Glider and Tab Navigation
function updateGliderPosition() {
  const activeItem = document.querySelector('.dock-item.active');
  if (!activeItem || !dockGlider) return;

  const itemRect = activeItem.getBoundingClientRect();
  const parentRect = activeItem.parentElement.getBoundingClientRect();

  dockGlider.style.left = `${itemRect.left - parentRect.left}px`;
  dockGlider.style.width = `${itemRect.width}px`;
}

function switchTab(tabId) {
  dockItems.forEach(item => {
    if (item.getAttribute('data-target') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  tabPanels.forEach(panel => {
    if (panel.id === `${tabId}-section`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  updateGliderPosition();
}

dockItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.getAttribute('data-target');
    switchTab(target);
  });
});

window.addEventListener('resize', updateGliderPosition);
window.addEventListener('DOMContentLoaded', updateGliderPosition);
setTimeout(updateGliderPosition, 100);

// Home Search & Mode Switcher Handler
const homeSearchInput = document.getElementById('homeSearchInput');
const searchModeSelect = document.getElementById('searchModeSelect');
const modeToggleBtn = document.getElementById('modeToggleBtn');
const modeIcon = document.getElementById('modeIcon');
const modeText = document.getElementById('modeText');
const modeOptions = document.querySelectorAll('.mode-option');

let currentSearchMode = 'games';

if (modeToggleBtn && searchModeSelect) {
  modeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchModeSelect.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!searchModeSelect.contains(e.target)) {
      searchModeSelect.classList.remove('open');
    }
  });

  modeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const mode = opt.getAttribute('data-mode');
      currentSearchMode = mode;
      
      modeOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      if (mode === 'games') {
        modeIcon.className = 'fa-solid fa-gamepad';
        modeText.textContent = 'Games';
        if (homeSearchInput) homeSearchInput.placeholder = 'Search games...';
      } else if (mode === 'apps') {
        modeIcon.className = 'fa-solid fa-shapes';
        modeText.textContent = 'Apps';
        if (homeSearchInput) homeSearchInput.placeholder = 'Search apps...';
      } else if (mode === 'proxy') {
        modeIcon.className = 'fa-solid fa-shield-halved';
        modeText.textContent = 'Proxy';
        if (homeSearchInput) homeSearchInput.placeholder = 'Search web or enter URL...';
      }

      searchModeSelect.classList.remove('open');
    });
  });
}

function handleHomeSearch() {
  if (!homeSearchInput) return;
  const val = homeSearchInput.value.trim();
  // Switch to selected tab (games, apps, or proxy)
  switchTab(currentSearchMode);
  
  if (currentSearchMode === 'games') {
    if (gamesSearchInput) {
      gamesSearchInput.value = val;
      filterGames();
    }
  } else if (currentSearchMode === 'apps') {
    if (appsSearchInput) {
      appsSearchInput.value = val;
      filterApps();
    }
  } else if (currentSearchMode === 'proxy') {
    const proxyIframe = document.getElementById('proxyIframe');
    if (proxyIframe && val) {
      // If user typed a search query or URL, pass it to proxy iframe
      try {
        if (proxyIframe.contentWindow && typeof proxyIframe.contentWindow.createTab === 'function') {
          proxyIframe.contentWindow.createTab(val);
        }
      } catch (e) {}
    }
  }
}

if (homeSearchInput) {
  homeSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleHomeSearch();
  });
}

// ==========================================
// SETTINGS: TAB CLOAKING
// ==========================================
const cloakPresets = {
  google: {
    title: 'Google',
    favicon: 'assets/cloak/google.ico'
  },
  docs: {
    title: 'Google Docs',
    favicon: 'assets/cloak/docs.ico'
  },
  drive: {
    title: 'Google Drive',
    favicon: 'assets/cloak/drive.png'
  },
  classroom: {
    title: 'Classes',
    favicon: 'assets/cloak/classroom.png'
  },
  slides: {
    title: 'Google Slides',
    favicon: 'assets/cloak/slides.ico'
  },
  gmail: {
    title: 'Gmail',
    favicon: 'assets/cloak/gmail.ico'
  },
  canvas: {
    title: 'Dashboard | Canvas',
    favicon: 'assets/cloak/canvas.png'
  },
  desmos: {
    title: 'Desmos | Graphing Calculator',
    favicon: 'assets/cloak/desmos.ico'
  },
  classlink: {
    title: 'ClassLink LaunchPad',
    favicon: 'assets/cloak/classlink.ico'
  },
  reset: {
    title: 'Athyx Network',
    favicon: ''
  }
};

function applyCloak(title, faviconUrl) {
  if (title) {
    document.title = title;
  }

  let fav = document.getElementById('pageFavicon');
  if (!fav) {
    fav = document.createElement('link');
    fav.id = 'pageFavicon';
    fav.rel = 'icon';
    document.head.appendChild(fav);
  }
  fav.href = faviconUrl || '';

  // Persist settings in localStorage
  localStorage.setItem('cloak_title', title || '');
  localStorage.setItem('cloak_favicon', faviconUrl || '');
}

// Preset button handlers
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const presetKey = btn.getAttribute('data-preset');
    const preset = cloakPresets[presetKey];
    if (preset) {
      applyCloak(preset.title, preset.favicon);
    }
  });
});

// Load saved cloak on startup
function loadSavedCloak() {
  const savedTitle = localStorage.getItem('cloak_title');
  const savedFavicon = localStorage.getItem('cloak_favicon');
  if (savedTitle || savedFavicon) {
    applyCloak(savedTitle, savedFavicon);
  }
}
loadSavedCloak();

// ==========================================
// SETTINGS: ABOUT:BLANK CLOAKER
// ==========================================
const openAboutBlankBtn = document.getElementById('openAboutBlankBtn');
const autoBlankToggle = document.getElementById('autoBlankToggle');

function openInAboutBlank() {
  const win = window.open('about:blank', '_blank');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    return false;
  }

  const doc = win.document;
  doc.title = document.title;

  // Set favicon if exists
  const currentFav = document.getElementById('pageFavicon');
  if (currentFav && currentFav.href) {
    const link = doc.createElement('link');
    link.rel = 'icon';
    link.href = currentFav.href;
    doc.head.appendChild(link);
  }

  // Embed current page into a full viewport iframe
  const iframe = doc.createElement('iframe');
  iframe.src = window.location.href;
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.bottom = '0';
  iframe.style.right = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.overflow = 'hidden';
  iframe.style.zIndex = '999999';

  doc.body.style.margin = '0';
  doc.body.style.padding = '0';
  doc.body.style.overflow = 'hidden';
  doc.body.style.backgroundColor = '#0d0d0e';
  doc.body.appendChild(iframe);
  return true;
}

if (openAboutBlankBtn) {
  openAboutBlankBtn.addEventListener('click', () => {
    openInAboutBlank();
  });
}

// Auto about:blank toggle handler
if (autoBlankToggle) {
  const isAutoBlank = localStorage.getItem('autoblank') === 'true';
  autoBlankToggle.checked = isAutoBlank;

  autoBlankToggle.addEventListener('change', () => {
    localStorage.setItem('autoblank', autoBlankToggle.checked ? 'true' : 'false');
  });
}

// Check on page load for Auto about:blank
function checkAutoBlankOnLoad() {
  const isAutoBlank = localStorage.getItem('autoblank') === 'true';
  // Only trigger if enabled and not already inside the about:blank iframe
  if (isAutoBlank && window.self === window.top) {
    const opened = openInAboutBlank();
    if (opened) {
      // Redirect original tab to Google so no history remains
      window.location.replace('https://google.com');
    } else {
      // If browser blocked unprompted background popup on load, listen for the very first click to launch
      document.addEventListener('click', () => {
        if (openInAboutBlank()) {
          window.location.replace('https://google.com');
        }
      }, { once: true });
    }
  }
}
checkAutoBlankOnLoad();

// ==========================================
// SETTINGS: PANIC BUTTON & HOTKEY
// ==========================================
const recordKeyBtn = document.getElementById('recordKeyBtn');
const currentPanicKeyDisplay = document.getElementById('currentPanicKeyDisplay');
const panicUrlInput = document.getElementById('panicUrlInput');
const keyRecordModal = document.getElementById('keyRecordModal');
const cancelRecordKeyBtn = document.getElementById('cancelRecordKeyBtn');
const panicToggle = document.getElementById('panicToggle');

let panicKey = localStorage.getItem('panic_key') || '`';
let panicUrl = localStorage.getItem('panic_url') || 'https://classroom.google.com';
let panicEnabled = localStorage.getItem('panic_enabled') !== 'false';
let isRecordingPanicKey = false;

// Initialize Panic UI
if (currentPanicKeyDisplay) {
  currentPanicKeyDisplay.textContent = panicKey;
}
if (panicUrlInput) {
  panicUrlInput.value = panicUrl;
  panicUrlInput.addEventListener('input', () => {
    panicUrl = panicUrlInput.value.trim() || 'https://classroom.google.com';
    localStorage.setItem('panic_url', panicUrl);
  });
}
if (panicToggle) {
  panicToggle.checked = panicEnabled;
  panicToggle.addEventListener('change', () => {
    panicEnabled = panicToggle.checked;
    localStorage.setItem('panic_enabled', panicEnabled ? 'true' : 'false');
  });
}

function triggerPanic() {
  let dest = panicUrl.trim();
  if (!dest) dest = 'https://classroom.google.com';
  if (!dest.startsWith('http://') && !dest.startsWith('https://')) {
    dest = 'https://' + dest;
  }
  window.location.replace(dest);
}

function openKeyRecordModal() {
  isRecordingPanicKey = true;
  if (keyRecordModal) keyRecordModal.classList.add('show');
  if (recordKeyBtn) recordKeyBtn.classList.add('recording');
}

function closeKeyRecordModal() {
  isRecordingPanicKey = false;
  if (keyRecordModal) keyRecordModal.classList.remove('show');
  if (recordKeyBtn) recordKeyBtn.classList.remove('recording');
}

if (recordKeyBtn) {
  recordKeyBtn.addEventListener('click', openKeyRecordModal);
}

if (cancelRecordKeyBtn) {
  cancelRecordKeyBtn.addEventListener('click', closeKeyRecordModal);
}

// Global Keydown Listener for Panic Key & Recording
window.addEventListener('keydown', (e) => {
  if (isRecordingPanicKey) {
    e.preventDefault();
    if (e.key === 'Escape') {
      closeKeyRecordModal();
      return;
    }
    panicKey = e.key;
    localStorage.setItem('panic_key', panicKey);
    if (currentPanicKeyDisplay) currentPanicKeyDisplay.textContent = panicKey;
    closeKeyRecordModal();
    return;
  }

  // If panic key is disabled or user is typing inside an input, don't trigger
  if (!panicEnabled) return;
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && e.key !== 'Escape') {
    return;
  }

  if (e.key === panicKey) {
    e.preventDefault();
    triggerPanic();
  }
});

// ==========================================
// GAMES & APPS SYSTEM
// ==========================================

let gamesData = [];
let appsData = [];

// Elements for Games & Apps
const gamesGrid = document.getElementById('gamesGrid');
const gamesSearchInput = document.getElementById('gamesSearchInput');
const gamesNoResults = document.getElementById('gamesNoResults');

const appsGrid = document.getElementById('appsGrid');
const appsSearchInput = document.getElementById('appsSearchInput');
const appsNoResults = document.getElementById('appsNoResults');

// Player Modal Elements
const playerModal = document.getElementById('playerModal');
const playerTitle = document.getElementById('playerTitle');
const playerTypeIcon = document.getElementById('playerTypeIcon');
const playerIframe = document.getElementById('playerIframe');
const playerCloseBtn = document.getElementById('playerCloseBtn');
const playerFullscreenBtn = document.getElementById('playerFullscreenBtn');
const playerContainer = document.querySelector('.player-container');

let activePlayerItem = null;

function normalizeItem(raw, type) {
  if (!raw || typeof raw !== 'object') return null;
  const title = raw.title || raw.name || 'Untitled';
  const url = raw.path || raw.url || raw.link || '';
  
  // Icon file in assets/app_icons (for apps) or assets/game_icons (for games) or direct path/URL
  let image = raw.icon || raw.image || raw.icon_file || '';
  if (image && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('data:') && !image.startsWith('/') && !image.startsWith('assets/')) {
    image = type === 'app' ? `assets/app_icons/${image}` : `assets/game_icons/${image}`;
  }

  return {
    id: raw.id || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    title: title,
    url: url,
    image: image,
    icon: raw.fa_icon || (type === 'game' ? 'fa-gamepad' : 'fa-shapes')
  };
}

async function loadGames() {
  try {
    const res = await fetch('games.json');
    if (res.ok) {
      const text = await res.text();
      if (text.trim().length > 0) {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          gamesData = json.map(item => normalizeItem(item, 'game')).filter(Boolean);
        }
      }
    }
  } catch (err) {
    console.warn('Could not load games.json:', err);
  }
  filterGames();
}

async function loadApps() {
  try {
    const res = await fetch('apps.json');
    if (res.ok) {
      const text = await res.text();
      if (text.trim().length > 0) {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          appsData = json.map(item => normalizeItem(item, 'app')).filter(Boolean);
        }
      }
    }
  } catch (err) {
    console.warn('Could not load apps.json:', err);
  }
  filterApps();
}

function createCard(item, type) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.setAttribute('data-id', item.id);

  const imgHtml = item.image
    ? `<img src="${item.image}" alt="${item.title}" class="item-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />`
    : '';
  const fallbackDisplay = item.image ? 'style="display:none;"' : '';

  card.innerHTML = `
    <div class="item-thumbnail-wrap">
      ${imgHtml}
      <div class="item-fallback-icon" ${fallbackDisplay}><i class="fa-solid ${item.icon || (type === 'game' ? 'fa-gamepad' : 'fa-shapes')}"></i></div>
      <div class="item-hover-play">
        <div class="play-circle-icon"><i class="fa-solid fa-play"></i></div>
      </div>
    </div>
    <div class="item-info">
      <div class="item-name">${item.title}</div>
    </div>
  `;

  card.addEventListener('click', () => {
    openPlayer(item, type);
  });

  return card;
}

function filterGames() {
  if (!gamesGrid) return;
  const query = (gamesSearchInput ? gamesSearchInput.value : '').trim().toLowerCase();
  
  const filtered = gamesData.filter(item => {
    return !query || (item.title && item.title.toLowerCase().includes(query));
  });

  gamesGrid.innerHTML = '';
  filtered.forEach(item => {
    gamesGrid.appendChild(createCard(item, 'game'));
  });

  if (gamesNoResults) {
    if (filtered.length === 0) {
      gamesNoResults.style.display = 'flex';
      gamesNoResults.innerHTML = gamesData.length === 0
        ? '<i class="fa-solid fa-gamepad"></i><p>No games added yet</p>'
        : '<i class="fa-solid fa-ghost"></i><p>No games found matching your search</p>';
    } else {
      gamesNoResults.style.display = 'none';
    }
  }
}

function filterApps() {
  if (!appsGrid) return;
  const query = (appsSearchInput ? appsSearchInput.value : '').trim().toLowerCase();

  const filtered = appsData.filter(item => {
    return !query || (item.title && item.title.toLowerCase().includes(query));
  });

  appsGrid.innerHTML = '';
  filtered.forEach(item => {
    appsGrid.appendChild(createCard(item, 'app'));
  });

  if (appsNoResults) {
    if (filtered.length === 0) {
      appsNoResults.style.display = 'flex';
      appsNoResults.innerHTML = appsData.length === 0
        ? '<i class="fa-solid fa-shapes"></i><p>No apps added yet</p>'
        : '<i class="fa-solid fa-ghost"></i><p>No apps found matching your search</p>';
    } else {
      appsNoResults.style.display = 'none';
    }
  }
}

// Search input listeners
if (gamesSearchInput) {
  gamesSearchInput.addEventListener('input', filterGames);
}
if (appsSearchInput) {
  appsSearchInput.addEventListener('input', filterApps);
}

// Helper to load HTML into iframes via srcdoc (bypasses jsDelivr text/plain content-type)
async function loadContentIntoIframe(iframe, url) {
  if (!iframe || !url) return;

  const isExternalHttp = url.startsWith('http://') || (url.startsWith('https://') && !url.includes('jsdelivr.net') && !url.includes('github.io') && !url.includes('githubusercontent.com'));
  if (isExternalHttp) {
    iframe.removeAttribute('srcdoc');
    iframe.src = url;
    return;
  }

  const separator = url.includes('?') ? '&' : '?';
  const urlWithCacheBuster = url.includes('_t=') ? url : `${url}${separator}_t=${Date.now()}`;
  const resolvedUrl = new URL(urlWithCacheBuster, document.baseURI || window.location.href).href;

  try {
    const res = await fetch(resolvedUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let html = await res.text();

    const cleanUrl = resolvedUrl.split('?')[0];
    const fileBaseUrl = cleanUrl.substring(0, cleanUrl.lastIndexOf('/') + 1);

    if (!/<base\s+[^>]*href=/i.test(html)) {
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head[^>]*>/i, `$&<base href="${fileBaseUrl}">`);
      } else {
        html = `<base href="${fileBaseUrl}">` + html;
      }
    }

    iframe.src = 'about:blank';
    iframe.srcdoc = html;
  } catch (err) {
    console.warn('Could not fetch HTML for srcdoc, falling back to direct src:', err);
    iframe.removeAttribute('srcdoc');
    iframe.src = resolvedUrl;
  }
}

// Player Modal Controls
function openPlayer(item, type) {
  if (!playerModal) return;
  activePlayerItem = item;
  
  if (playerTitle) playerTitle.textContent = item.title;
  if (playerTypeIcon) {
    playerTypeIcon.className = type === 'game' ? 'fa-solid fa-gamepad' : 'fa-solid fa-shapes';
  }
  if (playerIframe) {
    playerIframe.onload = () => {
      try {
        if (playerIframe.contentWindow) {
          playerIframe.contentWindow.alert = function(msg) {
            console.warn('Suppressed iframe alert:', msg);
          };
        }
      } catch (e) {}
    };

    loadContentIntoIframe(playerIframe, item.url);
  }
  
  playerModal.classList.add('active');
}

function closePlayer() {
  if (!playerModal) return;
  if (playerIframe) {
    playerIframe.removeAttribute('srcdoc');
    playerIframe.src = 'about:blank';
  }
  playerModal.classList.remove('active');
  activePlayerItem = null;
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (playerContainer) playerContainer.classList.remove('is-fullscreen');
}

if (playerCloseBtn) {
  playerCloseBtn.addEventListener('click', closePlayer);
}

if (playerFullscreenBtn) {
  playerFullscreenBtn.addEventListener('click', () => {
    if (!playerContainer) return;
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch(() => {
        playerContainer.classList.toggle('is-fullscreen');
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
}

// Close player modal on ESC key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && playerModal && playerModal.classList.contains('active')) {
    closePlayer();
  }
});

// Initialize proxy iframe with live URL
const proxyIframeEl = document.getElementById('proxyIframe');
if (proxyIframeEl) {
  proxyIframeEl.removeAttribute('srcdoc');
  if (window.location.protocol.startsWith('http') && !window.location.hostname.includes('jsdelivr')) {
    const currentFolder = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    proxyIframeEl.src = `${window.location.origin}${currentFolder}proxy/index.html`;
  } else {
    proxyIframeEl.src = 'https://athyx-network.github.io/Athyx-Network/proxy/index.html';
  }
}

// Load Games & Apps from JSON files
loadGames();
loadApps();

