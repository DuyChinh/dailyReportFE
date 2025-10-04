import authService from '../services/authService';

// Helper function to handle localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export default {
  namespaced: true,
  
  state: {
    token: localStorage.getItem('token') || null,
    user: getUserFromStorage(),
    loading: false,
    error: null
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    isAdmin: state => state.user && state.user.role === 'admin',
    currentUser: state => state.user,
    loading: state => state.loading,
    error: state => state.error
  },
  
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_AUTH(state) {
      state.token = null;
      state.user = null;
      state.error = null;
    }
  },
  
  actions: {
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const response = await authService.register(userData);
        
        commit('SET_TOKEN', response.token);
        commit('SET_USER', response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response.user;
      } catch (error) {
        console.log(error);
        
        commit('SET_ERROR', error.response?.data?.errors[0]?.msg || 'Registration failed');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const response = await authService.login(credentials);
        
        commit('SET_TOKEN', response.token);
        commit('SET_USER', response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response.user;
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.errors[0]?.msg || 'Login failed');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async getCurrentUser({ commit, state }) {
      if (!state.token) return null;
      
      try {
        commit('SET_LOADING', true);
        
        const user = await authService.getCurrentUser();
        commit('SET_USER', user);
        localStorage.setItem('user', JSON.stringify(user));
        
        return user;
      } catch (error) {
        console.error('Failed to get current user:', error);
        commit('CLEAR_AUTH');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    logout({ commit }) {
      return new Promise(resolve => {
        commit('CLEAR_AUTH');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        resolve();
      });
    },
    
    // Add a new action to initialize user from localStorage
    initializeFromStorage({ commit }) {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          commit('SET_TOKEN', token);
          commit('SET_USER', user);
          return true;
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      return false;
    }
  }
};
