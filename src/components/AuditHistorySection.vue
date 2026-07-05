<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuditsStore } from '../store/audits'
import { formatDateTime } from '../utils/helpers'
import { Clock, ChevronDown, ChevronUp, History } from '@lucide/vue'

const props = defineProps({
  type: {
    type: String,
    required: true // 'product', 'category', 'user', 'role'
  },
  id: {
    type: [String, Number],
    required: true
  }
})

const auditsStore = useAuditsStore()
const auditsList = ref([])
const isLoading = ref(false)
const expandedRows = ref({})

const loadHistory = async () => {
  if (!props.id) return
  isLoading.value = true
  try {
    const res = await auditsStore.fetchAudits(props.type, {
      auditable_id: props.id,
      row_per_page: 50 // Get all recent changes
    })
    if (res && res.success) {
      // The store updates audits.value, but we filter/store locally to avoid conflicts
      auditsList.value = auditsStore.audits.value
    }
  } catch (err) {
    console.error('Failed to load audit history:', err)
  } finally {
    isLoading.value = false
  }
}

const toggleRow = (auditId) => {
  expandedRows.value[auditId] = !expandedRows.value[auditId]
}

const parseValues = (val) => {
  if (!val) return {}
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch (e) {
    return {}
  }
}

const getChangedKeys = (audit) => {
  const oldVal = parseValues(audit.old_values)
  const newVal = parseValues(audit.new_values)
  const keys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)])
  return Array.from(keys).filter(k => k !== 'updated_at')
}

watch(() => props.id, () => {
  expandedRows.value = {}
  loadHistory()
}, { immediate: true })

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <div class="space-y-3 pt-4 border-t border-slate-150">
    <div class="flex items-center gap-2">
      <History class="w-4 h-4 text-slate-400" />
      <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Change History & Audits</h4>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-6 flex flex-col items-center justify-center gap-2 border border-slate-150 rounded-xl bg-slate-50/50">
      <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-[11px] text-slate-400 font-medium">Fetching history log...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="auditsList.length === 0" class="py-6 flex flex-col items-center justify-center border border-slate-150 rounded-xl bg-slate-50/30 text-slate-400">
      <Clock class="w-6 h-6 text-slate-300 mb-1" />
      <span class="text-[11px] font-semibold">No modifications logged yet</span>
    </div>

    <!-- Audits List -->
    <div v-else class="border border-slate-150 rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-55/60 text-slate-400 uppercase font-bold text-[9px] border-b border-slate-150">
            <th class="px-4 py-2 w-6"></th>
            <th class="px-4 py-2">Operator</th>
            <th class="px-4 py-2">Action</th>
            <th class="px-4 py-2">Date & Time</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <template v-for="audit in auditsList" :key="audit.id">
            <tr class="hover:bg-slate-50/50 transition-colors text-[11px]">
              <td class="px-4 py-2">
                <button 
                  @click="toggleRow(audit.id)"
                  class="p-0.5 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
                >
                  <ChevronDown v-if="!expandedRows[audit.id]" class="w-3.5 h-3.5" />
                  <ChevronUp v-else class="w-3.5 h-3.5" />
                </button>
              </td>
              <td class="px-4 py-2 font-bold text-slate-700">
                {{ audit.user?.name || 'System / Import' }}
              </td>
              <td class="px-4 py-2">
                <span :class="[
                  'px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border uppercase tracking-wider',
                  audit.event === 'created' ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20' : 
                  audit.event === 'updated' ? 'bg-blue-50 text-blue-700 border-blue-200/20' :
                  'bg-rose-50 text-rose-700 border-rose-250/20'
                ]">
                  {{ audit.event }}
                </span>
              </td>
              <td class="px-4 py-2 text-slate-450 font-mono">
                {{ formatDateTime(audit.created_at) }}
              </td>
            </tr>

            <!-- Expanded Comparative Diff -->
            <tr v-if="expandedRows[audit.id]" class="bg-slate-50/40">
              <td colspan="4" class="px-4 py-3 border-t border-slate-100">
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-[9px] text-slate-400 uppercase font-mono">
                    <span>IP: {{ audit.ip_address || '-' }}</span>
                    <span>Agent: {{ audit.user_agent || '-' }}</span>
                  </div>

                  <div class="border border-slate-150 rounded-lg overflow-hidden bg-white">
                    <table class="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr class="bg-slate-50 text-slate-400 font-bold border-b border-slate-150">
                          <th class="px-3 py-1.5">Field</th>
                          <th class="px-3 py-1.5">Original / Old Value</th>
                          <th class="px-3 py-1.5">Updated / New Value</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr 
                          v-for="key in getChangedKeys(audit)" 
                          :key="key"
                          class="hover:bg-slate-50/30 font-mono"
                        >
                          <td class="px-3 py-1.5 font-bold text-slate-600 capitalize">{{ key.replace('_', ' ') }}</td>
                          <td class="px-3 py-1.5 text-rose-600 bg-rose-50/20 max-w-[150px] truncate" :title="String(parseValues(audit.old_values)[key] ?? '')">
                            {{ parseValues(audit.old_values)[key] ?? '-' }}
                          </td>
                          <td class="px-3 py-1.5 text-emerald-600 bg-emerald-50/20 max-w-[150px] truncate" :title="String(parseValues(audit.new_values)[key] ?? '')">
                            {{ parseValues(audit.new_values)[key] ?? '-' }}
                          </td>
                        </tr>
                        <tr v-if="getChangedKeys(audit).length === 0">
                          <td colspan="3" class="px-3 py-2 text-center text-slate-400 italic">No visible changes recorded</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
