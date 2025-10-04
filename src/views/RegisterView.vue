<template>
  <div class="register-view">
    <div class="auth-container">
      <div class="auth-logo">
        <h1>Daily Report System</h1>
      </div>
      <register-form />
    </div>
  </div>
</template>

<script>
import RegisterForm from '../components/Auth/RegisterForm.vue';

export default {
  name: 'RegisterView',
  components: {
    RegisterForm
  }
};
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.auth-container {
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-logo {
  text-align: center;
  padding: 20px;
  background-color: #007bff;
  color: white;
}
</style>
