<script setup>
import { ref, watch } from 'vue'
import { useProductsStore } from '../../store/products'
import { useToast } from '../../composables/useToast'
import { X, Loader2, PlusCircle, MinusCircle } from '@lucide/vue'
import FormInput from '../../components/FormInput.vue'

const props = defineProps({
  isOpen: Boolean,
  editingProduct: Object,
  categoriesList: Array
})

const emit = defineEmits(['close', 'saved'])
const { addToast } = useToast()
const productsStore = useProductsStore()

const isSubmitting = ref(false)
const form = ref({
  category_id: '',
  product_code: '',
  product_name: '',
  price: '',
  current_stock: 0,
  image: null,
  specification_pdf: null,
  is_active: true
})
const attributesList = ref([]) // Dynamic key-values for JSON attributes
const errors = ref({})

const imageInputRef = ref(null)
const pdfInputRef = ref(null)

const resetForm = () => {
  form.value = {
    category_id: '',
    product_code: '',
    product_name: '',
    price: '',
    current_stock: 0,
    image: null,
    specification_pdf: null,
    is_active: true
  }
  attributesList.value = []
  errors.value = {}
  if (imageInputRef.value) imageInputRef.value.value = ''
  if (pdfInputRef.value) pdfInputRef.value.value = ''
}

watch([() => props.isOpen, () => props.editingProduct], ([isOpen, newVal]) => {
  if (isOpen) {
    if (newVal) {
      form.value = {
        category_id: newVal.category?.id || newVal.category_id || '',
        product_code: newVal.product_code,
        product_name: newVal.product_name,
        price: newVal.price,
        current_stock: newVal.current_stock || 0,
        image: null,
        specification_pdf: null,
        is_active: newVal.is_active
      }
      
      // Parse JSON attributes
      let parsedAttrs = []
      const srcAttrs = newVal.attributes || newVal.additional_attributes
      if (srcAttrs) {
        const attrs = typeof srcAttrs === 'string'
          ? JSON.parse(srcAttrs)
          : srcAttrs
        
        parsedAttrs = Object.keys(attrs).map(key => ({
          key,
          value: attrs[key]
        }))
      }
      attributesList.value = parsedAttrs
    } else {
      resetForm()
    }
  }
}, { immediate: true })

const handleFileChange = (e, field) => {
  const file = e.target.files[0]
  if (!file) {
    form.value[field] = null
    return
  }

  if (field === 'specification_pdf') {
    if (file.type !== 'application/pdf') {
      addToast('Only PDF files are allowed for product specifications.', 'error')
      e.target.value = ''
      form.value.specification_pdf = null
      return
    }
    const fileSizeKb = file.size / 1024
    if (fileSizeKb < 100 || fileSizeKb > 500) {
      addToast(`PDF size must be between 100 KB and 500 KB. (Current: ${fileSizeKb.toFixed(1)} KB)`, 'error')
      e.target.value = ''
      form.value.specification_pdf = null
      return
    }
  }

  if (field === 'image') {
    if (!file.type.startsWith('image/')) {
      addToast('Only image files (JPEG, PNG, WEBP) are allowed.', 'error')
      e.target.value = ''
      form.value.image = null
      return
    }
    if (file.size > 2048 * 1024) {
      addToast('Image size must be under 2 MB.', 'error')
      e.target.value = ''
      form.value.image = null
      return
    }
  }

  form.value[field] = file
}

const addAttribute = () => {
  attributesList.value.push({ key: '', value: '' })
}

const removeAttribute = (idx) => {
  attributesList.value.splice(idx, 1)
}

