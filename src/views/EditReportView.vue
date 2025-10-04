<template>
  <div class="edit-report-view">
    <div class="container">
      <div class="header">
        <h1>Edit Report</h1>
        <router-link :to="`/reports/${reportId}`" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Back to Report
        </router-link>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">Loading report...</div>
      </div>
      
      <div v-else-if="error" class="error-container">
        <div class="alert alert-danger">
          {{ error }}
          <button @click="fetchReport" class="btn btn-sm btn-primary">Try Again</button>
        </div>
      </div>
      
      <div v-else-if="currentReport" class="content-container">
        <report-form 
          :report-id="reportId" 
          :initial-data="currentReport" 
          @saved="handleReportSaved" 
        />
      </div>
      
      <div v-else class="not-found">
        <h2>Report Not Found</h2>
        <p>The report you're trying to edit doesn't exist or has been deleted.</p>
        <router-link to="/reports" class="btn btn-primary">Back to Reports</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ReportForm from '../components/Reports/ReportForm.vue';

export default {
  name: 'EditReportView',
  
  components: {
    ReportForm
  },
  
  data() {
    return {
      reportId: this.$route.params.id
    };
  },
  
  computed: {
    ...mapGetters('reports', ['currentReport', 'loading', 'error']),
    ...mapGetters('auth', ['currentUser']),
  },
  
  created() {
    this.resetCurrentReport();
    this.fetchReport();
  },
  
  methods: {
    ...mapActions('reports', ['fetchReportById', 'resetCurrentReport']),
    
    async fetchReport() {
      try {
        await this.fetchReportById(this.reportId);
      } catch (error) {
        // Error is handled in the store
      }
    },
    
    handleReportSaved() {
      this.$router.push(`/reports/${this.reportId}`);
    }
  }
};
</script>

<style scoped>
.edit-report-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  color: #212529;
  font-size: 1.75rem;
  margin: 0;
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

.content-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 25px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 12px 15px;
  background-color: #f0f8ff;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e6f2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-avatar i {
  font-size: 24px;
  color: #007bff;
}

.author-details {
  color: #495057;
}

.author-name {
  font-weight: bold;
  color: #212529;
}

.not-found {
  text-align: center;
  padding: 40px 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.not-found h2 {
  color: #dc3545;
  margin-bottom: 15px;
}

.not-found p {
  color: #495057;
  margin-bottom: 20px;
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

.alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c6cb;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
