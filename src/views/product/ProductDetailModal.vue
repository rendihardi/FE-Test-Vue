<script setup>
import { computed } from 'vue'
import { X, FileText, Image as ImageIcon, ExternalLink } from '@lucide/vue'
import { getAssetUrl, formatPrice } from '../../utils/helpers'

const props = defineProps({
  isOpen: Boolean,
  product: Object
})

defineEmits(['close'])


const attributesList = computed(() => {
  if (!props.product) return []
  const srcAttrs = props.product.attributes || props.product.additional_attributes
  if (!srcAttrs) return []
  
  const attrs = typeof srcAttrs === 'string'
    ? JSON.parse(srcAttrs)
    : srcAttrs
  
  return Object.keys(attrs).map(key => ({
    key,
    value: attrs[key]
  }))
})

</script>

<template>
  <div v-if="isOpen && product" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl relative z-10 p-6 space-y-6 max-h-[90vh] overflow-y-auto text-left">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900">Product Specification Details</h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Detail Layout grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Left Column: Product Image -->
        <div class="md:col-span-1 flex flex-col items-center">
          <div class="w-full aspect-square rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
            <img 
              v-if="product.image" 
              :src="getAssetUrl(product.image)" 
              :alt="product.product_name"
              class="w-full h-full object-cover"
            />
            <ImageIcon v-else class="w-12 h-12 text-slate-350" />
          </div>
          
          <span :class="[
            'mt-3.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider',
            product.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-250/20' : 'bg-slate-50 text-slate-500 border-slate-200/20'
          ]">
            {{ product.is_active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Right Column: Specs -->
        <div class="md:col-span-2 space-y-4">
          <div>
            <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest">{{ product.category?.name || product.category_name || '-' }}</span>
            <h2 class="text-base font-black text-slate-900 mt-0.5">{{ product.product_name }}</h2>
            <p class="font-mono text-slate-400 text-xs mt-1">Code: {{ product.product_code }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-3 rounded-xl">
            <div>
              <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Unit Price</span>
              <span class="text-xs font-bold text-slate-800">{{ formatPrice(product.price) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Current Stock</span>
              <div class="flex items-center gap-2 mt-0.5">
                <span :class="[
                  'text-xs font-bold',
                  product.current_stock <= (product.minimum_stock || 10) ? 'text-rose-600' : 'text-slate-800'
                ]">{{ product.current_stock }} units</span>
                <span v-if="product.stock_status" :class="[
                  'inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border',
                  product.stock_status === 'in stock' || product.stock_status === 'safe' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/30' : '',
                  product.stock_status === 'low stock' || product.stock_status === 'low' ? 'bg-amber-50 text-amber-700 border-amber-200/30' : '',
                  product.stock_status === 'out of stock' || product.stock_status === 'empty' ? 'bg-rose-50 text-rose-700 border-rose-200/30' : ''
                ]">
                  {{ product.stock_status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Specs File -->
          <div v-if="product.specification_pdf">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Reference Document</span>
            <a 
              :href="getAssetUrl(product.specification_pdf)"
              target="_blank"
              class="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200/20 transition-colors"
            >
              <FileText class="w-4 h-4" />
              <span>Open Specification PDF</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

      <!-- JSON spec attributes table -->
      <div v-if="attributesList.length > 0" class="space-y-2 pt-3 border-t border-slate-150">
        <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technical Specifications</h4>
        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-left text-xs border-collapse">
            <tbody>
              <tr 
                v-for="attr in attributesList" 
                :key="attr.key"
                class="border-b border-slate-150 last:border-0 hover:bg-slate-50/50"
              >
                <td class="px-4 py-2 font-bold text-slate-500 bg-slate-50/60 w-1/3">{{ attr.key }}</td>
                <td class="px-4 py-2 text-slate-800 font-medium">{{ attr.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>
