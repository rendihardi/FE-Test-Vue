<script setup>
import { Loader2 } from '@lucide/vue'

defineProps({
  message: {
    type: String,
    default: 'Fetching data list...'
  }
})
</script>

<template>
  <div class="p-16 flex flex-col items-center justify-center gap-3">
    <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
    <span class="text-xs text-slate-400 font-medium">{{ message }}</span>
  </div>
</template>
