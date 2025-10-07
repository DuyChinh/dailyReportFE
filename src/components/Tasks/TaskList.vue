<template>
  <div class="task-list">
    <!-- Task Filters -->
    <div class="task-filters">
      <div class="filter-group">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search tasks by title or date..."
            class="search-input"
          />
        </div>
        
        <div class="filter-options">
          <button 
            class="filter-btn"
            :class="{ active: showTodayOnly }"
            @click="toggleTodayFilter"
          >
            <i class="fas fa-calendar-day"></i>
            Today Only
          </button>
          
          <select v-model="statusFilter" class="status-filter">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Task List -->
    <div class="tasks-container">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <h3>No tasks found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
      
      <div v-else class="tasks-grid">
        <div 
          v-for="task in filteredTasks" 
          :key="task._id"
          class="task-card"
          :class="task.status"
        >
          <div class="task-header">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-actions">
              <button 
                class="action-btn"
                @click="toggleTaskStatus(task)"
                :title="`Mark as ${getNextStatus(task.status)}`"
              >
                <i :class="getStatusIcon(task.status)"></i>
              </button>
              <button 
                v-if="shouldShowAdminActions"
                class="action-btn edit"
                @click="editTask(task)"
                title="Edit Task"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                v-if="shouldShowAdminActions"
                class="action-btn delete"
                @click="handleDeleteTask(task)"
                title="Delete Task"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="task-content">
            <p class="task-description" v-if="task.description">
              {{ task.description }}
            </p>
            
            <div class="task-meta">
              <div class="meta-item">
                <i class="fas fa-flag"></i>
                <span class="priority" :class="task.priority?.toLowerCase()">
                  {{ task.priority || 'Medium' }}
                </span>
              </div>
              
              <div class="meta-item" v-if="task.dueDate">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(task.dueDate) }}</span>
              </div>
              
              <div class="meta-item" v-if="task.category">
                <i class="fas fa-tag"></i>
                <span>{{ task.category }}</span>
              </div>
              
              <!-- Add assigned user information -->
              <div class="meta-item" v-if="task.assignedTo">
                <i class="fas fa-user"></i>
                <span>{{ getAssignedUserName(task.assignedTo) }}</span>
              </div>
            </div>
          </div>
          
          <div class="task-footer">
            <div class="task-status">
              <span class="status-badge" :class="task.status">
                {{ formatStatus(task.status) }}
              </span>
            </div>
            
            <div class="task-dates">
              <small class="created-date">
                Created: {{ formatDate(task.createdAt) }}
              </small>
              <small class="updated-date" v-if="task.updatedAt !== task.createdAt">
                Updated: {{ formatDate(task.updatedAt) }}
              </small>
            </div>
          </div>
          
          <div class="task-actions">
            <router-link class="btn btn-sm" :to="{ name: 'task-detail', params: { id: task._id } }">
              <i class="fas fa-eye"></i>
              View
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import moment from 'moment';
import toastService from '../../services/toastService';

