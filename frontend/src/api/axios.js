import axios from 'axios';

// Get base URL for backend API from env variables or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: add JWT token to headers if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('placemate_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: redirect to login if JWT token expires (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Authentication token expired or invalid.');
      localStorage.removeItem('placemate_jwt_token');
      // If we are not already on the login or landing page, redirect to login
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
