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
   * Get reports with pagination and filtering
   * @param {Object} params - Filter parameters (page, limit, status, etc.)
   * @returns {Promise} Promise with reports array and total count
   */
  async getReports(params = {}) {
    console.log('Fetching reports with params:', params);
    
    // Format date parameters if provided
    const formattedParams = { ...params };
    
    // Make sure we send dates in a format the API expects
    if (formattedParams.startDate) {
      console.log('Using start date filter:', formattedParams.startDate);
    }
    
    if (formattedParams.endDate) {
      console.log('Using end date filter:', formattedParams.endDate);
    }
    
    const response = await api.get('/reports', { params: formattedParams });
    console.log('API response:', response.data);
    
    return {
      reports: response.data.data || [],
      total: response.data.total || 0
    };
  },
  
  /**
   * Get a specific report by ID
   * @param {string} reportId - Report ID
   * @returns {Promise} Promise with report data
   */
  async getReportById(reportId) {
    const response = await api.get(`/reports/${reportId}`);
    console.log('API response:', response.data);
    // Most APIs return data in a nested structure like {data: actualData}
    // Check if this is the case and handle it
    return response.data.data || response.data;
  },
  
  /**
   * Create a new report
   * @param {Object} reportData - Report data
   * @returns {Promise} Promise with created report
   */
  async createReport(reportData) {
    const response = await api.post('/reports', reportData);
    return response.data;
  },
  
  /**
   * Update an existing report
   * @param {string} reportId - Report ID
   * @param {Object} reportData - Updated report data
   * @returns {Promise} Promise with updated report
   */
  async updateReport(reportId, reportData) {
    const response = await api.put(`/reports/${reportId}`, reportData);
    return response.data;
  },
  
  /**
   * Delete a report
   * @param {string} reportId - Report ID
   * @returns {Promise} Promise with deletion status
   */
  async deleteReport(reportId) {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },
  
  /**
   * Add a comment to a report
   * @param {string} reportId - Report ID
   * @param {string} comment - Comment content
   * @returns {Promise} Promise with updated report
   */
  async addComment(reportId, comment) {
    const response = await api.post(`/reports/${reportId}/comments`, { content: comment });
    return response.data;
  },
  
  /**
   * Change report status
   * @param {string} reportId - Report ID
   * @param {string} status - New status ('draft', 'submitted', 'approved', 'rejected')
   * @returns {Promise} Promise with updated report
   */
  async changeReportStatus(reportId, status) {
    const response = await api.patch(`/reports/${reportId}/status`, { status });
    return response.data;
  }
};
