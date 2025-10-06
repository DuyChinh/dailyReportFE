import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

function isUserAdmin() {
  try {
    // First, check the dedicated isAdmin flag
    if (localStorage.getItem('isAdmin') === 'true') {
      console.log('Router guard: User is admin (from isAdmin flag)');
      return true;
    }
    
    // Otherwise, check from the user object
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('Router guard: No user in localStorage');
      return false;
    }
    
    const user = JSON.parse(userStr);
    console.log('Router guard: User from localStorage:', user);
    
    // Check different possible structures
    let role;
    if (user.user && user.user.role) {
      role = user.user.role;
    } else if (user.role) {
      role = user.role;
    }
    
    console.log('Router guard: Role found:', role);
    
    if (role === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Router guard: Error checking admin status', e);
    return false;
  }
}

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
    path: '/tasks/:id',
    name: 'task-detail',
    component: () => import('../views/TaskDetailView.vue'),
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
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !isUserAdmin()) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
