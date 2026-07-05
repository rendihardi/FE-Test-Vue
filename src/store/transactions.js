import { ref } from 'vue'
import api from '../utils/api'

export const useTransactionsStore = () => {
  const transactions = ref([])
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
      const res = await api.get('/stock-transactions/paginated', { params })
      if (res.data.success) {
        transactions.value = res.data.data.data
        meta.value = res.data.data.meta
        return res.data
      }
    } catch (err) {
      console.error('Failed fetching paginated transactions:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const stockIn = async (productId, formData) => {
    try {
      const res = await api.post(`/products/${productId}/stock-in`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      console.error('Failed registering Stock In:', err)
      throw err
    }
  }

  const stockOut = async (productId, formData) => {
    try {
      const res = await api.post(`/products/${productId}/stock-out`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      console.error('Failed registering Stock Out:', err)
      throw err
    }
  }

  const adjustStock = async (productId, formData) => {
    try {
      const res = await api.post(`/products/${productId}/adjust-stock`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      console.error('Failed adjusting stock:', err)
      throw err
    }
  }

  return {
    transactions,
    meta,
    isLoading,
    fetchPaginated,
    stockIn,
    stockOut,
    adjustStock
  }
}
