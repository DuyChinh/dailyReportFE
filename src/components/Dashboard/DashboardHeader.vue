<template>
  <header class="dashboard-header">
    <div class="container">
      <div class="header-content">
        <div class="logo-section">
          <h1>Daily Report System</h1>
        </div>
        <nav class="main-nav">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/reports" class="nav-link">Reports</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-link">Admin</router-link>
        </nav>
        <div class="user-actions">
          <div class="user-greeting" v-if="displayName">
            <span>Welcome, {{ displayName }}</span>
          </div>
          <button @click="handleLogout" class="btn btn-sm btn-outline">Logout</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'DashboardHeader',
  
  data() {
    return {
      localUserData: null
    };
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isAdmin']),
    
    // Ensures we always have a name to display
    displayName() {
      // First try local data
      if (this.localUserData && this.localUserData.name) {
        return this.localUserData.name;
      }
      
      // Then try Vuex store
      if (this.currentUser && this.currentUser.name) {
        return this.currentUser.name;
      }
      
      // Finally try localStorage directly
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData && userData.name) {
            return userData.name;
          }
        }
      } catch (e) {
        console.error('Error reading user from localStorage', e);
      }
      
      return 'User'; // Fallback
    }
  },
  
  created() {
    this.loadUserData();
    
    // Set up an interval to check localStorage regularly
    this.intervalId = setInterval(() => {
      this.checkLocalStorage();
    }, 2000); // Check every 2 seconds
  },
  
  beforeUnmount() {
    // Clean up interval when component is unmounted
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  
  methods: {
    ...mapActions('auth', ['logout', 'initializeFromStorage']),
    
    loadUserData() {
      // Try to initialize from Vuex store first
      if (this.currentUser) {
        this.localUserData = {...this.currentUser};
        return;
      }
      
      // Then try localStorage
      try {
        this.localUserData = JSON.parse(localStorage.getItem('user'))?.user || null;    
      } catch (e) {
        console.error('Error parsing user data', e);
      }
      
      // Finally try to reinitialize auth from storage
      this.initializeFromStorage();
      this.$nextTick(() => {
        if (this.currentUser) {
          this.localUserData = {...this.currentUser};
        }
      });
    },
    
    checkLocalStorage() {
      // Periodically check localStorage for user data
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData && userData.name) {
            this.localUserData = userData;
          }
        } else {
          // If no user in localStorage but we have localUserData,
          // user might have logged out in another tab
          if (this.localUserData) {
            this.localUserData = null;
          }
        }
      } catch (e) {
        console.error('Error checking localStorage', e);
      }
    },
    
    async handleLogout() {
      try {
        await this.logout();
        this.localUserData = null;
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  },
  
  // Watch for changes in the store's currentUser and update local userData
  watch: {
    currentUser: {
      handler(newUser) {
        if (newUser) {
          this.localUserData = {...newUser};
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.dashboard-header {
  background-color: #343a40;
  color: white;
  padding: 15px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section h1 {
  margin: 0;
  font-size: 24px;
}

.main-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #f8f9fa;
  text-decoration: none;
  font-weight: 500;
  padding: 5px 0;
  position: relative;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link.router-link-active {
  color: #ffffff;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ffffff;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-greeting {
  font-size: 14px;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.btn-sm {
  font-size: 14px;
}

.btn-outline {
  background-color: transparent;
  color: #fff;
  border: 1px solid #fff;
}

.btn-outline:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
  }
  
  .user-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
