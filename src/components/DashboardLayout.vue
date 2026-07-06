<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import api from '../utils/api'
import DashboardHeader from './DashboardHeader.vue'
import BrandLogo from './BrandLogo.vue'
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  History,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  LogOut,
  X,
  User as UserIcon,
  Clock,
  FileText
} from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isSidebarOpen = ref(true)

const user = computed(() => authStore.state.user || { name: 'User', email: '', roles: [] })
const userRole = computed(() => {
  if (user.value.roles && user.value.roles.length > 0) {
    const firstRole = user.value.roles[0]
    return typeof firstRole === 'string' ? firstRole : (firstRole.name || 'No Role')
  }
  return 'No Role'
})

const isAdmin = computed(() => authStore.isAdmin.value)

const menuItems = computed(() => {
  const items = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      to: { path: '/dashboard' }
    },
    {
      header: 'Catalog Management'
    },
    {
      title: 'Categories',
      icon: FolderTree,
      to: { path: '/categories' }
    },
    {
      title: 'Products',
      icon: Package,
      to: { path: '/products' }
    },
    {
      header: 'Inventory Management'
    },
    {
      title: 'Stock In',
      icon: ArrowDownRight,
      to: { path: '/stock-transactions', query: { tab: 'stock-in' } }
    },
    {
      title: 'Stock Out',
      icon: ArrowUpRight,
      to: { path: '/stock-transactions', query: { tab: 'stock-out' } }
    },
    {
      title: 'Stock Adjustment',
      icon: SlidersHorizontal,
      to: { path: '/stock-transactions', query: { tab: 'adjust' } }
    },
    {
      title: 'Transaction History',
      icon: History,
      to: { path: '/stock-transactions', query: { tab: 'history' } }
    },
    {
      header: 'Access Control'
    }
  ]

  if (isAdmin.value) {
    items.push({
      title: 'Users',
      icon: Users,
      to: { path: '/users' }
    })
  }

  items.push({
    title: 'Roles',
    icon: ShieldCheck,
    to: { path: '/roles' }
  })

  // Add Audits sub-sections matching Design.md
  // if (isAdmin.value) {
    items.push({
      header: 'System Logs'
    })
    items.push({
      title: 'Product Audit Logs',
      icon: FileText,
      to: { path: '/audits', query: { type: 'product' } }
    })
    items.push({
      title: 'Category Audit Logs',
      icon: FileText,
      to: { path: '/audits', query: { type: 'category' } }
    })
    items.push({
      title: 'User Audit Logs',
      icon: FileText,
      to: { path: '/audits', query: { type: 'user' } }
    })
    items.push({
      title: 'Role Audit Logs',
      icon: FileText,
      to: { path: '/audits', query: { type: 'role' } }
    })
  // }

  items.push({
    header: 'System Tools'
  })

  items.push({
    title: 'Excel Jobs',
    icon: FileSpreadsheet,
    to: { path: '/excel-tasks' }
  })

  return items
})

const isItemActive = (item) => {
  if (!item.to) return false
  
  const pathMatches = route.path === item.to.path
  
  if (!pathMatches) return false
  
  // If item specifies query parameters, they must match
  if (item.to.query) {
    const keys = Object.keys(item.to.query)
    return keys.every(key => route.query[key] === item.to.query[key])
  }
  
  // If item doesn't specify queries but the current route has query parameters, 
  // we count it as active only if it is a general page without query requirements
  return Object.keys(route.query).length === 0
}

const currentTitle = computed(() => {
  if (route.path === '/dashboard') return 'Dashboard Overview'
  if (route.path === '/categories') return 'Product Categories'
  if (route.path === '/products') return 'Product Catalog'
  if (route.path === '/roles') return 'Role Management'
  if (route.path === '/users') return 'User Accounts'
  if (route.path === '/excel-tasks') return 'Excel Import/Export Center'
  
  if (route.path === '/stock-transactions') {
    const tab = route.query.tab
    if (tab === 'stock-in') return 'Inventory Stock In'
    if (tab === 'stock-out') return 'Inventory Stock Out'
    if (tab === 'adjust') return 'Inventory Stock Adjustment'
    return 'Stock Transaction History'
  }
  
  if (route.path === '/audits') {
    const type = route.query.type
    if (type === 'product') return 'Product Audit Logs'
    if (type === 'category') return 'Category Audit Logs'
    if (type === 'user') return 'User Audit Logs'
    if (type === 'role') return 'Role Audit Logs'
    return 'System Audit Logs'
  }
  
  return 'Management System'
})

const handleLogout = async () => {
  try {
    await api.post('/logout')
  } catch (error) {
    console.error('Logout request failed', error)
  } finally {
    authStore.clearAuth()
    router.push('/login')
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex text-slate-800">
    <!-- Sidebar Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 md:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Left Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 bg-white border-r border-slate-200 text-slate-700 z-30 flex flex-col justify-between transition-all duration-300 w-64 md:sticky',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
      ]"
    >
      <div>
        <!-- Sidebar Header / Brand Logo -->
        <div class="h-16 flex items-center px-5 border-b border-slate-200 justify-between bg-white">
          <BrandLogo size="sm" :showText="isSidebarOpen" />
          <!-- Close button for mobile -->
          <button @click="toggleSidebar" class="p-1.5 rounded-lg hover:bg-slate-100 md:hidden text-slate-400">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin">
          <template v-for="(item, index) in menuItems" :key="index">
            <!-- Header items -->
            <div v-if="item.header" class="pt-4 pb-1">
              <span v-if="isSidebarOpen" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">
                {{ item.header }}
              </span>
              <div v-else class="h-px bg-slate-200 my-2 mx-2"></div>
            </div>

            <!-- Link items -->
            <router-link
              v-else
              :to="item.to"
              class="w-full"
            >
              <span
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                  isItemActive(item) 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                ]"
              >
                <component :is="item.icon" class="w-4.5 h-4.5 shrink-0" />
                <span v-if="isSidebarOpen" class="whitespace-nowrap transition-opacity duration-200">
                  {{ item.title }}
                </span>
                
                <!-- Mini tooltip when sidebar collapsed -->
                <span 
                  v-if="!isSidebarOpen" 
                  class="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-lg border border-slate-800 z-50"
                >
                  {{ item.title }}
                </span>
              </span>
            </router-link>
          </template>
        </nav>
      </div>

      <!-- Sidebar Footer (User / Logout) -->
      <div class="p-4 bg-slate-50 border-t border-slate-200">
        <!-- User Info collapsed -->
        <div v-if="!isSidebarOpen" class="flex flex-col items-center gap-3 py-2">
          <div class="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
            <UserIcon class="w-4 h-4" />
          </div>
          <button 
            @click="handleLogout" 
            class="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors"
            title="Log Out"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>

        <!-- User Info open -->
        <div v-else class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <UserIcon class="w-4.5 h-4.5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ user.name }}</p>
              <p class="text-xs text-slate-400 truncate">{{ userRole }}</p>
            </div>
          </div>
          
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-100 transition-all duration-150 cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>


    <!-- Main Content wrapper -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Top Navigation Bar -->
      <DashboardHeader :title="currentTitle" @toggle-sidebar="toggleSidebar" />

      <!-- Main Page Content -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
        <slot />
      </main>
    </div>
  </div>
</template>
