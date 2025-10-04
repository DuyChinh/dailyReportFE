<template>
  <div class="report-detail-view">
    <div class="container">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">Loading report...</div>
      </div>
      
      <div v-else-if="error" class="error-container">
        <div class="alert alert-danger">
          {{ error }}
          <button @click="fetchReport" class="btn btn-sm btn-primary">Try Again</button>
        </div>
      </div>
      
      <template v-else-if="currentReport">
        <div class="header">
          <div class="header-navigation">
            <router-link to="/reports" class="btn btn-secondary">
              <i class="fas fa-arrow-left"></i> Back to Reports
            </router-link>
            
            <div class="header-actions">
              <router-link :to="`/reports/${reportId}/edit`" class="btn btn-primary">
                <i class="fas fa-edit"></i> Edit
              </router-link>
              <button @click="confirmDelete" class="btn btn-danger">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
          
          <h1 class="report-title">{{ currentReport.title || 'Untitled Report' }}</h1>
          
          <div class="author-info">
            <div class="author-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="author-details">
              <div class="author-name">{{ getAuthorName() }}</div>
              <div class="report-date">{{ formatDate(currentReport.date) }}</div>
            </div>
          </div>
          
          <div class="report-meta">
            <div v-if="currentReport.category" class="meta-item">
              <i class="fas fa-tag"></i> {{ formatCategory(currentReport.category) }}
            </div>
            <div class="meta-item status" :class="'status-' + (currentReport.status || 'draft')">
              <i class="fas fa-info-circle"></i> {{ formatStatus(currentReport.status) }}
            </div>
            <div v-if="currentReport.isPublic" class="meta-item public">
              <i class="fas fa-globe"></i> Public
            </div>
            <div v-else class="meta-item private">
              <i class="fas fa-lock"></i> Private
            </div>
          </div>
        </div>
        
        <div class="report-content-container">
          <div class="report-content">
            <h2>Report Content</h2>
            <div class="content-text">
              {{ currentReport.content || 'No content available' }}
            </div>
            
            <div v-if="currentReport.tags && currentReport.tags.length" class="report-tags">
              <h3>Tags</h3>
              <div class="tags-list">
                <span v-for="(tag, index) in currentReport.tags" :key="index" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div v-if="currentReport.attachments && currentReport.attachments.length" class="report-attachments">
              <h3>Attachments</h3>
              <ul class="attachments-list">
                <li v-for="(attachment, index) in currentReport.attachments" :key="index" class="attachment-item">
                  <a :href="attachment.url" target="_blank">
                    <i class="fas fa-paperclip"></i> {{ attachment.originalName }}
                  </a>
                  <span class="attachment-size">{{ formatFileSize(attachment.size) }}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="report-comments">
            <h2>Comments</h2>
            
            <div v-if="!currentReport.comments || currentReport.comments.length === 0" class="no-comments">
              No comments yet.
            </div>
            
            <div v-else class="comments-list">
              <div v-for="comment in currentReport.comments" :key="comment._id" class="comment">
                <div class="comment-header">
                  <div class="comment-author">
                    {{ comment.user ? comment.user.name : 'Unknown User' }}
                  </div>
                  <div class="comment-date">
                    {{ formatDate(comment.createdAt) }}
                  </div>
                </div>
                <div class="comment-content">
                  {{ comment.content }}
                </div>
              </div>
            </div>
            
            <div class="add-comment">
              <h3>Add Comment</h3>
              <form @submit.prevent="addComment">
                <div class="form-group">
                  <textarea 
                    v-model="newComment" 
                    placeholder="Write your comment here..." 
                    class="form-control" 
                    rows="3"
                    maxlength="500"
                    required
                  ></textarea>
                  <small class="comment-count">{{ newComment.length }}/500</small>
                </div>
                <button type="submit" class="btn btn-primary" :disabled="!newComment.trim()">
                  Post Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      </template>
      
      <div v-else class="not-found">
        <h2>Report Not Found</h2>
        <p>The report you're looking for doesn't exist or has been deleted.</p>
        <router-link to="/reports" class="btn btn-primary">
          Back to Reports
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
  name: 'ReportDetailView',
  
  data() {
    return {
      reportId: this.$route.params.id,
      newComment: ''
    };
  },
  
  computed: {
    ...mapGetters('reports', ['currentReport', 'loading', 'error']),
    ...mapGetters('auth', ['currentUser']),
  },
  
  created() {
    console.log('ReportDetailView created, fetching report with ID:', this.reportId);
    this.$store.commit('reports/RESET_CURRENT_REPORT');
    this.fetchReport();
  },
  
  methods: {
    ...mapActions('reports', ['fetchReportById', 'deleteReport', 'addComment']),
    
    async fetchReport() {
      try {
        const report = await this.fetchReportById(this.reportId);
        console.log('Fetched report:', report);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    },
    
    formatDate(date) {
      if (!date) return 'No date available';
      return moment(date).format('MMMM DD, YYYY [at] h:mm A');
    },
    
    formatCategory(category) {
      if (!category) return 'Unknown';
      return category.charAt(0).toUpperCase() + category.slice(1);
    },
    
    formatStatus(status) {
      if (!status) return 'Unknown';
      const statusMap = {
        'draft': 'Draft',
        'submitted': 'Submitted',
        'approved': 'Approved',
        'rejected': 'Rejected'
      };
      return statusMap[status] || 'Unknown';
    },
    
    getAuthorName() {
      if (!this.currentReport || !this.currentReport.author) return 'Unknown';
      if (typeof this.currentReport.author === 'object' && this.currentReport.author.name) {
        return this.currentReport.author.name;
      }
      return 'User #' + this.currentReport.author;
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '0 Bytes';
      
      const units = ['Bytes', 'KB', 'MB', 'GB'];
      let i = 0;
      while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
      }
      
      return `${bytes.toFixed(2)} ${units[i]}`;
    },
    
    async confirmDelete() {
      if (confirm('Are you sure you want to delete this report?')) {
        try {
          await this.deleteReport(this.reportId);
          this.$router.push('/reports');
        } catch (error) {
          // Error is handled in the store
        }
      }
    },
    
    async submitComment() {
      if (!this.newComment.trim()) return;
      
      try {
        await this.addComment({
          reportId: this.reportId,
          comment: this.newComment.trim()
        });
        this.newComment = '';
        await this.fetchReport(); // Refresh to get the new comment
      } catch (error) {
        // Error is handled in the store
      }
    }
  }
};
</script>

