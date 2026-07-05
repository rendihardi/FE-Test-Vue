<script setup>
import { ChevronLeft, ChevronRight } from '@lucide/vue'

defineProps({
  from: {
    type: Number,
    default: 0
  },
  to: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    required: true
  },
  lastPage: {
    type: Number,
    required: true
  }
})

defineEmits(['update:currentPage'])
</script>

<template>
  <div class="p-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
    <div>
      Showing <span class="font-bold text-slate-700">{{ from }}</span> to 
      <span class="font-bold text-slate-700">{{ to }}</span> of 
      <span class="font-bold text-slate-700">{{ total }}</span> results
    </div>
    
    <div class="flex items-center gap-1">
      <button
        @click="$emit('update:currentPage', currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
      <span class="px-3 font-semibold text-slate-700">Page {{ currentPage }} / {{ lastPage }}</span>
      <button
        @click="$emit('update:currentPage', currentPage + 1)"
        :disabled="currentPage === lastPage"
        class="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
