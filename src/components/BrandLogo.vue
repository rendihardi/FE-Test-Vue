<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value)
  },
  gradientText: {
    type: Boolean,
    default: false
  },
  showText: {
    type: Boolean,
    default: true
  }
})

const boxClass = computed(() => {
  return props.size === 'sm'
    ? 'w-8 h-8 rounded-lg text-sm bg-blue-600 font-bold text-white shrink-0 shadow-md shadow-blue-500/20'
    : 'w-9 h-9 rounded-xl text-base bg-blue-600 font-bold text-white shrink-0 shadow-lg shadow-blue-500/25'
})

const textClass = computed(() => {
  let classes = 'tracking-wider '
  if (props.size === 'sm') {
    classes += 'font-semibold text-lg text-white'
  } else {
    classes += 'font-bold text-xl '
    if (props.gradientText) {
      classes += 'bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent'
    } else {
      classes += 'text-white'
    }
  }
  return classes
})
</script>

<template>
  <div class="flex items-center gap-3 overflow-hidden">
    <div :class="boxClass" class="flex items-center justify-center">
      IA
    </div>
    <span v-if="showText" :class="textClass" class="whitespace-nowrap">
      Inventory Application
    </span>
  </div>
</template>