<style scoped>
.report-detail-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 50px 0;
}

.loading-spinner {
  font-size: 18px;
  color: #6c757d;
}

.error-container {
  padding: 30px 0;
}

.header {
  margin-bottom: 20px;
}

.header-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.report-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #212529;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
  padding: 15px;
  background-color: #f0f8ff;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e6f2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-avatar i {
  font-size: 30px;
  color: #007bff;
}

.author-details {
  flex: 1;
}

.author-name {
  font-weight: bold;
  font-size: 18px;
  color: #212529;
}

.report-date {
  color: #6c757d;
  font-size: 14px;
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
}

.meta-item.status {
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: bold;
}

.status-draft {
  background-color: #e9ecef;
  color: #495057;
}

.status-submitted {
  background-color: #cce5ff;
  color: #0d6efd;
}

.status-approved {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-rejected {
  background-color: #f8d7da;
  color: #842029;
}

.meta-item.public,
.meta-item.private {
  padding: 3px 10px;
  border-radius: 12px;
}

.meta-item.public {
  background-color: #d1e7dd;
  color: #0f5132;
}

.meta-item.private {
  background-color: #e2e3e5;
  color: #41464b;
}

.report-content-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .report-content-container {
    grid-template-columns: 1fr;
  }
}

.report-content, .report-comments {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.report-content h2, .report-comments h2 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #212529;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.7;
  margin-bottom: 20px;
  color: #212529;
  font-size: 1rem;
}

.report-tags h3, .report-attachments h3 {
  font-size: 16px;
  margin: 20px 0 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background-color: #e9ecef;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.attachments-list {
  list-style-type: none;
  padding: 0;
}

.attachment-item {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attachment-item a {
  color: #007bff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.attachment-size {
  color: #6c757d;
  font-size: 12px;
}

.report-comments {
  height: fit-content;
}

.comments-list {
  margin-bottom: 20px;
}

.comment {
  padding: 10px 0;
  border-bottom: 1px solid #dee2e6;
}

.comment:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-author {
  font-weight: bold;
}

.comment-date {
  font-size: 12px;
  color: #6c757d;
}

.comment-content {
  white-space: pre-wrap;
}

.no-comments {
  color: #6c757d;
  font-style: italic;
  padding: 10px 0;
}

.add-comment h3 {
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 10px;
}

.comment-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #6c757d;
}

.not-found {
  text-align: center;
  padding: 40px 0;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
