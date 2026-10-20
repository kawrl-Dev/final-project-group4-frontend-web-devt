import { getToken, clearToken } from '../lib/auth';
import { API_BASE } from '../lib/config';

// kind: 'network' | 'unauthorized' | 'badRequest' | 'forbidden' | 'notFound' | 'server' | 'unknown'
export class ApiError extends Error {
  constructor(kind, status, message) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

function kindFor(status) {
  if (status === 400) return 'badRequest';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status >= 500) return 'server';
  return 'unknown';
}

/**
 * One place that builds the URL, adds the Bearer token, parses JSON,
 * and turns failures into ApiError. Pass { auth: false } for login/register.
 * AbortError is rethrown untouched so callers can ignore cancelled requests.
 */
export async function api(path, { method = 'GET', body, signal, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('network', 0, 'Could not reach the server.');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearToken();
      window.location.assign('/login');
    }
    throw new ApiError(kindFor(res.status), res.status, data?.error ?? `Request failed (${res.status})`);
  }

  // A 200 that is not JSON usually means the request hit Vercel's index.html
  // rewrite instead of the API (VITE_API_URL missing in production).
  if (data === null) {
    throw new ApiError('server', res.status, 'Server sent an unreadable reply.');
  }
  return data;
}