<template>
  <header class="app-header" v-if="isUserAuthenticated">
    <div class="container">
      <div class="header-content">
        <div class="logo-section">
          <router-link to="/dashboard" class="logo-link">
            <i class="fas fa-tasks"></i>
            <span class="logo-text">Task Management</span>
          </router-link>
        </div>
        
        <nav class="main-nav" :class="{ 'nav-open': isMobileMenuOpen }">
          <router-link to="/dashboard" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
          </router-link>
          <router-link to="/reports" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-file-alt"></i>
            <span>Reports</span>
          </router-link>
          <router-link to="/tasks" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-list-check"></i>
            <span>My Tasks</span>
          </router-link>
          <router-link v-if="isUserAdmin" to="/admin" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-cog"></i>
            <span>Admin</span>
          </router-link>
        </nav>
        
        <div class="user-actions">
          <div class="user-info" v-if="userData">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ userData.name }}</span>
              <span class="user-role">{{ isUserAdmin ? 'Admin' : 'User' }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button @click="toggleNotifications" class="btn-icon" title="Notifications">
              <i class="fas fa-bell"></i>
              <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
            </button>
            
            <div class="user-menu">
              <button @click="toggleUserMenu" class="btn-icon" title="User Menu">
                <i class="fas fa-chevron-down"></i>
              </button>
              <div class="user-dropdown" :class="{ 'dropdown-open': isUserMenuOpen }">
                <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
                  <i class="fas fa-user"></i>
                  Profile
                </router-link>
                <router-link to="/settings" class="dropdown-item" @click="closeUserMenu">
                  <i class="fas fa-cog"></i>
                  Settings
                </router-link>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item logout">
                  <i class="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          <button @click="toggleMobileMenu" class="mobile-menu-btn">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AppHeader',
  
  emits: [],
  
  data() {
    return {
      isMobileMenuOpen: false,
      isUserMenuOpen: false,
      notificationCount: 0,
      userData: null,
      intervalId: null
    };
  },

  created() {
    // Try to initialize auth state from various sources
    this.loadUserData();
    
    // Set up interval to periodically check localStorage for changes
    this.intervalId = setInterval(() => {
      this.checkLocalStorage();
    }, 2000);
  },

  beforeUnmount() {
    // Clean up interval when component is unmounted
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isAdmin', 'isAuthenticated']),
    
    // Enhanced computed properties that work even on reload
    isUserAdmin() {
      // First check our local data
      if (this.userData && typeof this.userData.role === 'string') {
        const isAdmin = this.userData.role === 'admin';
        console.log('Admin check from userData:', isAdmin);
        if (isAdmin) {
          localStorage.setItem('isAdmin', 'true');
          return true;
        }
      }
      
      // Then check Vuex store
      if (this.isAdmin) {
        console.log('Admin check from Vuex:', true);
        localStorage.setItem('isAdmin', 'true');
        return true;
      }
      
      // Finally check localStorage directly with more reliable parsing
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.log('No user in localStorage');
          localStorage.removeItem('isAdmin');
          return false;
        }
        
        const user = JSON.parse(userStr);
        console.log('User from localStorage:', user);
        
        // Try different possible structures of user data in localStorage
        let role;
        if (user.user && user.user.role) {
          role = user.user.role;
        } else if (user.role) {
          role = user.role;
        }
        
        console.log('Role found:', role);
        
        // Store this role in localStorage for router guards to use
        if (role === 'admin') {
          // Set a dedicated admin flag in localStorage that router guards can check
          localStorage.setItem('isAdmin', 'true');
          return true;
        } else {
          localStorage.removeItem('isAdmin');
          return false;
        }
      } catch (e) {
        console.error('Error checking admin status from localStorage', e);
        localStorage.removeItem('isAdmin');
        return false;
      }
    },
    
    isUserAuthenticated() {
      // First check if we have local user data
      if (this.userData) {
        return true;
      }
      
      // Then check Vuex store
      if (this.isAuthenticated) {
        return true;
      }
      
      // Finally check localStorage directly
      try {
        const user = localStorage.getItem('user');
        return !!user;
      } catch (e) {
        console.error('Error checking auth status from localStorage', e);
        return false;
      }
    }
  },
  
  methods: {
    ...mapActions('auth', ['logout', 'initializeFromStorage']),
    
    loadUserData() {
      // Try to get user data from Vuex store first
      if (this.currentUser) {
        this.userData = {...this.currentUser};
        
        // Update admin status in localStorage for router guards
        if (this.currentUser.role === 'admin') {
          console.log('Setting isAdmin from currentUser');
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
        return;
      }
      
      // Then try localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsedData = JSON.parse(userStr);
          this.userData = parsedData.user || parsedData;
          
          // Update admin status in localStorage
          const role = this.userData.role;
          console.log('Role from localStorage:', role);
          
          if (role === 'admin') {
            console.log('Setting isAdmin from localStorage');
            localStorage.setItem('isAdmin', 'true');
          }
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
      }
      
      // Try to initialize the store from storage
      this.initializeFromStorage();
      
      // After store initialization, check if we have user data now
      this.$nextTick(() => {
        if (this.currentUser && !this.userData) {
          this.userData = {...this.currentUser};
        }
      });
    },
    
    checkLocalStorage() {
      // Periodically check localStorage for changes
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsedData = JSON.parse(userStr);
          const user = parsedData.user || parsedData;
          
          // Update our local user data if it's different
          if (JSON.stringify(user) !== JSON.stringify(this.userData)) {
            this.userData = user;
            
            // Update admin status in localStorage
            if (user.role === 'admin') {
              localStorage.setItem('isAdmin', 'true');
            } else {
              localStorage.removeItem('isAdmin');
            }
          }
        } else if (this.userData) {
          // If localStorage has no user but we have userData, user might have logged out in another tab
          this.userData = null;
          // Try to synchronize with the store
          this.initializeFromStorage();
        }
      } catch (e) {
        console.error('Error checking localStorage for user data', e);
      }
    },
    
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      this.isUserMenuOpen = false;
    },
    
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
    
    toggleUserMenu() {
      this.isUserMenuOpen = !this.isUserMenuOpen;
      this.isMobileMenuOpen = false;
    },
    
    closeUserMenu() {
      this.isUserMenuOpen = false;
    },
    
    toggleNotifications() {
      // TODO: Implement notifications
      console.log('Toggle notifications');
    },
    
    async handleLogout() {
      try {
        await this.logout();
        this.userData = null;
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  },
  
  watch: {
    // Watch for changes in the Vuex store currentUser
    currentUser: {
      handler(newUser) {
        if (newUser && (!this.userData || JSON.stringify(newUser) !== JSON.stringify(this.userData))) {
          this.userData = {...newUser};
        }
      },
      immediate: true
    }
  },
  
  mounted() {
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.isMobileMenuOpen = false;
        this.isUserMenuOpen = false;
      }
    });
  }
};
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  font-size: 24px;
  font-weight: 700;
  transition: transform 0.2s ease;
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo-link i {
  font-size: 28px;
  color: #ffd700;
}

.logo-text {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-link i {
  font-size: 16px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 18px;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  opacity: 0.8;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.btn-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
}

.user-dropdown.dropdown-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.logout {
  color: #dc3545;
}

.dropdown-item.logout:hover {
  background-color: #f8d7da;
}

.dropdown-divider {
  height: 1px;
  background-color: #e9ecef;
  margin: 8px 0;
}

.mobile-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .header-content {
    height: 60px;
  }
  
  .logo-text {
    display: none;
  }
  
  .main-nav {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    padding: 20px;
    gap: 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .main-nav.nav-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  
  .user-info {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-buttons {
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .logo-link {
    font-size: 20px;
  }
  
  .logo-link i {
    font-size: 24px;
  }
}
</style>
