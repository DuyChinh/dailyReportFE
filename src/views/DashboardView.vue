<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1 class="welcome-title">
              Welcome back! 👋
            </h1>
            <p class="welcome-subtitle">
              Here's what's happening with your tasks and reports today.
            </p>
          </div>
          <div class="welcome-actions">
            <router-link to="/reports/create" class="action-btn primary">
              <i class="fas fa-plus"></i>
              <span>Create Report</span>
            </router-link>
            <router-link to="/tasks" class="action-btn secondary">
              <i class="fas fa-tasks"></i>
              <span>View Tasks</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.totalReports || 0 }}</h3>
            <p class="stat-label">Total Reports</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-list-check"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.totalTasks || 0 }}</h3>
            <p class="stat-label">My Tasks</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.completedTasks || 0 }}</h3>
            <p class="stat-label">Completed</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.pendingTasks || 0 }}</h3>
            <p class="stat-label">Pending</p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent Reports -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-file-alt"></i>
              Recent Reports
            </h3>
            <router-link to="/reports" class="card-action">
              View All <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
          <div class="card-content">
            <reports-list v-if="!loading" :limit="5" />
            <div v-else class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading recent reports...</p>
            </div>
          </div>
        </div>

        <!-- My Tasks -->
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-tasks"></i>
              My Tasks
            </h3>
            <router-link to="/tasks" class="card-action">
              View All <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
          <div class="card-content">
            <div v-if="!taskLoading" class="task-list">
              <div v-if="myTasks && myTasks.length > 0" class="tasks">
                <task-list 
                  :tasks="myTasks.slice(0, 5)"
                  :show-admin-actions="false"
                  @task-updated="handleTaskUpdated"
                />
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks assigned yet</p>
              </div>
            </div>
            <div v-else class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading tasks...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ReportsList from '../components/Reports/ReportsList.vue';
import TaskList from '../components/Tasks/TaskList.vue';
import toastService from '../services/toastService';

export default {
  name: 'DashboardView',
  
  components: {
    ReportsList,
    TaskList
  },
  
  data() {
    return {
      stats: {
        totalReports: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
      },
      tasks: [],
      taskLoading: false
    };
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('reports', ['allReports', 'loading', 'error']),
    ...mapGetters('tasks', ['myTasks', 'stats'])
  },
  
  async created() {
    await this.loadDashboardData();
  },
  
  methods: {
    ...mapActions('reports', ['fetchReports', 'setFilters']),
    ...mapActions('tasks', ['fetchMyTasks', 'fetchTaskStats']),
    
    async loadDashboardData() {
      try {
        // Make sure we reset or initialize data properly
        this.stats = {
          totalReports: 0,
          drafts: 0,
          submitted: 0,
          approved: 0,
          rejected: 0
        };
        
        // Explicitly fetch reports with appropriate filters for the dashboard
        await this.setFilters({
          page: 1,
          limit: 10,
          status: '',
          category: '',
          search: ''
        });
        
        await Promise.all([
          this.fetchReports(),
          this.loadTasks()
        ]);
        
        console.log('Reports data loaded:', this.allReports);
        this.calculateStats();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toastService.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
      }
    },
    
    calculateStats() {
      // Make sure to use the correct getter name
      const reports = this.allReports || [];
      
      this.stats.totalReports = reports.length;
      
      // Protect against undefined reports
      if (reports.length === 0) return;
      
      reports.forEach(report => {
        if (!report || !report.status) return;
        
        switch (report.status) {
          case 'draft':
            this.stats.drafts++;
            break;
          case 'submitted':
            this.stats.submitted++;
            break;
          case 'approved':
            this.stats.approved++;
            break;
          case 'rejected':
            this.stats.rejected++;
            break;
        }
      });
    },
    
    async loadTasks() {
      try {
        // Initialize tasks with safe defaults
        this.tasks = {
          recent: [],
          upcoming: [],
          completed: []
        };
        
        // Mock tasks for now - in a real app you'd fetch from API
        this.tasks = {
          recent: [
            { _id: '1', title: 'Implement search feature', status: 'in-progress', dueDate: '2023-08-30' },
            { _id: '2', title: 'Fix UI bugs', status: 'open', dueDate: '2023-09-02' }
          ],
          upcoming: [
            { _id: '3', title: 'Write documentation', status: 'open', dueDate: '2023-09-05' }
          ],
          completed: [
            { _id: '4', title: 'Performance optimization', status: 'completed', dueDate: '2023-08-25' }
          ]
        };
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'No due date';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    
    handleTaskUpdated(taskId) {
      // Reload tasks when a task is updated
      this.loadTasks();
    }
  }
};
</script>

<style scoped>
.dashboard {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Welcome Section */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 15px;
  margin-left: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;
}

.action-btn.primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.action-btn.primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  font-weight: 500;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 25px 0;
  border-bottom: 1px solid #f1f3f4;
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.card-title i {
  color: #667eea;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.card-action:hover {
  color: #5a6fd8;
  transform: translateX(3px);
}

.card-content {
  padding: 0 25px 25px;
}

/* Task List */
.task-list {
  max-height: 400px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #f1f3f4;
}

.task-item:last-child {
  border-bottom: none;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.task-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.task-priority {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
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

.task-due-date {
  font-size: 12px;
  color: #6b7280;
}

.task-status {
  margin-left: 15px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.completed {
  background: #d1fae5;
  color: #059669;
}

/* Loading States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 20px 15px;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .welcome-actions {
    margin-left: 0;
    justify-content: center;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 30px 20px;
  }
  
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .welcome-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
