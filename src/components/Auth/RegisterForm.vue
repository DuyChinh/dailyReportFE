<template>
  <div class="register-form">
    <h2>Create an Account</h2>
    
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          class="form-control"
          required
          maxlength="50"
        />
      </div>
      
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
          minlength="6"
        />
        <small class="form-text text-muted">Password must be at least 6 characters long</small>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="form.confirmPassword"
          class="form-control"
          required
          minlength="6"
        />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </div>
      
      <div class="form-footer">
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'RegisterForm',
  
  emits: [],
  
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationError: null
    };
  },
  
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  
  methods: {
    ...mapActions('auth', ['register']),
    
    async handleSubmit() {
      // Reset validation error
      this.validationError = null;
      
      // Check if passwords match
      if (this.form.password !== this.form.confirmPassword) {
        this.validationError = 'Passwords do not match';
        return;
      }
      
      try {
        // Extract data to send to API (omit confirmPassword)
        const { confirmPassword, ...userData } = this.form;
        
        await this.register(userData);
        // Wait for the next tick to ensure the store is updated
        await this.$nextTick();
        // Small delay to ensure all components are properly updated
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 100);
      } catch (error) {
        // Error is handled in the store
        console.error('Registration error:', error);
      }
    }
  }
};
</script>

<style scoped>
.register-form {
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

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 0.875em;
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
