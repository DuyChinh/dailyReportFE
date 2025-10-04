<template>
  <div id="app">
    <app-header />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import AppHeader from './components/Layout/AppHeader.vue';

export default {
  name: 'App',
  
  components: {
    AppHeader
  },
  
  created() {
    // Initialize auth on app start
    this.initAuth();
  },
  
  methods: {
    ...mapActions('auth', ['getCurrentUser', 'initializeFromStorage']),
    
    async initAuth() {
      try {
        // First initialize from localStorage
        const initialized = await this.initializeFromStorage();
        
        // Then try to get fresh data from the server
        if (initialized) {
          await this.getCurrentUser();
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      }
    }
  }
};
</script>

<style>
@import './assets/styles/main.css';

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  min-height: calc(100vh - 70px);
  padding-top: 0;
}

/* Global scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* Smooth transitions */
* {
  transition: all 0.3s ease;
}

/* Focus styles */
*:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Selection styles */
::selection {
  background-color: #667eea;
  color: white;
}
* {
  transition: all 0.3s ease;
}

/* Focus styles */
*:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Selection styles */
::selection {
  background-color: #667eea;
  color: white;
}
</style>

