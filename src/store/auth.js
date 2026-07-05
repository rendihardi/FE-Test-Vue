import { reactive, computed } from 'vue'

const state = reactive({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
})

export const useAuthStore = () => {
  const isLoggedIn = computed(() => !!state.token)
  
  const isAdmin = computed(() => {
    if (!state.user || !state.user.roles) return false
    return state.user.roles.some(role => {
      if (typeof role === 'string') {
        return role === 'Administrator'
      }
      return role && role.name === 'Administrator'
    })
  })

  const setUser = (user, token) => {
    state.user = user
    state.token = token
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const clearAuth = () => {
    state.user = null
    state.token = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    state,
    isLoggedIn,
    isAdmin,
    setUser,
    clearAuth
  }
}
