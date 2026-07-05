<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useTransactionsStore } from '../../store/transactions'
import { useProductsStore } from '../../store/products'
import { useToast } from '../../composables/useToast'
import { getAssetUrl, formatDateTime } from '../../utils/helpers'
import Pagination from '../../components/Pagination.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import ExportModal from '../../components/ExportModal.vue'
import { useUsersStore } from '../../store/users'
import { 
  Plus, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal,
  History,
  FileText,
  Calendar,
  Download,
  Upload,
  Loader2
} from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { addToast } = useToast()
const transactionsStore = useTransactionsStore()
const productsStore = useProductsStore()
const usersStore = useUsersStore()

// Active Tab computed from route query
const activeTab = computed(() => route.query.tab || 'history')

// Form & Reference Document state
const productsList = ref([]) // For selector dropdown
const usersList = ref([]) // For creator filter dropdown
const isSubmitting = ref(false)
const form = ref({
  product_id: '',
  qty: 1,
  reference_document: null,
  remarks: ''
})
const errors = ref({})
const docInputRef = ref(null)

// Query / Filter states
const search = ref('')
const rowPerPage = ref(10)
const currentPage = ref(1)
const filterType = ref('')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const selectedFilterProduct = ref('')
const selectedFilterUser = ref('')

// Export Modal States
const isExportModalOpen = ref(false)
const exportModule = ref('stockin')
const allowModuleSelection = ref(false)

const transactionColumns = [
  { label: 'Transaction Code', value: 'trx_code' },
  { label: 'Product Name', value: 'product_name' },
  { label: 'Quantity', value: 'qty' },
  { label: 'Stock Before', value: 'stock_before' },
  { label: 'Stock After', value: 'stock_after' },
  { label: 'Transaction Date', value: 'transaction_date' },
  { label: 'Actor', value: 'created_by' },
  { label: 'Remarks', value: 'remarks' }
]

const transactionFilters = computed(() => {
  let typeParam = filterType.value || undefined
  if (activeTab.value === 'stock-in') typeParam = 'IN'
  if (activeTab.value === 'stock-out') typeParam = 'OUT'
  if (activeTab.value === 'adjust') typeParam = 'ADJUSTMTENT'

  return {
    search: search.value || undefined,
    type: typeParam,
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
    sort_by: sortBy.value || undefined,
    sort_order: sortOrder.value || undefined,
    product_id: selectedFilterProduct.value || undefined,
    created_by: selectedFilterUser.value || undefined
  }
})

const openExport = () => {
  // If active tab is history, use the general stocktransactions endpoint
  if (activeTab.value === 'history') {
    exportModule.value = 'stocktransactions'
    allowModuleSelection.value = false
  } else if (activeTab.value === 'stock-in') {
    exportModule.value = 'stockin'
    allowModuleSelection.value = false
  } else if (activeTab.value === 'stock-out') {
    exportModule.value = 'stockout'
    allowModuleSelection.value = false
  } else if (activeTab.value === 'adjust') {
    exportModule.value = 'adjustment'
    allowModuleSelection.value = false
  }
  
  isExportModalOpen.value = true
}


const fetchProductsList = async () => {
  try {
    const res = await productsStore.fetchAll()
    if (res.success) {
      productsList.value = res.data.filter(p => p.is_active)
    }
  } catch (err) {
    console.error('Failed to load products list', err)
  }
}

const fetchUsersList = async () => {
  try {
    const res = await usersStore.fetchAll()
    if (res.success) {
      usersList.value = res.data
    }
  } catch (err) {
    console.error('Failed to load users list', err)
  }
}

const loadTransactions = async () => {
  try {
    let typeParam = filterType.value || undefined
    if (activeTab.value === 'stock-in') typeParam = 'IN'
    if (activeTab.value === 'stock-out') typeParam = 'OUT'
    if (activeTab.value === 'adjust') typeParam = 'ADJUSTMTENT'

    await transactionsStore.fetchPaginated({
      search: search.value,
      row_per_page: rowPerPage.value,
      page: currentPage.value,
      type: typeParam,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
      product_id: selectedFilterProduct.value || undefined,
      created_by: selectedFilterUser.value || undefined
    })
  } catch (err) {
    addToast('Failed to load transaction logs.', 'error')
  }
}

watch(activeTab, () => {
  resetForm()
  currentPage.value = 1
  loadTransactions()
})

