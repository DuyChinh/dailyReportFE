<template>
  <div class="admin-view">
    <div class="admin-container">
      <!-- Header Section -->
      <div class="admin-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-cog"></i>
            Admin Panel
          </h1>
          <p class="page-subtitle">
            Manage tasks and users
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="showCreateTaskModal = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Create Task
          </button>
          
          <!-- Toast Test Buttons -->
          <div class="toast-test-buttons">
            <button @click="testSuccessToast" class="btn btn-success btn-sm">
              <i class="fas fa-check"></i>
              Success
            </button>
            <button @click="testErrorToast" class="btn btn-danger btn-sm">
              <i class="fas fa-times"></i>
              Error
            </button>
            <button @click="testWarningToast" class="btn btn-warning btn-sm">
              <i class="fas fa-exclamation"></i>
              Warning
            </button>
            <button @click="testInfoToast" class="btn btn-info btn-sm">
              <i class="fas fa-info"></i>
              Info
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ taskStats.total || 0 }}</h3>
            <p class="stat-label">Total Tasks</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ usersCount }}</h3>
            <p class="stat-label">Users</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ taskStats.completed || 0 }}</h3>
            <p class="stat-label">Completed</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ taskStats.pending || 0 }}</h3>
            <p class="stat-label">Pending</p>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
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
            <label for="assigned-filter">Assigned To</label>
            <select id="assigned-filter" v-model="filters.assignedTo" @change="applyFilters" class="filter-select">
              <option value="">All Users</option>
              <option v-for="user in users" :key="user._id" :value="user._id">
                {{ user.name }}
              </option>
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

      <!-- Tasks Table -->
      <div class="tasks-section">
        <div class="section-header">
          <h3>All Tasks</h3>
          <button @click="refreshTasks" class="btn btn-outline" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
        </div>
        
        <!-- Task List Component -->
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Loading tasks...</span>
        </div>
        
        <div v-else>
          <task-list 
            :tasks="filteredTasks"
            :show-admin-actions="true"
            @task-updated="handleTaskUpdated"
            @edit-task="handleEditTask"
            @task-deleted="handleTaskDeleted"
          />
        </div>
      </div>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateTaskModal" class="modal-overlay" @click="closeCreateTaskModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Task</h3>
          <button @click="closeCreateTaskModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <task-form
            @cancel="closeCreateTaskModal"
            @saved="handleTaskSaved"
          />
        </div>
      </div>
    </div>
    
    <!-- Edit Task Modal -->
    <div v-if="editingTask" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Task</h3>
          <button class="close-btn" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleTaskUpdate">
            <div class="form-group">
              <label for="edit-title">Task Title</label>
              <input 
                type="text" 
                id="edit-title"
                v-model="editForm.title"
                required
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label for="edit-description">Description</label>
              <textarea 
                id="edit-description"
                v-model="editForm.description"
                class="form-control"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="edit-priority">Priority</label>
                <select id="edit-priority" v-model="editForm.priority" class="form-control">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="edit-status">Status</label>
                <select id="edit-status" v-model="editForm.status" class="form-control">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="edit-dueDate">Due Date</label>
                <input 
                  type="date" 
                  id="edit-dueDate"
                  v-model="editForm.dueDate"
                  class="form-control"
                />
              </div>
              
              <div class="form-group">
                <label for="edit-category">Category</label>
                <input 
                  type="text" 
                  id="edit-category"
                  v-model="editForm.category"
                  class="form-control"
                  placeholder="e.g., Development, Bug Fix"
                />
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeEditModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                Update Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TaskForm from '../components/Tasks/TaskForm.vue';
import TaskList from '../components/Tasks/TaskList.vue';
import toastService from '../services/toastService';

