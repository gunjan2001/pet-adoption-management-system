import { API_BASE_URL, TOKEN_KEY } from "@/const";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

// ---------------------------------------------------------------------------
// Retry config
// ---------------------------------------------------------------------------

/** 5xx codes that indicate a transient infra/DB error (e.g. NeonDB cold-start). */
const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);

/**
 * Axios error codes that indicate a cold NeonDB / slow-starting Render dyno
 * rather than a real application error:
 *   ECONNABORTED — request timed out (Axios timeout option exceeded)
 *   ERR_NETWORK  — TCP connection refused / no response at all
 */
const RETRYABLE_ERROR_CODES = new Set(["ECONNABORTED", "ERR_NETWORK"]);

/** Delay before the single retry attempt — gives NeonDB + Render dyno time to resume. */
const COLD_START_RETRY_DELAY_MS = 5_000;

// ---------------------------------------------------------------------------
// Custom DOM event
//
// Fired on `window` right before the retry so any component in the tree can
// listen and show a "waking up" banner — no prop-drilling or global store needed.
//
// Usage in a component:
//   useEffect(() => {
//     const on  = () => setWakingUp(true);
//     const off = () => setWakingUp(false);
//     window.addEventListener('db:waking',  on);
//     window.addEventListener('db:awake',   off);
//     return () => {
//       window.removeEventListener('db:waking', on);
//       window.removeEventListener('db:awake',  off);
//     };
//   }, []);
// ---------------------------------------------------------------------------

export function emitDbWaking() {
  window.dispatchEvent(new CustomEvent("db:waking"));
}
export function emitDbAwake() {
  window.dispatchEvent(new CustomEvent("db:awake"));
}

// ---------------------------------------------------------------------------
// Extend Axios config to carry a retry flag
// ---------------------------------------------------------------------------

interface RetryableConfig extends InternalAxiosRequestConfig {
  _hasBeenRetried?: boolean;
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ---------------------------------------------------------------------------
// Request interceptor: attach JWT if present
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
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message,
    );

    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const code   = error.code; // e.g. "ECONNABORTED", "ERR_NETWORK", "ERR_CANCELED"

    // Silently ignore aborted requests (AbortController / StrictMode cleanup)
    // — these are intentional cancellations, not real errors.
    if (code === "ERR_CANCELED" || error.name === "CanceledError") {
      return Promise.reject(error);
    }

    console.error(
      "API Error:",
      status ?? code,
      error.response?.data || error.message,
    );

    // ── 1. 401: token expired/invalid ─────────────────────────────────────
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // ── 2. NeonDB cold-start retry ─────────────────────────────────────────
    //
    // Retry once on:
    //   a) 5xx HTTP responses  — server/DB error after the dyno woke up
    //   b) Timeout / no-response — dyno or NeonDB hasn't finished waking yet
    //
    const isRetryableStatus = status !== undefined && RETRYABLE_STATUS_CODES.has(status);
    const isRetryableCode   = code !== undefined   && RETRYABLE_ERROR_CODES.has(code);
    if (config && (isRetryableStatus || isRetryableCode) && !config._hasBeenRetried) {
      config._hasBeenRetried = true;

      console.warn(
        `NeonDB may be resuming from suspension. ` +
          `Retrying in ${COLD_START_RETRY_DELAY_MS / 1_000}s… ` +
          `(${error.config?.url})`,
      );

      // 🔔 Tell the UI the DB is waking up BEFORE the delay
      emitDbWaking();

      await new Promise((resolve) =>
        setTimeout(resolve, COLD_START_RETRY_DELAY_MS),
      );

      try {
        // Give the retry more breathing room — the dyno just woke up and may
        // still be establishing the NeonDB connection pool.
        config.timeout = 30_000;
        const result = await api(config);
        // ✅ Retry succeeded — tell the UI we're back
        emitDbAwake();
        return result;
      } catch (retryError) {
        // ❌ Retry also failed — clear the banner and propagate
        emitDbAwake();
        return Promise.reject(retryError);
      }
    }

    // ── 3. Everything else — propagate to the caller ───────────────────────
    return Promise.reject(error);
  },
);

export default api;