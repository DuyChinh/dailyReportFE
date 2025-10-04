<template>
  <div class="toast-example">
    <h2>Toast Usage Examples</h2>
    
    <div class="example-section">
      <h3>Basic Toast Types</h3>
      <div class="button-group">
        <button @click="showSuccess" class="btn btn-success">
          <i class="fas fa-check"></i>
          Success Toast
        </button>
        <button @click="showError" class="btn btn-danger">
          <i class="fas fa-times"></i>
          Error Toast
        </button>
        <button @click="showWarning" class="btn btn-warning">
          <i class="fas fa-exclamation"></i>
          Warning Toast
        </button>
        <button @click="showInfo" class="btn btn-info">
          <i class="fas fa-info"></i>
          Info Toast
        </button>
      </div>
    </div>

    <div class="example-section">
      <h3>Custom Options</h3>
      <div class="button-group">
        <button @click="showLongToast" class="btn btn-primary">
          <i class="fas fa-clock"></i>
          Long Duration Toast
        </button>
        <button @click="showPersistentToast" class="btn btn-secondary">
          <i class="fas fa-pause"></i>
          Persistent Toast
        </button>
        <button @click="showCustomToast" class="btn btn-outline">
          <i class="fas fa-magic"></i>
          Custom Toast
        </button>
      </div>
    </div>

    <div class="example-section">
      <h3>Toast Management</h3>
      <div class="button-group">
        <button @click="showMultipleToasts" class="btn btn-primary">
          <i class="fas fa-layer-group"></i>
          Multiple Toasts
        </button>
        <button @click="clearAllToasts" class="btn btn-danger">
          <i class="fas fa-trash"></i>
          Clear All
        </button>
      </div>
    </div>

    <div class="example-section">
      <h3>Real-world Examples</h3>
      <div class="button-group">
        <button @click="simulateApiSuccess" class="btn btn-success">
          <i class="fas fa-save"></i>
          Simulate API Success
        </button>
        <button @click="simulateApiError" class="btn btn-danger">
          <i class="fas fa-exclamation-triangle"></i>
          Simulate API Error
        </button>
        <button @click="simulateValidation" class="btn btn-warning">
          <i class="fas fa-check-circle"></i>
          Simulate Validation
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import toastService from '../services/toastService';

export default {
  name: 'ToastUsageExample',
  
  methods: {
    // Basic toast types
    showSuccess() {
      toastService.success('Operation completed successfully!');
    },
    
    showError() {
      toastService.error('Something went wrong. Please try again.');
    },
    
    showWarning() {
      toastService.warning('Please check your input before proceeding.');
    },
    
    showInfo() {
      toastService.info('Here is some useful information for you.');
    },
    
    // Custom options
    showLongToast() {
      toastService.info('This toast will stay for 10 seconds', {
        timeout: 10000
      });
    },
    
    showPersistentToast() {
      toastService.warning('This toast will stay until manually closed', {
        timeout: false
      });
    },
    
    showCustomToast() {
      toastService.custom('Custom styled toast!', {
        type: 'success',
        timeout: 5000,
        closeOnClick: false,
        draggable: false
      });
    },
    
    // Toast management
    showMultipleToasts() {
      toastService.info('First toast');
      setTimeout(() => toastService.success('Second toast'), 500);
      setTimeout(() => toastService.warning('Third toast'), 1000);
    },
    
    clearAllToasts() {
      toastService.clear();
    },
    
    // Real-world examples
    async simulateApiSuccess() {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toastService.success('Data saved successfully!');
      } catch (error) {
        toastService.error('Failed to save data');
      }
    },
    
    async simulateApiError() {
      try {
        // Simulate API error
        throw new Error('Network error');
      } catch (error) {
        toastService.error('Failed to connect to server. Please check your internet connection.');
      }
    },
    
    simulateValidation() {
      const errors = ['Name is required', 'Email format is invalid'];
      errors.forEach((error, index) => {
        setTimeout(() => {
          toastService.warning(error);
        }, index * 500);
      });
    }
  }
};
</script>

<style scoped>
.toast-example {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.example-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.25rem;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.button-group .btn {
  margin: 0;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }
  
  .button-group .btn {
    width: 100%;
  }
}
</style>