export default {
  name: 'AdminView',
  
  components: {
    TaskForm,
    TaskList
  },
  
  data() {
    return {
      filters: {
        status: '',
        priority: '',
        assignedTo: '',
        search: ''
      },
      searchTimeout: null,
      showCreateTaskModal: false,
      creating: false,
      submitting: false,
      editingTask: null,
      editForm: {},
      // Fallback list used only if API fails to fetch users
      localUsers: [],
      newTask: {
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'development',
        dueDate: '',
        estimatedHours: null,
        tagsInput: ''
      }
    };
  },
  
  computed: {
    ...mapGetters('tasks', ['tasks', 'loading', 'stats']),
    ...mapGetters('users', { usersList: 'users' }),
    
    usersCount() {
      return (this.usersList && this.usersList.length) || this.localUsers.length || 0;
    },
    
    taskStats() {
      const counts = {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0
      };
      
      // Prefer server stats when present and non-zero
      if (this.stats && (
        this.stats.total ||
        this.stats.pending ||
        this.stats.in_progress ||
        this.stats.completed ||
        this.stats.cancelled
      )) {
        return {
          total: this.stats.total || 0,
          pending: this.stats.pending || 0,
          in_progress: this.stats.in_progress || 0,
          completed: this.stats.completed || 0,
          cancelled: this.stats.cancelled || 0
        };
      }
      
      // Fallback: compute from tasks list
      const list = Array.isArray(this.tasks) ? this.tasks : [];
      counts.total = list.length;
      
      list.forEach(t => {
        if (!t || !t.status) return;
        if (counts[t.status] !== undefined) counts[t.status]++;
      });
      
      return counts;
    },
    
    filteredTasks() {
      let filtered = [...this.tasks];
      
      if (this.filters.status) {
        filtered = filtered.filter(task => task.status === this.filters.status);
      }
      
      if (this.filters.priority) {
        filtered = filtered.filter(task => task.priority === this.filters.priority);
      }
      
      if (this.filters.assignedTo) {
        filtered = filtered.filter(task => task.assignedTo?._id === this.filters.assignedTo);
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
    await this.loadData();
  },
  
  methods: {
    ...mapActions('tasks', ['fetchTasks', 'createTask', 'updateTask', 'deleteTask', 'fetchTaskStats']),
    ...mapActions('users', ['fetchUsers']),
    
    // Toast test methods
    testSuccessToast() {
      toastService.success('Operation completed successfully!');
    },
    
    testErrorToast() {
      toastService.error('Something went wrong. Please try again.');
    },
    
    testWarningToast() {
      toastService.warning('Please check your input before proceeding.');
    },
    
    testInfoToast() {
      toastService.info('Here is some useful information for you.');
    },
    
    async loadData() {
      try {
        await Promise.all([
          this.fetchTasks(),
          this.fetchTaskStats(),
          this.loadUsers()
        ]);
        
        console.log("Task stats loaded:", this.stats);
        console.log("Computed taskStats:", this.taskStats);
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    },
    
    async loadUsers() {
      try {
        await this.fetchUsers();
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to mock data if API fails
        this.localUsers = [
          { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
          { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
        ];
      }
    },
    
    async refreshTasks() {
      await this.loadData();
    },
    
    handleTaskSaved() {
      toastService.success('Tạo task thành công!');
      this.closeCreateTaskModal();
      this.refreshTasks();
    },
    
    handleFilterChange(filters) {
      // Handle filter changes from TaskList component
      this.filters = { ...filters };
    },
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },
    
    applyFilters() {
      // Filters are applied reactively through computed property
    },
    
    async createTask() {
      this.creating = true;
      try {
        const taskData = {
          ...this.newTask,
          tags: this.newTask.tagsInput ? this.newTask.tagsInput.split(',').map(tag => tag.trim()) : []
        };
        
        // Remove tagsInput from the data
        delete taskData.tagsInput;
        
        await this.createTask(taskData);
        this.closeCreateTaskModal();
        this.resetNewTask();
        await this.refreshTasks();
      } catch (error) {
        console.error('Error creating task:', error);
      } finally {
        this.creating = false;
      }
    },
    
    async handleDeleteTask(taskId) {
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          await this.deleteTask(taskId);
          toastService.success('Xóa task thành công!');
          await this.refreshTasks();
        } catch (error) {
          console.error('Error deleting task:', error);
          toastService.error('Xóa task thất bại. Vui lòng thử lại.');
        }
      }
    },
    
    handleTaskUpdated(taskId) {
      // Reload tasks when a task is updated
      this.refreshTasks();
    },
    
    handleEditTask(task) {
      this.editingTask = task;
      this.editForm = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        category: task.category
      };
    },
    
    async handleTaskUpdate() {
      this.submitting = true;
      try {
        await this.updateTask({
          taskId: this.editingTask._id,
          updateData: this.editForm
        });
        toastService.success('Cập nhật task thành công!');
        this.closeEditModal();
        await this.refreshTasks();
      } catch (error) {
        console.error('Error updating task:', error);
        toastService.error('Cập nhật task thất bại. Vui lòng thử lại.');
      } finally {
        this.submitting = false;
      }
    },
    
    handleTaskDeleted(taskId) {
      // Reload tasks when a task is deleted
      this.refreshTasks();
    },
    
    closeEditModal() {
      this.editingTask = null;
      this.editForm = {};
    },
    
    editTask(task) {
      this.handleEditTask(task);
    },
    
    closeCreateTaskModal() {
      this.showCreateTaskModal = false;
      this.resetNewTask();
    },
    
    resetNewTask() {
      this.newTask = {
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'development',
        dueDate: '',
        estimatedHours: null,
        tagsInput: ''
      };
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
    }
  }
};
</script>

<style scoped>
.admin-view {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Header Section */
.admin-header {
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

/* Tasks Section */
.tasks-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f3f4;
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* Loading and Empty States */
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

/* Tasks Table */
.tasks-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr 1fr;
  gap: 15px;
  padding: 15px 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e9ecef;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr 1fr;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row.overdue {
  background: #fff5f5;
  border-left: 4px solid #dc3545;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.task-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: #6c757d;
}

.status-badge,
.priority-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
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

.due-date {
  font-size: 14px;
  color: #2c3e50;
}

.overdue-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #dc3545;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #f1f3f4;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.modal-body {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group.half {
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f1f3f4;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 8px 12px;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  }
  
  .col-assigned {
    display: none;
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 20px 15px;
  }
  
  .admin-header {
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
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .col-title,
  .col-assigned,
  .col-status,
  .col-priority,
  .col-due,
  .col-actions {
    display: block;
    margin-bottom: 10px;
  }
  
  .table-header .col-title::before {
    content: 'Title: ';
    font-weight: 600;
  }
  
  .table-header .col-assigned::before {
    content: 'Assigned To: ';
    font-weight: 600;
  }
  
  .table-header .col-status::before {
    content: 'Status: ';
    font-weight: 600;
  }
  
  .table-header .col-priority::before {
    content: 'Priority: ';
    font-weight: 600;
  }
  
  .table-header .col-due::before {
    content: 'Due Date: ';
    font-weight: 600;
  }
  
  .table-header .col-actions::before {
    content: 'Actions: ';
    font-weight: 600;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

/* Toast Test Buttons */
.toast-test-buttons {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  flex-wrap: wrap;
}

.toast-test-buttons .btn {
  margin: 0;
}

.btn-info {
  color: #fff;
  background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);
  border-color: #17a2b8;
  box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
}

.btn-info:hover {
  background: linear-gradient(135deg, #138496 0%, #5a32a3 100%);
  border-color: #138496;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(23, 162, 184, 0.4);
}

.btn-warning {
  color: #212529;
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
  border-color: #ffc107;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #e0a800 0%, #e55a00 100%);
  border-color: #e0a800;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
}

@media (max-width: 768px) {
  .toast-test-buttons {
    margin-left: 0;
    margin-top: 12px;
    justify-content: center;
  }
}
</style>