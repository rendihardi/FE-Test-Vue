import { ref } from 'vue'
import api from '../utils/api'

export const useRolesStore = () => {
  const roles = ref([])
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
      const res = await api.get('/roles/paginated', { params })
      if (res.data.success) {
        roles.value = res.data.data.data
        meta.value = res.data.data.meta
        return res.data
      }
    } catch (err) {
      console.error('Failed fetching paginated roles:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAll = async () => {
    try {
      const res = await api.get('/roles')
      return res.data
    } catch (err) {
      console.error('Failed fetching all roles:', err)
      throw err
    }
  }

  const createRole = async (payload) => {
    try {
      const res = await api.post('/roles', payload)
      return res.data
    } catch (err) {
      console.error('Failed creating role:', err)
      throw err
    }
  }

  const updateRole = async (id, payload) => {
    try {
      const res = await api.put(`/roles/${id}`, payload)
      return res.data
    } catch (err) {
      console.error('Failed updating role:', err)
      throw err
    }
  }

  const deleteRole = async (id) => {
    try {
      const res = await api.delete(`/roles/${id}`)
      return res.data
    } catch (err) {
      console.error('Failed deleting role:', err)
      throw err
    }
  }

  return {
    roles,
    meta,
    isLoading,
    fetchPaginated,
    fetchAll,
    createRole,
    updateRole,
    deleteRole
  }
}
