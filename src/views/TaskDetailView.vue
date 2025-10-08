<template>
  <div class="task-detail-view">
    <div class="container">
      <div class="header">
        <div class="title-group">
          <h1 class="title">
            <i class="fas fa-tasks"></i>
            {{ task?.title || 'Task Detail' }}
          </h1>
          <div class="subtitle" v-if="task?.description" v-html="formatDescription(task.description)"></div>
        </div>

        <div class="actions">
          <router-link to="/tasks" class="btn btn-outline">
            <i class="fas fa-arrow-left"></i>
            Back to Tasks
          </router-link>
          <button v-if="isAdmin" class="btn btn-primary" @click="toggleEdit">
            <i class="fas fa-edit"></i>
            {{ editing ? 'Cancel' : 'Edit' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading task...</p>
      </div>

      <div v-else-if="!task" class="empty">
        <i class="fas fa-exclamation-circle"></i>
        <p>Task not found</p>
      </div>

      <div v-else class="content-grid">
        <div class="main-card">
          <div class="row">
            <div class="info">
              <div class="meta">
                <span class="badge" :class="`status ${task.status}`">{{ formatStatus(task.status) }}</span>
                <span class="badge priority" :class="task.priority">{{ formatCap(task.priority || 'medium') }}</span>
                <span v-if="task.category" class="chip">
                  <i class="fas fa-tag"></i> {{ formatCap(task.category) }}
                </span>
              </div>

              <ul class="details">
                <li v-if="task.dueDate"><i class="fas fa-calendar"></i> Due: {{ formatDate(task.dueDate) }}</li>
                <li><i class="fas fa-user"></i> Assigned To: {{ task.assignedTo?.name || task.assignedTo || 'Me' }}</li>
                <li v-if="task.assignedBy"><i class="fas fa-user-shield"></i> Assigned By: {{ task.assignedBy?.name || task.assignedBy }}</li>
                <li><i class="fas fa-clock"></i> Created: {{ formatDate(task.createdAt) }}</li>
                <li v-if="task.updatedAt && task.updatedAt !== task.createdAt"><i class="fas fa-history"></i> Updated: {{ formatDate(task.updatedAt) }}</li>
              </ul>
            </div>
          </div>

          <div class="description" v-if="task.description">
            <h3><i class="fas fa-align-left"></i> Description</h3>
            <div class="description-content" v-html="formatDescription(task.description)"></div>
          </div>

          <div v-if="editing" class="edit-panel">
            <h3><i class="fas fa-tools"></i> Update Task</h3>
            <form @submit.prevent="save">
              <div class="form-row">
                <label>Title</label>
                <input v-model="form.title" type="text" required />
              </div>
              <div class="form-row">
                <label>Description</label>
                <textarea v-model="form.description" rows="6" class="description-textarea" placeholder="Enter task description with line breaks..." />
              </div>
              <div class="form-row grid">
                <div>
                  <label>Status</label>
                  <select v-model="form.status">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label>Priority</label>
                  <select v-model="form.priority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <label>Due Date</label>
                <input v-model="form.dueDate" type="date" />
              </div>
              <div class="actions-row">
                <button type="submit" class="btn btn-success">
                  <i class="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import moment from 'moment';
import toastService from '../services/toastService';

export default {
  name: 'TaskDetailView',
  computed: {
    ...mapGetters('tasks', ['currentTask', 'loading']),
    ...mapGetters('auth', ['isAdmin']),
    task() { return this.currentTask; }
  },
  data() {
    return {
      editing: false,
      form: {
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
      }
    };
  },
  async created() {
    const id = this.$route.params.id;
    try {
      const data = await this.fetchTaskById(id);
      this.syncForm(data);
    } catch (e) {
      // handled by store error; show toast for UX
      toastService.error('Không thể tải chi tiết task.');
    }
  },
  methods: {
    ...mapActions('tasks', ['fetchTaskById', 'updateTask']),
    toggleEdit() {
      this.editing = !this.editing;
      if (this.editing && this.task) this.syncForm(this.task);
    },
    syncForm(task) {
      this.form = {
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : ''
      };
    },
    formatDate(date) {
      if (!date) return '—';
      return moment(date).format('MMM DD, YYYY');
    },
    formatCap(v) {
      if (!v) return '';
      return String(v).charAt(0).toUpperCase() + String(v).slice(1);
    },
    formatStatus(s) {
      const map = { pending: 'Chờ xử lý', in_progress: 'Đang thực hiện', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
      return map[s] || s;
    },
    formatDescription(description) {
      if (!description) return '';
      // Convert line breaks to <br> tags and preserve formatting
      return description
        .replace(/\n/g, '<br>')
        .replace(/\r\n/g, '<br>')
        .replace(/\r/g, '<br>');
    },
    async save() {
      try {
        const payload = { ...this.form };
        if (!payload.dueDate) delete payload.dueDate;
        const updated = await this.updateTask({ taskId: this.$route.params.id, updateData: payload });
        this.editing = false;
        this.syncForm(updated);
        toastService.success('Cập nhật task thành công!');
      } catch (e) {
        toastService.error('Cập nhật task thất bại.');
      }
    }
  }
};
</script>

<style scoped>
.task-detail-view { min-height: calc(100vh - 70px); background: #f5f7fb; }
.container { max-width: 1000px; margin: 0 auto; padding: 24px 16px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,.08); }
.title { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 28px; color: #2c3e50; }
.subtitle { margin: 6px 0 0 36px; color: #6c757d; }
.actions { display: flex; gap: 10px; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
.btn-outline { background: transparent; color: #667eea; border: 2px solid #667eea; }
.btn-outline:hover { background: #667eea; color: #fff; }
.btn-primary { background: #667eea; color: #fff; }
.btn-primary:hover { background: #5a6fd8; }
.btn-success { background: #28a745; color: #fff; }
.loading, .empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 0; color: #6c757d; }
.spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg);} }
.content-grid { margin-top: 20px; }
.main-card { background: #fff; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,.08); padding: 20px; }
.meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 12px; }
.badge { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.badge.status.pending { background: #fff3cd; color: #7a5a00; }
.badge.status.in_progress { background: #dbeafe; color: #1e40af; }
.badge.status.completed { background: #d1fae5; color: #065f46; }
.badge.status.cancelled { background: #f3f4f6; color: #374151; }
.badge.priority.low { background: #eafff3; color: #0f7a45; }
.badge.priority.medium { background: #eef2ff; color: #4338ca; }
.badge.priority.high { background: #fee2e2; color: #991b1b; }
.badge.priority.urgent { background: #fecaca; color: #7f1d1d; }
.chip { background: #f0f4ff; color: #4158a6; padding: 4px 8px; border-radius: 8px; font-weight: 600; }
.details { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 8px; }
.details li { display: flex; align-items: center; gap: 8px; color: #6c757d; font-size: 14px; }
.description { margin-top: 20px; }
.description h3 { margin: 0 0 8px 0; font-size: 16px; color: #2c3e50; }
.description-content { margin: 0; color: #495057; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; min-height: 20px; }
.subtitle { margin: 6px 0 0 36px; color: #6c757d; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; }
.edit-panel { margin-top: 24px; padding-top: 16px; border-top: 1px solid #edf2f7; }
.form-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.form-row.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
input, select, textarea { border: 2px solid #e9ecef; border-radius: 8px; padding: 10px 12px; font-size: 14px; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }
.actions-row { display: flex; gap: 10px; justify-content: flex-end; }
@media (max-width: 768px) {
  .header { flex-direction: column; align-items: stretch; }
  .subtitle { margin-left: 0; }
  .actions { justify-content: flex-end; }
}
</style>


