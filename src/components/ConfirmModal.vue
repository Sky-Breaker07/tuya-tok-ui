<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        class="bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] max-w-md w-full p-6"
        style="font-family: var(--font-main)"
      >
        <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
        <p class="mb-6 whitespace-pre-wrap">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <button
            v-if="showCancel"
            @click="$emit('cancel')"
            class="px-4 py-2 border border-[var(--color-border)] rounded text-[var(--color-text)] hover:bg-[var(--color-border)] transition"
          >
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 rounded bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  showCancel: { type: Boolean, default: true },
});

defineEmits(['confirm', 'cancel']);
</script> 