<script setup>
import { ref, watch } from 'vue'
import { useCategoriesStore } from '../../store/categories'
import { useToast } from '../../composables/useToast'
import { X, Loader2 } from '@lucide/vue'
import FormInput from '../../components/FormInput.vue'

const props = defineProps({
  isOpen: Boolean,
  editingCategory: Object
})

const emit = defineEmits(['close', 'saved'])
const { addToast } = useToast()
const categoriesStore = useCategoriesStore()

const isSubmitting = ref(false)
const form = ref({
  name: '',
  description: '',
  is_active: true
})
const errors = ref({})

watch([() => props.isOpen, () => props.editingCategory], ([isOpen, newVal]) => {
  if (isOpen) {
    if (newVal) {
      form.value = {
        name: newVal.name,
        description: newVal.description || '',
        is_active: !!newVal.is_active
      }
    } else {
      form.value = {
        name: '',
        description: '',
        is_active: true
      }
    }
    errors.value = {}
  }
}, { immediate: true })

const handleSubmit = async () => {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = ['Category name is required']
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      is_active: form.value.is_active ? 1 : 0
    }

    let res
    if (props.editingCategory) {
      res = await categoriesStore.updateCategory(props.editingCategory.id, payload)
    } else {
      res = await categoriesStore.createCategory(payload)
    }

    if (res.success) {
      addToast(props.editingCategory ? 'Category updated successfully.' : 'Category created successfully.', 'success')
      emit('saved')
      emit('close')
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors || {}
    } else {
      addToast('An error occurred while saving the category.', 'error')
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
          {{ editingCategory ? 'Edit Category' : 'Create New Category' }}
        </h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
        <FormInput 
          id="cat-name"
          label="Category Name"
          v-model="form.name"
          required
          placeholder="e.g. Office Stationery"
          :error="errors.name ? errors.name[0] : ''"
        />

        <FormInput 
          id="cat-desc"
          label="Description"
          v-model="form.description"
          textarea
          placeholder="Optional summary detailing items grouped in this category..."
          :error="errors.description ? errors.description[0] : ''"
        />

        <div class="flex items-center gap-2.5 py-1">
          <input
            id="cat-active"
            v-model="form.is_active"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500 cursor-pointer"
          />
          <label for="cat-active" class="text-xs font-semibold text-slate-650 cursor-pointer">
            Set this category as active and visible to catalog
          </label>
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
            <span>{{ isSubmitting ? 'Saving...' : 'Save Category' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
