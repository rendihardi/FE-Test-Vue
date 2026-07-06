<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { useToast } from '../composables/useToast'
import { formatDateTime, formatPrice } from '../utils/helpers'

import { 
  Package, 
  FolderTree, 
  ArrowUpDown, 
  History, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  FileDown
} from '@lucide/vue'

const { addToast } = ref(useToast())

// Loading states
const isCardsLoading = ref(true)
const isChartLoading = ref(true)
const isPieLoading = ref(true)
const isLowStockLoading = ref(true)
const isRecentLoading = ref(true)

// Data refs
const cardsData = ref({
  total_products: 0,
  total_categories: 0,
  current_stock: 0,
  today_transactions: 0
})
const pieChartData = ref([])
const lowStockData = ref([])
const stockChartData = ref([])
const recentTransactionsData = ref([])

// Color palette for chart slices
const colors = [
  { hex: '#3b82f6', bg: 'bg-blue-500' },
  { hex: '#10b981', bg: 'bg-emerald-500' },
  { hex: '#f59e0b', bg: 'bg-amber-500' },
  { hex: '#8b5cf6', bg: 'bg-purple-500' },
  { hex: '#ec4899', bg: 'bg-pink-500' },
  { hex: '#f97316', bg: 'bg-orange-500' },
  { hex: '#06b6d4', bg: 'bg-cyan-500' },
  { hex: '#14b8a6', bg: 'bg-teal-500' }
]

const hoveredCategory = ref(null)

