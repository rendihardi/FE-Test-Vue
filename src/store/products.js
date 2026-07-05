import { ref } from 'vue'
import api from '../utils/api'

export const useProductsStore = () => {
  const products = ref([])
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
      const res = await api.get('/products/paginated', { params })
      if (res.data.success) {
        products.value = res.data.data.data
        meta.value = res.data.data.meta
        return res.data
      }
    } catch (err) {
      console.error('Failed fetching paginated products:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchAll = async () => {
    try {
      const res = await api.get('/products')
      return res.data
    } catch (err) {
      console.error('Failed fetching all products:', err)
      throw err
    }
  }

  const createProduct = async (formData) => {
    try {
      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      console.error('Failed creating product:', err)
      throw err
    }
  }

  const updateProduct = async (id, formData) => {
    try {
      // Laravel requires POST with spoofed PUT method when processing multipart/form-data
      formData.append('_method', 'PUT')
      const res = await api.post(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      console.error('Failed updating product:', err)
      throw err
    }
  }

  const deleteProduct = async (id) => {
    try {
      const res = await api.delete(`/products/${id}`)
      return res.data
    } catch (err) {
      console.error('Failed deleting product:', err)
      throw err
    }
  }

  return {
    products,
    meta,
    isLoading,
    fetchPaginated,
    fetchAll,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
