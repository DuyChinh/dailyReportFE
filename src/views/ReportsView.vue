<template>
  <div class="reports-view">
    <div class="reports-container">
      <h1 class="reports-title">Reports</h1>
      
      <div class="reports-header">
        <div class="date-indicator">
          <template v-if="isShowingToday">
            <i class="fas fa-calendar-day"></i> Today's Reports
          </template>
          <template v-else>
            <i class="fas fa-calendar-alt"></i> 
            {{ formatDateRange(filters.startDate, filters.endDate) }}
          </template>
        </div>
        
        <div class="reports-actions">
          <router-link to="/reports/create" class="btn btn-primary">
            <i class="fas fa-plus"></i> New Report
          </router-link>
        </div>
      </div>
      
      <report-filters 
        :initial-filters="filters" 
        @filter-applied="applyFilters" 
      />
      
      <div v-if="loading" class="loading-spinner">
        <span>Loading reports...</span>
      </div>
      
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <div v-else-if="allReports.length === 0" class="no-reports">
        <p>No reports found for the selected filters.</p>
        <button @click="resetToToday" class="btn btn-primary">
          Show Today's Reports
        </button>
      </div>
      
      <reports-list v-else :reports="allReports" @delete-report="confirmDelete" />
      
      <pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-changed="changePage"
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ReportsList from '../components/Reports/ReportsList.vue';
import ReportFilters from '../components/Reports/ReportFilters.vue';
import Pagination from '../components/Reports/Pagination.vue';
import moment from 'moment';

export default {
  name: 'ReportsView',
  
  components: {
    ReportsList,
    ReportFilters,
    Pagination
  },
  
  data() {
    return {
      confirmingDelete: null
    };
  },
  
  computed: {
    ...mapGetters('reports', [
      'allReports',
      'loading',
      'error',
      'totalPages',
      'currentPage',
      'filters'
    ]),
    
    isShowingToday() {
      const today = new Date().toISOString().split('T')[0];
      return this.filters.startDate === today && this.filters.endDate === today;
    }
  },
  
  created() {
    this.fetchReports();
  },
  
  methods: {
    ...mapActions('reports', ['fetchReports', 'deleteReport', 'setFilters', 'resetFilters']),
    
    applyFilters(filters) {
      this.setFilters(filters);
    },
    
    changePage(page) {
      this.setFilters({ page });
    },
    
    resetToToday() {
      this.resetFilters();
    },
    
    confirmDelete(reportId) {
      if (confirm('Are you sure you want to delete this report?')) {
        this.deleteReport(reportId);
      }
    },
    
    formatDateRange(startDate, endDate) {
      if (startDate === endDate) {
        return moment(startDate).format('MMMM D, YYYY');
      }
      return `${moment(startDate).format('MMM D')} - ${moment(endDate).format('MMM D, YYYY')}`;
    }
  }
};
</script>

<style scoped>
.reports-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.reports-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.reports-title {
  margin-bottom: 20px;
  color: #212529;
  font-size: 1.75rem;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-indicator {
  font-size: 1.2rem;
  color: #007bff;
  font-weight: 500;
}

.date-indicator i {
  margin-right: 8px;
}

.reports-actions {
  display: flex;
  gap: 10px;
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

.loading-spinner {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  color: #6c757d;
}

.no-reports {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
}

.no-reports .btn {
  margin-top: 20px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 12px;
  border-radius: 4px;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .reports-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>
