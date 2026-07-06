<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useProductsStore } from '../../store/products'
import { useCategoriesStore } from '../../store/categories'
import { useToast } from '../../composables/useToast'
import { getAssetUrl, formatPrice } from '../../utils/helpers'
import ProductFormModal from './ProductFormModal.vue'
import ProductDetailModal from './ProductDetailModal.vue'
import DeleteConfirmModal from '../../components/DeleteConfirmModal.vue'
import ProductImportModal from './ProductImportModal.vue'
import ExportModal from '../../components/ExportModal.vue'
import Pagination from '../../components/Pagination.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FileText,
  Filter,
  Eye,
  Image as ImageIcon,
  Upload,
  Download
} from '@lucide/vue'

const { addToast } = useToast()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// Dropdown lists
const categoriesList = ref([])

// Query params
const search = ref('')
const rowPerPage = ref(10)
const currentPage = ref(1)
const selectedCategory = ref('')
const selectedStockStatus = ref('')
const selectedActiveStatus = ref('')
const minPrice = ref('')
const maxPrice = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')

// Modal visibility
const isFormModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isExportModalOpen = ref(false)

const selectedProduct = ref(null)
const isSubmitting = ref(false)

const productColumns = [
  { label: 'Product Code', value: 'product_code' },
  { label: 'Product Name', value: 'product_name' },
  { label: 'Category Name', value: 'category_name' },
  { label: 'Price', value: 'price' },
  { label: 'Current Stock', value: 'current_stock' },
  { label: 'Stock Status', value: 'stock_status' },
  { label: 'Active Status', value: 'is_active' }
]

const productFilters = computed(() => {
  return {
    search: search.value || undefined,
    category_id: selectedCategory.value || undefined,
    stock_status: selectedStockStatus.value || undefined,
    is_active: selectedActiveStatus.value || undefined,
    min_price: minPrice.value || undefined,
    max_price: maxPrice.value || undefined,
    sort_by: sortBy.value || undefined,
    sort_order: sortOrder.value || undefined
  }
})


const fetchCategoriesList = async () => {
  try {
    const res = await categoriesStore.fetchAll()
    if (res.success) {
      categoriesList.value = res.data
    }
  } catch (err) {
    console.error(err)
  }
}

const loadProducts = async () => {
  try {
    await productsStore.fetchPaginated({
      search: search.value,
      row_per_page: rowPerPage.value,
      page: currentPage.value,
      category_id: selectedCategory.value || undefined,
      stock_status: selectedStockStatus.value || undefined,
      is_active: selectedActiveStatus.value !== '' ? selectedActiveStatus.value : undefined,
      min_price: minPrice.value || undefined,
      max_price: maxPrice.value || undefined,
      sort_by: sortBy.value,
      sort_order: sortOrder.value
    })
  } catch (err) {
    addToast('Failed to load products.', 'error')
  }
}

watch([rowPerPage, currentPage, selectedCategory, selectedStockStatus, selectedActiveStatus, sortBy, sortOrder], () => {
  loadProducts()
})

let queryTimeout
watch([search, minPrice, maxPrice], () => {
  clearTimeout(queryTimeout)
  queryTimeout = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 450)
})

onMounted(() => {
  fetchCategoriesList()
  loadProducts()
})

// Handlers
const openCreate = () => {
  selectedProduct.value = null
  isFormModalOpen.value = true
}

const openEdit = (product) => {
  selectedProduct.value = product
  isFormModalOpen.value = true
}

const openDetail = (product) => {
  selectedProduct.value = product
  isDetailModalOpen.value = true
}

