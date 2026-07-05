<script setup>
import { ref, watch } from 'vue'
import { useExcelStore } from '../../store/excel'
import { useToast } from '../../composables/useToast'
import api from '../../utils/api'
import { 
  Upload, 
  Download, 
  X, 
  Loader2, 
  Info 
} from '@lucide/vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'imported'])
const { addToast } = useToast()
const excelStore = useExcelStore()

const isSubmitting = ref(false)
const importFile = ref(null)
const fileInputRef = ref(null)

// Reset state when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    importFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) {
    importFile.value = null
    return
  }

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
    addToast('Only Excel (.xlsx, .xls) or CSV files are allowed.', 'error')
    e.target.value = ''
    importFile.value = null
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    addToast('File size must be under 10 MB.', 'error')
    e.target.value = ''
    importFile.value = null
    return
  }

  importFile.value = file
}

const handleSubmit = async () => {
  if (!importFile.value) {
    addToast('Please select a valid template spreadsheet first.', 'error')
    return
  }

  isSubmitting.value = true
  const formData = new FormData()
  formData.append('file', importFile.value)

  try {
    const res = await excelStore.triggerImport(formData)
    if (res.success) {
      addToast('Import task successfully queued in the background.', 'success')
      emit('imported')
      emit('close')
    }
  } catch (err) {
    addToast(err.response?.data?.message || 'Failed to trigger background import task.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const downloadTemplate = async (format) => {
  try {
    const res = await api.get('/excel/templates/product', {
      params: { format },
      responseType: 'blob'
    })
    const blob = new Blob([res.data], {
      type: format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `product_import_template.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href)
    addToast(`Template ${format.toUpperCase()} downloaded successfully.`, 'success')
  } catch (err) {
    addToast('Failed to download product import template.', 'error')
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl relative z-10 p-6 space-y-5 text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Download class="w-4.5 h-4.5 text-indigo-500" />
          <span>Import Catalog Products</span>
        </h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-3 text-left">
        <Info class="w-5 h-5 text-indigo-500 shrink-0" />
        <div class="text-[11px] text-indigo-750 space-y-1">
          <p class="font-bold">Instructions & Template rules:</p>
          <p>Upload a valid spreadsheet (.xlsx or .csv) containing product columns. Key fields: <strong>Product Name</strong> (required), price, current_stock, category, etc. Files must be under 10MB.</p>
        </div>
      </div>

      <!-- Download Templates -->
      <div class="space-y-2">
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Download Prepared Templates</label>
        <div class="flex items-center gap-2">
          <button
            @click="downloadTemplate('xlsx')"
            class="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            @click="downloadTemplate('csv')"
            class="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download class="w-3.5 h-3.5" />
            <span>CSV (.csv)</span>
          </button>
        </div>
      </div>

      <!-- File selector -->
      <div class="space-y-1.5">
        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Spreadsheet File</label>
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls,.csv"
          @change="handleFileChange"
          class="block w-full border border-slate-200 rounded-xl text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-705 hover:file:bg-slate-200 cursor-pointer"
        />
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
          :disabled="isSubmitting || !importFile"
          class="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer transition-colors"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Queueing...' : 'Queue Import' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
