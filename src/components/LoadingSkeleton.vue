<template>
  <div
    :class="[
      'bg-[var(--color-bg-secondary)] animate-pulse overflow-hidden',
      shape === 'circle' ? 'rounded-full' : 'rounded',
    ]"
    :style="{ width, height }"
  >
    <div class="w-full h-full shimmer"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1.5rem' },
  shape: { type: String, default: 'rect' }, // 'rect' or 'circle'
});
</script>

<style scoped>
.shimmer {
  background: linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-surface) 50%, var(--color-bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite linear;
  width: 100%;
  height: 100%;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style> 