export default {
  name: 'TaskList',
  
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    showAdminActions: {
      type: Boolean,
      default: false
    },
    userFilter: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      searchQuery: '',
      showTodayOnly: false,
      statusFilter: ''
    };
  },
  
  computed: {
    ...mapGetters('auth', ['isAdmin', 'currentUser']),
    ...mapGetters('users', ['users']),
    
    shouldShowAdminActions() {
      // Force show admin actions if showAdminActions prop is true
      // or if user is admin
      return this.showAdminActions || this.isAdmin;
    },
    
    filteredTasks() {
      let filtered = [...this.tasks];
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(task => {
          const titleMatch = task.title.toLowerCase().includes(query);
          const dateMatch = this.formatDate(task.dueDate || task.createdAt).toLowerCase().includes(query);
          return titleMatch || dateMatch;
        });
      }
      
      // Today filter
      if (this.showTodayOnly) {
        const today = moment().format('YYYY-MM-DD');
        filtered = filtered.filter(task => {
          const taskDate = moment(task.dueDate || task.createdAt).format('YYYY-MM-DD');
          return taskDate === today;
        });
      }
      
      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(task => task.status === this.statusFilter);
      }
      
      // User filter (from parent component - Admin)
      if (this.userFilter) {
        filtered = filtered.filter(task => {
          // Handle different ways assignedTo might be stored
          const taskUserId = task.assignedTo?._id || task.assignedTo;
          return taskUserId === this.userFilter;
        });
      }
      
      // Sort by updatedAt (most recent first)
      return filtered.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
    }
  },
  
  mounted() {
    console.log('TaskList mounted - Current user:', this.currentUser);
    console.log('TaskList mounted - Is admin:', this.isAdmin);
    console.log('TaskList mounted - Show admin actions prop:', this.showAdminActions);
    console.log('TaskList mounted - Should show admin actions:', this.shouldShowAdminActions);
  },

  methods: {
    ...mapActions('tasks', ['updateTask', 'deleteTask']),
    
    // Helper method to get user name from ID or user object
    getAssignedUserName(assignedTo) {
      // If assignedTo is already a user object with name
      if (assignedTo && typeof assignedTo === 'object' && assignedTo.name) {
        return assignedTo.name;
      }
      
      // If assignedTo is just an ID, find the user in our users list
      if (assignedTo && typeof assignedTo === 'string') {
        const userId = assignedTo;
        const user = this.users?.find(u => u._id === userId);
        if (user) return user.name;
      }
      
      return 'Unassigned';
    },
    
    toggleTodayFilter() {
      this.showTodayOnly = !this.showTodayOnly;
    },
    
    formatDate(date) {
      if (!date) return '';
      return moment(date).format('MMM DD, YYYY');
    },
    
    formatStatus(status) {
      const statusMap = {
        pending: 'Chờ xử lý',
        in_progress: 'Đang thực hiện',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
      };
      return statusMap[status] || status;
    },
    
    getStatusIcon(status) {
      const iconMap = {
        pending: 'fas fa-clock',
        in_progress: 'fas fa-play',
        completed: 'fas fa-check',
        cancelled: 'fas fa-times'
      };
      return iconMap[status] || 'fas fa-question';
    },
    
    getNextStatus(currentStatus) {
      const statusFlow = {
        pending: 'in_progress',
        in_progress: 'completed',
        completed: 'pending',
        cancelled: 'pending'
      };
      return statusFlow[currentStatus] || 'pending';
    },
    
    async toggleTaskStatus(task) {
      const nextStatus = this.getNextStatus(task.status);
      try {
        await this.updateTask({
          taskId: task._id,
          updateData: { status: nextStatus }
        });
        toastService.success(`Cập nhật trạng thái task thành công! (${this.formatStatus(nextStatus)})`);
        this.$emit('task-updated', task._id);
      } catch (error) {
        console.error('Error updating task status:', error);
        toastService.error('Cập nhật trạng thái task thất bại. Vui lòng thử lại.');
      }
    },
    
    editTask(task) {
      this.$emit('edit-task', task);
    },
    
    async handleDeleteTask(task) {
      if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        try {
          await this.deleteTask(task._id);
          this.$emit('task-deleted', task._id);
          toastService.success('Xóa task thành công!');
        } catch (error) {
          console.error('Error deleting task:', error);
          toastService.error('Xóa task thất bại. Vui lòng thử lại.');
        }
      }
    }
  }
};
</script>

<style scoped>
.task-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.task-filters {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.filter-group {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.filter-options {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.status-filter {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.tasks-container {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #495057;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.task-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.task-card.pending {
  border-left: 4px solid #ffc107;
}

.task-card.in_progress {
  border-left: 4px solid #17a2b8;
}

.task-card.completed {
  border-left: 4px solid #28a745;
}

.task-card.cancelled {
  border-left: 4px solid #dc3545;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
  flex: 1;
  margin-right: 10px;
}

.task-actions {
  margin-top: 10px;
  float: right;
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 12px;
}

.action-btn:not(.edit):not(.delete) {
  background: #f8f9fa;
  color: #6c757d;
}

.action-btn:not(.edit):not(.delete):hover {
  background: #e9ecef;
  color: #495057;
}

.action-btn.edit {
  background: #17a2b8;
  color: white;
}

.action-btn.edit:hover {
  background: #138496;
}

.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn.delete:hover {
  background: #c82333;
}

.task-content {
  margin-bottom: 16px;
}

.task-description {
  margin: 0 0 12px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.meta-item i {
  width: 12px;
}

.priority {
  font-weight: 600;
  text-transform: capitalize;
}

.priority.high {
  color: #dc3545;
}

.priority.medium {
  color: #ffc107;
}

.priority.low {
  color: #28a745;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.in_progress {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.task-dates {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.task-dates small {
  font-size: 10px;
  color: #6c757d;
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-options {
    justify-content: space-between;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  
  .task-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .task-actions {
    justify-content: flex-end;
  }
}

/* Add styles for assigned user */
.meta-item i.fa-user {
  color: #6f42c1;
}
</style>