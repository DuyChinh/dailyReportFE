import axios from 'axios';
import toastService from './toastService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class TaskService {
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

  // Get all tasks with filters
  async getTasks(params = {}) {
    try {
      const response = await this.api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Get tasks assigned to current user
  async getMyTasks(params = {}) {
    try {
      const response = await this.api.get('/tasks/my-tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      throw error;
    }
  }

  // Search tasks for report creation
  async searchTasks(query, params = {}) {
    try {
      const response = await this.api.get('/tasks/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  }

  // Get single task by ID
  async getTaskById(taskId) {
    try {
      const response = await this.api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  // Create new task (Admin only)
  async createTask(taskData) {
    try {
      const response = await this.api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update task
  async updateTask(taskId, updateData) {
    try {
      const response = await this.api.put(`/tasks/${taskId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Update task status
  async updateTaskStatus(taskId, status) {
    try {
      const response = await this.api.put(`/tasks/${taskId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  // Delete task (Admin only)
  async deleteTask(taskId) {
    try {
      const response = await this.api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get task statistics
  async getTaskStats() {
    try {
      const response = await this.api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  }

  // Get users for task assignment (Admin only)
  async getUsers() {
    try {
      const response = await this.api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}

export default new TaskService();
