<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuditsStore } from '../../store/audits'
import { useToast } from '../../composables/useToast'
import { formatDateTime } from '../../utils/helpers'

import Pagination from '../../components/Pagination.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import { 
  Search, 
  Clock,
  ChevronDown,
  ChevronUp
} from '@lucide/vue'

const route = useRoute()
const { addToast } = useToast()
const auditsStore = useAuditsStore()

// Read active audit class category
const auditType = computed(() => route.query.type || 'product')

// Query & Filter params
const search = ref('')
const selectedEvent = ref('')
const rowPerPage = ref(10)
const currentPage = ref(1)

// Expanded rows mapping for side-by-side JSON comparison
const expandedRows = ref({})

const loadAudits = async () => {
  expandedRows.value = {} // reset collapse
  try {
    await auditsStore.fetchAudits(auditType.value, {
      search: search.value,
      event: selectedEvent.value || undefined,
      row_per_page: rowPerPage.value,
      page: currentPage.value
    })
  } catch (err) {
    addToast('Failed to retrieve system logs.', 'error')
  }
}

// Watchers
watch(auditType, () => {
  currentPage.value = 1
  search.value = ''
  selectedEvent.value = ''
  loadAudits()
})

watch([rowPerPage, currentPage, selectedEvent], () => {
  loadAudits()
})

let searchTimeout
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadAudits()
  }, 400)
})

onMounted(() => {
  loadAudits()
})

// UI Toggle Details
const toggleRow = (id) => {
  expandedRows.value[id] = !expandedRows.value[id]
}


// Parse audit old/new values safely
const parseValues = (val) => {
  if (!val) return {}
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch (e) {
    return {}
  }
}

// Calculate the changed keys list
const getChangedKeys = (audit) => {
  const oldVal = parseValues(audit.old_values)
  const newVal = parseValues(audit.new_values)
  const keys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)])
  return Array.from(keys).filter(k => k !== 'updated_at')
}
</script>

