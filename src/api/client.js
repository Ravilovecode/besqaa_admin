import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// Attach the admin token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('besqaa_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Surface a clean error message and auto-logout on 401.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('besqaa_admin_token');
      if (!location.pathname.startsWith('/login')) location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
