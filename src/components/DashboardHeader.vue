<script setup>
import { Menu, ChevronRight } from '@lucide/vue'

defineProps({
  title: {
    type: String,
    default: 'Management System'
  }
})

defineEmits(['toggle-sidebar'])
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-xs">
    <div class="flex items-center gap-4">
      <button 
        @click="$emit('toggle-sidebar')" 
        class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        <Menu class="w-5 h-5" />
      </button>
      
      <!-- Breadcrumb / Title -->
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <span>App</span>
        <ChevronRight class="w-4 h-4 text-slate-300" />
        <span class="font-semibold text-slate-800">{{ title }}</span>
      </div>
    </div>

    <!-- Right Side Controls -->
    <div class="flex items-center gap-4">
      <!-- Live Date Clock -->
      <div class="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Live System Connected</span>
      </div>
    </div>
  </header>
</template>
