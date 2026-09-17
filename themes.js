function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function generateCustomTheme(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return null;

  const r = rgb.r, g = rgb.g, b = rgb.b;
  return {
    id: hexColor,
    name: "Custom Theme",
    category: "Custom",
    vars: {
      "--bg": "#09090b",
      "--bg-base": "#09090b",
      "--surface": "#121215",
      "--surface-hover": "#18181c",
      "--surface-active": "#222228",
      "--border": `rgba(${r}, ${g}, ${b}, 0.16)`,
      "--border-hover": `rgba(${r}, ${g}, ${b}, 0.32)`,
      "--border-light": `rgba(${r}, ${g}, ${b}, 0.22)`,
      "--text": "#ffffff",
      "--text-main": "#ffffff",
      "--text-muted": "#a1a1aa",
      "--text-dim": hexColor,
      "--accent": hexColor,
      "--accent-dim": `rgba(${r}, ${g}, ${b}, 0.18)`,
      "--accent-glow": `rgba(${r}, ${g}, ${b}, 0.45)`,
      "--accent-hover": hexColor,
      "--dock-bg": "rgba(18, 18, 22, 0.85)",
      "--dock-border": `rgba(${r}, ${g}, ${b}, 0.2)`,
      "--dock-btn-hover": `rgba(${r}, ${g}, ${b}, 0.14)`,
      "--dock-btn-active": `rgba(${r}, ${g}, ${b}, 0.25)`
    }
  };
}

