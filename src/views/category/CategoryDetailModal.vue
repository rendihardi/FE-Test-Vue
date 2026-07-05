<script setup>
import { X, FolderTree } from '@lucide/vue'
import AuditHistorySection from '../../components/AuditHistorySection.vue'

defineProps({
  isOpen: Boolean,
  category: Object
})

defineEmits(['close'])
</script>

<template>
  <div v-if="isOpen && category" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl relative z-10 p-6 space-y-6 max-h-[90vh] overflow-y-auto text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900">Category Details</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Detail Info -->
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 shrink-0">
          <FolderTree class="w-6 h-6" />
        </div>
        <div class="space-y-1 w-full">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-black text-slate-900">{{ category.name }}</h2>
            <span :class="[
              'px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase',
              category.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20' : 'bg-slate-50 text-slate-500 border-slate-200/20'
            ]">
              {{ category.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium leading-relaxed">{{ category.description || 'No description provided.' }}</p>
        </div>
      </div>

      <!-- Audit History -->
      <AuditHistorySection 
        type="category" 
        :id="category.id" 
      />

    </div>
  </div>
</template>
