import axios from 'axios';
import toastService from './toastService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      toastService.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toastService.error('Bạn không có quyền thực hiện hành động này.');
    } else if (error.response?.status >= 500) {
      toastService.error('Lỗi máy chủ. Vui lòng thử lại sau.');
    } else if (error.code === 'NETWORK_ERROR') {
      toastService.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.');
    }
    return Promise.reject(error);
  }
);

export default {
  /**
   * Register a new user
   * @param {Object} userData - User data including name, email, password
   * @returns {Promise} Promise with user data and token
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  /**
   * Login a user
   * @param {Object} credentials - User credentials (email, password)
   * @returns {Promise} Promise with user data and token
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  /**
   * Get current authenticated user
   * @returns {Promise} Promise with user data
   */
  async getCurrentUser() {
    const response = await api.get('/auth/current');
    return response.data;
  },
  
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Promise with updated user data
   */
  async updateProfile(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
};
