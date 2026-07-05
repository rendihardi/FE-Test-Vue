import { ref } from 'vue'
import api from '../utils/api'

export const useUsersStore = () => {
  const users = ref([])
  const meta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  })
  const isLoading = ref(false)

  const fetchPaginated = async (params) => {
    isLoading.value = true
    try {
      const res = await api.get('/users/paginated', { params })
      if (res.data.success) {
        users.value = res.data.data.data
        meta.value = res.data.data.meta
        return res.data
      }
    } catch (err) {
      console.error('Failed fetching paginated users:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAll = async () => {
    try {
      const res = await api.get('/users')
      return res.data
    } catch (err) {
      console.error('Failed fetching all users:', err)
      throw err
    }
  }

  const createUser = async (payload) => {
    try {
      const res = await api.post('/users', payload)
      return res.data
    } catch (err) {
      console.error('Failed creating user:', err)
      throw err
    }
  }

  const updateUser = async (id, payload) => {
    try {
      const res = await api.put(`/users/${id}`, payload)
      return res.data
    } catch (err) {
      console.error('Failed updating user:', err)
      throw err
    }
  }

  const deleteUser = async (id) => {
    try {
      const res = await api.delete(`/users/${id}`)
      return res.data
    } catch (err) {
      console.error('Failed deleting user:', err)
      throw err
    }
  }

  return {
    users,
    meta,
    isLoading,
    fetchPaginated,
    fetchAll,
    createUser,
    updateUser,
    deleteUser
  }
}
