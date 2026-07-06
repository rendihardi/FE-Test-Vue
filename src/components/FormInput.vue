<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  textarea: {
    type: Boolean,
    default: false
  },
  rows: {
    type: [Number, String],
    default: 3
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: undefined
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="space-y-1.5">
    <label :for="id" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </label>
    
    <textarea
      v-if="textarea"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :class="[
        'block w-full px-3 py-2 border rounded-xl text-slate-800 text-xs focus:outline-none transition-all resize-none',
        error 
          ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 bg-white' 
          : 'border-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white'
      ]"
    ></textarea>
    
    <input
      v-else
      :id="id"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :class="[
        'block w-full px-3 py-2 border rounded-xl text-slate-800 text-xs focus:outline-none transition-all',
        error 
          ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 bg-white' 
          : 'border-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white'
      ]"
    />
    
    <p v-if="error" class="text-[10px] text-rose-500 leading-tight">
      {{ error }}
    </p>
  </div>
</template>
