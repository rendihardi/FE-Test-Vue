<script setup>
import { AlertTriangle, Loader2 } from '@lucide/vue'

defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Confirm Deletion'
  },
  description: {
    type: String,
    default: 'Are you sure you want to perform this action?'
  },
  itemName: {
    type: String,
    default: ''
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])
</script>

<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl relative z-10 p-6 space-y-5 text-center">
      <div class="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <AlertTriangle class="w-6 h-6" />
      </div>
      
      <div>
        <h3 class="text-sm font-bold text-slate-900 text-center">{{ title }}</h3>
        <p class="text-xs text-slate-500 mt-2 leading-relaxed text-center">
          {{ description }}
          <span v-if="itemName" class="font-bold text-slate-800">"{{ itemName }}"</span>?
        </p>
      </div>

      <div class="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          @click="$emit('confirm')"
          class="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>Yes, Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
