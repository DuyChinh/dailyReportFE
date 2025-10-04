<template>
  <div v-if="totalPages > 1" class="pagination">
    <button 
      class="pagination-btn" 
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      Previous
    </button>
    
    <div class="pagination-pages">
      <button
        v-for="page in visiblePageNumbers"
        :key="page"
        class="pagination-page"
        :class="{ active: page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
    </div>
    
    <button 
      class="pagination-btn" 
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  
  computed: {
    visiblePageNumbers() {
      const delta = 2;
      const pages = [];
      
      // Always show first page
      pages.push(1);
      
      // Calculate visible page numbers
      let left = Math.max(2, this.currentPage - delta);
      let right = Math.min(this.totalPages - 1, this.currentPage + delta);
      
      // Add ellipsis if needed for left side
      if (left > 2) {
        pages.push('...');
      }
      
      // Add central pages
      for (let i = left; i <= right; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed for right side
      if (right < this.totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page if it's not the first page
      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
      
      return pages;
    }
  },
  
  methods: {
    changePage(page) {
      if (page !== '...' && page !== this.currentPage) {
        this.$emit('page-changed', page);
      }
    }
  },
  
  emits: ['page-changed']
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 10px;
}

.pagination-pages {
  display: flex;
  gap: 5px;
}

.pagination-btn, .pagination-page {
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  color: #007bff;
}

.pagination-btn:disabled {
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-page.active {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}

.pagination-btn:hover:not(:disabled),
.pagination-page:hover:not(.active) {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}
</style>
