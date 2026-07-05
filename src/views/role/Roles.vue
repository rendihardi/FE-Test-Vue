<script setup>
import { ref, onMounted, watch } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useRolesStore } from '../../store/roles'
import { useToast } from '../../composables/useToast'
import RoleFormModal from './RoleFormModal.vue'
import Pagination from '../../components/Pagination.vue'
import DeleteConfirmModal from '../../components/DeleteConfirmModal.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck
} from '@lucide/vue'

const { addToast } = useToast()
const rolesStore = useRolesStore()

// Query params
const search = ref('')
const rowPerPage = ref(10)
const currentPage = ref(1)

// Modal states
const isFormOpen = ref(false)
const isDeleteOpen = ref(false)

const selectedRole = ref(null)
const isSubmitting = ref(false)

const loadRoles = async () => {
  try {
    await rolesStore.fetchPaginated({
      search: search.value,
      row_per_page: rowPerPage.value,
      page: currentPage.value
    })
  } catch (err) {
    addToast('Failed to load roles.', 'error')
  }
}

watch([rowPerPage, currentPage], () => {
  loadRoles()
})

let searchTimeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadRoles()
  }, 400)
})

onMounted(() => {
  loadRoles()
})

const openCreate = () => {
  selectedRole.value = null
  isFormOpen.value = true
}

const openEdit = (role) => {
  selectedRole.value = role
  isFormOpen.value = true
}

const openDelete = (role) => {
  selectedRole.value = role
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  isSubmitting.value = true
  try {
    const res = await rolesStore.deleteRole(selectedRole.value.id)
    if (res.success) {
      addToast('Role deleted successfully.', 'success')
      isDeleteOpen.value = false
      loadRoles()
    }
  } catch (err) {
    addToast(err.response?.data?.message || 'Failed to delete role.', 'error')
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
          <h2 class="text-xl font-bold text-slate-900">Role Management</h2>
          <p class="text-xs text-slate-500">Define user roles and system scopes for authorization access.</p>
        </div>
        <button
          @click="openCreate"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-transform hover:-translate-y-0.5"
        >
          <Plus class="w-4 h-4" />
          <span>Add New Role</span>
        </button>
      </div>

      <!-- Main Table Card -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        <!-- Controls -->
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 text-left">
          <div class="relative max-w-sm w-full">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search class="w-4 h-4" />
            </span>
            <input
              v-model="search"
              type="text"
              placeholder="Search roles..."
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
          v-if="rolesStore.isLoading.value" 
          message="Fetching roles..."
        />

        <!-- Empty State -->
        <EmptyState 
          v-else-if="rolesStore.roles.value.length === 0"
          title="No Roles Registered"
          description="No roles found matching your search term."
          :icon="ShieldCheck"
        />

        <!-- Data Table -->
        <div v-else class="overflow-x-auto text-left">
          <table class="w-full text-left border-collapse text-xs text-slate-600">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-150">
                <th class="px-6 py-3.5 tracking-wider">Role Name</th>
                <th class="px-6 py-3.5 tracking-wider">Guard Name</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="role in rolesStore.roles.value" 
                :key="role.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>{{ role.name }}</span>
                </td>
                <td class="px-6 py-4 text-slate-550 font-mono">{{ role.guard_name }}</td>
                <td class="px-6 py-4 text-right space-x-2.5">
                  <button 
                    @click="openEdit(role)"
                    class="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer inline-block"
                    title="Edit Role"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="openDelete(role)"
                    class="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer inline-block"
                    title="Delete Role"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <Pagination 
          v-if="rolesStore.roles.value.length > 0"
          :from="rolesStore.meta.value.from"
          :to="rolesStore.meta.value.to"
          :total="rolesStore.meta.value.total"
          v-model:current-page="currentPage"
          :last-page="rolesStore.meta.value.last_page"
        />

      </div>
    </div>

    <!-- Role Form Modal mount -->
    <RoleFormModal 
      :is-open="isFormOpen"
      :editing-role="selectedRole"
      @close="isFormOpen = false"
      @saved="loadRoles"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal 
      :is-open="isDeleteOpen"
      title="Delete Role"
      description="Are you sure you want to permanently delete the role"
      :item-name="selectedRole?.name"
      :is-submitting="isSubmitting"
      @close="isDeleteOpen = false"
      @confirm="confirmDelete"
    />
  </DashboardLayout>
</template>
