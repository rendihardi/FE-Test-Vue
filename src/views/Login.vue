<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useToast } from '../composables/useToast'
import api from '../utils/api'
import BrandLogo from '../components/BrandLogo.vue'
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { addToast } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = ref({})
const showPassword = ref(false)

onMounted(() => {
  if (route.query.message === 'session_expired') {
    addToast('Your session has expired. Please log in again.', 'warning')
  }
})

const handleLogin = async () => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = 'Email is required'
  }
  if (!password.value) {
    errors.value.password = 'Password is required'
  }
  if (Object.keys(errors.value).length > 0) return

  isLoading.value = true
  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    })

    const responseData = response.data
    if (responseData.success) {
      const user = responseData.data.user
      const token = responseData.data.access_token

      authStore.setUser(user, token)
      addToast('Welcome back! Login successful.', 'success')
      
      const redirectTo = route.query.redirect || '/dashboard'
      router.push(redirectTo)
    } else {
      addToast(responseData.message || 'Login failed', 'error')
    }
  } catch (error) {
    console.error(error)
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors || { general: error.response.data.message }
      addToast('Validation error. Please verify input data.', 'error')
    } else if (error.response && error.response.status === 401) {
      addToast('Invalid email or password combination.', 'error')
    } else {
      addToast(error.message || 'An error occurred during login.', 'error')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex" style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;">

    <!-- Left: Branding Panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full"></div>
      <div class="absolute bottom-0 -left-12 w-56 h-56 bg-white/5 rounded-full"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>

      <!-- Top brand -->
      <div class="relative z-10">
        <BrandLogo size="md" :white="true" />
      </div>

      <!-- Centered content -->
      <div class="relative z-10 space-y-6">
        <h1 class="text-4xl font-black text-white leading-snug">
          Your complete<br />inventory command<br />center.
        </h1>
        <p class="text-blue-100 text-base leading-relaxed max-w-sm">
          Track stock, manage products, run bulk Excel operations, and keep a full audit trail — all from one dashboard.
        </p>

        <!-- Feature list -->
        <div class="space-y-3 pt-2">
          <div v-for="item in [
            'Real-time stock tracking',
            'Full audit log with diff viewer',
            'Background Excel import/export',
            'Role-based access control'
          ]" :key="item" class="flex items-center gap-3 text-sm text-blue-100">
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- Bottom note -->
      <p class="relative z-10 text-xs text-blue-200">&copy; 2026 Inventory System. All rights reserved.</p>
    </div>

    <!-- Right: Login Form Panel -->
    <div class="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">

      <!-- Back link (mobile only or always visible) -->
      <div class="w-full max-w-sm mb-8 lg:mb-6">
        <router-link 
          to="/" 
          class="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </router-link>
      </div>

      <div class="w-full max-w-sm space-y-8">
        <!-- Mobile brand (only shown on small screens) -->
        <div class="lg:hidden text-center">
          <BrandLogo size="md" class="justify-center mb-2" />
        </div>

        <!-- Heading -->
        <div class="space-y-1">
          <h2 class="text-2xl font-black text-slate-900">Sign in to your account</h2>
          <p class="text-sm text-slate-500">Enter your credentials to access the dashboard.</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <form class="space-y-5" @submit.prevent="handleLogin">

            <!-- Email Input -->
            <div>
              <label for="email" class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail class="w-4 h-4" />
                </div>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="you@example.com"
                  :class="[
                    'block w-full pl-10 pr-3 py-2.5 border rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none transition-all bg-white',
                    errors.email 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400'
                  ]"
                />
              </div>
              <p v-if="errors.email" class="mt-1.5 text-xs text-red-500 font-medium">{{ errors.email }}</p>
            </div>

            <!-- Password Input -->
            <div>
              <label for="password" class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  placeholder="••••••••"
                  :class="[
                    'block w-full pl-10 pr-10 py-2.5 border rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none transition-all bg-white',
                    errors.password 
                      ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400'
                  ]"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="errors.password" class="mt-1.5 text-xs text-red-500 font-medium">{{ errors.password }}</p>
            </div>

            <!-- General error -->
            <div v-if="errors.general" class="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center font-medium">
              {{ errors.general }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
              <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
            </button>
          </form>
        </div>

        <!-- Footer note -->
        <p class="text-center text-xs text-slate-400">
          Having trouble? Contact your system administrator.
        </p>
      </div>
    </div>
  </div>
</template>
