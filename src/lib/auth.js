const KEY = 'minosdb_token';

export const getToken = () => localStorage.getItem(KEY);
export const saveToken = (t) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

export function authFetch(url, options = {}) {
    if (typeof url !== 'string' || !url.startsWith('/api/')) {
        throw new Error('authFetch only sends requests to /api/ paths')
    }
    const token = getToken();
    return fetch(url, {
        ...options,
        cache: 'no-store',
        headers: {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}`} : {}),
        },
    });
}