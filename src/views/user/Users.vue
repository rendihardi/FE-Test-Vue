<script setup>
import { ref, onMounted, watch } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useUsersStore } from '../../store/users'
import { useRolesStore } from '../../store/roles'
import { useToast } from '../../composables/useToast'
import { formatDateTime } from '../../utils/helpers'

import UserFormModal from './UserFormModal.vue'
import Pagination from '../../components/Pagination.vue'
import DeleteConfirmModal from '../../components/DeleteConfirmModal.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import UserDetailModal from './UserDetailModal.vue'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserCheck,
  Eye
} from '@lucide/vue'

const { addToast } = useToast()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()

// State
const rolesList = ref([]) // For select dropdown options
const search = ref('')
const rowPerPage = ref(10)
const currentPage = ref(1)

// Modal states
const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const isDetailOpen = ref(false)

const selectedUser = ref(null)
const isSubmitting = ref(false)

const fetchRolesList = async () => {
  try {
    const res = await rolesStore.fetchAll()
    if (res.success) {
      rolesList.value = res.data
    }
  } catch (err) {
    console.error('Failed to load roles list', err)
  }
}

const loadUsers = async () => {
  try {
    await usersStore.fetchPaginated({
      search: search.value,
      row_per_page: rowPerPage.value,
      page: currentPage.value
    })
  } catch (err) {
    addToast('Failed to retrieve user list.', 'error')
  }
}

watch([rowPerPage, currentPage], () => {
  loadUsers()
})

let searchTimeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 400)
})

onMounted(() => {
  fetchRolesList()
  loadUsers()
})

const openCreate = () => {
  selectedUser.value = null
  isFormOpen.value = true
}

const openEdit = (user) => {
  selectedUser.value = user
  isFormOpen.value = true
}

const openDetail = (user) => {
  selectedUser.value = user
  isDetailOpen.value = true
}

const openDelete = (user) => {
  selectedUser.value = user
  isDeleteOpen.value = true
}

const confirmDelete = async () => {
  isSubmitting.value = true
  try {
    const res = await usersStore.deleteUser(selectedUser.value.id)
    if (res.success) {
      addToast('User account deleted successfully.', 'success')
      isDeleteOpen.value = false
      loadUsers()
    }
  } catch (err) {
    addToast('Failed to delete user account.', 'error')
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
          <h2 class="text-xl font-bold text-slate-900">User Accounts</h2>
          <p class="text-xs text-slate-500">Manage administrator credentials, staff allocations, and security scopes.</p>
        </div>
        <button
          @click="openCreate"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-transform hover:-translate-y-0.5"
        >
          <Plus class="w-4 h-4" />
          <span>Register User</span>
        </button>
      </div>

      <!-- User Accounts Table Card -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        <!-- Controls header -->
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 text-left">
          <div class="relative max-w-sm w-full">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search class="w-4 h-4" />
            </span>
            <input
              v-model="search"
              type="text"
              placeholder="Search user name or email..."
              class="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Show</span>
            <select 
              v-model="rowPerPage"
              class="bg-white border border-slate-200 rounded-lg py-1 px-2 focus:outline-none focus:border-blue-500"
            >
              <option :value="5">5 rows</option>
              <option :value="10">10 rows</option>
              <option :value="20">20 rows</option>
            </select>
          </div>
        </div>

        <!-- Table Loading state -->
        <LoadingState 
          v-if="usersStore.isLoading.value" 
          message="Fetching accounts ledger..."
        />

        <!-- Empty State -->
        <EmptyState 
          v-else-if="usersStore.users.value.length === 0"
          title="No Users Found"
          description="No registered credentials match your query terms."
          :icon="UserCheck"
        />

        <!-- Data Table -->
        <div v-else class="overflow-x-auto text-left">
          <table class="w-full text-left border-collapse text-xs text-slate-650">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-150">
                <th class="px-6 py-3.5 tracking-wider">Name</th>
                <th class="px-6 py-3.5 tracking-wider">Email Address</th>
                <th class="px-6 py-3.5 tracking-wider">Assigned Role</th>
                <th class="px-6 py-3.5 tracking-wider">Date Registered</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="user in usersStore.users.value" 
                :key="user.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-6 py-4 font-bold text-slate-900">{{ user.name }}</td>
                <td class="px-6 py-4 text-slate-550 font-mono">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span 
                    v-for="(role, rIdx) in user.roles" 
                    :key="rIdx"
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border mr-1',
                      (typeof role === 'string' ? role : role.name) === 'Administrator' ? 'bg-blue-50 text-blue-700 border-blue-200/20' : 'bg-slate-50 text-slate-650 border-slate-200/20'
                    ]"
                  >
                    {{ typeof role === 'string' ? role : role.name }}
                  </span>
                  <span v-if="!user.roles || user.roles.length === 0" class="text-slate-400">-</span>
                </td>
                <td class="px-6 py-4 text-slate-400">{{ formatDateTime(user.created_at) }}</td>
                <td class="px-6 py-4 text-right space-x-2.5">
                  <button 
                    @click="openDetail(user)"
                    class="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer inline-block"
                    title="View User Details & Audits"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button 
                    @click="openEdit(user)"
                    class="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer inline-block"
                    title="Edit User"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="openDelete(user)"
                    class="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer inline-block"
                    title="Delete User"
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
          v-if="usersStore.users.value.length > 0"
          :from="usersStore.meta.value.from"
          :to="usersStore.meta.value.to"
          :total="usersStore.meta.value.total"
          v-model:current-page="currentPage"
          :last-page="usersStore.meta.value.last_page"
        />

      </div>
    </div>

    <!-- User Detail Modal Mount -->
    <UserDetailModal 
      :is-open="isDetailOpen"
      :user="selectedUser"
      @close="isDetailOpen = false"
    />

    <!-- User Form Modal mount -->
    <UserFormModal 
      :is-open="isFormOpen"
      :editing-user="selectedUser"
      :roles-list="rolesList"
      @close="isFormOpen = false"
      @saved="loadUsers"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal 
      :is-open="isDeleteOpen"
      title="Delete User Account"
      description="Are you sure you want to permanently delete user account"
      :item-name="selectedUser?.name"
      :is-submitting="isSubmitting"
      @close="isDeleteOpen = false"
      @confirm="confirmDelete"
    />
  </DashboardLayout>
</template>
