<template>
  <div class="report-filters">
    <h4>Filter Reports</h4>
    
    <form @submit.prevent="applyFilters">
      <div class="filters-grid">
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="filters.status" class="form-control">
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="filters.category" class="form-control">
            <option value="">All</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="project">Project</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="form-group date-range">
          <label>Date Range</label>
          <div class="date-inputs">
            <div class="date-field">
              <label for="startDate" class="sub-label">From</label>
              <input
                type="date"
                id="startDate"
                v-model="filters.startDate"
                class="form-control"
              />
            </div>
            <div class="date-field">
              <label for="endDate" class="sub-label">To</label>
              <input
                type="date"
                id="endDate"
                v-model="filters.endDate"
                class="form-control"
              />
            </div>
          </div>
        </div>
        
        <div class="form-group search-group">
          <label for="search">Search</label>
          <input
            type="text"
            id="search"
            v-model="filters.search"
            placeholder="Search in title or content..."
            class="form-control"
          />
        </div>
      </div>
      
      <div class="filter-actions">
        <button type="button" class="btn btn-secondary" @click="resetFilters">
          Show Today Only
        </button>
        <button type="submit" class="btn btn-primary">
          Apply Filters
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ReportFilters',
  
  props: {
    initialFilters: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      filters: {
        status: '',
        category: '',
        startDate: this.getTodayDate(),
        endDate: this.getTodayDate(),
        search: ''
      }
    };
  },
  
  created() {
    // Initialize filters with props or defaults
    if (this.initialFilters) {
      this.filters = { ...this.filters, ...this.initialFilters };
    }
  },
  
  methods: {
    applyFilters() {
      this.$emit('filter-applied', { ...this.filters });
    },
    
    resetFilters() {
      this.filters = {
        status: '',
        category: '',
        startDate: this.getTodayDate(),
        endDate: this.getTodayDate(),
        search: ''
      };
      
      this.$emit('filter-applied', { ...this.filters });
    },
    
    getTodayDate() {
      return new Date().toISOString().split('T')[0];
    }
  },
  
  emits: ['filter-applied']
};
</script>

<style scoped>
.report-filters {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.report-filters h4 {
  color: #212529;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.date-range {
  grid-column: span 2;
}

.date-inputs {
  display: flex;
  gap: 10px;
}

.date-field {
  flex: 1;
}

.sub-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 3px;
}

.search-group {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .date-range {
    grid-column: auto;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
