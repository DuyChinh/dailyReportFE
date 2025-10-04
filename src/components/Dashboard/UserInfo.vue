<template>
  <div class="user-info-card">
    <div v-if="loading" class="loading-spinner">
      Loading user data...
    </div>
    
    <div v-else-if="currentUser" class="user-profile">
      <div class="avatar-container">
        <img 
          v-if="currentUser.avatar" 
          :src="currentUser.avatar" 
          :alt="currentUser.name" 
          class="avatar"
        />
        <div v-else class="avatar avatar-placeholder">
          {{ userInitials }}
        </div>
      </div>
      
      <div class="user-details">
        <h2 class="user-name">{{ currentUser.name }}</h2>
        <p class="user-email">{{ currentUser.email }}</p>
        <div class="user-role">
          <span :class="['role-badge', {'role-admin': isAdmin}]">
            {{ currentUser.role }}
          </span>
        </div>
        
        <div class="user-stats">
          <div class="stat">
            <div class="stat-value">{{ totalReports }}</div>
            <div class="stat-label">Reports</div>
          </div>
          
          <div class="stat">
            <div class="stat-value">{{ pendingReports }}</div>
            <div class="stat-label">Pending</div>
          </div>
          
          <div class="stat">
            <div class="stat-value">{{ approvedReports }}</div>
            <div class="stat-label">Approved</div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-message">
      Failed to load user data
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'UserInfo',
  
  data() {
    return {
      totalReports: 0,
      pendingReports: 0,
      approvedReports: 0
    };
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isAdmin', 'loading']),
    
    userInitials() {
      if (!this.currentUser || !this.currentUser.name) return '?';
      return this.currentUser.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
  },
  
  created() {
    // In a real application, you would fetch these statistics from your API
    // For now, we'll use placeholder values
    this.totalReports = 12;
    this.pendingReports = 3;
    this.approvedReports = 8;
  }
};
</script>

<style scoped>
.user-info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-width: 280px;
}

.loading-spinner {
  text-align: center;
  color: #6c757d;
  padding: 20px 0;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-container {
  margin-bottom: 15px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #007bff;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.user-details {
  width: 100%;
}

.user-name {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #343a40;
}

.user-email {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 14px;
}

.user-role {
  margin-bottom: 15px;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  background-color: #6c757d;
  color: white;
  font-size: 12px;
  text-transform: uppercase;
}

.role-admin {
  background-color: #ffc107;
  color: #212529;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  border-top: 1px solid #dee2e6;
  padding-top: 15px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #343a40;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.error-message {
  color: #dc3545;
  text-align: center;
  padding: 20px 0;
}
</style>
