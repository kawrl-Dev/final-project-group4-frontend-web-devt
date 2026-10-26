const KEY = 'minosdb_settings';

const osReducesMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

const clamp = (n, min, max, fallback) => Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
const bool = (v, fallback) => (typeof v === 'boolean' ? v : fallback);

export function normalizeSettings(raw, osMotion = false) {
    const r = raw && typeof raw === 'object' ? raw : {};
    return {
        binary: bool(r.binary, true),
        brightness: clamp(r.brightness, 50, 150, 100),
        reduceMotion: bool(r.reduceMotion, osMotion),
        reduceGlow: bool(r.reduceGlow, false),
        showScore: bool(r.showScore, false),
    };
}

export function getSettings() {
    let raw;
    try {
        raw = JSON.parse(localStorage.getItem(KEY));
    } catch {
        raw = null;
    }
    return normalizeSettings(raw, osReducesMotion());
}

export function applySettings(s = getSettings()) {
    const root = document.documentElement;
    root.style.setProperty('--app-filter', s.brightness === 100 ? 'none' : `brightness(${s.brightness / 100})`);
    root.dataset.reduceMotion = String(s.reduceMotion);
    root.dataset.reduceGlow = String(s.reduceGlow);
}

export function saveSettings(patch) {
    try {
        localStorage.setItem(KEY, JSON.stringify({ ...getSettings(), ...patch }));
    } catch {
        // storage blocked: the setting still applies for this page view
    }
    applySettings();
    window.dispatchEvent(new Event('minosdb-settings'));
}

export function resetSettings() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // storage blocked: the setting still applies for this page view
    }
    applySettings();
    window.dispatchEvent(new Event('minosdb-settings'));
}