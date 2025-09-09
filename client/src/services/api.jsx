import axios from 'axios';

// Determine API URL based on current host
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // If using ngrok (https tunnel) - use relative path
  if (hostname.includes('ngrok.io') || hostname.includes('ngrok-free.app')) {
    return '/api'; // Use same ngrok domain for API
  }
  
  // If accessing via local network IP
  if (hostname === '192.168.1.19' || hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://192.168.1.19:3000/api';
  }
  
  // Default fallback for production
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;