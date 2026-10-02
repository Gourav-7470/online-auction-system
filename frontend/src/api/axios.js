import axios from 'axios';
import { getToken, removeToken, removeUser } from '../utils/auth';

// Use environment variable if set, otherwise default to relative path (Vite proxy)
const envUrl = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = envUrl && envUrl.trim() !== '' ? envUrl.trim() : '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Error handling & 401 auto-logout
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Unauthorized - token expired or invalid
      if (status === 401) {
        removeToken();
        removeUser();
        // Only redirect if not already on login/register page to prevent reload loops
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')
        ) {
          window.location.href = '/login?expired=true';
        }
      }

      // Format clean error message from Spring Boot backend
      const data = error.response.data;
      let errorMsg = 'An unexpected server error occurred.';

      if (typeof data === 'string' && data.trim()) {
        errorMsg = data;
      } else if (data && typeof data === 'object') {
        if (data.message) {
          errorMsg = data.message;
        } else if (data.messages && typeof data.messages === 'object') {
          // Spring Boot validation errors map
          errorMsg = Object.values(data.messages).join(', ');
        } else if (data.error) {
          errorMsg = data.error;
        }
      }

      error.userMessage = errorMsg;
    } else if (error.request) {
      error.userMessage =
        'Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.';
    } else {
      error.userMessage = error.message || 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default api;
