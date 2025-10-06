<template>
  <div class="reports-list">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading reports...</p>
    </div>
    
    <div v-else-if="!recentReports || recentReports.length === 0" class="empty-state">
      <i class="fas fa-file-alt"></i>
      <h3>No reports found</h3>
      <p>You haven't created any reports yet</p>
      <router-link to="/reports/create" class="btn btn-primary mt-3">
        <i class="fas fa-plus"></i>
        Create Report
      </router-link>
    </div>
    
    <div v-else class="reports-grid">
      <div 
        v-for="report in recentReports" 
        :key="report._id" 
        class="report-card" 
        :class="[report.status, {'today-report': isReportFromToday(report)}]"
      >
        <div class="report-header">
          <div class="header-main">
            <h3 class="report-title">{{ report.title }}</h3>
            <div class="report-status">
              <span class="status-badge" :class="report.status">{{ formatStatus(report.status) }}</span>
            </div>
          </div>
          
          <!-- Updated to use author instead of creator -->
          <div class="creator-info" v-if="report.author">
            <div class="creator-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="creator-details">
              <span class="creator-name">{{ getCreatorName(report.author) }}</span>
              <span class="creator-role" v-if="report.author.role">{{ report.author.role }}</span>
            </div>
          </div>
        </div>
        
        <div class="report-content">
          <p class="report-summary" v-if="report.summary">
            {{ truncateText(report.summary, 120) }}
          </p>
          
          <div class="report-text" v-if="report.content">
            <h4 class="content-heading">Content:</h4>
            <p>{{ truncateText(report.content, 200) }}</p>
          </div>
          
          <div class="report-meta">
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(report.createdAt) }}</span>
              <span v-if="isReportFromToday(report)" class="today-badge">Today</span>
            </div>
            <div class="meta-item" v-if="report.category">
              <i class="fas fa-tag"></i>
              <span>{{ report.category }}</span>
            </div>
            
            <!-- Add timestamp for when report was created -->
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatTime(report.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="report-footer">
          <!-- <div class="footer-info">
            <span class="created-by">Created by: <strong>{{ getCreatorName(report.author) }}</strong></span>
          </div> -->
          <router-link :to="`/reports/${report._id}`" class="view-report-btn">
            <i class="fas fa-eye"></i>
            View Report
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';

export default {
  name: 'ReportsList',
  
  props: {
    limit: {
      type: Number,
      default: 0
    }
  },
  
  computed: {
    ...mapGetters('reports', ['allReports', 'loading']),
    
    recentReports() {
      console.log('All reports:', this.allReports);
      let reports = [...this.allReports];
      
      // Sort by createdAt (most recent first)
      reports = reports.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Apply limit if specified
      if(this.limit > 0) {
        reports = reports.slice(0, this.limit);
      }
      
      console.log('Recent reports:', reports);
      return reports;
    }
  },
  
  methods: {
    formatDate(date) {
      if (!date) return '';
      return moment(date).format('MMM DD, YYYY');
    },
    
    formatStatus(status) {
      if (!status) return 'Unknown';
      
      const statusMap = {
        draft: 'Draft',
        submitted: 'Submitted',
        approved: 'Approved',
        rejected: 'Rejected'
      };
      
      return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
    },
    
    getCreatorName(author) {
      if (!author) return 'Unknown';
      
      if (typeof author === 'object') {
        return author.name || author.username || 'Unknown';
      }
      
      return author;
    },
    
    isReportFromToday(report) {
      if (!report || !report.createdAt) return false;
      
      const reportDate = moment(report.createdAt).format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      
      return reportDate === today;
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    },
    
    formatTime(date) {
      if (!date) return '';
      return moment(date).format('HH:mm');
    }
  }
};
</script>

<style scoped>
.reports-list {
  width: 100%;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.report-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
  border-left: 4px solid #e9ecef;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.report-card.draft {
  border-left-color: #6c757d;
}

.report-card.submitted {
  border-left-color: #0d6efd;
}

.report-card.approved {
  border-left-color: #198754;
}

.report-card.rejected {
  border-left-color: #dc3545;
}

/* Style for today's reports */
.report-card.today-report {
  background: #AAFFA9;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #11FFBD, #AAFFA9);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #11FFBD, #AAFFA9); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  border-left-color: #6366f1;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
}

.report-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 12px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.report-title {
  font-size: 18px;
  font-weight: 600;
  color: #343a40;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 15px;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.draft {
  background: #e9ecef;
  color: #495057;
}

.status-badge.submitted {
  background: #cfe2ff;
  color: #0d6efd;
}

.status-badge.approved {
  background: #d1e7dd;
  color: #198754;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #dc3545;
}

.report-summary {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

/* New styles for report content */
.report-text {
  margin: 12px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.content-heading {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #495057;
}

.report-text p {
  font-size: 13px;
  line-height: 1.5;
  color: #6c757d;
  margin: 0;
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6c757d;
}

.meta-item i {
  color: #6c757d;
}

/* Style for creator info */
.meta-item.creator {
  background: #f0f4ff;
  padding: 4px 8px;
  border-radius: 20px;
  color: #5a6fd8;
}

.meta-item.creator i {
  color: #667eea;
}

/* Enhanced creator information */
.creator-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 8px;
  margin-top: 5px;
}

.creator-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.creator-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.creator-name {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.creator-role {
  font-size: 12px;
  color: #6b7280;
  text-transform: capitalize;
}

.today-badge {
  background: #6366f1;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
  text-transform: uppercase;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  border-top: 1px solid #e9ecef;
  padding-top: 12px;
}

.footer-info {
  font-size: 12px;
  color: #6c757d;
}

.created-by strong {
  color: #495057;
}

.view-report-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.view-report-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
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
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.6;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #495057;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.mt-3 {
  margin-top: 15px;
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
