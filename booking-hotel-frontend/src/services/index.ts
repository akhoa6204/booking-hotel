import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = "http://localhost:3001/api";
const TIME_REQUEST = 25_000;

export const AxiosInstanceDefault = axios.create({
  baseURL: BASE_URL,
  timeout: TIME_REQUEST,
  headers: { "Content-Type": "application/json" },
});

// ---------- request interceptor ----------
AxiosInstanceDefault.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// ---------- refresh logic ----------
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const runQueue = (token: string | null) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");
  const res = await axios.post(
    `${BASE_URL}/auth/refresh`,
    { token: refreshToken },
    { withCredentials: true }
  );
  const newToken = res.data?.token as string;
  if (!newToken) throw new Error("No new token");
  localStorage.setItem("accessToken", newToken);
  return newToken;
};

// ---------- response interceptor ----------
AxiosInstanceDefault.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;

    if (!original || original._retry || (status !== 401 && status !== 403)) {
      return Promise.reject(error);
    }

    // đã retry rồi
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error);
          original.headers.Authorization = `Bearer ${token}`;
          resolve(AxiosInstanceDefault(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      runQueue(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return AxiosInstanceDefault(original);
    } catch (e) {
      runQueue(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

// --------- thin wrapper ----------
const httpClient = {
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return AxiosInstanceDefault.get<T, T>(url, config); // <T, T>
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return AxiosInstanceDefault.post<T, T>(url, data, config); // <T, T>
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return AxiosInstanceDefault.put<T, T>(url, data, config);
  },
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return AxiosInstanceDefault.patch<T, T>(url, data, config);
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return AxiosInstanceDefault.delete<T, T>(url, config);
  },
};

export default httpClient;
