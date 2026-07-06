<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTransactionsStore } from '../../store/transactions'
import { useProductsStore } from '../../store/products'
import { useToast } from '../../composables/useToast'
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal,
  Loader2
} from '@lucide/vue'

const props = defineProps({
  activeTab: {
    type: String,
    required: true,
    validator: (value) => ['stock-in', 'stock-out', 'adjust'].includes(value)
  }
})

const emit = defineEmits(['success'])

const { addToast } = useToast()
const transactionsStore = useTransactionsStore()
const productsStore = useProductsStore()

const productsList = ref([]) // For selector dropdown
const isSubmitting = ref(false)
const form = ref({
  product_id: '',
  qty: props.activeTab === 'adjust' ? 0 : 1,
  reference_document: null,
  remarks: ''
})
const errors = ref({})
const docInputRef = ref(null)

// Searchable product dropdown states
const productSearchQuery = ref('')
const isProductDropdownOpen = ref(false)

const filteredProductsForSelect = computed(() => {
  if (!productSearchQuery.value) return productsList.value
  
  // If the search query matches the selected product representation exactly, show all options
  const selectedProduct = productsList.value.find(p => p.id === form.value.product_id)
  if (selectedProduct) {
    const matchStr = `${selectedProduct.product_name} (Code: ${selectedProduct.product_code}, Stock: ${selectedProduct.current_stock})`
    if (productSearchQuery.value === matchStr) {
      return productsList.value
    }
  }

  const q = productSearchQuery.value.toLowerCase()
  return productsList.value.filter(p => 
    p.product_name.toLowerCase().includes(q) || 
    p.product_code.toLowerCase().includes(q)
  )
})

const selectProduct = (p) => {
  form.value.product_id = p.id
  productSearchQuery.value = `${p.product_name} (Code: ${p.product_code}, Stock: ${p.current_stock})`
  isProductDropdownOpen.value = false
}

const closeProductDropdown = () => {
  setTimeout(() => {
    isProductDropdownOpen.value = false
    if (!form.value.product_id) {
      productSearchQuery.value = ''
    } else {
      const p = productsList.value.find(prod => prod.id === form.value.product_id)
      if (p) {
        productSearchQuery.value = `${p.product_name} (Code: ${p.product_code}, Stock: ${p.current_stock})`
      }
    }
  }, 200)
}

watch(productSearchQuery, (newVal) => {
  if (!newVal) {
    form.value.product_id = ''
  }
})

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
    qty: props.activeTab === 'adjust' ? 0 : 1,
    reference_document: null,
    remarks: ''
  }
  productSearchQuery.value = ''
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
  if (props.activeTab === 'adjust') {
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
    if (props.activeTab === 'stock-in') {
      res = await transactionsStore.stockIn(form.value.product_id, formData)
    } else if (props.activeTab === 'stock-out') {
      res = await transactionsStore.stockOut(form.value.product_id, formData)
    } else if (props.activeTab === 'adjust') {
      res = await transactionsStore.adjustStock(form.value.product_id, formData)
    }

    if (res.success) {
      addToast(
        props.activeTab === 'stock-in' ? 'Stock added successfully.' :
        props.activeTab === 'stock-out' ? 'Stock dispatched successfully.' :
        'Stock adjustment registered successfully.',
        'success'
      )
      resetForm()
      emit('success')
      // Refresh local product list stock counts
      await fetchProductsList()
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

watch(() => props.activeTab, () => {
  resetForm()
})

onMounted(() => {
  fetchProductsList()
})
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl text-left mx-auto md:mx-0">
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

    <form @submit.prevent="handleTransactionSubmit" class="space-y-4" autocomplete="off">
      <!-- Product Select Searchable Dropdown -->
      <div class="relative">
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Select Product *
        </label>
        <div class="relative">
          <input
            type="text"
            v-model="productSearchQuery"
            @focus="isProductDropdownOpen = true"
            @blur="closeProductDropdown"
            placeholder="Type to search product name or code..."
            class="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer bg-white"
          />
          <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        <!-- Dropdown List -->
        <div 
          v-if="isProductDropdownOpen" 
          class="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          <div 
            v-for="p in filteredProductsForSelect" 
            :key="p.id"
            @mousedown="selectProduct(p)"
            class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs text-slate-700 flex justify-between items-center border-b border-slate-100 last:border-0"
          >
            <div>
              <span class="font-bold text-slate-900">{{ p.product_name }}</span>
              <span class="text-slate-400 ml-1.5 text-[10px]">({{ p.product_code }})</span>
            </div>
            <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-600">
              Stock: {{ p.current_stock }}
            </span>
          </div>
          <div 
            v-if="filteredProductsForSelect.length === 0" 
            class="px-4 py-3 text-xs text-slate-400 text-center"
          >
            No products found
          </div>
        </div>
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
          autocomplete="off"
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
</template>
