import { ref } from 'vue'

const toasts = ref([])

export const useToast = () => {
  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}
