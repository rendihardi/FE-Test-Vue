import { ref } from 'vue'
import api from '../utils/api'

export const useAuditsStore = () => {
  const audits = ref([])
  const meta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  })
  const isLoading = ref(false)

  const fetchAudits = async (type, params) => {
    isLoading.value = true
    try {
      let endpoint = '/audits/products'
      if (type === 'category') endpoint = '/audits/categories'
      if (type === 'user') endpoint = '/audits/users'
      if (type === 'role') endpoint = '/audits/roles'

      const res = await api.get(endpoint, { params })
      if (res.data.success) {
        audits.value = res.data.data.data
        meta.value = res.data.data.meta
        return res.data
      }
    } catch (err) {
      console.error(`Failed fetching ${type} audits:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    audits,
    meta,
    isLoading,
    fetchAudits
  }
}