const ATHYX_THEMES = [
  {
    id: "crimson",
    name: "Crimson",
    subtitle: "Default Onyx & Ruby Scarlet",
    category: "Vivid",
    vars: {
      "--bg": "#0c0406",
      "--bg-base": "#0c0406",
      "--surface": "#190a0e",
      "--surface-hover": "#251016",
      "--surface-active": "#35161f",
      "--border": "rgba(244, 63, 94, 0.16)",
      "--border-hover": "rgba(244, 63, 94, 0.32)",
      "--border-light": "rgba(244, 63, 94, 0.22)",
      "--text": "#fff1f2",
      "--text-main": "#fff1f2",
      "--text-muted": "#fecdd3",
      "--text-dim": "#f43f5e",
      "--accent": "#f43f5e",
      "--accent-dim": "rgba(244, 63, 94, 0.18)",
      "--accent-glow": "rgba(244, 63, 94, 0.45)",
      "--accent-hover": "#e11d48",
      "--dock-bg": "rgba(25, 10, 14, 0.88)",
      "--dock-border": "rgba(244, 63, 94, 0.2)",
      "--dock-btn-hover": "rgba(244, 63, 94, 0.14)",
      "--dock-btn-active": "rgba(244, 63, 94, 0.25)"
    }
  },
  {
    id: "midnight",
    name: "Midnight",
    subtitle: "Classic Athyx Sapphire Blue",
    category: "Classic",
    vars: {
      "--bg": "#09090b",
      "--bg-base": "#09090b",
      "--surface": "#121215",
      "--surface-hover": "#18181c",
      "--surface-active": "#222228",
      "--border": "rgba(255, 255, 255, 0.08)",
      "--border-hover": "rgba(255, 255, 255, 0.18)",
      "--border-light": "rgba(255, 255, 255, 0.16)",
      "--text": "#f4f4f5",
      "--text-main": "#f4f4f5",
      "--text-muted": "#a1a1aa",
      "--text-dim": "#71717a",
      "--accent": "#3b82f6",
      "--accent-dim": "rgba(59, 130, 246, 0.15)",
      "--accent-glow": "rgba(59, 130, 246, 0.35)",
      "--accent-hover": "#2563eb",
      "--dock-bg": "rgba(18, 18, 22, 0.85)",
      "--dock-border": "rgba(255, 255, 255, 0.08)",
      "--dock-btn-hover": "rgba(255, 255, 255, 0.07)",
      "--dock-btn-active": "rgba(255, 255, 255, 0.14)"
    }
  },
  {
    id: "oled",
    name: "OLED Void",
    subtitle: "Pure pitch black & Cyan",
    category: "Minimal",
    vars: {
      "--bg": "#000000",
      "--bg-base": "#000000",
      "--surface": "#08080a",
      "--surface-hover": "#121216",
      "--surface-active": "#1c1c22",
      "--border": "rgba(255, 255, 255, 0.10)",
      "--border-hover": "rgba(255, 255, 255, 0.24)",
      "--border-light": "rgba(255, 255, 255, 0.18)",
      "--text": "#ffffff",
      "--text-main": "#ffffff",
      "--text-muted": "#a6a6b0",
      "--text-dim": "#70707c",
      "--accent": "#38bdf8",
      "--accent-dim": "rgba(56, 189, 248, 0.16)",
      "--accent-glow": "rgba(56, 189, 248, 0.4)",
      "--accent-hover": "#0284c7",
      "--dock-bg": "rgba(8, 8, 10, 0.92)",
      "--dock-border": "rgba(255, 255, 255, 0.12)",
      "--dock-btn-hover": "rgba(255, 255, 255, 0.08)",
      "--dock-btn-active": "rgba(255, 255, 255, 0.18)"
    }
  },
  {
    id: "nebula",
    name: "Nebula",
    subtitle: "Cosmic ultraviolet neon",
    category: "Vibrant",
    vars: {
      "--bg": "#0a0612",
      "--bg-base": "#0a0612",
      "--surface": "#140c24",
      "--surface-hover": "#1d1233",
      "--surface-active": "#281947",
      "--border": "rgba(168, 85, 247, 0.16)",
      "--border-hover": "rgba(168, 85, 247, 0.32)",
      "--border-light": "rgba(168, 85, 247, 0.24)",
      "--text": "#f5f3ff",
      "--text-main": "#f5f3ff",
      "--text-muted": "#c4b5fd",
      "--text-dim": "#8b5cf6",
      "--accent": "#a855f7",
      "--accent-dim": "rgba(168, 85, 247, 0.18)",
      "--accent-glow": "rgba(168, 85, 247, 0.45)",
      "--accent-hover": "#9333ea",
      "--dock-bg": "rgba(20, 12, 36, 0.88)",
      "--dock-border": "rgba(168, 85, 247, 0.2)",
      "--dock-btn-hover": "rgba(168, 85, 247, 0.14)",
      "--dock-btn-active": "rgba(168, 85, 247, 0.25)"
    }
  },
  {
    id: "emerald",
    name: "Emerald",
    subtitle: "Obsidian shadow & cyber green",
    category: "Neon",
    vars: {
      "--bg": "#030c08",
      "--bg-base": "#030c08",
      "--surface": "#081810",
      "--surface-hover": "#0e2419",
      "--surface-active": "#143424",
      "--border": "rgba(16, 185, 129, 0.16)",
      "--border-hover": "rgba(16, 185, 129, 0.32)",
      "--border-light": "rgba(16, 185, 129, 0.22)",
      "--text": "#ecfdf5",
      "--text-main": "#ecfdf5",
      "--text-muted": "#a7f3d0",
      "--text-dim": "#10b981",
      "--accent": "#10b981",
      "--accent-dim": "rgba(16, 185, 129, 0.18)",
      "--accent-glow": "rgba(16, 185, 129, 0.45)",
      "--accent-hover": "#059669",
      "--dock-bg": "rgba(8, 24, 16, 0.88)",
      "--dock-border": "rgba(16, 185, 129, 0.2)",
      "--dock-btn-hover": "rgba(16, 185, 129, 0.14)",
      "--dock-btn-active": "rgba(16, 185, 129, 0.25)"
    }
  },
  {
    id: "oceanic",
    name: "Oceanic",
    subtitle: "Abyssal depth & electric cyan",
    category: "Cool",
    vars: {
      "--bg": "#040b15",
      "--bg-base": "#040b15",
      "--surface": "#0a1628",
      "--surface-hover": "#10213d",
      "--surface-active": "#162f55",
      "--border": "rgba(14, 165, 233, 0.16)",
      "--border-hover": "rgba(14, 165, 233, 0.32)",
      "--border-light": "rgba(14, 165, 233, 0.22)",
      "--text": "#f0f9ff",
      "--text-main": "#f0f9ff",
      "--text-muted": "#bae6fd",
      "--text-dim": "#38bdf8",
      "--accent": "#0ea5e9",
      "--accent-dim": "rgba(14, 165, 233, 0.18)",
      "--accent-glow": "rgba(14, 165, 233, 0.45)",
      "--accent-hover": "#0284c7",
      "--dock-bg": "rgba(10, 22, 40, 0.88)",
      "--dock-border": "rgba(14, 165, 233, 0.2)",
      "--dock-btn-hover": "rgba(14, 165, 233, 0.14)",
      "--dock-btn-active": "rgba(14, 165, 233, 0.25)"
    }
  },
  {
    id: "sunset",
    name: "Sunset Flare",
    subtitle: "Warm dusk & radiant amber",
    category: "Warm",
    vars: {
      "--bg": "#0f0603",
      "--bg-base": "#0f0603",
      "--surface": "#1c0d06",
      "--surface-hover": "#29140b",
      "--surface-active": "#3a1c0f",
      "--border": "rgba(249, 115, 22, 0.16)",
      "--border-hover": "rgba(249, 115, 22, 0.32)",
      "--border-light": "rgba(249, 115, 22, 0.22)",
      "--text": "#fff7ed",
      "--text-main": "#fff7ed",
      "--text-muted": "#fed7aa",
      "--text-dim": "#fb923c",
      "--accent": "#f97316",
      "--accent-dim": "rgba(249, 115, 22, 0.18)",
      "--accent-glow": "rgba(249, 115, 22, 0.45)",
      "--accent-hover": "#ea580c",
      "--dock-bg": "rgba(28, 13, 6, 0.88)",
      "--dock-border": "rgba(249, 115, 22, 0.2)",
      "--dock-btn-hover": "rgba(249, 115, 22, 0.14)",
      "--dock-btn-active": "rgba(249, 115, 22, 0.25)"
    }
  },
  {
    id: "nord",
    name: "Nord Frost",
    subtitle: "Arctic slate & glacier ice",
    category: "Pastel",
    vars: {
      "--bg": "#0f131a",
      "--bg-base": "#0f131a",
      "--surface": "#181f2b",
      "--surface-hover": "#222b3b",
      "--surface-active": "#2d394e",
      "--border": "rgba(136, 192, 208, 0.16)",
      "--border-hover": "rgba(136, 192, 208, 0.32)",
      "--border-light": "rgba(136, 192, 208, 0.22)",
      "--text": "#eceff4",
      "--text-main": "#eceff4",
      "--text-muted": "#d8dee9",
      "--text-dim": "#88c0d0",
      "--accent": "#88c0d0",
      "--accent-dim": "rgba(136, 192, 208, 0.18)",
      "--accent-glow": "rgba(136, 192, 208, 0.45)",
      "--accent-hover": "#81a1c1",
      "--dock-bg": "rgba(24, 31, 43, 0.88)",
      "--dock-border": "rgba(136, 192, 208, 0.2)",
      "--dock-btn-hover": "rgba(136, 192, 208, 0.14)",
      "--dock-btn-active": "rgba(136, 192, 208, 0.25)"
    }
  },
  {
    id: "catppuccin",
    name: "Catppuccin Mocha",
    subtitle: "Soothing dark pastel mocha",
    category: "Cozy",
    vars: {
      "--bg": "#14141e",
      "--bg-base": "#14141e",
      "--surface": "#1e1e2e",
      "--surface-hover": "#28283d",
      "--surface-active": "#33334d",
      "--border": "rgba(203, 166, 247, 0.16)",
      "--border-hover": "rgba(203, 166, 247, 0.32)",
      "--border-light": "rgba(203, 166, 247, 0.22)",
      "--text": "#cdd6f4",
      "--text-main": "#cdd6f4",
      "--text-muted": "#bac2de",
      "--text-dim": "#a6adc8",
      "--accent": "#cba6f7",
      "--accent-dim": "rgba(203, 166, 247, 0.18)",
      "--accent-glow": "rgba(203, 166, 247, 0.45)",
      "--accent-hover": "#b4befe",
      "--dock-bg": "rgba(30, 30, 46, 0.88)",
      "--dock-border": "rgba(203, 166, 247, 0.2)",
      "--dock-btn-hover": "rgba(203, 166, 247, 0.14)",
      "--dock-btn-active": "rgba(203, 166, 247, 0.25)"
    }
  },
  {
    id: "sakura",
    name: "Sakura Rose",
    subtitle: "Midnight plum & spring blossom",
    category: "Aesthetic",
    vars: {
      "--bg": "#11060e",
      "--bg-base": "#11060e",
      "--surface": "#1d0b1a",
      "--surface-hover": "#2a1025",
      "--surface-active": "#3b1735",
      "--border": "rgba(251, 113, 133, 0.16)",
      "--border-hover": "rgba(251, 113, 133, 0.32)",
      "--border-light": "rgba(251, 113, 133, 0.22)",
      "--text": "#fff1f2",
      "--text-main": "#fff1f2",
      "--text-muted": "#fecdd3",
      "--text-dim": "#fb7185",
      "--accent": "#fb7185",
      "--accent-dim": "rgba(251, 113, 133, 0.18)",
      "--accent-glow": "rgba(251, 113, 133, 0.45)",
      "--accent-hover": "#f43f5e",
      "--dock-bg": "rgba(29, 11, 26, 0.88)",
      "--dock-border": "rgba(251, 113, 133, 0.2)",
      "--dock-btn-hover": "rgba(251, 113, 133, 0.14)",
      "--dock-btn-active": "rgba(251, 113, 133, 0.25)"
    }
  },
  {
    id: "cybergold",
    name: "Cyber Gold",
    subtitle: "Dystopian night & electric gold",
    category: "Tech",
    vars: {
      "--bg": "#0c0c03",
      "--bg-base": "#0c0c03",
      "--surface": "#171708",
      "--surface-hover": "#23230c",
      "--surface-active": "#333312",
      "--border": "rgba(234, 179, 8, 0.16)",
      "--border-hover": "rgba(234, 179, 8, 0.32)",
      "--border-light": "rgba(234, 179, 8, 0.22)",
      "--text": "#fefce8",
      "--text-main": "#fefce8",
      "--text-muted": "#fef08a",
      "--text-dim": "#eab308",
      "--accent": "#eab308",
      "--accent-dim": "rgba(234, 179, 8, 0.18)",
      "--accent-glow": "rgba(234, 179, 8, 0.45)",
      "--accent-hover": "#ca8a04",
      "--dock-bg": "rgba(23, 23, 8, 0.88)",
      "--dock-border": "rgba(234, 179, 8, 0.2)",
      "--dock-btn-hover": "rgba(234, 179, 8, 0.14)",
      "--dock-btn-active": "rgba(234, 179, 8, 0.25)"
    }
  },
  {
    id: "dracula",
    name: "Dracula",
    subtitle: "Gothic charcoal & electric pink",
    category: "Contrast",
    vars: {
      "--bg": "#15161c",
      "--bg-base": "#15161c",
      "--surface": "#1e1f29",
      "--surface-hover": "#272836",
      "--surface-active": "#323445",
      "--border": "rgba(255, 121, 198, 0.16)",
      "--border-hover": "rgba(255, 121, 198, 0.32)",
      "--border-light": "rgba(255, 121, 198, 0.22)",
      "--text": "#f8f8f2",
      "--text-main": "#f8f8f2",
      "--text-muted": "#bd93f9",
      "--text-dim": "#ff79c6",
      "--accent": "#ff79c6",
      "--accent-dim": "rgba(255, 121, 198, 0.18)",
      "--accent-glow": "rgba(255, 121, 198, 0.45)",
      "--accent-hover": "#ff92d0",
      "--dock-bg": "rgba(30, 31, 41, 0.88)",
      "--dock-border": "rgba(255, 121, 198, 0.2)",
      "--dock-btn-hover": "rgba(255, 121, 198, 0.14)",
      "--dock-btn-active": "rgba(255, 121, 198, 0.25)"
    }
  }
];

