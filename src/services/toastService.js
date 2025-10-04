import { useToast } from 'vue-toastification';

// Toast service for easy usage across components
class ToastService {
  constructor() {
    this.toast = useToast();
  }

  // Success toast
  success(message, options = {}) {
    return this.toast.success(message, {
      timeout: 3000,
      ...options
    });
  }

  // Error toast
  error(message, options = {}) {
    return this.toast.error(message, {
      timeout: 5000,
      ...options
    });
  }

  // Warning toast
  warning(message, options = {}) {
    return this.toast.warning(message, {
      timeout: 4000,
      ...options
    });
  }

  // Info toast
  info(message, options = {}) {
    return this.toast.info(message, {
      timeout: 3000,
      ...options
    });
  }

  // Custom toast
  custom(message, options = {}) {
    return this.toast(message, options);
  }

  // Clear all toasts
  clear() {
    return this.toast.clear();
  }

  // Clear specific toast
  clearToast(toastId) {
    return this.toast.dismiss(toastId);
  }

  // Update existing toast
  update(toastId, content, options = {}) {
    return this.toast.update(toastId, content, options);
  }
}

// Create singleton instance
const toastService = new ToastService();

// Export both the class and instance
export { ToastService };
export default toastService;
