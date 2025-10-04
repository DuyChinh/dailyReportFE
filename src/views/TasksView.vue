<template>
  <div class="tasks-view">
    <div class="tasks-container">
      <!-- Header Section -->
      <div class="tasks-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-tasks"></i>
            My Tasks
          </h1>
          <p class="page-subtitle">
            Manage and track your assigned tasks
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="refreshTasks" class="btn btn-outline" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-list"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.total || 0 }}</h3>
            <p class="stat-label">Total Tasks</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.pending || 0 }}</h3>
            <p class="stat-label">Pending</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-play"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.in_progress || 0 }}</h3>
            <p class="stat-label">In Progress</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.completed || 0 }}</h3>
            <p class="stat-label">Completed</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label for="status-filter">Status</label>
            <select id="status-filter" v-model="filters.status" @change="applyFilters" class="filter-select">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="priority-filter">Priority</label>
            <select id="priority-filter" v-model="filters.priority" @change="applyFilters" class="filter-select">
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="search-input">Search</label>
            <input
              id="search-input"
              type="text"
              v-model="filters.search"
              @input="debouncedSearch"
              placeholder="Search tasks..."
              class="filter-input"
            />
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="tasks-content">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
        
        <div v-else>
          <task-list 
            :tasks="filteredTasks"
            :show-admin-actions="false"
            @task-updated="handleTaskUpdated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TaskList from '../components/Tasks/TaskList.vue';

export default {
  name: 'TasksView',
  
  components: {
    TaskList
  },
  
  data() {
    return {
      filters: {
        status: '',
        priority: '',
        search: ''
      },
      searchTimeout: null
    };
  },
  
  computed: {
    ...mapGetters('tasks', ['myTasks', 'loading', 'stats']),
    
    filteredTasks() {
      let filtered = [...this.myTasks];
      
      if (this.filters.status) {
        filtered = filtered.filter(task => task.status === this.filters.status);
      }
      
      if (this.filters.priority) {
        filtered = filtered.filter(task => task.priority === this.filters.priority);
      }
      
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm) ||
          (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
      }
      
      return filtered;
    }
  },
  
  async created() {
    await this.loadTasks();
  },
  
  methods: {
    ...mapActions('tasks', ['fetchMyTasks', 'updateTask', 'fetchTaskStats']),
    
    async loadTasks() {
      try {
        await Promise.all([
          this.fetchMyTasks(),
          this.fetchTaskStats()
        ]);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    },
    
    async refreshTasks() {
      await this.loadTasks();
    },
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    
    applyFilters() {
      // Filters are applied reactively through computed property
      // This method can be used for additional filter logic if needed
    },
    
    async updateTaskStatus(taskId, newStatus) {
      try {
        await this.updateTask({ taskId, updateData: { status: newStatus } });
        // Refresh stats after status update
        await this.fetchTaskStats();
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    },
    
    formatStatus(status) {
      const statusMap = {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
      };
      return statusMap[status] || status;
    },
    
    formatCategory(category) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    },
    
    formatDate(dateString) {
      if (!dateString) return 'No due date';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    
    isOverdue(dueDate, status) {
      if (!dueDate || status === 'completed') return false;
      return new Date(dueDate) < new Date();
    },
    
    handleTaskUpdated(taskId) {
      // Reload tasks when a task is updated
      this.loadTasks();
    }
  }
};
</script>

<style scoped>
.tasks-view {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

.tasks-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header Section */
.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.page-title i {
  color: #667eea;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  font-weight: 500;
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.filter-select,
.filter-input {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.filter-select:focus,
.filter-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Tasks Content */
.tasks-content {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

/* Tasks Grid */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.task-card {
  background: white;
  border: 2px solid #f1f3f4;
  border-radius: 16px;
  padding: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.task-card.overdue {
  border-color: #dc3545;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.task-card.overdue::before {
  content: 'OVERDUE';
  position: absolute;
  top: 15px;
  right: -30px;
  background: #dc3545;
  color: white;
  padding: 5px 40px;
  font-size: 12px;
  font-weight: bold;
  transform: rotate(45deg);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.task-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.task-badges {
  display: flex;
  gap: 8px;
  margin-left: 15px;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.low {
  background: #d1fae5;
  color: #059669;
}

.priority-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-badge.high {
  background: #fee2e2;
  color: #dc2626;
}

.priority-badge.urgent {
  background: #fecaca;
  color: #b91c1c;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.completed {
  background: #d1fae5;
  color: #059669;
}

.status-badge.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.task-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 20px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
}

.meta-item i {
  width: 16px;
  color: #667eea;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.tag {
  background: #f0f4ff;
  color: #667eea;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.task-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .tasks-container {
    padding: 20px 15px;
  }
  
  .tasks-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .task-badges {
    margin-left: 0;
  }
  
  .task-actions {
    justify-content: center;
  }
}
</style>
