<template>
  <div class="login-form">
    <h2>Login to Daily Report System</h2>
    
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          class="form-control"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="form-control"
          required
        />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </div>
      
      <div class="form-footer">
        <p>Don't have an account? <router-link to="/register">Register</router-link></p>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'LoginForm',
  
  emits: [],
  
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    };
  },
  
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  
  methods: {
    ...mapActions('auth', ['login']),
    
    async handleSubmit() {
      try {
        await this.login(this.form);
        // Wait for the next tick to ensure the store is updated
        await this.$nextTick();
        // Small delay to ensure all components are properly updated
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 100);
      } catch (error) {
        // Error is already handled in the store
        console.error('Login error:', error);
      }
    }
  }
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.form-actions {
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 15px;
  text-align: center;
}
</style>
