import userService from '../services/userService';

const state = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    active: 0,
    inactive: 0
  }
};

const getters = {
  users: state => state.users,
  currentUser: state => state.currentUser,
  loading: state => state.loading,
  error: state => state.error,
  stats: state => state.stats,
  
  // Get users for task assignment (exclude current user)
  availableUsers: (state, getters, rootState) => {
    const currentUserId = rootState.auth.user?._id;
    return state.users.filter(user => user._id !== currentUserId);
  },
  
  // Get active users only
  activeUsers: state => state.users.filter(user => user.status === 'active'),
  
  // Get users by role
  adminUsers: state => state.users.filter(user => user.role === 'admin'),
  regularUsers: state => state.users.filter(user => user.role === 'user')
};

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  SET_USERS(state, users) {
    state.users = users;
  },
  
  SET_CURRENT_USER(state, user) {
    state.currentUser = user;
  },
  
  SET_STATS(state, stats) {
    state.stats = stats;
  },
  
  ADD_USER(state, user) {
    state.users.push(user);
  },
  
  UPDATE_USER(state, updatedUser) {
    const index = state.users.findIndex(user => user._id === updatedUser._id);
    if (index !== -1) {
      state.users.splice(index, 1, updatedUser);
    }
  },
  
  REMOVE_USER(state, userId) {
    state.users = state.users.filter(user => user._id !== userId);
  },
  
  CLEAR_USERS(state) {
    state.users = [];
    state.currentUser = null;
  }
};

const actions = {
  async fetchUsers({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await userService.getUsers(params);
      commit('SET_USERS', response.data || []);
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error fetching users:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchUserById({ commit }, userId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await userService.getUserById(userId);
      commit('SET_CURRENT_USER', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error fetching user:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateUser({ commit }, { userId, userData }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await userService.updateUser(userId, userData);
      commit('UPDATE_USER', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error updating user:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async deleteUser({ commit }, userId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      await userService.deleteUser(userId);
      commit('REMOVE_USER', userId);
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchUserStats({ commit }) {
    try {
      const response = await userService.getUserStats();
      commit('SET_STATS', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error fetching user stats:', error);
    }
  },
  
  clearUsers({ commit }) {
    commit('CLEAR_USERS');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