const AthyxThemeEngine = {
  getThemes: () => ATHYX_THEMES,
  
  getStoredThemeId: () => {
    try {
      return localStorage.getItem("athyx_theme") || "crimson";
    } catch(e) {
      return "crimson";
    }
  },

  getThemeById: (id) => {
    if (id && id.startsWith("#")) {
      const customTheme = generateCustomTheme(id);
      if (customTheme) return customTheme;
    }
    return ATHYX_THEMES.find(t => t.id === id) || ATHYX_THEMES.find(t => t.id === "crimson") || ATHYX_THEMES[0];
  },

  applyTheme: function(themeId, options = { broadcast: true, save: true }) {
    const theme = this.getThemeById(themeId);
    if (!theme) return;

    if (typeof document !== "undefined" && document.documentElement) {
      const root = document.documentElement;
      root.setAttribute("data-theme", theme.id);

      
      Object.entries(theme.vars).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
      });
    }

    if (options.save !== false && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("athyx_theme", theme.id);
      } catch(e) {}
    }

    
    if (typeof window !== "undefined" && typeof window.onAthyxThemeChange === "function") {
      window.onAthyxThemeChange(theme);
    }

    
    if (options.broadcast !== false && typeof window !== "undefined") {
      const msg = { action: "athyx_theme_change", themeId: theme.id };
      
      
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(msg, "*");
        }
        if (window.top && window.top !== window && window.top !== window.parent) {
          window.top.postMessage(msg, "*");
        }
      } catch (e) {}

      
      try {
        if (typeof document !== "undefined") {
          const frames = document.querySelectorAll("iframe");
          frames.forEach(iframe => {
            try {
              if (iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, "*");
              }
            } catch (e) {}
          });
        }
      } catch (e) {}
    }
  },

  init: function() {
    const savedId = this.getStoredThemeId();
    this.applyTheme(savedId, { broadcast: false, save: false });

    if (typeof window !== "undefined") {
      
      window.addEventListener("message", (event) => {
        if (event.data && (event.data.action === "athyx_theme_change" || event.data.type === "athyx_theme_change")) {
          const newThemeId = event.data.themeId || event.data.theme;
          if (newThemeId && newThemeId !== this.getStoredThemeId()) {
            this.applyTheme(newThemeId, { broadcast: false, save: true });
          } else if (newThemeId) {
            this.applyTheme(newThemeId, { broadcast: false, save: false });
          }
        }
      });

      
      window.addEventListener("storage", (event) => {
        if (event.key === "athyx_theme" && event.newValue) {
          this.applyTheme(event.newValue, { broadcast: false, save: false });
        }
      });
    }
  }
};

if (typeof window !== "undefined") {
  window.AthyxThemeEngine = AthyxThemeEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ATHYX_THEMES, AthyxThemeEngine };
}

AthyxThemeEngine.init();
