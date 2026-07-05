<script setup>
defineProps({
  title: {
    type: String,
    default: 'No Data Found'
  },
  description: {
    type: String,
    default: 'Try adjusting your search terms or filters.'
  },
  icon: {
    type: [Object, Function],
    default: null
  }
})
</script>

<template>
  <div class="p-16 flex flex-col items-center justify-center text-center gap-2">
    <div class="text-slate-300">
      <component :is="icon" v-if="icon" class="w-12 h-12 text-slate-350" />
      <slot name="icon" v-else>
        <!-- Fallback standard folder icon -->
        <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </slot>
    </div>
    <h3 class="text-sm font-bold text-slate-700 mt-2">{{ title }}</h3>
    <p class="text-xs text-slate-400 max-w-xs leading-relaxed">{{ description }}</p>
  </div>
</template>
