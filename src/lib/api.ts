import axios, { type AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: false,
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

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      setToken(null);
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
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
    return data.error.details
      .map((d) => `${d.path}: ${d.message}`)
      .join(", ");
  }

  return (
    data?.error?.message ||
    data?.message ||
    e?.message ||
    fallback
  );
}
