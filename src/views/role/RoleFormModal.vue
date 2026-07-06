<script setup>
import { ref, watch } from 'vue'
import { useRolesStore } from '../../store/roles'
import { useToast } from '../../composables/useToast'
import { X, Loader2 } from '@lucide/vue'
import FormInput from '../../components/FormInput.vue'

const props = defineProps({
  isOpen: Boolean,
  editingRole: Object
})

const emit = defineEmits(['close', 'saved'])
const { addToast } = useToast()
const rolesStore = useRolesStore()

const isSubmitting = ref(false)
const form = ref({
  name: '',
  guard_name: 'sanctum'
})
const errors = ref({})

watch([() => props.isOpen, () => props.editingRole], ([isOpen, newVal]) => {
  if (isOpen) {
    if (newVal) {
      form.value = {
        name: newVal.name,
        guard_name: newVal.guard_name || 'sanctum'
      }
    } else {
      form.value = {
        name: '',
        guard_name: 'sanctum'
      }
    }
    errors.value = {}
  }
}, { immediate: true })

const handleSubmit = async () => {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = ['Role name is required']
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      name: form.value.name,
      guard_name: form.value.guard_name
    }

    let res
    if (props.editingRole) {
      res = await rolesStore.updateRole(props.editingRole.id, payload)
    } else {
      res = await rolesStore.createRole(payload)
    }

    if (res.success) {
      addToast(props.editingRole ? 'Role updated successfully.' : 'Role created successfully.', 'success')
      emit('saved')
      emit('close')
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors || {}
    } else {
      addToast('An error occurred while saving the role.', 'error')
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
          {{ editingRole ? 'Edit Role' : 'Create New Role' }}
        </h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
        <FormInput 
          id="role-name"
          label="Role Name"
          v-model="form.name"
          required
          placeholder="e.g. Sales Officer"
          :error="errors.name ? errors.name[0] : ''"
        />


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
            <span>{{ isSubmitting ? 'Saving...' : 'Save Role' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
