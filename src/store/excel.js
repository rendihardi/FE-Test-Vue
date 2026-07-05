import { ref } from 'vue'
import api from '../utils/api'

export const useExcelStore = () => {
  const jobs = ref([])
  const meta = ref({
    current_page: 1,
    last_page: 1,
    total: 0
  })
  const isLoading = ref(false)

  const fetchJobs = async (params) => {
    isLoading.value = true
    try {
      const res = await api.get('/excel/jobs', { params })
      if (res.data.success) {
        jobs.value = res.data.data.data
        meta.value = res.data.data.meta
        return res.data
      }
    } catch (err) {
      console.error('Failed fetching excel jobs:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const triggerExport = async (module, payload) => {
    try {
      let endpoint = '/excel/export/products'
      if (module === 'stockin') endpoint = '/excel/export/stock-in'
      if (module === 'stockout') endpoint = '/excel/export/stock-out'
      if (module === 'adjustment') endpoint = '/excel/export/adjustments'
      if (module === 'stocktransactions') endpoint = '/excel/export/stock-transactions'

      const res = await api.post(endpoint, payload)
      return res.data
    } catch (err) {
      console.error(`Failed triggering ${module} export:`, err)
      throw err
    }
  }

  const triggerImport = async (formData) => {
    try {
      const res = await api.post('/excel/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return res.data
    } catch (err) {
      console.error('Failed triggering import:', err)
      throw err
    }
  }

  return {
    jobs,
    meta,
    isLoading,
    fetchJobs,
    triggerExport,
    triggerImport
  }
}
