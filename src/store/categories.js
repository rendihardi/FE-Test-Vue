import { ref } from 'vue'
import api from '../utils/api'

export const useCategoriesStore = () => {
  const categories = ref([])
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
      const res = await api.get('/categories/paginated', { params })
      if (res.data.success) {
        categories.value = res.data.data.data
        meta.value = res.data.data.meta
        return res.data
      }
    } catch (err) {
      console.error('Failed fetching paginated categories:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAll = async () => {
    try {
      const res = await api.get('/categories')
      return res.data
    } catch (err) {
      console.error('Failed fetching all categories:', err)
      throw err
    }
  }

  const createCategory = async (payload) => {
    try {
      const res = await api.post('/categories', payload)
      return res.data
    } catch (err) {
      console.error('Failed creating category:', err)
      throw err
    }
  }

  const updateCategory = async (id, payload) => {
    try {
      const res = await api.put(`/categories/${id}`, payload)
      return res.data
    } catch (err) {
      console.error('Failed updating category:', err)
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      const res = await api.delete(`/categories/${id}`)
      return res.data
    } catch (err) {
      console.error('Failed deleting category:', err)
      throw err
    }
  }

  return {
    categories,
    meta,
    isLoading,
    fetchPaginated,
    fetchAll,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
