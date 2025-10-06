import reportService from '../services/reportService';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get tomorrow's date in YYYY-MM-DD format
const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export default {
  namespaced: true,
  
  state: {
    reports: [],
    currentReport: null,
    totalReports: 0,
    loading: false,
    error: null,
    filters: {
      page: 1,
      limit: 10,
      status: '',
      category: '',
      startDate: getTodayDate(), // Set today as default start date
      endDate: getTodayDate(),   // Set tomorrow as default end date
      search: ''
    }
  },
  
  getters: {
    allReports: state => state.reports || [],
    currentReport: state => state.currentReport,
    totalPages: state => Math.ceil(state.totalReports / state.filters.limit),
    currentPage: state => state.filters.page,
    loading: state => state.loading,
    error: state => state.error,
    filters: state => state.filters,
    
    // Add this getter that was being referenced but missing
    reports: state => state.reports || []
  },
  
  mutations: {
    SET_REPORTS(state, { reports, total }) {
      state.reports = reports;
      state.totalReports = total;
    },
    SET_CURRENT_REPORT(state, report) {
      state.currentReport = report;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    RESET_FILTERS(state) {
      state.filters = {
        page: 1,
        limit: 10,
        status: '',
        category: '',
        startDate: getTodayDate(), // Reset to today
        endDate: getTomorrowDate(),   // Reset to tomorrow
        search: ''
      };
    },
    ADD_REPORT(state, report) {
      state.reports = [report, ...state.reports];
      state.totalReports++;
    },
    UPDATE_REPORT(state, updatedReport) {
      const index = state.reports.findIndex(r => r._id === updatedReport._id);
      if (index !== -1) {
        state.reports.splice(index, 1, updatedReport);
      }
      if (state.currentReport && state.currentReport._id === updatedReport._id) {
        state.currentReport = updatedReport;
      }
    },
    DELETE_REPORT(state, reportId) {
      state.reports = state.reports.filter(r => r._id !== reportId);
      state.totalReports--;
      if (state.currentReport && state.currentReport._id === reportId) {
        state.currentReport = null;
      }
    },
    RESET_CURRENT_REPORT(state) {
      state.currentReport = null;
    }
  },
  
  actions: {
    async fetchReports({ commit, state }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const { reports, total } = await reportService.getReports(state.filters);
        commit('SET_REPORTS', { reports, total });
        
        return reports;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.errors?.[0]?.msg || 'Failed to fetch reports');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchReportById({ commit }, reportId) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const report = await reportService.getReportById(reportId);
        console.log('Report from API:', report);
        
        if (report) {
          commit('SET_CURRENT_REPORT', report);
        } else {
          commit('SET_ERROR', 'Report not found');
        }
        
        return report;
      } catch (error) {
        console.error('Error fetching report:', error);
        commit('SET_ERROR', error.response?.data?.errors?.[0]?.msg || 'Failed to fetch report');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async createReport({ commit }, reportData) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const newReport = await reportService.createReport(reportData);
        commit('ADD_REPORT', newReport);
        
        return newReport;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.errors?.[0]?.msg || 'Failed to create report');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async updateReport({ commit }, { reportId, reportData }) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const updatedReport = await reportService.updateReport(reportId, reportData);
        commit('UPDATE_REPORT', updatedReport);
        
        return updatedReport;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.errors?.[0]?.msg || 'Failed to update report');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async deleteReport({ commit }, reportId) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        await reportService.deleteReport(reportId);
        commit('DELETE_REPORT', reportId);
        
        return true;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.errors?.[0]?.msg || 'Failed to delete report');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    setFilters({ commit, dispatch }, filters) {
      commit('SET_FILTERS', filters);
      return dispatch('fetchReports');
    },
    
    resetFilters({ commit, dispatch }) {
      commit('RESET_FILTERS');
      return dispatch('fetchReports');
    },
    
    resetCurrentReport({ commit }) {
      commit('RESET_CURRENT_REPORT');
    }
  }
};
