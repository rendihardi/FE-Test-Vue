<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import BrandLogo from '../components/BrandLogo.vue'
import { 
  ShieldCheck, 
  Package, 
  BarChart3, 
  FileSpreadsheet, 
  ArrowRight,
  CheckCircle2,
  Users,
  ClipboardList
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

const features = [
  {
    icon: ShieldCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Role-Based Access',
    desc: 'Granular permission control that restricts admin portals to specific authenticated administrators.'
  },
  {
    icon: Package,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    title: 'Product Catalog',
    desc: 'Manage products with images, spec PDFs, dynamic attributes, and full category organization.'
  },
  {
    icon: BarChart3,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    title: 'Audit Trails',
    desc: 'Every change is logged. Know who changed what and when, with complete before-after diff views.'
  },
  {
    icon: FileSpreadsheet,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: 'Excel Import/Export',
    desc: 'Export and import hundreds of records with dynamic column selection via background queue jobs.'
  }
]
</script>

<template>
  <div class="min-h-screen bg-white text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white" style="font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;">

    <!-- Navigation Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-6xl w-full mx-auto px-6 h-16 flex items-center justify-between">
        <BrandLogo size="md" />
        <button 
          @click="navigateToApp"
          class="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150 cursor-pointer shadow-sm"
        >
          {{ isLoggedIn ? 'Go to Dashboard' : 'Sign In' }}
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-1">
      <section class="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <!-- Left: Text Content -->
          <div class="space-y-7 text-left">
            <!-- Eyebrow badge -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Inventory Management System</span>
            </div>

            <!-- Headline -->
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
              Manage your stock,<br />
              <span class="text-blue-600">track every move.</span>
            </h1>

            <!-- Sub-headline -->
            <p class="text-base sm:text-lg text-slate-500 leading-relaxed">
              A complete inventory platform for managing products, monitoring stock transactions, generating audit trails, and running bulk Excel operations — all in one place.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="navigateToApp"
                class="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-200 transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
              >
                <span>{{ isLoggedIn ? 'Launch Dashboard' : 'Get Started' }}</span>
                <ArrowRight class="w-4 h-4" />
              </button>
              <a
                href="#features"
                class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all duration-150 hover:-translate-y-0.5"
              >
                See Features
              </a>
            </div>
          </div>

          <!-- Right: Dashboard Preview Card -->
          <div class="relative">
            <div class="absolute -inset-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl -z-10"></div>

            <div class="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 overflow-hidden">
              <!-- Fake browser chrome -->
              <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <div class="flex-1 mx-3 bg-white border border-slate-200 rounded-md px-3 py-1 text-[10px] text-slate-400 font-mono text-left">
                  inventory.app/dashboard
                </div>
              </div>

              <!-- Preview Content -->
              <div class="p-5 space-y-4 text-left">
                <!-- Stats row -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p class="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mb-1">Products</p>
                    <p class="text-2xl font-black text-blue-700">248</p>
                    <p class="text-[10px] text-blue-400 mt-0.5">+12 this week</p>
                  </div>
                  <div class="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <p class="text-[10px] text-emerald-500 font-semibold uppercase tracking-wide mb-1">Stock In</p>
                    <p class="text-2xl font-black text-emerald-700">1,480</p>
                    <p class="text-[10px] text-emerald-400 mt-0.5">units today</p>
                  </div>
                  <div class="bg-violet-50 rounded-xl p-3 border border-violet-100">
                    <p class="text-[10px] text-violet-500 font-semibold uppercase tracking-wide mb-1">Audits</p>
                    <p class="text-2xl font-black text-violet-700">63</p>
                    <p class="text-[10px] text-violet-400 mt-0.5">last 7 days</p>
                  </div>
                </div>

                <!-- Transaction table preview -->
                <div class="rounded-xl border border-slate-200 overflow-hidden">
                  <div class="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-600">Recent Transactions</span>
                    <span class="text-[10px] text-slate-400">Live</span>
                  </div>
                  <div class="divide-y divide-slate-100">
                    <div v-for="tx in [
                      { code: 'TRX-IN-20260706-0041', product: 'Logitech Wireless Mouse', type: 'IN', qty: 50, color: 'bg-emerald-100 text-emerald-700' },
                      { code: 'TRX-OUT-20260706-0040', product: 'Ergonomic Office Chair', type: 'OUT', qty: 3, color: 'bg-rose-100 text-rose-700' },
                      { code: 'TRX-ADJ-20260706-0039', product: 'Mechanical Keyboard RGB', type: 'ADJ', qty: 15, color: 'bg-amber-100 text-amber-700' },
                    ]" :key="tx.code" class="px-4 py-2.5 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-3">
                      <span :class="[tx.color, 'px-2 py-0.5 rounded font-bold text-[10px] uppercase']">{{ tx.type }}</span>
                      <div>
                        <p class="font-semibold text-slate-700">{{ tx.product }}</p>
                        <p class="font-mono text-[10px] text-slate-400">{{ tx.code }}</p>
                      </div>
                    </div>
                    <span class="font-bold text-slate-700">{{ tx.qty }} units</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div><!-- end grid -->
      </section>

      <!-- Social Proof / Checkmarks -->
      <section class="border-y border-slate-100 bg-slate-50 py-10 px-6">
        <div class="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-4">
          <div v-for="item in ['Full audit trail logging', 'Role-based access control', 'Background Excel export/import', 'Real-time stock tracking', 'Soft-delete & restoration']" :key="item"
            class="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <CheckCircle2 class="w-4 h-4 text-blue-500 shrink-0" />
            <span>{{ item }}</span>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="max-w-6xl mx-auto px-6 py-24">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Everything you need to manage inventory</h2>
          <p class="text-slate-500 text-base max-w-xl mx-auto">Built for warehouses and operations teams who need precision, traceability, and efficiency.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="f in features" :key="f.title"
            class="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-150 space-y-4 text-left"
          >
            <div :class="[f.bg, 'w-11 h-11 rounded-xl flex items-center justify-center']">
              <component :is="f.icon" :class="[f.color, 'w-5 h-5']" />
            </div>
            <h3 class="font-bold text-slate-900">{{ f.title }}</h3>
            <p class="text-sm text-slate-500 leading-relaxed">{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <!-- Final CTA Section -->
      <section class="bg-blue-600 py-20 px-6 text-center text-white">
        <div class="max-w-2xl mx-auto space-y-6">
          <h2 class="text-3xl sm:text-4xl font-black">Ready to take control of your inventory?</h2>
          <p class="text-blue-200 text-base">Sign in and start managing your stock, transactions, and team — all from one dashboard.</p>
          <button
            @click="navigateToApp"
            class="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-base transition-all duration-150 cursor-pointer hover:-translate-y-0.5 shadow-lg shadow-blue-800/20"
          >
            <span>{{ isLoggedIn ? 'Go to Dashboard' : 'Sign In Now' }}</span>
            <ArrowRight class="w-5 h-5" />
          </button>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-100 bg-white px-6 py-8">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <BrandLogo size="sm" />
        <p>&copy; 2026 Inventory System. All rights reserved.</p>
        <div class="flex gap-6">
          <span class="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
          <span class="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  </div>
</template>
