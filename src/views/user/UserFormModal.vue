<script setup>
import { ref, watch } from 'vue'
import { useUsersStore } from '../../store/users'
import { useToast } from '../../composables/useToast'
import { X, Loader2 } from '@lucide/vue'
import FormInput from '../../components/FormInput.vue'

const props = defineProps({
  isOpen: Boolean,
  editingUser: Object,
  rolesList: Array
})

const emit = defineEmits(['close', 'saved'])
const { addToast } = useToast()
const usersStore = useUsersStore()

const isSubmitting = ref(false)
const form = ref({
  name: '',
  email: '',
  password: '',
  role: ''
})
const errors = ref({})

watch([() => props.isOpen, () => props.editingUser], ([isOpen, newVal]) => {
  if (isOpen) {
    if (newVal) {
      let currentRole = ''
      if (newVal.roles && newVal.roles.length > 0) {
        const firstRole = newVal.roles[0]
        currentRole = typeof firstRole === 'string' ? firstRole : (firstRole.name || '')
      }

      form.value = {
        name: newVal.name,
        email: newVal.email,
        password: '',
        role: currentRole
      }
    } else {
      form.value = {
        name: '',
        email: '',
        password: '',
        role: ''
      }
    }
    errors.value = {}
  }
}, { immediate: true })

const handleSubmit = async () => {
  errors.value = {}
  
  if (!form.value.name.trim()) errors.value.name = ['Name is required']
  if (!form.value.email.trim()) errors.value.email = ['Email is required']
  if (!props.editingUser && !form.value.password) errors.value.password = ['Password is required']
  if (!form.value.role) errors.value.role = ['Please assign a role']

  if (Object.keys(errors.value).length > 0) return

  isSubmitting.value = true
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      roles: [form.value.role]
    }

    if (form.value.password) {
      payload.password = form.value.password
    }

    let res
    if (props.editingUser) {
      res = await usersStore.updateUser(props.editingUser.id, payload)
    } else {
      res = await usersStore.createUser(payload)
    }

    if (res.success) {
      addToast(props.editingUser ? 'User account updated successfully.' : 'User account registered successfully.', 'success')
      emit('saved')
      emit('close')
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors || {}
    } else {
      addToast('An error occurred while saving user accounts.', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl relative z-10 p-6 space-y-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900">
          {{ editingUser ? 'Edit User Credentials' : 'Register New User Account' }}
        </h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
        <FormInput 
          id="user-name"
          label="Full Name"
          v-model="form.name"
          required
          placeholder="e.g. John Doe"
          :error="errors.name ? errors.name[0] : ''"
        />

        <FormInput 
          id="user-email"
          label="Email Address"
          type="email"
          v-model="form.email"
          required
          placeholder="johndoe@example.com"
          :error="errors.email ? errors.email[0] : ''"
        />

        <FormInput 
          id="user-password"
          :label="'Password ' + (editingUser ? '(Optional)' : '*')"
          type="password"
          v-model="form.password"
          :required="!editingUser"
          placeholder="••••••••"
          :error="errors.password ? errors.password[0] : ''"
        />
        <p v-if="editingUser && !errors.password" class="text-[9.5px] text-slate-400 -mt-1">Leave blank to retain current user password.</p>

        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Security Scope (Role) *
          </label>
          <select
            v-model="form.role"
            required
            :class="[
              'block w-full px-3 py-2 border rounded-xl text-slate-850 text-xs focus:outline-none transition-all cursor-pointer',
              errors.role ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            ]"
          >
            <option value="">Select scope role...</option>
            <option v-for="r in rolesList" :key="r.id" :value="r.name">
              {{ r.name }}
            </option>
          </select>
          <p v-if="errors.role" class="mt-1 text-[10px] text-rose-500">{{ errors.role[0] }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Saving Account...' : 'Save User' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
