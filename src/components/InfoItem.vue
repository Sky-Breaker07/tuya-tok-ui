<template>
  <div class="flex flex-col">
    <span class="text-xs text-[var(--color-text-secondary)]">{{ label }}</span>
    <span 
      class="text-sm truncate" 
      :title="tooltip || displayValue"
    >{{ displayValue }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number, Boolean, Object, Array, undefined, null], default: undefined },
  tooltip: { type: String, default: '' },
  fallback: { type: String, default: 'Unknown' }
});

// Convert value to string safely, with fallback for undefined/null values
const displayValue = computed(() => {
  if (props.value === undefined || props.value === null) {
    return props.fallback;
  }
  return String(props.value);
});
</script> 