// Fetch Functions
const fetchCards = async () => {
  isCardsLoading.value = true
  try {
    const res = await api.get('/dashboard/cards')
    if (res.data.success) {
      cardsData.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isCardsLoading.value = false
  }
}

const fetchPieChart = async () => {
  isPieLoading.value = true
  try {
    const res = await api.get('/dashboard/pie-chart')
    if (res.data.success) {
      pieChartData.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isPieLoading.value = false
  }
}

const fetchLowStock = async () => {
  isLowStockLoading.value = true
  try {
    const res = await api.get('/dashboard/low-stock')
    if (res.data.success) {
      lowStockData.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLowStockLoading.value = false
  }
}

const fetchStockChart = async () => {
  isChartLoading.value = true
  try {
    const res = await api.get('/dashboard/stock-chart')
    if (res.data.success) {
      stockChartData.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isChartLoading.value = false
  }
}

const fetchRecentTransactions = async () => {
  isRecentLoading.value = true
  try {
    const res = await api.get('/dashboard/recent-transactions')
    if (res.data.success) {
      recentTransactionsData.value = res.data.data
    }
  } catch (err) {
    console.error(err)
  } finally {
    isRecentLoading.value = false
  }
}

const reloadAll = () => {
  fetchCards()
  fetchPieChart()
  fetchLowStock()
  fetchStockChart()
  fetchRecentTransactions()
  addToast.value.addToast('Dashboard data refreshed.', 'info')
}

onMounted(() => {
  fetchCards()
  fetchPieChart()
  fetchLowStock()
  fetchStockChart()
  fetchRecentTransactions()
})

</script>

<template>
  <div class="space-y-8">
    
    <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">System Statistics</h2>
          <p class="text-sm text-slate-500">Real-time status of products, transaction volume, and operational metrics.</p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button 
            @click="reloadAll"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw class="w-4 h-4" />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Card 1: Total Products -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Package class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
            <div v-if="isCardsLoading" class="h-7 w-16 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            <h3 v-else class="text-2xl font-bold text-slate-900 mt-0.5">{{ cardsData.total_products }}</h3>
          </div>
        </div>

        <!-- Card 2: Total Categories -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FolderTree class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
            <div v-if="isCardsLoading" class="h-7 w-16 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            <h3 v-else class="text-2xl font-bold text-slate-900 mt-0.5">{{ cardsData.total_categories }}</h3>
          </div>
        </div>

        <!-- Card 3: Current Stock -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowUpDown class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stock Count</p>
            <div v-if="isCardsLoading" class="h-7 w-16 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            <h3 v-else class="text-2xl font-bold text-slate-900 mt-0.5">{{ cardsData.current_stock }}</h3>
          </div>
        </div>

        <!-- Card 4: Today Transactions -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-0.5 duration-200">
          <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <History class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Transactions</p>
            <div v-if="isCardsLoading" class="h-7 w-16 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            <h3 v-else class="text-2xl font-bold text-slate-900 mt-0.5">{{ cardsData.today_transactions }}</h3>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Bar Chart (Stock Trends) -->
        <div class="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-slate-800">Stock Movements Trend</h4>
              <p class="text-xs text-slate-400">Comparing total items received (Stock In) vs dispatched (Stock Out)</p>
            </div>
            <span class="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">Last 12 Months</span>
          </div>

          <!-- Loading state -->
          <div v-if="isChartLoading" class="h-64 flex items-center justify-center bg-slate-50/50 rounded-xl mt-6">
            <div class="flex flex-col items-center gap-2">
              <RefreshCw class="w-6 h-6 text-blue-500 animate-spin" />
              <span class="text-xs text-slate-400">Loading stock trends...</span>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="stockChartData.length === 0" class="h-64 flex items-center justify-center text-slate-400 mt-6">
            No stock transactions recorded in the last 12 months.
          </div>

          <!-- SVG Bar Chart -->
          <div v-else class="mt-6 flex-1 flex flex-col">
            <!-- Custom dynamic SVG render -->
            <div class="h-64 w-full relative">
              <svg viewBox="0 0 800 250" class="w-full h-full" preserveAspectRatio="none">
                <!-- Grid Lines -->
                <line x1="40" y1="20" x2="780" y2="20" stroke="#f1f5f9" stroke-width="1" />
                <line x1="40" y1="70" x2="780" y2="70" stroke="#f1f5f9" stroke-width="1" />
                <line x1="40" y1="120" x2="780" y2="120" stroke="#f1f5f9" stroke-width="1" />
                <line x1="40" y1="170" x2="780" y2="170" stroke="#f1f5f9" stroke-width="1" />
                <line x1="40" y1="220" x2="780" y2="220" stroke="#e2e8f0" stroke-width="1.5" />

                <!-- Draw bars -->
                <g v-for="(d, idx) in stockChartData" :key="d.month">
                  <!-- Bar coordinates calculation -->
                  <!-- Max quantity scale helper -->
                  <g>
                    <!-- Stock In (Blue Bar) -->
                    <rect 
                      :x="52 + idx * 60" 
                      :y="220 - Math.min(190, (d.stock_in * 1.5))" 
                      width="12" 
                      :height="Math.min(190, (d.stock_in * 1.5))" 
                      rx="2.5" 
                      fill="#2563eb"
                      class="transition-all hover:fill-blue-700 cursor-pointer"
                    >
                      <title>{{ d.label }}: Stock In {{ d.stock_in }} qty</title>
                    </rect>
                    <!-- Stock Out (Red Bar) -->
                    <rect 
                      :x="66 + idx * 60" 
                      :y="220 - Math.min(190, (d.stock_out * 1.5))" 
                      width="12" 
                      :height="Math.min(190, (d.stock_out * 1.5))" 
                      rx="2.5" 
                      fill="#f43f5e"
                      class="transition-all hover:fill-rose-700 cursor-pointer"
                    >
                      <title>{{ d.label }}: Stock Out {{ d.stock_out }} qty</title>
                    </rect>
                    <!-- Adjustment (Amber Bar) -->
                    <rect 
                      :x="80 + idx * 60" 
                      :y="220 - Math.min(190, (d.adj * 1.5))" 
                      width="12" 
                      :height="Math.min(190, (d.adj * 1.5))" 
                      rx="2.5" 
                      fill="#f59e0b"
                      class="transition-all hover:fill-amber-700 cursor-pointer"
                    >
                      <title>{{ d.label }}: Adjustment {{ d.adj }} qty</title>
                    </rect>
                  </g>
                </g>
              </svg>
            </div>

            <!-- X Axis Labels -->
            <div class="flex justify-between pl-[40px] pr-[15px] pt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider overflow-x-auto whitespace-nowrap">
              <span v-for="d in stockChartData" :key="d.month" class="w-[50px] text-center">
                {{ d.month.substring(5) }}
              </span>
            </div>

            <!-- Chart Legend -->
            <div class="flex flex-wrap items-center gap-6 justify-center mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded bg-blue-600 shrink-0"></span>
                <span>Stock In (Items Received)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded bg-rose-500 shrink-0"></span>
                <span>Stock Out (Items Dispatched)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded bg-amber-500 shrink-0"></span>
                <span>Adjustment</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Pie Chart (Category Distribution) -->
        <div class="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div class="pb-4 border-b border-slate-100">
            <h4 class="font-bold text-slate-800">Category Distribution</h4>
            <p class="text-xs text-slate-400">Percentage of product items per category</p>
          </div>

          <!-- Loading state -->
          <div v-if="isPieLoading" class="h-64 flex items-center justify-center bg-slate-50/50 rounded-xl mt-6">
            <div class="flex flex-col items-center gap-2">
              <RefreshCw class="w-6 h-6 text-indigo-500 animate-spin" />
              <span class="text-xs text-slate-400">Loading catalog...</span>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="pieChartData.length === 0" class="h-64 flex items-center justify-center text-slate-400 mt-6">
            No categories or products registered.
          </div>

          <!-- SVG Donut Chart -->
          <div v-else class="mt-6 flex-1 flex flex-col justify-center items-center">
            <div class="relative w-44 h-44">
              <!-- Simple placeholder dynamic representation for category count -->
              <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                <!-- Donut rings -->
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="#f1f5f9" 
                  stroke-width="12" 
                />
                
                <!-- Display slices representation -->
                <circle 
                  v-for="(cat, index) in pieChartData" 
                  :key="cat.category_id"
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  :stroke="colors[index % colors.length].hex" 
                  :stroke-width="hoveredCategory?.category_id === cat.category_id ? 15 : 12" 
                  :stroke-dasharray="`${(Number(cat.percentage) / 100) * 251.2} 251.2`"
                  :stroke-dashoffset="index === 0 ? 0 : -((pieChartData.slice(0, index).reduce((acc, c) => acc + Number(c.percentage), 0) / 100) * 251.2)"
                  class="transition-all duration-300 cursor-pointer origin-center hover:scale-[1.03]"
                  :opacity="hoveredCategory && hoveredCategory.category_id !== cat.category_id ? 0.5 : 1"
                  @mouseenter="hoveredCategory = cat"
                  @mouseleave="hoveredCategory = null"
                />
              </svg>
              <!-- Middle content -->
              <div class="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-5 shadow-xs transition-all duration-300">
                <template v-if="hoveredCategory">
                  <span 
                    class="text-[10px] font-bold uppercase tracking-wider text-center px-2 truncate max-w-[110px]"
                    :style="{ color: colors[pieChartData.indexOf(hoveredCategory) % colors.length].hex }"
                  >
                    {{ hoveredCategory.category_name }}
                  </span>
                  <span class="text-xl font-black text-slate-800 my-0.5">
                    {{ Number(hoveredCategory.percentage).toFixed(1) }}%
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">
                    {{ hoveredCategory.product_count }} items
                  </span>
                </template>
                <template v-else>
                  <span class="text-xs text-slate-400 font-medium">Category</span>
                  <span class="text-lg font-black text-slate-800">{{ cardsData.total_categories }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">Total Products</span>
                </template>
              </div>
            </div>

            <!-- List Legend -->
            <div class="w-full space-y-2 mt-6 max-h-36 overflow-y-auto scrollbar-thin pr-1">
              <div 
                v-for="(cat, index) in pieChartData" 
                :key="cat.category_id"
                class="flex items-center justify-between text-xs font-semibold text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-50"
                :class="{ 'bg-slate-50': hoveredCategory?.category_id === cat.category_id }"
                @mouseenter="hoveredCategory = cat"
                @mouseleave="hoveredCategory = null"
              >
                <div class="flex items-center gap-2 truncate">
                  <span :class="['w-2.5 h-2.5 rounded-full shrink-0', colors[index % colors.length].bg]"></span>
                  <span class="truncate" :class="{ 'text-slate-900 font-bold': hoveredCategory?.category_id === cat.category_id }">
                    {{ cat.category_name }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 font-mono text-slate-400 shrink-0">
                  <span>{{ cat.product_count }} Products</span>
                  <span class="text-[10px] font-bold text-slate-300">|</span>
                  <span class="text-slate-500 font-bold">{{ Number(cat.percentage).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Tables Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Table: Low Stock Warning -->
        <div class="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <AlertTriangle class="w-5 h-5 text-amber-500" />
                <h4 class="font-bold text-slate-800">Low Stock Alert</h4>
              </div>
              <span class="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">Threshold &lt; 15</span>
            </div>

            <!-- Loading state -->
            <div v-if="isLowStockLoading" class="space-y-4 mt-6">
              <div v-for="i in 3" :key="i" class="h-12 bg-slate-50 animate-pulse rounded-lg"></div>
            </div>

            <!-- Empty state -->
            <div v-else-if="lowStockData.length === 0" class="h-48 flex items-center justify-center text-slate-400 mt-6 text-sm">
              All product stock levels are healthy!
            </div>

            <!-- Table -->
            <div v-else class="mt-4 overflow-x-auto">
              <table class="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr class="text-xs text-slate-400 border-b border-slate-100">
                    <th class="py-3 font-semibold uppercase tracking-wider">Product</th>
                    <th class="py-3 font-semibold uppercase tracking-wider">Code</th>
                    <th class="py-3 font-semibold uppercase tracking-wider">Category</th>
                    <th class="py-3 font-semibold uppercase tracking-wider text-right">Stock</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="prod in lowStockData" :key="prod.id" class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-3.5 font-semibold text-slate-800 truncate max-w-[150px]">{{ prod.product_name }}</td>
                    <td class="py-3.5 font-mono text-xs text-slate-500">{{ prod.product_code }}</td>
                    <td class="py-3.5 text-xs text-slate-500">{{ prod.category?.name || '-' }}</td>
                    <td class="py-3.5 text-right font-black text-xs">
                      <span :class="[
                        'px-2 py-1 rounded-md',
                        prod.current_stock === 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      ]">
                        {{ prod.current_stock }} left
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="mt-6 pt-4 border-t border-slate-150">
            <router-link 
              to="/products"
              class="w-full text-center block text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              View All Category Products
            </router-link>
          </div>
        </div>

        <!-- Right Table: Recent Transactions Feed -->
        <div class="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="pb-4 border-b border-slate-100 flex items-center justify-between">
              <h4 class="font-bold text-slate-800">Recent Movements</h4>
              <span class="text-xs text-slate-400">Top 5 activities</span>
            </div>

            <!-- Loading state -->
            <div v-if="isRecentLoading" class="space-y-4 mt-6">
              <div v-for="i in 3" :key="i" class="h-12 bg-slate-50 animate-pulse rounded-lg"></div>
            </div>

            <!-- Empty state -->
            <div v-else-if="recentTransactionsData.length === 0" class="h-48 flex items-center justify-center text-slate-400 mt-6 text-sm">
              No stock transaction records found.
            </div>

            <!-- Feed List -->
            <div v-else class="mt-6 space-y-4">
              <div 
                v-for="tx in recentTransactionsData" 
                :key="tx.id"
                class="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100/50"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Type Badge -->
                  <div :class="[
                    'w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                    tx.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : '',
                    tx.type === 'OUT' ? 'bg-rose-50 text-rose-600 border border-rose-100' : '',
                    tx.type === 'ADJUSTMTENT' ? 'bg-amber-50 text-amber-600 border border-amber-100' : ''
                  ]">
                    {{ tx.type === 'ADJUSTMTENT' ? 'ADJ' : tx.type }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 truncate">{{ tx.product_name }}</p>
                    <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ tx.trx_code }}</p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p :class="[
                    'text-sm font-black',
                    tx.type === 'IN' ? 'text-emerald-600' : '',
                    tx.type === 'OUT' ? 'text-rose-600' : '',
                    tx.type === 'ADJUSTMTENT' ? 'text-amber-600' : ''
                  ]">
                    {{ tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : '' }}{{ tx.qty }}
                  </p>
                  <p class="text-[9px] text-slate-400 mt-0.5">{{ formatDateTime(tx.transaction_date) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-150">
            <router-link 
              to="/stock-transactions?tab=history"
              class="w-full text-center block text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              View Full Transaction Logs
            </router-link>
          </div>
        </div>

    </div>

</div>
</template>


