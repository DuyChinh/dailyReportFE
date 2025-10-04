<template>
  <div class="report-card" :class="{ 'draft': report.status === 'draft', 'linked-task': report.task }">
    <div class="card-header">
      <div class="status-badge" :class="statusClass">
        <i class="fas fa-circle"></i>
        {{ formatStatus(report.status) }}
      </div>
      
      <div class="card-actions">
        <div class="dropdown">
          <button class="dropdown-toggle" @click="toggleDropdown">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div class="dropdown-menu" :class="{ 'show': showDropdown }">
            <router-link :to="`/reports/${report._id}`" class="dropdown-item">
              <i class="fas fa-eye"></i>
              View
            </router-link>
            <router-link :to="`/reports/${report._id}/edit`" class="dropdown-item">
              <i class="fas fa-edit"></i>
              Edit
            </router-link>
            <div class="dropdown-divider"></div>
            <button @click="handleDelete" class="dropdown-item danger">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <h3 class="report-title">
        <router-link :to="`/reports/${report._id}`">{{ report.title }}</router-link>
      </h3>
      
      <div class="report-content">
        {{ truncateContent(report.content) }}
      </div>
      
      <div v-if="report.task" class="linked-task-info">
        <i class="fas fa-link"></i>
        <span>Linked to task: {{ report.task.title }}</span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="report-meta">
        <div class="meta-item">
          <i class="fas fa-user"></i>
          <span>{{ authorName }}</span>
        </div>
        
        <div class="meta-item">
          <i class="fas fa-calendar"></i>
          <span>{{ formatDate(report.date) }}</span>
        </div>
        
        <div class="meta-item">
          <i class="fas fa-tag"></i>
          <span>{{ formatCategory(report.category) }}</span>
        </div>
      </div>
      
      <div v-if="report.tags && report.tags.length > 0" class="report-tags">
        <span v-for="(tag, index) in report.tags.slice(0, 3)" :key="index" class="tag">
          {{ tag }}
        </span>
        <span v-if="report.tags.length > 3" class="tag-more">
          +{{ report.tags.length - 3 }} more
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ReportCard',
  
  props: {
    report: {
      type: Object,
      required: true
    }
  },
  
  computed: {
    statusClass() {
      const statusClasses = {
        draft: 'status-draft',
        submitted: 'status-submitted',
        approved: 'status-approved',
        rejected: 'status-rejected'
      };
      
      return statusClasses[this.report.status] || 'status-draft';
    },
    
    authorName() {
      if (!this.report.author) return 'Unknown Author';
      
      if (typeof this.report.author === 'object') {
        return this.report.author.name || 'Unnamed User';
      }
      
      return this.report.authorName || `User #${this.report.author}`;
    }
  },
  
  data() {
    return {
      showDropdown: false
    };
  },
  
  methods: {
    formatDate(date) {
      return moment(date).format('MMM DD, YYYY');
    },
    
    formatCategory(category) {
      if (!category) return 'Uncategorized';
      return category.charAt(0).toUpperCase() + category.slice(1);
    },
    
    formatStatus(status) {
      const statusMap = {
        draft: 'Draft',
        submitted: 'Submitted',
        approved: 'Approved',
        rejected: 'Rejected'
      };
      return statusMap[status] || status;
    },
    
    truncateContent(content) {
      if (!content) return 'No content';
      if (content.length > 120) {
        return content.substring(0, 120) + '...';
      }
      return content;
    },
    
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    
    handleDelete() {
      if (confirm('Are you sure you want to delete this report?')) {
        this.$emit('delete');
      }
      this.showDropdown = false;
    }
  },
  
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showDropdown = false;
      }
    });
  },
  
  emits: ['delete']
};
</script>

<style scoped>
.report-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.report-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.report-card.draft {
  border-left: 4px solid #6c757d;
}

.report-card.linked-task {
  border-left: 4px solid #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px 0;
  margin-bottom: 15px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-draft {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-submitted {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.status-approved {
  background: #d1fae5;
  color: #059669;
}

.status-badge.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge i {
  font-size: 8px;
}

.card-actions {
  position: relative;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.danger {
  color: #dc3545;
}

.dropdown-item.danger:hover {
  background: #f8d7da;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 8px 0;
}

/* Card Body */
.card-body {
  padding: 0 25px 20px;
}

.report-title {
  margin-bottom: 15px;
}

.report-title a {
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.report-title a:hover {
  color: #667eea;
}

.report-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6c757d;
}

.meta-item i {
  color: #667eea;
  font-size: 12px;
  width: 14px;
}

.report-content {
  color: #6c757d;
  line-height: 1.6;
  font-size: 14px;
  margin-bottom: 15px;
}

.linked-task-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f2ff 100%);
  border-radius: 8px;
  margin-top: 15px;
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

.linked-task-info i {
  color: #667eea;
}

/* Card Footer */
.card-footer {
  padding: 20px 25px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.report-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-more {
  background: #e9ecef;
  color: #6c757d;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-header {
    padding: 15px 20px 0;
  }
  
  .card-body {
    padding: 0 20px 15px;
  }
  
  .card-footer {
    padding: 15px 20px;
  }
  
  .report-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .report-title a {
    font-size: 1.1rem;
  }
}

</style>
