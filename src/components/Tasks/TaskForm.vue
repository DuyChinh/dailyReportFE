<template>
  <div class="task-form">
    <h3>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h3>
    
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          v-model="form.title"
          class="form-control"
          required
          maxlength="100"
          placeholder="Enter task title"
        />
        <small>{{ form.title?.length || 0 }}/100 characters</small>
      </div>
      
      <div class="form-group">
        <label for="task-description">Description</label>
        <textarea
          id="task-description"
          v-model="form.description"
          class="form-control"
          rows="4"
          required
          maxlength="500"
          placeholder="Describe the task in detail"
        ></textarea>
        <small>{{ form.description?.length || 0 }}/500 characters</small>
      </div>
      
      <div class="form-row">
        <div class="form-group half">
          <label for="task-assigned">Assign To</label>
          <select id="task-assigned" v-model="form.assignedTo" class="form-control" required>
            <option value="">Select User</option>
            <option v-for="user in availableUsers" :key="user._id" :value="user._id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
        </div>
        
        <div class="form-group half">
          <label for="task-priority">Priority</label>
          <select id="task-priority" v-model="form.priority" class="form-control" required>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group half">
          <label for="task-category">Category</label>
          <select id="task-category" v-model="form.category" class="form-control" required>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="testing">Testing</option>
            <option value="documentation">Documentation</option>
            <option value="meeting">Meeting</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="form-group half">
          <label for="task-status">Status</label>
          <select id="task-status" v-model="form.status" class="form-control" required>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group half">
          <label for="task-due">Due Date</label>
          <input
            id="task-due"
            type="datetime-local"
            v-model="form.dueDate"
            class="form-control"
            required
          />
        </div>
        
        <div class="form-group half">
          <label for="task-start">Start Date (Optional)</label>
          <input
            id="task-start"
            type="datetime-local"
            v-model="form.startDate"
            class="form-control"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="task-hours">Estimated Hours</label>
        <input
          id="task-hours"
          type="number"
          v-model="form.estimatedHours"
          class="form-control"
          min="1"
          max="100"
          placeholder="Enter estimated hours"
        />
      </div>
      
      <div class="form-group">
        <label for="task-tags">Tags (comma-separated)</label>
        <input
          id="task-tags"
          type="text"
          v-model="form.tagsInput"
          class="form-control"
          placeholder="frontend, auth, urgent"
        />
        <small class="form-help">
          <i class="fas fa-info-circle"></i>
          Separate multiple tags with commas
        </small>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import toastService from '../../services/toastService';

export default {
  name: 'TaskForm',
  
  props: {
    task: {
      type: Object,
      default: null
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['cancel', 'saved'],
  
  data() {
    return {
      form: {
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'development',
        status: 'pending',
        dueDate: '',
        startDate: '',
        estimatedHours: null,
        tagsInput: ''
      }
    };
  },
  
  computed: {
    ...mapGetters('tasks', ['loading', 'error']),
    ...mapGetters('users', ['availableUsers'])
  },
  
  watch: {
    task: {
      handler(newTask) {
        if (newTask) {
          this.form = {
            title: newTask.title || '',
            description: newTask.description || '',
            assignedTo: newTask.assignedTo?._id || newTask.assignedTo || '',
            priority: newTask.priority || 'medium',
            category: newTask.category || 'development',
            status: newTask.status || 'pending',
            dueDate: newTask.dueDate ? this.formatDateTimeLocal(newTask.dueDate) : '',
            startDate: newTask.startDate ? this.formatDateTimeLocal(newTask.startDate) : '',
            estimatedHours: newTask.estimatedHours || null,
            tagsInput: newTask.tags ? newTask.tags.join(', ') : ''
          };
        }
      },
      immediate: true
    }
  },
  
  methods: {
    ...mapActions('tasks', ['createTask', 'updateTask']),
    
    async handleSubmit() {
      try {
        const taskData = {
          ...this.form,
          tags: this.form.tagsInput ? this.form.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };
        
        // Remove tagsInput from the data
        delete taskData.tagsInput;
        
        if (this.isEditing) {
          await this.updateTask({ taskId: this.task._id, updateData: taskData });
          toastService.success('Cập nhật task thành công!');
        } else {
          await this.createTask(taskData);
          toastService.success('Tạo task thành công!');
        }
        
        this.$emit('saved');
        this.resetForm();
      } catch (error) {
        toastService.error('Lưu task thất bại. Vui lòng thử lại.');
        console.error('Error saving task:', error);
      }
    },
    
    resetForm() {
      this.form = {
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'development',
        status: 'pending',
        dueDate: '',
        startDate: '',
        estimatedHours: null,
        tagsInput: ''
      };
    },
    
    formatDateTimeLocal(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  }
};
</script>

<style scoped>
.task-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.task-form h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group.half {
  margin-bottom: 0;
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

.form-group small {
  display: block;
  color: #6c757d;
  margin-top: 5px;
  font-size: 0.875rem;
}

.form-help {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
}

.form-help i {
  color: #667eea;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .task-form {
    padding: 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
