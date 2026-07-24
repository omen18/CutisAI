// frontend/src/api/client.ts
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/api/client.ts
// Base axios instance. VITE_API_URL is set in .env / .env.local
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  timeout: 30_000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.status, err.message);
    return Promise.reject(err);
  }
);

export default apiClient;
