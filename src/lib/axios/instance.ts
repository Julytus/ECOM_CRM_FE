import { refreshAccessToken } from "@/lib/axios/auth";
import env from "@/lib/env";
import { useAuthStore } from "@/lib/stores/auth";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Not 401 → forward error
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      useAuthStore.getState().clear();
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // If already refreshing → queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      // Retry all queued requests
      pendingRequests.forEach((cb) => cb(newToken));
      pendingRequests = [];
      isRefreshing = false;

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      pendingRequests = [];

      // Refresh failed → logout
      useAuthStore.getState().clear();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