watch([rowPerPage, currentPage, filterType, sortBy, sortOrder, selectedFilterProduct, selectedFilterUser], () => {
  loadTransactions()
})

let searchTimeout
watch([search, startDate, endDate], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadTransactions()
  }, 450)
})

onMounted(() => {
  fetchProductsList()
  fetchUsersList()
  loadTransactions()
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) {
    form.value.reference_document = null
    return
  }

  if (file.type !== 'application/pdf') {
    addToast('Only PDF files are allowed for reference documents.', 'error')
    e.target.value = ''
    form.value.reference_document = null
    return
  }

  const sizeKb = file.size / 1024
  if (sizeKb < 100 || sizeKb > 500) {
    addToast(`PDF size must be between 100 KB and 500 KB. Current: ${sizeKb.toFixed(1)} KB`, 'error')
    e.target.value = ''
    form.value.reference_document = null
    return
  }

  form.value.reference_document = file
}

const resetForm = () => {
  form.value = {
    product_id: '',
    qty: activeTab.value === 'adjust' ? 0 : 1,
    reference_document: null,
    remarks: ''
  }
  errors.value = {}
  if (docInputRef.value) {
    docInputRef.value.value = ''
  }
}

const handleTransactionSubmit = async () => {
  errors.value = {}
  
  if (!form.value.product_id) {
    errors.value.product_id = ['Please select a product']
  }
  
  const qtyVal = parseInt(form.value.qty)
  if (activeTab.value === 'adjust') {
    if (isNaN(qtyVal) || qtyVal < 0) {
      errors.value.qty = ['Quantity must be a non-negative integer']
    }
  } else {
    if (isNaN(qtyVal) || qtyVal < 1) {
      errors.value.qty = ['Quantity must be at least 1']
    }
  }

  if (Object.keys(errors.value).length > 0) return

  isSubmitting.value = true

  const formData = new FormData()
  formData.append('qty', form.value.qty.toString())
  if (form.value.remarks) formData.append('remarks', form.value.remarks)
  if (form.value.reference_document) {
    formData.append('reference_document', form.value.reference_document)
  }

  try {
    let res
    if (activeTab.value === 'stock-in') {
      res = await transactionsStore.stockIn(form.value.product_id, formData)
    } else if (activeTab.value === 'stock-out') {
      res = await transactionsStore.stockOut(form.value.product_id, formData)
    } else if (activeTab.value === 'adjust') {
      res = await transactionsStore.adjustStock(form.value.product_id, formData)
    }

    if (res.success) {
      addToast(
        activeTab.value === 'stock-in' ? 'Stock added successfully.' :
        activeTab.value === 'stock-out' ? 'Stock dispatched successfully.' :
        'Stock adjustment registered successfully.',
        'success'
      )
      resetForm()
      loadTransactions()
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors || {}
    } else {
      addToast(err.response?.data?.message || 'An error occurred during transaction processing.', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}

const switchTab = (tabName) => {
  router.push({ path: '/stock-transactions', query: { tab: tabName } })
}

</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      
      <!-- Top Title Bar -->
      <div class="text-left">
        <h2 class="text-xl font-bold text-slate-900">Inventory Stock Transactions</h2>
        <p class="text-xs text-slate-500">Record inventory intake, outbound transfers, write-offs, and monitor audit histories.</p>
      </div>

      <!-- Tabs Navigation Header -->
      <div class="border-b border-slate-200 flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-xs">
        <button
          @click="switchTab('history')"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
            activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <History class="w-4 h-4" />
          <span>Transaction Logs</span>
        </button>

        <button
          @click="switchTab('stock-in')"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
            activeTab === 'stock-in' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <ArrowDownRight class="w-4 h-4" />
          <span>Perform Stock In</span>
        </button>

        <button
          @click="switchTab('stock-out')"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
            activeTab === 'stock-out' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <ArrowUpRight class="w-4 h-4" />
          <span>Perform Stock Out</span>
        </button>

        <button
          @click="switchTab('adjust')"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
            activeTab === 'adjust' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
          ]"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span>Adjust Stock Levels</span>
        </button>
      </div>

      <!-- Transaction Forms (for IN, OUT, ADJUST) -->
      <div v-if="activeTab !== 'history'" class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl text-left mx-auto md:mx-0">
        <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <component 
            :is="activeTab === 'stock-in' ? ArrowDownRight : activeTab === 'stock-out' ? ArrowUpRight : SlidersHorizontal" 
            :class="[
              'w-5 h-5',
              activeTab === 'stock-in' ? 'text-emerald-500' : activeTab === 'stock-out' ? 'text-rose-500' : 'text-amber-500'
            ]" 
          />
          <span>
            {{ activeTab === 'stock-in' ? 'Stock Intake Form' : activeTab === 'stock-out' ? 'Stock Dispatch Form' : 'Inventory Stock Adjustment Form' }}
          </span>
        </h3>

        <form @submit.prevent="handleTransactionSubmit" class="space-y-4">
          <!-- Product Select Dropdown -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Product *
            </label>
            <select
              v-model="form.product_id"
              required
              class="block w-full px-3 py-2 border border-slate-250 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Choose item from catalog...</option>
              <option v-for="p in productsList" :key="p.id" :value="p.id">
                {{ p.product_name }} (Code: {{ p.product_code }}, Stock: {{ p.current_stock }})
              </option>
            </select>
            <p v-if="errors.product_id" class="mt-1 text-[10px] text-rose-500">{{ errors.product_id[0] }}</p>
          </div>

          <!-- Quantity input -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              {{ activeTab === 'adjust' ? 'Target Stock Count *' : 'Quantity *' }}
            </label>
            <input
              v-model="form.qty"
              type="number"
              :min="activeTab === 'adjust' ? 0 : 1"
              required
              class="block w-full px-3 py-2 border border-slate-250 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500"
            />
            <p v-if="errors.qty" class="mt-1 text-[10px] text-rose-500">{{ errors.qty[0] }}</p>
            <p class="text-[9.5px] text-slate-400 mt-1">
              {{ activeTab === 'adjust' ? 'For adjustments, this value overrides current stock count.' : 'Increment/Decrement value for inventory.' }}
            </p>
          </div>

          <!-- Reference PDF document upload -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Reference Document (PDF Specification, 100 KB - 500 KB only)
            </label>
            <input
              ref="docInputRef"
              type="file"
              accept="application/pdf"
              @change="handleFileChange"
              class="block w-full border border-slate-200 rounded-xl text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p v-if="errors.reference_document" class="mt-1 text-[10px] text-rose-500">{{ errors.reference_document[0] }}</p>
          </div>

          <!-- Remarks text area -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Transaction Remarks / Notes
            </label>
            <textarea
              v-model="form.remarks"
              rows="3"
              placeholder="e.g. Received shipment from Supplier X or stock mismatch correction"
              class="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500"
            ></textarea>
            <p v-if="errors.remarks" class="mt-1 text-[10px] text-rose-500">{{ errors.remarks[0] }}</p>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isSubmitting"
              :class="[
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-colors cursor-pointer disabled:opacity-50',
                activeTab === 'stock-in' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10' :
                activeTab === 'stock-out' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/10' :
                'bg-amber-600 hover:bg-amber-500 shadow-amber-500/10'
              ]"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <span>{{ isSubmitting ? 'Registering Movement...' : 'Post Transaction' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Logs & Filter Panel -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        <!-- Filters header -->
        <div class="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4 text-left">
          <!-- Row 1: Search and Main Selects -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Search Box -->
            <div class="relative w-full">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search class="w-4 h-4" />
              </span>
              <input
                v-model="search"
                type="text"
                placeholder="Search code, product, doc..."
                class="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <!-- Type Selector -->
            <div v-if="activeTab === 'history'" class="relative w-full">
              <select 
                v-model="filterType"
                class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Types (In/Out/Adjust)</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
                <option value="ADJUSTMTENT">Adjustment</option>
              </select>
            </div>
            <!-- Empty placeholder if activeTab !== 'history' to align grid -->
            <div v-else class="hidden lg:block"></div>

            <!-- Product Filter -->
            <div class="relative w-full">
              <select 
                v-model="selectedFilterProduct"
                class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Products</option>
                <option v-for="p in productsList" :key="p.id" :value="p.id">
                  {{ p.product_name }}
                </option>
              </select>
            </div>

            <!-- Creator Filter -->
            <div class="relative w-full">
              <select 
                v-model="selectedFilterUser"
                class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Users</option>
                <option v-for="u in usersList" :key="u.id" :value="u.uuid || u.id">
                  {{ u.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Row 2: Date Range, Page Limit, and Export Button -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
            <!-- Date range pickers -->
            <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Calendar class="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                v-model="startDate"
                type="date"
                class="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
              />
              <span class="text-slate-400 font-medium">to</span>
              <input 
                v-model="endDate"
                type="date"
                class="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <!-- Show rows and Export Button -->
            <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 self-end sm:self-auto">
              <div class="flex items-center gap-2">
                <span>Show</span>
                <select 
                  v-model="rowPerPage"
                  class="bg-white border border-slate-200 rounded-xl py-1.5 px-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option :value="5">5 rows</option>
                  <option :value="10">10 rows</option>
                  <option :value="20">20 rows</option>
                </select>
              </div>

              <button
                @click="openExport"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <Upload class="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Table Loading state -->
        <LoadingState 
          v-if="transactionsStore.isLoading.value" 
          message="Fetching transaction history..."
        />

        <!-- Empty State -->
        <EmptyState 
          v-else-if="transactionsStore.transactions.value.length === 0"
          title="No Transaction Logs"
          description="No stock movements found matching your current query filters."
          :icon="History"
        />

        <!-- Table View -->
        <div v-else class="overflow-x-auto text-left">
          <table class="w-full text-left border-collapse text-xs text-slate-650">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-150">
                <th class="px-6 py-3.5 tracking-wider">Trx Code</th>
                <th class="px-6 py-3.5 tracking-wider">Product Info</th>
                <th class="px-6 py-3.5 tracking-wider">Type</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Quantity</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Before</th>
                <th class="px-6 py-3.5 tracking-wider text-right">After</th>
                <th class="px-6 py-3.5 tracking-wider">Document</th>
                <th class="px-6 py-3.5 tracking-wider">Actor</th>
                <th class="px-6 py-3.5 tracking-wider">Date</th>
                <th class="px-6 py-3.5 tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="tx in transactionsStore.transactions.value" 
                :key="tx.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-6 py-4 font-mono font-bold text-slate-800">{{ tx.trx_code }}</td>
                <td class="px-6 py-4">
                  <div>
                    <p class="font-bold text-slate-900 truncate max-w-[150px]">{{ tx.product_name }}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">{{ tx.category_name }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="[
                    'px-2.5 py-0.5 rounded text-[10px] font-bold border',
                    tx.type === 'IN' ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20' : '',
                    tx.type === 'OUT' ? 'bg-rose-50 text-rose-700 border-rose-250/20' : '',
                    tx.type === 'ADJUSTMTENT' ? 'bg-amber-50 text-amber-700 border-amber-250/20' : ''
                  ]">
                    {{ tx.type === 'ADJUSTMTENT' ? 'ADJUSTMENT' : tx.type }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right font-black text-slate-800">{{ tx.qty }}</td>
                <td class="px-6 py-4 text-right text-slate-400 font-mono">{{ tx.stock_before }}</td>
                <td class="px-6 py-4 text-right text-slate-800 font-mono font-semibold">{{ tx.stock_after }}</td>
                <td class="px-6 py-4">
                  <a 
                    v-if="tx.reference_document" 
                    :href="getAssetUrl(tx.reference_document)" 
                    target="_blank"
                    class="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-500 font-bold uppercase"
                  >
                    <FileText class="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </a>
                  <span v-else class="text-slate-400">-</span>
                </td>
                <td class="px-6 py-4 text-slate-700 font-medium">
                  {{ tx.creator?.name || tx.creator_name || '-' }}
                </td>
                <td class="px-6 py-4 text-slate-500 whitespace-nowrap">{{ formatDateTime(tx.transaction_date) }}</td>
                <td class="px-6 py-4 text-slate-400 max-w-[150px] truncate" :title="tx.remarks">{{ tx.remarks || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <Pagination 
          v-if="transactionsStore.transactions.value.length > 0"
          :from="transactionsStore.meta.value.from"
          :to="transactionsStore.meta.value.to"
          :total="transactionsStore.meta.value.total"
          v-model:current-page="currentPage"
          :last-page="transactionsStore.meta.value.last_page"
        />

      </div>

    </div>

    <!-- Export Modal -->
    <ExportModal
      :is-open="isExportModalOpen"
      :module="exportModule"
      :allow-module-selection="allowModuleSelection"
      title="Export Stock Transactions"
      :columns="transactionColumns"
      :filters="transactionFilters"
      @close="isExportModalOpen = false"
    />
  </DashboardLayout>
</template>
