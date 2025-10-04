<template>
  <div class="report-form">
    <h3>{{ isEditing ? 'Edit Report' : 'Create New Report' }}</h3>
    
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <form @submit.prevent="handleSubmit">
      <!-- Task Selection -->
      <div class="form-group">
        <label for="task-search">Link to Task (Optional)</label>
        <task-search
          :selected-task="form.task"
          :user-tasks="userTasks"
          @task-selected="handleTaskSelection"
          placeholder="Search for a task to link to this report..."
        />
        <small class="form-help">
          <i class="fas fa-info-circle"></i>
          Select a task to automatically link this report to it. The report title will be auto-filled from the task.
        </small>
      </div>
      
      <div class="form-group">
        <label for="title">Title</label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          class="form-control"
          :class="{ 'auto-filled': form.task }"
          required
          maxlength="100"
          :placeholder="form.task ? 'Title will be auto-filled from task' : 'Enter report title'"
        />
        <small>{{ form.title?.length || 0 }}/100 characters</small>
      </div>
      
      <div class="form-group">
        <label for="content">Content</label>
        <textarea
            style="min-height: 100px;"
          id="content"
          v-model="form.content"
          class="form-control"
          rows="8"
          required
          maxlength="2000"
        ></textarea>
        <small>{{ form.content?.length || 0 }}/2000 characters</small>
      </div>
      
      <div class="form-row">
        <div class="form-group half">
          <label for="date">Date</label>
          <input
            type="date"
            id="date"
            v-model="form.date"
            class="form-control"
            required
          />
        </div>
        
        <div class="form-group half">
          <label for="category">Category</label>
          <select id="category" v-model="form.category" class="form-control" required>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="project">Project</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" v-model="form.status" class="form-control" required>
          <option value="draft">Draft</option>
          <option value="submitted">Submit</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Tags</label>
        <div class="tags-input">
          <div v-for="(tag, index) in form.tags" :key="index" class="tag">
            {{ tag }}
            <button type="button" class="remove-tag" @click="removeTag(index)">×</button>
          </div>
          <input
            type="text"
            v-model="newTag"
            @keydown.enter.prevent="addTag"
            placeholder="Add tag and press Enter"
            maxlength="20"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="form.isPublic">
          Make this report public
        </label>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$router.go(-1)">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Saving...' : (isEditing ? 'Update Report' : 'Create Report') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TaskSearch from '../Tasks/TaskSearch.vue';
import toastService from '../../services/toastService';

