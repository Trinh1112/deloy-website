/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8099/api';

const axiosClient = axios.create({
  baseURL: BASE_API,
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:3000',
  },
});

const getToken = () => localStorage.getItem('accessToken') || '';
const getRefreshToken = () => localStorage.getItem('refreshToken') || '';

axiosClient.interceptors.request.use(async (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (token: string | null, error: any = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const response = await axios.post(`${BASE_API}/auth/refresh`, {
      refreshToken: getRefreshToken(),
    });
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return accessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken();
        processQueue(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(null, err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;