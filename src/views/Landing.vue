<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import BrandLogo from '../components/BrandLogo.vue'
import { 
  ShieldCheck, 
  Package, 
  ArrowUpDown, 
  FileSpreadsheet, 
  ArrowRight,
  TrendingUp,
  Cpu
} from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn.value)

const navigateToApp = () => {
  if (isLoggedIn.value) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
    <!-- Top Header -->
    <header class="h-20 max-w-7xl w-full mx-auto px-6 md:px-8 flex items-center justify-between">
      <BrandLogo size="md" :gradientText="true" />
      
      <button 
        @click="navigateToApp"
        class="px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-150 cursor-pointer"
      >
        {{ isLoggedIn ? 'Enter Dashboard' : 'Sign In' }}
      </button>
    </header>

    <!-- Hero Content -->
    <main class="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-6 md:px-8 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <!-- Hero Text -->
        <div class="lg:col-span-7 space-y-8 text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu class="w-3.5 h-3.5" />
            <span>Enterprise Inventory System v2.0</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            Next-Gen Inventory <br />
            <span class="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Control & Auditing
            </span>
          </h1>

          <p class="text-lg text-slate-400 leading-relaxed max-w-xl">
            A secure, role-restricted dashboard designed for managing enterprise inventory catalogs, tracking stock transactional history with complete audit trails, and executing high-throughput background imports and exports.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="navigateToApp"
              class="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
            >
              <span>{{ isLoggedIn ? 'Launch Workspace' : 'Get Started Now' }}</span>
              <ArrowRight class="w-5 h-5" />
            </button>
            
            <a
              href="#features"
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-base transition-all duration-150 hover:-translate-y-0.5"
            >
              Explore Features
            </a>
          </div>

          <!-- Mini stats preview -->
          <div class="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 max-w-md">
            <div>
              <p class="text-2xl font-bold text-white">99.99%</p>
              <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Reliability</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">&lt; 150ms</p>
              <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">API Latency</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-emerald-400">Queue</p>
              <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Background Jobs</p>
            </div>
          </div>
        </div>

        <!-- Right Side Glassmorphic Preview Card -->
        <div class="lg:col-span-5 relative">
          <!-- Ambient lighting effect -->
          <div class="absolute -inset-4 rounded-3xl bg-blue-500/10 blur-3xl -z-10"></div>
          
          <div class="bg-slate-950/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <span class="text-sm font-semibold text-slate-400">System Activity</span>
              <span class="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Live Feed</span>
              </span>
            </div>

            <!-- Fake transactions mock -->
            <div class="space-y-4">
              <div class="flex items-center justify-between text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span class="font-medium text-slate-300">TRX-7809 (Stock In)</span>
                </div>
                <span class="text-slate-500">Just now</span>
              </div>
              <div class="flex items-center justify-between text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span class="font-medium text-slate-300">TRX-7808 (Adjustment)</span>
                </div>
                <span class="text-slate-500">3 mins ago</span>
              </div>
              <div class="flex items-center justify-between text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span class="font-medium text-slate-300">TRX-7807 (Stock Out)</span>
                </div>
                <span class="text-slate-500">12 mins ago</span>
              </div>
            </div>

            <!-- Custom visual badge -->
            <div class="flex items-center gap-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-900/40 p-4 rounded-xl">
              <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                <TrendingUp class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-white">Dynamic Analytics</p>
                <p class="text-xs text-slate-400">Database queued report generation triggers automatic downloads.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Features Section -->
    <section id="features" class="border-t border-slate-800 bg-slate-950/30 py-20 px-6 md:px-8">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="text-center max-w-xl mx-auto space-y-3">
          <h2 class="text-2xl sm:text-3xl font-bold text-white">Full-Featured Inventory Platform</h2>
          <p class="text-slate-400 text-sm sm:text-base">Built to handle complex enterprise auditing and strict transactional operations.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Card 1 -->
          <div class="bg-slate-900/50 border border-slate-800/60 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div class="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-white">Role-Based Access</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Granular gatekeeping that restricts admin portals (user CRUD & logs) to specific authenticated administrators.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="bg-slate-900/50 border border-slate-800/60 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div class="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-400">
              <Package class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-white">Catalog Tracking</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Upload specification PDFs, manage dynamic JSON attributes, organize categories, and perform strict size validation.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="bg-slate-900/50 border border-slate-800/60 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div class="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400">
              <ArrowUpDown class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-white">Audit Trails</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Every detail is logged. Data snapshots preserve records immutably, protecting history from subsequent parent modifications.
            </p>
          </div>

          <!-- Card 4 -->
          <div class="bg-slate-900/50 border border-slate-800/60 p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
            <div class="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-purple-400">
              <FileSpreadsheet class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-semibold text-white">Queued Excel Ops</h3>
            <p class="text-sm text-slate-400 leading-relaxed">
              Export and import hundreds of records with dynamic column selection via a background database queue worker.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="h-16 border-t border-slate-850 px-6 md:px-8 flex items-center justify-between text-xs text-slate-500 max-w-7xl w-full mx-auto shrink-0">
      <p>&copy; 2026 Inventory System. All rights reserved.</p>
      <div class="flex gap-4">
        <span class="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
        <span class="hover:text-slate-400 cursor-pointer">Terms of Service</span>
      </div>
    </footer>
  </div>
</template>
