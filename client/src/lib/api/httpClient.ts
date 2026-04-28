import { API_BASE_URL, TOKEN_KEY } from "@/const";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

// ---------------------------------------------------------------------------
// Retry config
// ---------------------------------------------------------------------------

/** 5xx codes that indicate a transient infra/DB error (e.g. NeonDB cold-start). */
const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);

/** Delay before the single retry attempt — gives NeonDB time to resume. */
const COLD_START_RETRY_DELAY_MS = 3_000;

// ---------------------------------------------------------------------------
// Extend Axios config to carry a retry flag
//
// This is the standard pattern for preventing infinite retry loops:
// stamp the config object on the first failure; bail out on the second.
// ---------------------------------------------------------------------------

interface RetryableConfig extends InternalAxiosRequestConfig {
  _hasBeenRetried?: boolean;
}

// ---------------------------------------------------------------------------
// Axios instance — identical to your original
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ---------------------------------------------------------------------------
// Request interceptor: attach JWT if present — unchanged
// ---------------------------------------------------------------------------

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor: auto-logout on 401 + NeonDB cold-start retry
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    // Always log — same as your original
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message,
    );

    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    // ── 1. 401: token expired/invalid — unchanged ──────────────────────────
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // ── 2. NeonDB cold-start retry ─────────────────────────────────────────
    //
    // Retry once when:
    //   • the response is a transient 5xx (infra/DB error)
    //   • we have a config to replay the request with
    //   • this specific request hasn't been retried yet (prevents loops)
    //
    if (
      config &&
      status !== undefined &&
      RETRYABLE_STATUS_CODES.has(status) &&
      !config._hasBeenRetried
    ) {
      config._hasBeenRetried = true; // ← loop guard

      console.warn(
        `NeonDB may be resuming from suspension. ` +
          `Retrying in ${COLD_START_RETRY_DELAY_MS / 1_000}s… ` +
          `(${error.config?.url})`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, COLD_START_RETRY_DELAY_MS),
      );

      // Re-issue the original request. The request interceptor above will
      // re-attach the JWT header automatically, so nothing extra is needed.
      return api(config);
    }

    // ── 3. Everything else — propagate to the caller ───────────────────────
    return Promise.reject(error);
  },
);

export default api;

// ToDO:

// // src/lib/httpClient.ts
// // Axios instance wired to the Express REST backend

// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
// import { API_BASE_URL, TOKEN_KEY } from "@/const";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { "Content-Type": "application/json" },
//   timeout: 15_000,
// });

// // ── Request interceptor: attach JWT if present ─────────────────────────────
// api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ── Response interceptor: auto-logout on 401 ──────────────────────────────
// api.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     console.error("API Error:", error.response?.status, error.response?.data || error.message);
//     if (error.response?.status === 401) {
//       // Token expired or invalid — clear storage and redirect to login
//       localStorage.removeItem(TOKEN_KEY);
//       // Avoid circular import: use window.location instead of router
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
