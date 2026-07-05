<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useToast } from '../composables/useToast'
import api from '../utils/api'
import BrandLogo from '../components/BrandLogo.vue'
import { Mail, Lock, Loader2, ArrowLeft } from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { addToast } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = ref({})

onMounted(() => {
  if (route.query.message === 'session_expired') {
    addToast('Your session has expired. Please log in again.', 'warning')
  }
})

const handleLogin = async () => {
  errors.value = {}
  
  // Basic validation
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
      
      // Redirect
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
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background glow elements -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative px-6 sm:px-0">
      <!-- Back button -->
      <router-link 
        to="/" 
        class="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Return to Landing Page</span>
      </router-link>

      <BrandLogo size="md" class="justify-center mb-6" />
      
      <h2 class="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-slate-400">
        Enter credentials to access your inventory desk
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl shadow-xl space-y-6">
        <form class="space-y-5" @submit.prevent="handleLogin">
          
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div class="relative rounded-lg shadow-xs">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                  'block w-full pl-10 pr-3 py-3 bg-slate-950 border rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none transition-all',
                  errors.email ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                ]"
              />
            </div>
            <p v-if="errors.email" class="mt-1.5 text-xs text-rose-500">{{ errors.email }}</p>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div class="relative rounded-lg shadow-xs">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock class="w-4 h-4" />
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                :class="[
                  'block w-full pl-10 pr-3 py-3 bg-slate-950 border rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none transition-all',
                  errors.password ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                ]"
              />
            </div>
            <p v-if="errors.password" class="mt-1.5 text-xs text-rose-500">{{ errors.password }}</p>
          </div>

          <!-- General error alert -->
          <div v-if="errors.general" class="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg text-center font-medium">
            {{ errors.general }}
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin mr-2" />
              <span>{{ isLoading ? 'Authenticating...' : 'Sign In' }}</span>
            </button>
          </div>
        </form>

        <!-- Demo accounts cheat sheet -->
        <!-- <div class="pt-4 border-t border-slate-800/80">
          <p class="text-xs font-semibold text-slate-400 mb-2.5">Demo Account Credentials:</p>
          <div class="space-y-2 text-[11px] text-slate-500 font-mono">
            <div class="flex justify-between bg-slate-950/40 p-2 rounded border border-slate-850">
              <div>
                <span class="text-slate-400 font-semibold">Admin:</span> admin@gmail.com
              </div>
              <span class="text-slate-400">konfirmasi</span>
            </div>
            <div class="flex justify-between bg-slate-950/40 p-2 rounded border border-slate-850">
              <div>
                <span class="text-slate-400 font-semibold">Staff:</span> staf@gmail.com
              </div>
              <span class="text-slate-400">konfirmasi</span>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>
