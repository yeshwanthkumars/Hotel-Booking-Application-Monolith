import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TOKEN_KEYS = ['stayease_token', 'token'];
const SESSION_KEY = 'stayease_user';
const ROLE_KEYS = ['stayease_role', 'role'];

function readToken() {
  return TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || null;
}

function clearAuthStorage() {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(SESSION_KEY);
  ROLE_KEYS.forEach((key) => localStorage.removeItem(key));
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
