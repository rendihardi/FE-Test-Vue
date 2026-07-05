<script setup>
import { X, Shield } from '@lucide/vue'
import AuditHistorySection from '../../components/AuditHistorySection.vue'

defineProps({
  isOpen: Boolean,
  role: Object
})

defineEmits(['close'])
</script>

<template>
  <div v-if="isOpen && role" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl relative z-10 p-6 space-y-6 max-h-[90vh] overflow-y-auto text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900">Role Details</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Detail Info -->
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 shrink-0">
          <Shield class="w-6 h-6" />
        </div>
        <div class="space-y-1 w-full">
          <h2 class="text-base font-black text-slate-900">{{ role.name }}</h2>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400 font-medium">Guard Name:</span>
            <span class="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{{ role.guard_name }}</span>
          </div>
        </div>
      </div>

      <!-- Audit History -->
      <AuditHistorySection 
        type="role" 
        :id="role.id" 
      />

    </div>
  </div>
</template>
