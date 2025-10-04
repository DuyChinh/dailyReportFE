<template>
  <header class="app-header" v-if="isAuthenticated">
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
          <router-link v-if="isAdmin" to="/admin" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-cog"></i>
            <span>Admin</span>
          </router-link>
        </nav>
        
        <div class="user-actions">
          <div class="user-info" v-if="currentUser">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser.name }}</span>
              <span class="user-role">{{ isAdmin ? 'Admin' : 'User' }}</span>
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
      notificationCount: 0
    };
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isAdmin', 'isAuthenticated'])
  },
  
  methods: {
    ...mapActions('auth', ['logout']),
    
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
        this.$router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
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
