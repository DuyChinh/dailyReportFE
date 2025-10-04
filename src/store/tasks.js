import taskService from '../services/taskService';

const state = {
  tasks: [],
  myTasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
    assignedBy: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    pages: 1,
    total: 0
  },
  stats: {
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  }
};

const getters = {
  tasks: state => state.tasks,
  myTasks: state => state.myTasks,
  currentTask: state => state.currentTask,
  loading: state => state.loading,
  error: state => state.error,
  filters: state => state.filters,
  pagination: state => state.pagination,
  stats: state => state.stats,
  
  // Filtered tasks based on current filters
  filteredTasks: state => {
    let filtered = [...state.tasks];
    
    if (state.filters.status) {
      filtered = filtered.filter(task => task.status === state.filters.status);
    }
    
    if (state.filters.priority) {
      filtered = filtered.filter(task => task.priority === state.filters.priority);
    }
    
    if (state.filters.category) {
      filtered = filtered.filter(task => task.category === state.filters.category);
    }
    
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    return filtered;
  },
  
  // Tasks by status
  pendingTasks: state => state.tasks.filter(task => task.status === 'pending'),
  inProgressTasks: state => state.tasks.filter(task => task.status === 'in_progress'),
  completedTasks: state => state.tasks.filter(task => task.status === 'completed'),
  cancelledTasks: state => state.tasks.filter(task => task.status === 'cancelled'),
  
  // Tasks by priority
  highPriorityTasks: state => state.tasks.filter(task => task.priority === 'high'),
  urgentTasks: state => state.tasks.filter(task => task.priority === 'urgent'),
  
  // Overdue tasks
  overdueTasks: state => state.tasks.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  })
};

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  SET_TASKS(state, tasks) {
    state.tasks = tasks;
  },
  
  SET_MY_TASKS(state, tasks) {
    state.myTasks = tasks;
  },
  
  SET_CURRENT_TASK(state, task) {
    state.currentTask = task;
  },
  
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters };
  },
  
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination;
  },
  
  SET_STATS(state, stats) {
    state.stats = stats;
  },
  
  ADD_TASK(state, task) {
    state.tasks.unshift(task);
  },
  
  UPDATE_TASK(state, updatedTask) {
    const index = state.tasks.findIndex(task => task._id === updatedTask._id);
    if (index !== -1) {
      state.tasks.splice(index, 1, updatedTask);
    }
    
    // Also update in myTasks if it exists there
    const myTaskIndex = state.myTasks.findIndex(task => task._id === updatedTask._id);
    if (myTaskIndex !== -1) {
      state.myTasks.splice(myTaskIndex, 1, updatedTask);
    }
  },
  
  REMOVE_TASK(state, taskId) {
    state.tasks = state.tasks.filter(task => task._id !== taskId);
    state.myTasks = state.myTasks.filter(task => task._id !== taskId);
  },
  
  CLEAR_TASKS(state) {
    state.tasks = [];
    state.myTasks = [];
    state.currentTask = null;
  }
};

const actions = {
  async fetchTasks({ commit, state }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await taskService.getTasks(state.filters);
      commit('SET_TASKS', response.data);
      commit('SET_PAGINATION', response.pagination);
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error fetching tasks:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchMyTasks({ commit }, params = {}) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await taskService.getMyTasks(params);
      commit('SET_MY_TASKS', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error fetching my tasks:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async searchTasks({ commit }, { query, params = {} }) {
    try {
      const response = await taskService.searchTasks(query, params);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error searching tasks:', error);
      throw error;
    }
  },
  
  async fetchTaskById({ commit }, taskId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await taskService.getTaskById(taskId);
      commit('SET_CURRENT_TASK', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error fetching task:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async createTask({ commit }, taskData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await taskService.createTask(taskData);
      commit('ADD_TASK', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error creating task:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateTask({ commit }, { taskId, updateData }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await taskService.updateTask(taskId, updateData);
      commit('UPDATE_TASK', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error updating task:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async updateTaskStatus({ commit }, { taskId, status }) {
    try {
      const response = await taskService.updateTaskStatus(taskId, status);
      commit('UPDATE_TASK', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error updating task status:', error);
      throw error;
    }
  },
  
  async deleteTask({ commit }, taskId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      await taskService.deleteTask(taskId);
      commit('REMOVE_TASK', taskId);
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error deleting task:', error);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async fetchTaskStats({ commit }) {
    try {
      const response = await taskService.getTaskStats();
      commit('SET_STATS', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
      console.error('Error fetching task stats:', error);
    }
  },
  
  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters);
  },
  
  clearTasks({ commit }) {
    commit('CLEAR_TASKS');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