<template>
  <div>
    <div class="space-y-6">
      
      <!-- Top Title Bar -->
      <div class="text-left">
        <h2 class="text-xl font-bold text-slate-900 capitalize">{{ auditType }} Audit Logs</h2>
        <p class="text-xs text-slate-500">Trace history modifications, tracking who, when, and what changed in the database.</p>
      </div>

      <!-- Table Container -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        <!-- Controls header -->
        <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 text-left">
          
          <!-- Search input -->
          <div class="relative max-w-sm w-full">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search class="w-4 h-4" />
            </span>
            <input
              v-model="search"
              type="text"
              placeholder="Search changed values, user agent, IP..."
              class="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-650">
            <!-- Event trigger filter -->
            <div class="flex items-center gap-1.5">
              <span>Event:</span>
              <select 
                v-model="selectedEvent"
                class="bg-white border border-slate-200 rounded-lg py-1 px-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">All Events</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="restored">Restored</option>
              </select>
            </div>

            <!-- Page count -->
            <div class="flex items-center gap-2">
              <span>Show</span>
              <select 
                v-model="rowPerPage"
                class="bg-white border border-slate-200 rounded-lg py-1 px-2 focus:outline-none"
              >
                <option :value="5">5 rows</option>
                <option :value="10">10 rows</option>
                <option :value="20">20 rows</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table Loading state -->
        <LoadingState 
          v-if="auditsStore.isLoading.value" 
          message="Loading audit trail logs..."
        />

        <!-- Empty State -->
        <EmptyState 
          v-else-if="auditsStore.audits.value.length === 0"
          title="No Audits Recorded"
          description="No modification entries match your filter settings."
          :icon="Clock"
        />

        <!-- Data Table -->
        <div v-else class="overflow-x-auto text-left">
          <table class="w-full text-left border-collapse text-xs text-slate-650">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-150">
                <th class="px-6 py-3.5 tracking-wider w-8"></th>
                <th class="px-6 py-3.5 tracking-wider">User Operator</th>
                <th class="px-6 py-3.5 tracking-wider">Event Trigger</th>
                <th class="px-6 py-3.5 tracking-wider">Target ID</th>
                <th class="px-6 py-3.5 tracking-wider">IP Address</th>
                <th class="px-6 py-3.5 tracking-wider">Date & Time</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="audit in auditsStore.audits.value" :key="audit.id">
                <!-- Main log row -->
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4">
                    <button 
                      @click="toggleRow(audit.id)"
                      class="p-1 hover:bg-slate-100 rounded text-slate-550 cursor-pointer"
                    >
                      <ChevronDown v-if="!expandedRows[audit.id]" class="w-4 h-4" />
                      <ChevronUp v-else class="w-4 h-4" />
                    </button>
                  </td>

                  <!-- User -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                        {{ audit.user?.name?.charAt(0) || 'S' }}
                      </div>
                      <div>
                        <p class="font-bold text-slate-800">{{ audit.user?.name || 'System / Seeder' }}</p>
                        <p class="text-[9.5px] text-slate-450 truncate max-w-[130px] font-mono">{{ audit.user?.email || '' }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Event -->
                  <td class="px-6 py-4">
                    <span :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider',
                      audit.event === 'created' ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20' : 
                      audit.event === 'updated' ? 'bg-blue-50 text-blue-700 border-blue-200/20' :
                      'bg-rose-50 text-rose-700 border-rose-250/20'
                    ]">
                      {{ audit.event }}
                    </span>
                  </td>

                  <!-- Target ID -->
                  <td class="px-6 py-4 font-mono text-slate-500 text-[10px] max-w-[100px] truncate" :title="audit.auditable_id">
                    {{ audit.auditable_id }}
                  </td>

                  <!-- IP Address -->
                  <td class="px-6 py-4 font-mono text-slate-500">{{ audit.ip_address || '-' }}</td>

                  <!-- Date -->
                  <td class="px-6 py-4 text-slate-500 whitespace-nowrap">{{ formatDateTime(audit.created_at) }}</td>

                  <!-- Toggle link -->
                  <td class="px-6 py-4 text-right">
                    <button 
                      @click="toggleRow(audit.id)"
                      class="text-blue-650 hover:underline font-bold cursor-pointer"
                    >
                      {{ expandedRows[audit.id] ? 'Hide' : 'Review Diff' }}
                    </button>
                  </td>
                </tr>

                <!-- Expanded comparative diff drawer -->
                <tr v-if="expandedRows[audit.id]" class="bg-slate-50/50">
                  <td colspan="7" class="px-8 py-5 border-t border-slate-100">
                    <div class="space-y-3.5">
                      <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Property Changes comparative ledger</span>
                        <span class="text-[10px] font-mono text-slate-400">Agent: {{ audit.user_agent }}</span>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <!-- Left: Old Values -->
                        <div class="bg-slate-100/50 border border-slate-200 rounded-xl p-3.5 text-left">
                          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Original State</span>
                          <div class="space-y-1.5 font-mono text-[10.5px]">
                            <div 
                              v-for="key in getChangedKeys(audit)" 
                              :key="key"
                              class="grid grid-cols-3 gap-2 border-b border-slate-150/40 pb-1"
                            >
                              <span class="text-slate-505 font-bold">{{ key }}:</span>
                              <span class="col-span-2 text-slate-650 truncate">{{ parseValues(audit.old_values)[key] ?? '-' }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Right: New Values -->
                        <div class="bg-blue-950/[0.02] border border-blue-105 rounded-xl p-3.5 text-left">
                          <span class="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-2">Mutated State</span>
                          <div class="space-y-1.5 font-mono text-[10.5px]">
                            <div 
                              v-for="key in getChangedKeys(audit)" 
                              :key="key"
                              class="grid grid-cols-3 gap-2 border-b border-blue-100/30 pb-1"
                            >
                              <span class="text-blue-500 font-bold">{{ key }}:</span>
                              <span class="col-span-2 text-slate-800 font-semibold truncate">{{ parseValues(audit.new_values)[key] ?? '-' }}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <Pagination 
          v-if="auditsStore.audits.value.length > 0"
          :from="auditsStore.meta.value.from"
          :to="auditsStore.meta.value.to"
          :total="auditsStore.meta.value.total"
          v-model:current-page="currentPage"
          :last-page="auditsStore.meta.value.last_page"
        />

      </div>

    </div>
  </div>
</template>