export default {
  name: 'ReportForm',
  
  components: {
    TaskSearch
  },
  
  props: {
    reportId: {
      type: String,
      default: null
    },
    initialData: {
      type: Object,
      default: () => ({})
    },
    initialTaskId: {
      type: String,
      default: null
    },
    userTasks: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      form: {
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        category: 'daily',
        status: 'submitted',
        tags: [],
        isPublic: true,
        task: null
      },
      newTag: ''
    };
  },
  
  computed: {
    ...mapGetters('reports', ['loading', 'error']),
    
    isEditing() {
      return !!this.reportId;
    }
  },
  
  watch: {
    initialData: {
      handler(newData) {
        console.log('Watch: initialData changed:', newData);
        if (newData && typeof newData === 'object') {
          this.initializeForm();
        }
      },
      immediate: true,
      deep: true
    },
    
    userTasks: {
      handler() {
        if (this.userTasks.length > 0 && this.initialTaskId) {
          console.log('UserTasks loaded, checking for initial task');
          this.initializeForm();
        }
      }
    }
  },
  
  created() {
    console.log('ReportForm created with reportId:', this.reportId);
    console.log('initialData available:', this.initialData);
    
    if (this.initialData && Object.keys(this.initialData).length > 0) {
      this.initializeForm();
    } else if (this.reportId) {
      console.log('No initialData, fetching report with ID:', this.reportId);
      this.fetchReport();
    }
  },
  
  methods: {
    ...mapActions('reports', ['createReport', 'updateReport', 'fetchReportById']),
    
    initializeForm() {
      console.log('Initializing form with data:', this.initialData);
      
      // Create a safe copy with default values for all fields
      this.form = {
        title: this.initialData.title || '',
        content: this.initialData.content || '',
        date: this.extractDate(this.initialData.date),
        category: this.initialData.category || 'daily',
        status: this.initialData.status || 'submitted',
        tags: Array.isArray(this.initialData.tags) ? [...this.initialData.tags] : [],
        isPublic: this.initialData.isPublic !== undefined ? Boolean(this.initialData.isPublic) : true,
        task: this.initialData.task || null
      };
      
      // Handle initial task ID from URL
      if (this.initialTaskId && this.userTasks.length > 0) {
        const task = this.userTasks.find(t => t._id === this.initialTaskId);
        if (task) {
          this.form.task = task;
          if (!this.form.title) {
            this.form.title = task.title;
          }
        }
      }
      
      console.log('Form initialized with:', this.form);
    },
    
    extractDate(dateValue) {
      if (!dateValue) return new Date().toISOString().split('T')[0];
      
      try {
        // Handle different date formats
        if (typeof dateValue === 'string') {
          // Try to extract date part if it's an ISO string
          if (dateValue.includes('T')) {
            return dateValue.split('T')[0];
          }
          return dateValue;
        }
        
        // If it's a Date object or timestamp
        return new Date(dateValue).toISOString().split('T')[0];
      } catch (error) {
        console.error('Error parsing date:', error);
        return new Date().toISOString().split('T')[0];
      }
    },
    
    handleTaskSelection(task) {
      this.form.task = task;
      
      // Auto-fill title from task if no title is set
      if (task && !this.form.title) {
        this.form.title = task.title;
      }
      
      // Add task-related tags if not already present
      if (task && task.tags) {
        const newTags = task.tags.filter(tag => !this.form.tags.includes(tag));
        this.form.tags = [...this.form.tags, ...newTags];
      }
    },
    
    async fetchReport() {
      try {
        console.log('Fetching report in form component');
        const report = await this.fetchReportById(this.reportId);
        console.log('Report fetched in form:', report);
        
        if (report) {
          this.form = {
            title: report.title || '',
            content: report.content || '',
            date: this.extractDate(report.date),
            category: report.category || 'daily',
            status: report.status || 'draft',
            tags: Array.isArray(report.tags) ? [...report.tags] : [],
            isPublic: Boolean(report.isPublic)
          };
          console.log('Form initialized from fetched report:', this.form);
        }
      } catch (error) {
        console.error('Error fetching report in form:', error);
      }
    },
    
    addTag() {
      if (this.newTag.trim() && !this.form.tags.includes(this.newTag.trim())) {
        if (this.form.tags.length < 5) { // Limit to 5 tags
          this.form.tags.push(this.newTag.trim());
          this.newTag = '';
          toastService.success('Thêm tag thành công!');
        } else {
          toastService.warning('Tối đa 5 tags được phép.');
        }
      }
    },
    
    removeTag(index) {
      this.form.tags.splice(index, 1);
      toastService.info('Đã xóa tag.');
    },
    
    async handleSubmit() {
      try {
        // Prepare form data with task ID
        const formData = {
          ...this.form,
          task: this.form.task?._id || null
        };
        
        if (this.isEditing) {
          await this.updateReport({
            reportId: this.reportId,
            reportData: formData
          });
          toastService.success('Cập nhật báo cáo thành công!');
        } else {
          await this.createReport(formData);
          toastService.success('Tạo báo cáo thành công!');
        }
        
        // Only emit the saved event, don't navigate
        // Let the parent component handle navigation
        this.$emit('saved');
      } catch (error) {
        // Show error toast
        toastService.error('Lưu báo cáo thất bại. Vui lòng thử lại.');
        console.error('Error saving report:', error);
      }
    }
  }
};
</script>

<style scoped>
.report-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.report-form h3 {
  font-size: 1.5rem;
  color: #212529;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #212529;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  color: #212529;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  outline: 0;
}

.form-control::placeholder {
  color: #6c757d;
}

.form-control.auto-filled {
  background-color: #f8f9fa;
  border-color: #667eea;
  color: #495057;
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

.tags-input {
  display: flex;
  flex-wrap: wrap;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 5px;
  gap: 5px;
  background-color: #fff;
}

.tag {
  background-color: #e9ecef;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  color: #495057;
}

.remove-tag {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 5px;
  font-weight: bold;
  color: #6c757d;
}

.remove-tag:hover {
  color: #dc3545;
}

.tags-input input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  padding: 5px;
  color: #212529;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c6cb;
  padding: 12px 15px;
  margin-bottom: 15px;
  border-radius: 4px;
}
</style>
