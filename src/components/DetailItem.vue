<template>
  <div class="flex items-start gap-3">
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
      <IconifyIcon :icon="icon" class="text-[var(--color-primary)]" />
    </div>
    <div class="flex-1">
      <div class="text-xs text-[var(--color-text-secondary)] mb-1">{{ label }}</div>
      <div class="text-sm font-medium break-all" :title="tooltip || value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup>
import { Icon as IconifyIcon } from '@iconify/vue';

defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number, Boolean], default: 'Unknown' },
  tooltip: { type: String, default: '' }
});
</script> 