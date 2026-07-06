import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  // Public routes (no layout)
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

  // Dashboard routes — all share one persistent AppLayout (DashboardLayout mounted ONCE)
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('../views/role/Roles.vue'),
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/user/Users.vue'),
        meta: { adminOnly: true }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/category/Categories.vue'),
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/product/Products.vue'),
      },
      {
        path: 'stock-transactions',
        name: 'StockTransactions',
        component: () => import('../views/transaction/StockTransactions.vue'),
      },
      {
        path: 'audits',
        name: 'Audits',
        component: () => import('../views/audit/Audits.vue'),
      },
      {
        path: 'excel-tasks',
        name: 'ExcelTasks',
        component: () => import('../views/excel/ExcelTasks.vue'),
      },
    ]
  },

  // Catch-all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll behavior handled by DashboardLayout's main content area
  scrollBehavior: () => false
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Check auth for parent layout route and individual children
  const requiresAuth = to.matched.some(r => r.meta?.requiresAuth)
  const guestOnly = to.matched.some(r => r.meta?.guestOnly)
  const adminOnly = to.matched.some(r => r.meta?.adminOnly)

  if (requiresAuth && !authStore.isLoggedIn.value) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (guestOnly && authStore.isLoggedIn.value) {
    return { name: 'Dashboard' }
  }
  if (adminOnly && !authStore.isAdmin.value) {
    return { name: 'Dashboard' }
  }
})

export default router
