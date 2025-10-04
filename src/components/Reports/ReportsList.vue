<template>
  <div class="reports-list">
    <div v-if="!reports || reports.length === 0" class="no-reports">
      No reports to display
    </div>
    
    <div v-else class="reports-grid">
      <report-card
        v-for="report in displayedReports"
        :key="report._id"
        :report="report"
        @delete="$emit('delete-report', report._id)"
      />
    </div>
  </div>
</template>

<script>
import ReportCard from './ReportCard.vue';

export default {
  name: 'ReportsList',
  
  components: {
    ReportCard
  },
  
  props: {
    reports: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: null
    }
  },
  
  computed: {
    displayedReports() {
      if (!this.reports) return [];
      
      // Add author name directly to report object for easier display
      const processedReports = this.reports.map(report => {
        if (!report) return null;
        
        let authorName = 'Unknown Author';
        
        if (report.author) {
          if (typeof report.author === 'object' && report.author.name) {
            authorName = report.author.name;
          } else {
            authorName = `User #${report.author}`;
          }
        }
        
        return {
          ...report,
          authorName
        };
      }).filter(r => r !== null);
      
      if (this.limit && processedReports.length > this.limit) {
        return processedReports.slice(0, this.limit);
      }
      return processedReports;
    }
  },
  
  emits: ['delete-report']
};
</script>

<style scoped>
.reports-list {
  margin: 20px 0;
}

.no-reports {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #6c757d;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}

/* Additional styles for empty state */
.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.empty-icon i {
  font-size: 32px;
  color: white;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.empty-state p {
  font-size: 1rem;
  margin: 0 0 25px 0;
  max-width: 400px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .empty-state {
    padding: 40px 15px;
  }
  
  .empty-icon {
    width: 60px;
    height: 60px;
  }
  
  .empty-icon i {
    font-size: 24px;
  }
}
</style>
