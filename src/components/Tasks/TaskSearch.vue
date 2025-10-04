<template>
  <div class="task-search" ref="searchContainer">
    <div class="search-input-container">
      <i class="fas fa-search search-icon"></i>
      <input 
        type="text" 
        v-model="searchQuery" 
        :placeholder="placeholder" 
        class="search-input"
        :class="{'has-selection': selectedTask}"
        @focus="isOpen = true"
      />
      <button 
        v-if="searchQuery || selectedTask" 
        class="clear-btn" 
        @click="clearSearch">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div v-if="selectedTask" class="selected-task">
      <div class="selected-task-content">
        <div class="task-title">{{ selectedTask.title }}</div>
        <div class="task-meta">
          <div class="task-status" :class="selectedTask.status">
            {{ formatStatus(selectedTask.status) }}
          </div>
          <div v-if="selectedTask.dueDate" class="task-due-date">
            <i class="fas fa-calendar"></i> Due: {{ formatDate(selectedTask.dueDate) }}
          </div>
        </div>
      </div>
      <button class="remove-btn" @click="removeTask">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div v-if="isOpen" class="search-results" :class="{'is-loading': isLoading}">
      <div v-if="isLoading" class="loading-item">
        <div class="loading-spinner"></div>
        <span>Searching tasks...</span>
      </div>
      
      <template v-else>
        <div 
          v-for="task in filteredTasks" 
          :key="task._id" 
          class="task-option"
          :class="{'selected': selectedTask && selectedTask._id === task._id}"
          @click="selectTask(task)">
          <div class="task-header">
            <div class="task-title">{{ task.title }}</div>
            <div v-if="task.priority" class="task-priority" :class="task.priority.toLowerCase()">
              {{ task.priority }}
            </div>
          </div>
          
          <div v-if="task.description" class="task-description">
            {{ task.description }}
          </div>
          
          <div class="task-meta">
            <div class="task-status" :class="task.status">
              {{ formatStatus(task.status) }}
            </div>
            <div v-if="task.dueDate" class="task-due-date">
              <i class="fas fa-calendar"></i> {{ formatDate(task.dueDate) }}
            </div>
            <div v-if="task.category" class="task-category">
              {{ task.category }}
            </div>
          </div>
        </div>
        
        <div v-if="filteredTasks.length === 0 && searchQuery" class="no-results">
          <i class="fas fa-search"></i>
          <p>No tasks found matching "{{ searchQuery }}"</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskSearch',
  
  props: {
    selectedTask: {
      type: Object,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Search tasks...'
    },
    userTasks: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      searchQuery: '',
      isOpen: false,
      isLoading: false,
      searchTimeout: null
    };
  },
  
  computed: {
    filteredTasks() {
      let tasks = this.userTasks;
      
      // Sort by updatedAt (most recent first)
      tasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
      
      if (!this.searchQuery) return tasks;
      
      const query = this.searchQuery.toLowerCase();
      return tasks.filter(task => {
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.category && task.category.toLowerCase().includes(query))
        );
      });
    }
  },
  
  watch: {
    searchQuery(newValue) {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      if (newValue) {
        this.isLoading = true;
        
        // Simulate search delay for better UX
        this.searchTimeout = setTimeout(() => {
          this.isLoading = false;
        }, 200);
      } else {
        this.isLoading = false;
      }
    }
  },
  
  methods: {
    selectTask(task) {
      this.$emit('task-selected', task);
      this.isOpen = false;
      this.searchQuery = '';
    },
    
    removeTask() {
      this.$emit('task-selected', null);
      this.searchQuery = '';
    },
    
    clearSearch() {
      this.searchQuery = '';
      if (this.selectedTask) {
        this.$emit('task-selected', null);
      }
    },
    
    formatStatus(status) {
      return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    }
  },
  
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$refs.searchContainer?.contains(e.target)) {
        this.isOpen = false;
      }
    });
  },
  
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
};
</script>

<style scoped>
.task-search {
  position: relative;
  width: 100%;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 15px;
  color: #6c757d;
  font-size: 16px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input.has-selection {
  background: #f8f9fa;
  border-color: #667eea;
}

.clear-btn {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 5px;
}

.search-results.is-loading {
  padding: 20px;
}

.loading-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.task-option {
  padding: 15px 20px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-option:last-child {
  border-bottom: none;
}

.task-option:hover {
  background: #f8f9fa;
}

.task-option.selected {
  background: #e3f2fd;
  border-left: 4px solid #667eea;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.task-priority {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: 10px;
}

.task-priority.high {
  background: #fee2e2;
  color: #dc2626;
}

.task-priority.medium {
  background: #fef3c7;
  color: #d97706;
}

.task-priority.low {
  background: #d1fae5;
  color: #059669;
}

.task-priority.urgent {
  background: #fecaca;
  color: #b91c1c;
}

.task-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.task-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.task-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.task-status.in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.task-status.completed {
  background: #d1fae5;
  color: #059669;
}

.task-status.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.task-due-date {
  font-size: 12px;
  color: #6b7280;
}

.task-category {
  font-size: 12px;
  color: #667eea;
  background: #f0f4ff;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: capitalize;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  color: #6c757d;
}

.no-results i {
  font-size: 32px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.selected-task {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border: 2px solid #667eea;
  border-radius: 12px;
  margin-top: 10px;
}

.selected-task-content {
  flex: 1;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-priority {
    margin-left: 0;
  }
}
/* Responsive Design */
@media (max-width: 768px) {
  .search-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-priority {
    margin-left: 0;
  }
}
</style>
