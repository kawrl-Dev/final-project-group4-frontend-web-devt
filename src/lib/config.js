// Empty in dev: requests go to /api/... and the Vite proxy forwards them to :5000.
// In production (Vercel) set VITE_API_URL to the Render URL, e.g.
//   VITE_API_URL=https://minosdb-api.onrender.com
// Only VITE_* variables reach the browser, and they are baked in at build time,
// so changing one on Vercel needs a redeploy.
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');