import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/Landing.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('../views/role/Roles.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/user/Users.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/category/Categories.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/product/Products.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stock-transactions',
    name: 'StockTransactions',
    component: () => import('../views/transaction/StockTransactions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/audits',
    name: 'Audits',
    component: () => import('../views/audit/Audits.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/excel-tasks',
    name: 'ExcelTasks',
    component: () => import('../views/excel/ExcelTasks.vue'),
    meta: { requiresAuth: true }
  },
  // Catch-all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isLoggedIn.value) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && authStore.isLoggedIn.value) {
    return { name: 'Dashboard' }
  }
  if (to.meta.adminOnly && !authStore.isAdmin.value) {
    return { name: 'Dashboard' }
  }
})

export default router
