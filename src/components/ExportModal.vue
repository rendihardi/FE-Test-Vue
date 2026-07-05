<script setup>
import { ref, watch } from 'vue'
import { useExcelStore } from '../store/excel'
import { useToast } from '../composables/useToast'
import { Download, Upload, X, Loader2 } from '@lucide/vue'

const props = defineProps({
  isOpen: Boolean,
  module: String, // 'products', 'stockin', 'stockout', 'adjustment'
  title: String,
  columns: Array, // Array of { label, value }
  allowModuleSelection: Boolean, // If true, shows a dropdown to select module
  filters: Object
})

const emit = defineEmits(['close'])
const { addToast } = useToast()
const excelStore = useExcelStore()

const isSubmitting = ref(false)
const selectedColumns = ref([])
const selectedModule = ref(props.module || 'stockin')

// Reset / Select all by default when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.columns) {
      selectedColumns.value = props.columns.map(c => c.value)
    }
    if (props.module) {
      selectedModule.value = props.module
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (selectedColumns.value.length === 0) {
    addToast('Please select at least one column to include.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const res = await excelStore.triggerExport(selectedModule.value, {
      columns: selectedColumns.value,
      ...(props.filters || {})
    })
    if (res.success) {
      addToast('Export task queued in background successfully.', 'success')
      emit('close')
    }
  } catch (err) {
    addToast(err.response?.data?.message || 'Failed to dispatch export job.', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl relative z-10 p-6 space-y-5 text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Upload class="w-4.5 h-4.5 text-blue-500" />
          <span>{{ title || 'Export Data to Excel' }}</span>
        </h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Optional Module Selector -->
      <div v-if="allowModuleSelection" class="space-y-1.5">
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Export Dataset</label>
        <select
          v-model="selectedModule"
          class="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-850 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="stockin">Stock In Transactions</option>
          <option value="stockout">Stock Out Transactions</option>
          <option value="adjustment">Stock Adjustments</option>
        </select>
      </div>

      <div class="space-y-3">
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Columns to Include</label>
        <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
          <div 
            v-for="col in columns" 
            :key="col.value"
            class="flex items-center gap-2.5 py-0.5"
          >
            <input
              v-model="selectedColumns"
              type="checkbox"
              :value="col.value"
              class="w-4 h-4 text-blue-600 border-slate-350 rounded-sm focus:ring-blue-500 cursor-pointer"
            />
            <span class="text-[11px] font-semibold text-slate-655">{{ col.label }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3 pt-2">
        <button
          @click="$emit('close')"
          class="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="isSubmitting || selectedColumns.length === 0"
          class="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Queueing Export...' : 'Queue Export' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
