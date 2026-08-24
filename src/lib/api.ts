import axios, { type AxiosError } from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 20000,
});

const TOKEN_KEY = "finance-os.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function drainQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as typeof err.config & { _retry?: boolean };
    if (
      err.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) return reject(err);
            original._retry = true;
            if (original.headers) original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const res = await api.post<{ data: { token: string } }>("/auth/refresh");
        const newToken = res.data.data.token;
        setToken(newToken);
        drainQueue(newToken);
        if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        drainQueue(null);
        setToken(null);
        if (typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/login") &&
            !window.location.pathname.startsWith("/register")) {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

interface ApiErrorDetail {
  path: string;
  message: string;
}

interface ApiErrorData {
  error?: { message?: string; details?: ApiErrorDetail[] };
  message?: string;
}

export function apiError(err: unknown, fallback = "Something went wrong"): string {
  const e = err as AxiosError<ApiErrorData>;
  const data = e?.response?.data;

  if (data?.error?.details?.length) {
    return data.error.details.map((d) => d.message).join(". ");
  }

  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;

  const status = e?.response?.status;
  if (status === 400) return "Invalid request. Please check your input.";
  if (status === 401) return "Incorrect email or password.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "Not found.";
  if (status === 409) return "This already exists.";
  if (status === 422) return "Validation error. Please check your input.";
  if (status === 429) return "Too many attempts. Please wait and try again.";
  if (status === 503) return "Finance service is temporarily unavailable. Please try again shortly.";
  if (status && status >= 500) return "Server error. Please try again later.";
  if (!e?.response) return "Network error. Please check your connection and try again.";

  return fallback;
}
