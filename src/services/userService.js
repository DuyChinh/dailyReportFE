import axios from 'axios';
import toastService from './toastService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
  }

  // Get all users (Admin only)
  async getUsers(params = {}) {
    try {
      const response = await this.api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await this.api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await this.api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user (Admin only)
  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await this.api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
}

export default new UserService();
