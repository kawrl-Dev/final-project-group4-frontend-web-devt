const KEY = 'minosdb_settings';

const osReducesMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

    const clamp = (n, min, max, fallback) => Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
    const bool = (v, fallback) => (typeof v === 'boolean' ? v : fallback);

function readStored() {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export function getSettings() {
    const r = readStored();
    return {
        binary: bool(r.binary, true),
        brightness: clamp(r.brightness, 60, 140, 100),
        reduceMotion: bool(r.reduceMotion, osReducesMotion()),
        reduceGlow: bool(r.reduceGlow, false),
    };
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
        // Storage can be blocked (private mode, quota). Settings just won't persist.
    }
    applySettings();
    window.dispatchEvent(new Event('minosdb-settings'));
}

export function resetSettings() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // Storage can be blocked (private mode, quota). Settings just won't persist.
    }
    applySettings();
    window.dispatchEvent(new Event('minosdb-settings'));
}