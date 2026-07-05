import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Attach bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response Interceptor: Handle errors globally
api.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Session expired or unauthorized, clear storage and redirect
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Redirect to login only if not already on login or landing page
    const currentPath = window.location.pathname
    if (currentPath !== '/' && currentPath !== '/login') {
      window.location.href = '/login?message=session_expired'
    }
  }
  return Promise.reject(error)
})

export default api