const openDelete = (product) => {
  selectedProduct.value = product
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  isSubmitting.value = true
  try {
    const res = await productsStore.deleteProduct(selectedProduct.value.id)
    if (res.success) {
      addToast('Product soft-deleted successfully.', 'success')
      isDeleteModalOpen.value = false
      loadProducts()
    }
  } catch (err) {
    addToast('Failed to delete product.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <div>
    <div class="space-y-6">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Product Catalog</h2>
          <p class="text-xs text-slate-500">Add, edit, track and update your items in inventory.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Import Button -->
          <button
            @click="isImportModalOpen = true"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200/40 cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <Download class="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          <!-- Export Button -->
          <button
            @click="isExportModalOpen = true"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-250/40 cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <Upload class="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <!-- Add Product Button -->
          <button
            @click="openCreate"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-transform hover:-translate-y-0.5"
          >
            <Plus class="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filter Accordion Card -->
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 text-left">
        <h3 class="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Filter class="w-4 h-4 text-blue-500" />
          <span>Filter Parameters</span>
        </h3>
        
        <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          <!-- Category -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
            <select
              v-model="selectedCategory"
              class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option v-for="c in categoriesList" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- Stock Status -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Status</label>
            <select
              v-model="selectedStockStatus"
              class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Stock levels</option>
              <option value="low stock">Low Stock</option>
              <option value="out of stock">Out of Stock</option>
              <option value="in stock">Safe Stock</option>
            </select>
          </div>

          <!-- Active Status -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catalog Status</label>
            <select
              v-model="selectedActiveStatus"
              class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          <!-- Sort Column -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sort By</label>
            <select
              v-model="sortBy"
              class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="created_at">Date Added</option>
              <option value="product_name">Product Name</option>
              <option value="price">Price</option>
              <option value="current_stock">Stock Count</option>
            </select>
          </div>

          <!-- Sort Order -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sort Order</label>
            <select
              v-model="sortOrder"
              class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <!-- Price Boundaries -->
          <div class="col-span-2 md:col-span-1 flex items-center gap-1.5">
            <div class="flex-1">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Price</label>
              <input
                v-model="minPrice"
                type="number"
                placeholder="Min"
                class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div class="flex-1">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Price</label>
              <input
                v-model="maxPrice"
                type="number"
                placeholder="Max"
                class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        <!-- Controls Header -->
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
          <div class="relative max-w-sm w-full">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search class="w-4 h-4" />
            </span>
            <input
              v-model="search"
              type="text"
              placeholder="Search product code, name, description..."
              class="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Show</span>
            <select 
              v-model="rowPerPage"
              class="bg-white border border-slate-200 rounded-lg py-1 px-2.5 focus:outline-none focus:border-blue-500"
            >
              <option :value="5">5 rows</option>
              <option :value="10">10 rows</option>
              <option :value="20">20 rows</option>
            </select>
          </div>
        </div>

        <!-- Table Loading state -->
        <LoadingState 
          v-if="productsStore.isLoading.value" 
          message="Fetching catalog items..."
        />

        <!-- Empty State -->
        <EmptyState 
          v-else-if="productsStore.products.value.length === 0"
          title="No Products Registered"
          description="Try updating your filters or add a new product to populate the database."
          :icon="ImageIcon"
        />

        <!-- Table View -->
        <div v-else class="overflow-x-auto text-left">
          <table class="w-full text-left border-collapse text-xs text-slate-600">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-150">
                <th class="px-6 py-3.5 tracking-wider">Item Image</th>
                <th class="px-6 py-3.5 tracking-wider">Product Info</th>
                <th class="px-6 py-3.5 tracking-wider">Category</th>
                <th class="px-6 py-3.5 tracking-wider">Price (IDR)</th>
                <th class="px-6 py-3.5 tracking-wider">Current Stock</th>
                <th class="px-6 py-3.5 tracking-wider">Stock Status</th>
                <th class="px-6 py-3.5 tracking-wider">Document</th>
                <th class="px-6 py-3.5 tracking-wider">Status</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="p in productsStore.products.value" 
                :key="p.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <!-- Image -->
                <td class="px-6 py-4">
                  <div class="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      v-if="p.image" 
                      :src="getAssetUrl(p.image)" 
                      :alt="p.product_name"
                      class="w-full h-full object-cover"
                    />
                    <ImageIcon v-else class="w-5 h-5 text-slate-350" />
                  </div>
                </td>

                <!-- Info -->
                <td class="px-6 py-4">
                  <div>
                    <h4 class="font-bold text-slate-900 truncate max-w-[200px]">{{ p.product_name }}</h4>
                    <p class="text-[10px] text-slate-400 mt-0.5 font-mono">Code: {{ p.product_code }}</p>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200/60 uppercase">
                    {{ p.category?.name || p.category_name || '-' }}
                  </span>
                </td>

                <!-- Price -->
                <td class="px-6 py-4 font-semibold text-slate-800 font-mono">{{ formatPrice(p.price) }}</td>

                <!-- Current Stock -->
                <td class="px-6 py-4">
                  <span :class="[
                    'font-mono font-bold',
                    p.current_stock <= (p.minimum_stock || 10) ? 'text-rose-600' : 'text-slate-850'
                  ]">{{ p.current_stock }} units</span>
                </td>

                <!-- Stock Status -->
                <td class="px-6 py-4">
                  <span v-if="p.stock_status" :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border',
                    p.stock_status === 'in stock' || p.stock_status === 'safe' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/30' : '',
                    p.stock_status === 'low stock' || p.stock_status === 'low' ? 'bg-amber-50 text-amber-700 border-amber-200/30' : '',
                    p.stock_status === 'out of stock' || p.stock_status === 'empty' ? 'bg-rose-50 text-rose-700 border-rose-200/30' : ''
                  ]">
                    {{ p.stock_status }}
                  </span>
                  <span v-else class="text-slate-400">-</span>
                </td>

                <!-- Docs link -->
                <td class="px-6 py-4">
                  <a 
                    v-if="p.specification_pdf" 
                    :href="getAssetUrl(p.specification_pdf)" 
                    target="_blank"
                    class="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-500 font-bold uppercase"
                  >
                    <FileText class="w-3.5 h-3.5" />
                    <span>PDF specs</span>
                  </a>
                  <span v-else class="text-slate-400">-</span>
                </td>

                <!-- Status check -->
                <td class="px-6 py-4">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold border uppercase',
                    p.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20' : 'bg-slate-50 text-slate-500 border-slate-200/20'
                  ]">
                    {{ p.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Actions links -->
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <button 
                      @click="openDetail(p)"
                      class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <button 
                      @click="openEdit(p)"
                      class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button 
                      @click="openDelete(p)"
                      class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <Pagination 
          v-if="productsStore.products.value.length > 0"
          :from="productsStore.meta.value.from"
          :to="productsStore.meta.value.to"
          :total="productsStore.meta.value.total"
          v-model:current-page="currentPage"
          :last-page="productsStore.meta.value.last_page"
        />

      </div>

    </div>

    <!-- Reusable components mounting -->
    <ProductFormModal 
      :is-open="isFormModalOpen"
      :editing-product="selectedProduct"
      :categories-list="categoriesList"
      @close="isFormModalOpen = false"
      @saved="loadProducts"
    />

    <ProductDetailModal 
      :is-open="isDetailModalOpen"
      :product="selectedProduct"
      @close="isDetailModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal 
      :is-open="isDeleteModalOpen"
      title="Delete Product?"
      description="Are you sure you want to delete"
      :item-name="selectedProduct?.product_name"
      :is-submitting="isSubmitting"
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
    />

    <!-- Product Import Modal -->
    <ProductImportModal 
      :is-open="isImportModalOpen"
      @close="isImportModalOpen = false"
      @imported="loadProducts"
    />

    <!-- Product Export Modal -->
    <ExportModal
      :is-open="isExportModalOpen"
      module="products"
      title="Export Products Catalog"
      :columns="productColumns"
      :filters="productFilters"
      @close="isExportModalOpen = false"
    />
  </div>
</template>

