<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="error-code">404</div>
      
      <h1>Page Not Found</h1>
      
      <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      
      <div class="actions">
        <router-link to="/dashboard" class="btn btn-primary">
          <i class="fas fa-home"></i> Go to Dashboard
        </router-link>
        
        <button @click="goBack" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 20px;
}

.not-found-container {
  text-align: center;
  max-width: 600px;
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #dc3545;
  line-height: 1;
  margin-bottom: 20px;
}

h1 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #343a40;
}

p {
  font-size: 18px;
  color: #6c757d;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
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

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
