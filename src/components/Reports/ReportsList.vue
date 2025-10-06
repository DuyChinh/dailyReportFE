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
      <div v-for="report in recentReports" :key="report._id" class="report-card" :class="report.status">
        <div class="report-header">
          <h3 class="report-title">{{ report.title }}</h3>
          <div class="report-status">
            <span class="status-badge" :class="report.status">{{ formatStatus(report.status) }}</span>
          </div>
        </div>
        
        <div class="report-content">
          <p class="report-summary" v-if="report.summary">
            {{ truncateText(report.summary, 120) }}
          </p>
          <div class="report-meta">
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(report.createdAt) }}</span>
            </div>
            <div class="meta-item" v-if="report.category">
              <i class="fas fa-tag"></i>
              <span>{{ report.category }}</span>
            </div>
          </div>
        </div>
        
        <div class="report-footer">
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
    
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
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

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
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

.report-footer {
  display: flex;
  justify-content: flex-end;
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
