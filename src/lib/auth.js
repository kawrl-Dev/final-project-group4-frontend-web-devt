const KEY = 'minosdb_token';

export const getToken = () => sessionStorage.getItem(KEY);
export const saveToken = (t) => sessionStorage.setItem(KEY, t);
export const clearToken = () => sessionStorage.removeItem(KEY);

export function authFetch(url, options = {}) {
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