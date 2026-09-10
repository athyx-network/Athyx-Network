// Dynamic WISP URL Configuration
// Default WISP URL: wss://lunarrr.eminescusm.ro/w/
// This can be changed via the settings UI which updates localStorage 'proxServer' key

var basePath = (typeof location !== 'undefined') ? location.pathname.replace(/[^/]*$/, '') : '/';

function normalizeWispUrl(url) {
  if (!url || typeof url !== 'string') return url;
  let clean = url.trim();
  if (clean.startsWith('https://')) {
    clean = clean.replace(/^https:\/\//, 'wss://');
  } else if (clean.startsWith('http://')) {
    clean = clean.replace(/^http:\/\//, 'ws://');
  }
  return clean;
}

const DEFAULT_WISP_URL = "wss://lunarrr.eminescusm.ro/w/";

let _CONFIG = {
  wispurl: normalizeWispUrl(localStorage.getItem("proxServer")) || DEFAULT_WISP_URL,
  bareurl: undefined
};

/**
 * Validates if a URL is a valid WISP server URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidWispUrl(url) {
  try {
    if (!url || typeof url !== 'string') return false;
    const normalized = normalizeWispUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.protocol === 'wss:' || urlObj.protocol === 'ws:';
  } catch (e) {
    console.warn('Invalid WISP URL format:', url);
    return false;
  }
}

/**
 * Updates the WISP URL in configuration when localStorage changes
 * @param {string} newUrl - The new WISP URL from localStorage
 */
function updateWispUrl(newUrl) {
  try {
    if (!newUrl) return;
    const normalized = normalizeWispUrl(newUrl);
    if (normalized === _CONFIG.wispurl) {
      return;
    }

    if (!isValidWispUrl(normalized)) {
      console.warn('Invalid WISP URL format:', newUrl);
      return;
    }

    const oldUrl = _CONFIG.wispurl;
    _CONFIG.wispurl = normalized;

    console.log(`WISP URL updated from ${oldUrl} to ${normalized}`);

    // Broadcast message to service worker if available
    if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'config',
        wispurl: normalized
      });
    }

    // Dispatch custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('wispUrlUpdated', {
      detail: {
        oldUrl,
        newUrl: normalized,
        bareUrl: _CONFIG.bareurl
      }
    }));

  } catch (error) {
    console.error('Error updating WISP URL:', error);
  }
}

// Listen for localStorage changes on the proxServer key
window.addEventListener('storage', (event) => {
  if (event.key === 'proxServer') {
    updateWispUrl(event.newValue);
  }
});

// Also listen for our own localStorage changes (same window)
window.addEventListener('localStorageUpdate', (event) => {
  if (event.key === 'proxServer') {
    updateWispUrl(event.newValue);
  }
});
