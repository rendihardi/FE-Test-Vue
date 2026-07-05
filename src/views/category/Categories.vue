<script setup>
import { ref, onMounted, watch } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useCategoriesStore } from '../../store/categories'
import { useToast } from '../../composables/useToast'
import CategoryFormModal from './CategoryFormModal.vue'
import Pagination from '../../components/Pagination.vue'
import DeleteConfirmModal from '../../components/DeleteConfirmModal.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import CategoryDetailModal from './CategoryDetailModal.vue'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FolderTree,
  Eye
} from '@lucide/vue'

const { addToast } = useToast()
const categoriesStore = useCategoriesStore()

// Query params
const search = ref('')
const rowPerPage = ref(10)
const currentPage = ref(1)

// Modal states
const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const isDetailOpen = ref(false)

const selectedCategory = ref(null)
const isSubmitting = ref(false)

const loadCategories = async () => {
  try {
    await categoriesStore.fetchPaginated({
      search: search.value,
      row_per_page: rowPerPage.value,
      page: currentPage.value
    })
  } catch (err) {
    addToast('Failed to load categories.', 'error')
  }
}

watch([rowPerPage, currentPage], () => {
  loadCategories()
})

let searchTimeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadCategories()
  }, 400)
})

onMounted(() => {
  loadCategories()
})

const openCreate = () => {
  selectedCategory.value = null
  isFormOpen.value = true
}

const openEdit = (cat) => {
  selectedCategory.value = cat
  isFormOpen.value = true
}

const openDetail = (cat) => {
  selectedCategory.value = cat
  isDetailOpen.value = true
}

const openDelete = (cat) => {
  selectedCategory.value = cat
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  isSubmitting.value = true
  try {
    const res = await categoriesStore.deleteCategory(selectedCategory.value.id)
    if (res.success) {
      addToast('Category soft-deleted successfully.', 'success')
      isDeleteOpen.value = false
      loadCategories()
    }
  } catch (err) {
    addToast(err.response?.data?.message || 'Failed to delete category.', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900">Product Categories</h2>
          <p class="text-xs text-slate-500">Group and manage classification criteria for product stock listings.</p>
        </div>
        <button
          @click="openCreate"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-transform hover:-translate-y-0.5"
        >
          <Plus class="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <!-- Main Controls and Table -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        <!-- Header controls -->
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
          <div class="relative max-w-sm w-full">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search class="w-4 h-4" />
            </span>
            <input
              v-model="search"
              type="text"
              placeholder="Search category name..."
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
              <option :value="50">50 rows</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <LoadingState 
          v-if="categoriesStore.isLoading.value" 
          message="Fetching categories list..."
        />

        <!-- Empty State -->
        <EmptyState 
          v-else-if="categoriesStore.categories.value.length === 0"
          title="No Categories Found"
          description="No categories match your current search terms."
          :icon="FolderTree"
        />

        <!-- Data table -->
        <div v-else class="overflow-x-auto text-left">
          <table class="w-full text-left border-collapse text-xs text-slate-650">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-150">
                <th class="px-6 py-3.5 tracking-wider">Name</th>
                <th class="px-6 py-3.5 tracking-wider">Description</th>
                <th class="px-6 py-3.5 tracking-wider">Status</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="cat in categoriesStore.categories.value" 
                :key="cat.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-6 py-4 font-bold text-slate-900">{{ cat.name }}</td>
                <td class="px-6 py-4 text-slate-500 max-w-sm truncate">{{ cat.description || '-' }}</td>
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border',
                    cat.is_active 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-250/30' 
                      : 'bg-slate-50 text-slate-500 border-slate-250/30'
                  ]">
                    <span :class="['w-1.5 h-1.5 rounded-full', cat.is_active ? 'bg-emerald-500' : 'bg-slate-400']"></span>
                    <span>{{ cat.is_active ? 'Active' : 'Inactive' }}</span>
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2.5">
                  <button 
                    @click="openDetail(cat)"
                    class="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer inline-block"
                    title="View Category Details & Audits"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button 
                    @click="openEdit(cat)"
                    class="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer inline-block"
                    title="Edit Category"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="openDelete(cat)"
                    class="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer inline-block"
                    title="Delete Category"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <Pagination 
          v-if="categoriesStore.categories.value.length > 0"
          :from="categoriesStore.meta.value.from"
          :to="categoriesStore.meta.value.to"
          :total="categoriesStore.meta.value.total"
          v-model:current-page="currentPage"
          :last-page="categoriesStore.meta.value.last_page"
        />

      </div>
    </div>

    <!-- Category Detail Modal Mount -->
    <CategoryDetailModal 
      :is-open="isDetailOpen"
      :category="selectedCategory"
      @close="isDetailOpen = false"
    />

    <!-- Category Form Modal Mount -->
    <CategoryFormModal 
      :is-open="isFormOpen"
      :editing-category="selectedCategory"
      @close="isFormOpen = false"
      @saved="loadCategories"
    />

    <!-- Delete Modal -->
    <DeleteConfirmModal 
      :is-open="isDeleteOpen"
      title="Delete Category"
      description="Are you sure you want to soft-delete the category"
      :item-name="selectedCategory?.name"
      :is-submitting="isSubmitting"
      @close="isDeleteOpen = false"
      @confirm="confirmDelete"
    />
  </DashboardLayout>
</template>
