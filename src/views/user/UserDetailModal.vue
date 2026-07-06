<script setup>
import { X, User } from '@lucide/vue'
import { formatDateTime } from '../../utils/helpers'
import AuditHistorySection from '../../components/AuditHistorySection.vue'

defineProps({
  isOpen: Boolean,
  user: Object
})

defineEmits(['close'])
</script>

<template>
  <div v-if="isOpen && user" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl relative z-10 p-6 space-y-6 max-h-[90vh] overflow-y-auto text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900">User Account Details</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Detail Info -->
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 shrink-0">
          <User class="w-6 h-6" />
        </div>
        <div class="space-y-2 w-full">
          <div>
            <h2 class="text-base font-black text-slate-900">{{ user.name }}</h2>
            <p class="text-xs font-mono text-slate-450">{{ user.email }}</p>
          </div>
          
          <div class="flex flex-wrap gap-1.5 items-center">
            <span class="text-[10px] text-slate-400 font-bold uppercase mr-1">Roles:</span>
            <span 
              v-for="role in (user.roles || [])" 
              :key="typeof role === 'string' ? role : role.id"
              class="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase"
            >
              {{ typeof role === 'string' ? role : role.name }}
            </span>
            <span v-if="!user.roles || user.roles.length === 0" class="text-xs text-slate-400 italic">No assigned roles</span>
          </div>

          <div class="text-[10px] text-slate-400 font-medium">
            Registered on {{ formatDateTime(user.created_at) }}
          </div>
        </div>
      </div>

      <!-- Audit History -->
      <!-- User ID can be user.uuid or user.id depending on how it is key'd in database -->
      <AuditHistorySection 
        type="user" 
        :id="user.uuid" 
      />

    </div>
  </div>
</template>
