<template>
  <div class="create-report-view">
    <div class="container">
      <div class="header">
        <h1>Create New Report</h1>
        <router-link to="/reports" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Back to Reports
        </router-link>
      </div>
      
      <div class="author-info" v-if="currentUser">
        <div class="author-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="author-details">
          <div>Creating report as:</div>
          <div class="author-name">{{ currentUser.name }}</div>
        </div>
      </div>
      
      <div class="content-container">
        <report-form 
          :initial-task-id="taskId"
          :user-tasks="userTasks"
          @saved="handleReportSaved" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import ReportForm from '../components/Reports/ReportForm.vue';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'CreateReportView',
  
  components: {
    ReportForm
  },
  
  data() {
    return {
      userTasks: []
    };
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('tasks', ['myTasks']),
    
    taskId() {
      return this.$route.query.task || null;
    }
  },
  
  async created() {
    await this.loadUserTasks();
  },
  
  methods: {
    ...mapActions('tasks', ['fetchMyTasks']),
    
    async loadUserTasks() {
      try {
        await this.fetchMyTasks({ 
          status: 'pending,in_progress',
          limit: 50,
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        });
        this.userTasks = this.myTasks || [];
      } catch (error) {
        console.error('Error loading user tasks:', error);
        this.userTasks = [];
      }
    },
    
    handleReportSaved() {
      this.$router.push('/reports');
    }
  }
};
</script>

<style scoped>
.create-report-view {
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

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
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
  font-size: 0.95rem;
}

.author-name {
  font-weight: bold;
  color: #212529;
  font-size: 1.1rem;
}

.content-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 25px;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}
</style>
