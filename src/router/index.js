import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/ReportsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/create',
    name: 'create-report',
    component: () => import('../views/CreateReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/:id',
    name: 'report-detail',
    component: () => import('../views/ReportDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/:id/edit',
    name: 'edit-report',
    component: () => import('../views/EditReportView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('../views/TasksView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Wait for any pending Vuex actions to complete
  await Promise.resolve();
  
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const isAdmin = store.getters['auth/isAdmin'];

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    next('/dashboard');
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
