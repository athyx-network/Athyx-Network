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
  const input = document.getElementById('homeSearchInput');
  if (!input) return;
  const val = input.value.trim();
  // Switch to selected tab (games, apps, or proxy)
  switchTab(currentSearchMode);
  
  if (currentSearchMode === 'games') {
    const gamesInput = document.getElementById('gamesSearchInput');
    if (gamesInput) {
      gamesInput.value = val;
    }
    filterGames();
  } else if (currentSearchMode === 'apps') {
    const appsInput = document.getElementById('appsSearchInput');
    if (appsInput) {
      appsInput.value = val;
    }
    filterApps();
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

const homeSearchIcon = document.getElementById('homeSearchIcon');
if (homeSearchIcon) {
  homeSearchIcon.addEventListener('click', handleHomeSearch);
}

// Base URL for jsDelivr CDN
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/athyx-network/Athyx-Network@main/';

// ==========================================
// SETTINGS: TAB CLOAKING
// ==========================================
const cloakPresets = {
  google: {
    title: 'Google',
    favicon: `${JSDELIVR_BASE}assets/cloak/google.ico`
  },
  docs: {
    title: 'Google Docs',
    favicon: `${JSDELIVR_BASE}assets/cloak/docs.ico`
  },
  drive: {
    title: 'Google Drive',
    favicon: `${JSDELIVR_BASE}assets/cloak/drive.png`
  },
  classroom: {
    title: 'Classes',
    favicon: `${JSDELIVR_BASE}assets/cloak/classroom.png`
  },
  slides: {
    title: 'Google Slides',
    favicon: `${JSDELIVR_BASE}assets/cloak/slides.ico`
  },
  gmail: {
    title: 'Gmail',
    favicon: `${JSDELIVR_BASE}assets/cloak/gmail.ico`
  },
  canvas: {
    title: 'Dashboard | Canvas',
    favicon: `${JSDELIVR_BASE}assets/cloak/canvas.png`
  },
  desmos: {
    title: 'Desmos | Graphing Calculator',
    favicon: `${JSDELIVR_BASE}assets/cloak/desmos.ico`
  },
  classlink: {
    title: 'ClassLink LaunchPad',
    favicon: `${JSDELIVR_BASE}assets/cloak/classlink.ico`
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

const DEFAULT_GAMES_LIST = [
  { "name": "Angry Birds", "path": "games/Angry Birds.html", "icon": "angry_birds.png" },
  { "name": "Bad Piggies", "path": "games/Bad Piggies.html", "icon": "bad_piggies.png" },
  { "name": "Baldi's Basics", "path": "games/Baldis Basics.html", "icon": "baldis_basics.png" },
  { "name": "Basketball Stars", "path": "games/Basketball Stars.html", "icon": "basketball_stars.png" },
  { "name": "Block Blast", "path": "games/Block Blast.html", "icon": "block_blast.png" },
  { "name": "Bowmasters", "path": "games/Bow Masters.html", "icon": "bow_masters.png" },
  { "name": "Brawl Stars", "path": "games/Brawl Stars.html", "icon": "brawl_stars.png" },
  { "name": "Cluster Rush", "path": "games/Cluster Rush.html", "icon": "cluster_rush.png" },
  { "name": "Cookie Clicker", "path": "games/Cookie Clicker.html", "icon": "cookie_clicker.png" },
  { "name": "Crossy Road", "path": "games/Crossy Road.html", "icon": "crossy_road.png" },
  { "name": "DOOM", "path": "games/Doom.html", "icon": "doom.png" },
  { "name": "Five Nights at Epstein's", "path": "games/Five Nights At Epsteins.html", "icon": "five_nights_at_epsteins.png" },
  { "name": "Five Nights at Freddy's", "path": "games/Five Nights At Freddys.html", "icon": "fnaf1.png" },
  { "name": "Five Nights at Freddy's 2", "path": "games/Five Nights At Freddys 2.html", "icon": "fnaf2.png" },
  { "name": "Geometry Dash", "path": "games/Geometry Dash.html", "icon": "geometry_dash.svg" },
  { "name": "Chrome Dino", "path": "games/Google Dino.html", "icon": "google_dino.png" },
  { "name": "Granny", "path": "games/Granny.html", "icon": "granny.png" },
  { "name": "Helix Jump", "path": "games/Helix Jump.html", "icon": "helix_jump.png" },
  { "name": "Hypper Sandbox", "path": "games/Hypper Sandbox.html", "icon": "hypper_sandbox.png" },
  { "name": "Minecraft", "path": "games/Minecraft.html", "icon": "minecraft.png" },
  { "name": "Moto X3M", "path": "games/Moto X3m.html", "icon": "moto_x3m.png" },
  { "name": "Obby 99% Will Lose", "path": "games/Obby 99% will lose.html", "icon": "obby.png" },
  { "name": "OvO", "path": "games/OvO.html", "icon": "ovo.png" },
  { "name": "Plants vs. Zombies", "path": "games/Plants VS Zombies.html", "icon": "pvz.png" },
  { "name": "Raldi's Crackhouse", "path": "games/Raldis Crackhouse.html", "icon": "raldis_crackhouse.png" },
  { "name": "Retro Bowl", "path": "games/Retro Bowl.html", "icon": "retro_bowl.png" },
  { "name": "Snow Rider 3D", "path": "games/Snow Rider.html", "icon": "snow_rider.png" },
  { "name": "Subway Surfers: St. Petersburg", "path": "games/Subway Surfers: St .Petersburg.html", "icon": "subway_surfers.png" },
  { "name": "Wordle", "path": "games/Wordle.html", "icon": "wordle.png" }
];

const DEFAULT_APPS_LIST = [
  { "name": "DOS Wasm X", "path": "apps/Dos Wasm X.html", "icon": "dos_wasm_x.png" },
  { "name": "EmulatorJS", "path": "apps/Emulator JS.html", "icon": "emulatorjs.png" },
  { "name": "Meowio NES Emulator", "path": "apps/Meowio NES Emulator.html", "icon": "nes_emulator.png" },
  { "name": "PICO-8 Education Edition", "path": "apps/Pico 8 Edu.html", "icon": "pico8.png" },
  { "name": "TurboWarp (Scratch Plus)", "path": "apps/Scratch Plus (Turbowarp).html", "icon": "turbowarp.png" },
  { "name": "Silk", "path": "apps/Silk.html", "icon": "silk.png" }
];

let gamesData = DEFAULT_GAMES_LIST.map(item => normalizeItem(item, 'game')).filter(Boolean);
let appsData = DEFAULT_APPS_LIST.map(item => normalizeItem(item, 'app')).filter(Boolean);

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
  if (image && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('data:')) {
    if (image.startsWith('assets/')) {
      image = `${JSDELIVR_BASE}${image}`;
    } else if (image.startsWith('/')) {
      image = `${JSDELIVR_BASE}${image.slice(1)}`;
    } else {
      image = type === 'app' ? `${JSDELIVR_BASE}assets/app_icons/${image}` : `${JSDELIVR_BASE}assets/game_icons/${image}`;
    }
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
    let res = await fetch(`${JSDELIVR_BASE}games.json`).catch(() => null);
    if (!res || !res.ok) {
      res = await fetch('games.json');
    }
    if (res && res.ok) {
      const text = await res.text();
      if (text.trim().length > 0) {
        const json = JSON.parse(text);
        if (Array.isArray(json) && json.length > 0) {
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
    let res = await fetch(`${JSDELIVR_BASE}apps.json`).catch(() => null);
    if (!res || !res.ok) {
      res = await fetch('apps.json');
    }
    if (res && res.ok) {
      const text = await res.text();
      if (text.trim().length > 0) {
        const json = JSON.parse(text);
        if (Array.isArray(json) && json.length > 0) {
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

function matchesSearch(item, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const title = (item.title || item.name || '').toLowerCase();
  const rawId = (item.id || '').toLowerCase();
  const url = (item.url || '').toLowerCase();

  // 1. Direct Substring Match
  if (title.includes(q) || rawId.includes(q) || url.includes(q)) {
    return true;
  }

  // 2. Punctuation-stripped alphanumeric Match (e.g., "fnaf 2", "baldis basics", "pvz")
  const cleanQ = q.replace(/[^a-z0-9]/g, '');
  const cleanTitle = title.replace(/[^a-z0-9]/g, '');
  if (cleanQ && cleanTitle.includes(cleanQ)) {
    return true;
  }

  // 3. Acronym Match (e.g. "fnaf" for "Five Nights at Freddy's", "pvz" for "Plants vs. Zombies", "gd" for "Geometry Dash")
  const words = title.split(/[\s\-:_]+/).filter(Boolean);
  const initials = words.map(w => w[0]).join('');
  if (cleanQ && initials.startsWith(cleanQ)) {
    return true;
  }

  // 4. Word Prefix Match (e.g. "pig" matches "Bad Piggies")
  if (words.some(w => w.startsWith(q))) {
    return true;
  }

  return false;
}

function filterGames() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;
  const input = document.getElementById('gamesSearchInput');
  const clearBtn = document.getElementById('gamesSearchClear');
  const noResults = document.getElementById('gamesNoResults');
  const countBadge = document.getElementById('gamesSearchCount');
  
  const query = (input ? input.value : '').trim();
  if (clearBtn) {
    clearBtn.style.display = query.length > 0 ? 'inline-flex' : 'none';
  }

  const filtered = gamesData.filter(item => matchesSearch(item, query));

  grid.innerHTML = '';
  filtered.forEach(item => {
    grid.appendChild(createCard(item, 'game'));
  });

  if (countBadge) {
    countBadge.textContent = query
      ? `${filtered.length} found`
      : `${filtered.length} ${filtered.length === 1 ? 'game' : 'games'}`;
  }

  if (noResults) {
    if (filtered.length === 0) {
      noResults.style.display = 'flex';
      noResults.innerHTML = gamesData.length === 0
        ? '<i class="fa-solid fa-gamepad"></i><p>No games added yet</p>'
        : '<i class="fa-solid fa-ghost"></i><p>No games found matching your search</p>';
    } else {
      noResults.style.display = 'none';
    }
  }
}

function filterApps() {
  const grid = document.getElementById('appsGrid');
  if (!grid) return;
  const input = document.getElementById('appsSearchInput');
  const clearBtn = document.getElementById('appsSearchClear');
  const noResults = document.getElementById('appsNoResults');
  const countBadge = document.getElementById('appsSearchCount');

  const query = (input ? input.value : '').trim();
  if (clearBtn) {
    clearBtn.style.display = query.length > 0 ? 'inline-flex' : 'none';
  }

  const filtered = appsData.filter(item => matchesSearch(item, query));

  grid.innerHTML = '';
  filtered.forEach(item => {
    grid.appendChild(createCard(item, 'app'));
  });

  if (countBadge) {
    countBadge.textContent = query
      ? `${filtered.length} found`
      : `${filtered.length} ${filtered.length === 1 ? 'app' : 'apps'}`;
  }

  if (noResults) {
    if (filtered.length === 0) {
      noResults.style.display = 'flex';
      noResults.innerHTML = appsData.length === 0
        ? '<i class="fa-solid fa-shapes"></i><p>No apps added yet</p>'
        : '<i class="fa-solid fa-ghost"></i><p>No apps found matching your search</p>';
    } else {
      noResults.style.display = 'none';
    }
  }
}

// Universal delegated input & click listeners for instant real-time search
document.addEventListener('input', (e) => {
  if (!e.target) return;
  if (e.target.id === 'gamesSearchInput') {
    filterGames();
  } else if (e.target.id === 'appsSearchInput') {
    filterApps();
  }
});

document.addEventListener('click', (e) => {
  const clearBtn = e.target.closest('#gamesSearchClear, #appsSearchClear');
  if (clearBtn) {
    if (clearBtn.id === 'gamesSearchClear') {
      const input = document.getElementById('gamesSearchInput');
      if (input) { input.value = ''; input.focus(); }
      filterGames();
    } else if (clearBtn.id === 'appsSearchClear') {
      const input = document.getElementById('appsSearchInput');
      if (input) { input.value = ''; input.focus(); }
      filterApps();
    }
    return;
  }

  const searchIcon = e.target.closest('#gamesSearchIcon, #appsSearchIcon');
  if (searchIcon) {
    if (searchIcon.id === 'gamesSearchIcon') {
      const input = document.getElementById('gamesSearchInput');
      if (input) input.focus();
    } else if (searchIcon.id === 'appsSearchIcon') {
      const input = document.getElementById('appsSearchInput');
      if (input) input.focus();
    }
  }
});

// Quick keyboard shortcut (press '/' or Ctrl+K / Cmd+K to search, Esc to clear)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    if (e.key === 'Escape') {
      if (document.activeElement.id === 'gamesSearchInput') {
        document.activeElement.value = '';
        filterGames();
        document.activeElement.blur();
      } else if (document.activeElement.id === 'appsSearchInput') {
        document.activeElement.value = '';
        filterApps();
        document.activeElement.blur();
      } else if (document.activeElement.id === 'homeSearchInput') {
        document.activeElement.value = '';
        document.activeElement.blur();
      }
    }
    return;
  }

  if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
    const activePanel = document.querySelector('.tab-panel.active');
    if (activePanel) {
      if (activePanel.id === 'games-section') {
        e.preventDefault();
        const input = document.getElementById('gamesSearchInput');
        if (input) input.focus();
      } else if (activePanel.id === 'apps-section') {
        e.preventDefault();
        const input = document.getElementById('appsSearchInput');
        if (input) input.focus();
      } else if (activePanel.id === 'home-section') {
        e.preventDefault();
        const input = document.getElementById('homeSearchInput');
        if (input) input.focus();
      }
    }
  }
});

// Helper to resolve absolute or CDN URL for any game/app
function resolveItemUrl(rawUrl) {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  const cleanPath = rawUrl.replace(/^\.?\/+/, '');
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http') && !window.location.hostname.includes('github.io')) {
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    return `${window.location.origin}${basePath}${encodeURI(cleanPath)}`;
  }
  return `${JSDELIVR_BASE}${encodeURI(cleanPath)}`;
}

// Open game in about:blank cloaked window (never srcdoc)
function openGameInAboutBlank(item, resolvedUrl) {
  try {
    const win = window.open('about:blank', '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      return false;
    }

    const doc = win.document;
    doc.title = item.title || document.title;

    // Set favicon
    if (item.image) {
      const link = doc.createElement('link');
      link.rel = 'icon';
      link.href = item.image;
      doc.head.appendChild(link);
    } else {
      const currentFav = document.getElementById('pageFavicon');
      if (currentFav && currentFav.href) {
        const link = doc.createElement('link');
        link.rel = 'icon';
        link.href = currentFav.href;
        doc.head.appendChild(link);
      }
    }

    // Embed game directly via iframe.src (NOT srcdoc, NOT blob) with full permissions
    const iframe = doc.createElement('iframe');
    iframe.src = resolvedUrl;
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
    iframe.allow = 'autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; encrypted-media';

    doc.body.style.margin = '0';
    doc.body.style.padding = '0';
    doc.body.style.overflow = 'hidden';
    doc.body.style.backgroundColor = '#000000';
    doc.body.appendChild(iframe);

    return true;
  } catch (e) {
    console.warn('Could not open about:blank window for game:', e);
    return false;
  }
}

// Helper to load game/app content directly into modal iframe via standard src
function loadContentIntoIframe(iframe, rawUrl, type) {
  if (!iframe || !rawUrl) return;

  // Clear srcdoc completely so browser never sets location to about:srcdoc
  iframe.removeAttribute('srcdoc');

  const resolvedUrl = resolveItemUrl(rawUrl);

  // Directly load the game or app via src (never creates blob: URLs and never uses srcdoc)
  iframe.src = resolvedUrl;
}

// Player Modal Controls
function openPlayer(item, type) {
  if (!item || !playerModal) return;
  activePlayerItem = item;
  
  if (playerTitle) playerTitle.textContent = item.title;
  if (playerTypeIcon) {
    playerTypeIcon.className = type === 'game' ? 'fa-solid fa-gamepad' : 'fa-solid fa-shapes';
  }
  if (playerIframe) {
    playerIframe.removeAttribute('srcdoc');
    playerIframe.onload = () => {
      try {
        if (playerIframe.contentWindow) {
          playerIframe.contentWindow.alert = function(msg) {
            console.warn('Suppressed iframe alert:', msg);
          };
        }
      } catch (e) {}
    };

    loadContentIntoIframe(playerIframe, item.url, type);
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

const playerAboutBlankBtn = document.getElementById('playerAboutBlankBtn');
if (playerAboutBlankBtn) {
  playerAboutBlankBtn.addEventListener('click', () => {
    if (activePlayerItem) {
      const url = resolveItemUrl(activePlayerItem.url);
      openGameInAboutBlank(activePlayerItem, url);
      closePlayer();
    }
  });
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
  if (window.location.protocol.startsWith('http')) {
    const currentFolder = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    proxyIframeEl.src = `${window.location.origin}${currentFolder}proxy/index.html`;
  } else {
    proxyIframeEl.src = `${JSDELIVR_BASE}proxy/index.html`;
  }
}

// Render games and apps immediately from embedded data
filterGames();
filterApps();

// Load Games & Apps from JSON files in background
loadGames();
loadApps();

