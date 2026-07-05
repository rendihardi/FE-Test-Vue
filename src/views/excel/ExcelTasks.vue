<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import DashboardLayout from '../../components/DashboardLayout.vue'
import { useExcelStore } from '../../store/excel'
import { formatDateTime } from '../../utils/helpers'

import Pagination from '../../components/Pagination.vue'
import LoadingState from '../../components/LoadingState.vue'
import EmptyState from '../../components/EmptyState.vue'
import { 
  FileSpreadsheet,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from '@lucide/vue'

const excelStore = useExcelStore()

// Active Jobs and Pagination
const currentPage = ref(1)
const isLoadingJobs = ref(false)

let pollInterval = null

// Fetch Background Jobs
const fetchJobs = async (silent = false) => {
  if (!silent) isLoadingJobs.value = true
  try {
    const res = await excelStore.fetchJobs({ page: currentPage.value })
    if (res.success) {
      // Auto Start Polling if any job is pending/processing
      const hasActiveJobs = excelStore.jobs.value.some(j => j.status === 'pending' || j.status === 'processing')
      if (hasActiveJobs && !pollInterval) {
        startPolling()
      } else if (!hasActiveJobs && pollInterval) {
        stopPolling()
      }
    }
  } catch (err) {
    console.error(err)
    stopPolling()
  } finally {
    if (!silent) isLoadingJobs.value = false
  }
}

// Polling triggers every 3.5 seconds
const startPolling = () => {
  if (pollInterval) return
  pollInterval = setInterval(() => {
    fetchJobs(true)
  }, 3500)
}

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

watch(currentPage, () => {
  fetchJobs()
})

onMounted(() => {
  fetchJobs()
})

onBeforeUnmount(() => {
  stopPolling()
})

</script>

<template>
  <DashboardLayout>
    <div class="space-y-8">
      
      <!-- Top Title Bar -->
      <div class="text-left">
        <h2 class="text-xl font-bold text-slate-900">Excel Import/Export Center</h2>
        <p class="text-xs text-slate-500">Queue large data exports and product imports. Tracking is performed asynchronously in the background.</p>
      </div>

      <!-- Live Job Monitor Table -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        <!-- header controls -->
        <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-left">
          <div class="flex items-center gap-2">
            <Clock class="w-5 h-5 text-slate-450" />
            <h3 class="text-sm font-bold text-slate-800">Background Job Monitor</h3>
            <span v-if="pollInterval" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Auto Polling Live</span>
            </span>
          </div>

          <button
            @click="() => fetchJobs()"
            class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw class="w-4 h-4" />
          </button>
        </div>

        <!-- Table Loading state -->
        <LoadingState 
          v-if="isLoadingJobs" 
          message="Loading background tasks monitor..."
        />

        <!-- Empty state -->
        <EmptyState 
          v-else-if="excelStore.jobs.value.length === 0"
          title="No background jobs registered"
          description="Your triggered import and export requests will show here."
          :icon="FileSpreadsheet"
        />

        <!-- Table View -->
        <div v-else class="overflow-x-auto text-left">
          <table class="w-full text-left border-collapse text-xs text-slate-655">
            <thead>
              <tr class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-150">
                <th class="px-6 py-3.5 tracking-wider">Job ID</th>
                <th class="px-6 py-3.5 tracking-wider">Type</th>
                <th class="px-6 py-3.5 tracking-wider">Module Source</th>
                <th class="px-6 py-3.5 tracking-wider">Date Dispatched</th>
                <th class="px-6 py-3.5 tracking-wider">Task Status</th>
                <th class="px-6 py-3.5 tracking-wider text-right">Result Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="job in excelStore.jobs.value" 
                :key="job.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <!-- Job ID -->
                <td class="px-6 py-4 font-mono font-bold text-slate-800">{{ job.id }}</td>

                <!-- Type -->
                <td class="px-6 py-4">
                  <span :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold border capitalize',
                    job.type === 'export' ? 'bg-blue-50 text-blue-700 border-blue-200/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200/20'
                  ]">
                    {{ job.type }}
                  </span>
                </td>

                <!-- Module -->
                <td class="px-6 py-4 font-mono capitalize text-slate-500">{{ job.module }}</td>

                <!-- Created Date -->
                <td class="px-6 py-4 text-slate-500">{{ formatDateTime(job.created_at) }}</td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider',
                    job.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20' :
                    job.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-250/20' :
                    'bg-amber-50 text-amber-700 border-amber-250/20'
                  ]">
                    <CheckCircle v-if="job.status === 'completed'" class="w-3 h-3 text-emerald-500" />
                    <XCircle v-else-if="job.status === 'failed'" class="w-3 h-3 text-rose-500" />
                    <Loader2 v-else class="w-3 h-3 text-amber-500 animate-spin" />
                    <span>{{ job.status }}</span>
                  </span>
                </td>

                <!-- Result Actions / Error -->
                <td class="px-6 py-4 text-right">
                  <div v-if="job.status === 'completed' && job.type === 'export'">
                    <a 
                      :href="job.download_url" 
                      target="_blank"
                      class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-sm"
                    >
                      <Download class="w-3 h-3" />
                      <span>Download Excel</span>
                    </a>
                  </div>
                  
                  <div v-else-if="job.status === 'failed' && job.error_message" class="text-rose-550 max-w-xs truncate text-[10px] font-mono ml-auto" :title="job.error_message">
                    Error: {{ job.error_message }}
                  </div>

                  <span v-else class="text-slate-400 font-medium">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <Pagination 
          v-if="excelStore.jobs.value.length > 0"
          :from="excelStore.meta.value.from"
          :to="excelStore.meta.value.to"
          :total="excelStore.meta.value.total"
          v-model:current-page="currentPage"
          :last-page="excelStore.meta.value.last_page"
        />

      </div>

    </div>
  </DashboardLayout>
</template>
