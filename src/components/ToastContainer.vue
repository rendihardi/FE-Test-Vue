<script setup>
import { useToast } from '../composables/useToast'
import { CheckCircle, AlertTriangle, Info, XCircle, X } from '@lucide/vue'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200',
          toast.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : '',
          toast.type === 'error' ? 'bg-rose-50/95 border-rose-200 text-rose-800' : '',
          toast.type === 'warning' ? 'bg-amber-50/95 border-amber-200 text-amber-800' : '',
          toast.type === 'info' ? 'bg-blue-50/95 border-blue-200 text-blue-800' : ''
        ]"
      >
        <!-- Icon -->
        <component
          :is="
            toast.type === 'success' ? CheckCircle :
            toast.type === 'error' ? XCircle :
            toast.type === 'warning' ? AlertTriangle : Info
          "
          :class="[
            'w-5 h-5 shrink-0 mt-0.5',
            toast.type === 'success' ? 'text-emerald-500' : '',
            toast.type === 'error' ? 'text-rose-500' : '',
            toast.type === 'warning' ? 'text-amber-500' : '',
            toast.type === 'info' ? 'text-blue-500' : ''
          ]"
        />

        <!-- Message -->
        <div class="flex-1 text-sm font-medium leading-5">
          {{ toast.message }}
        </div>

        <!-- Close button -->
        <button
          @click="removeToast(toast.id)"
          :class="[
            'shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer',
            toast.type === 'success' ? 'text-emerald-600' : '',
            toast.type === 'error' ? 'text-rose-600' : '',
            toast.type === 'warning' ? 'text-amber-600' : '',
            toast.type === 'info' ? 'text-blue-600' : ''
          ]"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
