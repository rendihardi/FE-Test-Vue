<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  History, 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal 
} from '@lucide/vue'
import TransactionForm from './TransactionForm.vue'
import TransactionLogTable from './TransactionLogTable.vue'

const route = useRoute()
const router = useRouter()

// Active Tab computed from route query
const activeTab = computed(() => route.query.tab || 'history')

const tableRef = ref(null)

const switchTab = (tabName) => {
  router.push({ path: '/stock-transactions', query: { tab: tabName } })
}

const onTransactionSuccess = () => {
  if (tableRef.value) {
    tableRef.value.loadTransactions()
  }
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Top Title Bar -->
    <div class="text-left">
      <h2 class="text-xl font-bold text-slate-900">Inventory Stock Transactions</h2>
      <p class="text-xs text-slate-500">Record inventory intake, outbound transfers, write-offs, and monitor audit histories.</p>
    </div>

    <!-- Tabs Navigation Header -->
    <div class="border-b border-slate-200 flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-xs">
      <button
        @click="switchTab('history')"
        :class="[
          'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
          activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
        ]"
      >
        <History class="w-4 h-4" />
        <span>Transaction Logs</span>
      </button>

      <button
        @click="switchTab('stock-in')"
        :class="[
          'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
          activeTab === 'stock-in' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
        ]"
      >
        <ArrowDownRight class="w-4 h-4" />
        <span>Perform Stock In</span>
      </button>

      <button
        @click="switchTab('stock-out')"
        :class="[
          'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
          activeTab === 'stock-out' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
        ]"
      >
        <ArrowUpRight class="w-4 h-4" />
        <span>Perform Stock Out</span>
      </button>

      <button
        @click="switchTab('adjust')"
        :class="[
          'px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2',
          activeTab === 'adjust' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
        ]"
      >
        <SlidersHorizontal class="w-4 h-4" />
        <span>Adjust Stock Levels</span>
      </button>
    </div>

    <!-- Transaction Forms (for IN, OUT, ADJUST) -->
    <TransactionForm 
      v-if="activeTab !== 'history'" 
      :active-tab="activeTab"
      @success="onTransactionSuccess"
    />

    <!-- Logs & Filter Panel -->
    <TransactionLogTable 
      ref="tableRef"
      :active-tab="activeTab"
    />

  </div>
</template>