const handleSubmit = async () => {
  errors.value = {}
  isSubmitting.value = true

  const formData = new FormData()
  formData.append('category_id', form.value.category_id)
  formData.append('product_name', form.value.product_name)
  formData.append('price', form.value.price.toString())
  formData.append('current_stock', form.value.current_stock.toString())
  formData.append('is_active', form.value.is_active ? '1' : '0')

  if (form.value.image) formData.append('image', form.value.image)
  if (form.value.specification_pdf) formData.append('specification_pdf', form.value.specification_pdf)

  // Append attributes as multipart form array keys
  attributesList.value.forEach(attr => {
    if (attr.key.trim()) {
      formData.append(`attributes[${attr.key.trim()}]`, attr.value.trim())
    }
  })

  try {
    let res
    if (props.editingProduct) {
      res = await productsStore.updateProduct(props.editingProduct.id, formData)
    } else {
      res = await productsStore.createProduct(formData)
    }

    if (res.success) {
      addToast(props.editingProduct ? 'Product updated successfully.' : 'Product created successfully.', 'success')
      emit('saved')
      emit('close')
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      errors.value = err.response.data.errors || {}
    } else {
      addToast(err.response?.data?.message || 'An error occurred while saving the product.', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" @click="$emit('close')"></div>
    
    <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl relative z-10 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-150">
        <h3 class="text-sm font-bold text-slate-900">
          {{ editingProduct ? 'Edit Catalog Product' : 'Add Product to Catalog' }}
        </h3>
        <button @click="$emit('close')" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 text-left">
        <!-- Name -->
        <FormInput 
          id="prod-name"
          label="Product Name"
          v-model="form.product_name"
          required
          placeholder="Dell XPS 13"
          :error="errors.product_name ? errors.product_name[0] : ''"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
            <select
              v-model="form.category_id"
              required
              :class="['block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer bg-white', errors.category_id ? 'border-rose-500' : 'border-slate-200']"
            >
              <option value="">Select Category...</option>
              <option v-for="c in categoriesList" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
            <p v-if="errors.category_id" class="mt-1 text-[10px] text-rose-500">{{ errors.category_id[0] }}</p>
          </div>

          <!-- Price -->
          <FormInput 
            id="prod-price"
            label="Unit Price (IDR)"
            type="number"
            v-model="form.price"
            required
            placeholder="e.g. 15000000"
            :error="errors.price ? errors.price[0] : ''"
          />
        </div>

        <!-- Initial Stock (Visible only when creating new product) -->
        <FormInput 
          v-if="!editingProduct"
          id="prod-stock"
          label="Initial Stock Level"
          type="number"
          v-model="form.current_stock"
          placeholder="0"
          :error="errors.current_stock ? errors.current_stock[0] : ''"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Image -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Image (Max 2MB)</label>
            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              @change="(e) => handleFileChange(e, 'image')"
              class="block w-full border border-slate-200 rounded-xl text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p v-if="errors.image" class="mt-1 text-[10px] text-rose-500">{{ errors.image[0] }}</p>
          </div>

          <!-- Specs PDF -->
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Specification Document (PDF, 100-500KB)</label>
            <input
              ref="pdfInputRef"
              type="file"
              accept="application/pdf"
              @change="(e) => handleFileChange(e, 'specification_pdf')"
              class="block w-full border border-slate-200 rounded-xl text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p v-if="errors.specification_pdf" class="mt-1 text-[10px] text-rose-500">{{ errors.specification_pdf[0] }}</p>
          </div>
        </div>

        <!-- Dynamic Attributes -->
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Specifications</span>
            <button
              type="button"
              @click="addAttribute"
              class="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-500 font-bold uppercase cursor-pointer"
            >
              <PlusCircle class="w-3.5 h-3.5" />
              <span>Add Property</span>
            </button>
          </div>

          <div class="space-y-2.5 max-h-36 overflow-y-auto pr-1">
            <div v-if="attributesList.length === 0" class="text-center text-[10px] text-slate-400 py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No custom attributes attached. Click "Add Property" to define specifications like Weight, Dimension, or Color.
            </div>
            
            <div 
              v-for="(attr, idx) in attributesList" 
              :key="idx"
              class="flex items-center gap-3"
            >
              <input
                v-model="attr.key"
                type="text"
                placeholder="Key (e.g. Brand)"
                required
                class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <input
                v-model="attr.value"
                type="text"
                placeholder="Value (e.g. Dell)"
                required
                class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button 
                type="button" 
                @click="removeAttribute(idx)"
                class="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
              >
                <MinusCircle class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Active Status Checkbox -->
        <div class="flex items-center gap-2 pt-2">
          <input
            v-model="form.is_active"
            type="checkbox"
            id="is-active"
            class="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500 cursor-pointer"
          />
          <label for="is-active" class="text-xs font-semibold text-slate-650 cursor-pointer">Activate Product immediately in catalog</label>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Saving Item...' : 'Save Product' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
