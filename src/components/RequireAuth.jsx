import { Navigate } from 'react-router';
import { getToken } from '../lib/auth';

// Opposite of Skip: only lets logged-in users through, otherwise sends them to /login.
// This only checks that a token exists. If the token is expired or invalid, the first
// API call returns 401 and api.js clears it and redirects to /login.
export default function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}