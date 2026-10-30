<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Motion } from 'motion-v';
import { AlertTriangle } from 'lucide-vue-next';
import AppButton from './AppButton.vue';

interface Props {
  open: boolean;
  title: string;
  confirmLabel?: string;
  danger?: boolean;
}

withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  danger: false,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('cancel');
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <Motion
      v-if="open"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('cancel')" />
      <Motion
        :initial="{ opacity: 0, scale: 0.95, y: 10 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :exit="{ opacity: 0, scale: 0.95, y: 10 }"
        :transition="{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }"
        class="relative w-full max-w-md rounded-lg border p-6"
        :style="{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-xl)' }"
      >
        <div class="flex items-center gap-2 mb-3">
          <AlertTriangle v-if="danger" :size="16" :style="{ color: 'var(--danger)' }" />
          <h3 class="text-[15px] font-semibold" :style="{ color: 'var(--text-primary)' }">{{ title }}</h3>
        </div>
        <div class="text-[13px] mb-5" :style="{ color: 'var(--text-secondary)' }">
          <slot />
        </div>
        <div class="flex justify-end gap-2">
          <AppButton variant="secondary" @click="emit('cancel')">Cancel</AppButton>
          <AppButton :variant="danger ? 'danger' : 'primary'" @click="emit('confirm')">{{ confirmLabel }}</AppButton>
        </div>
      </Motion>
    </Motion>
  </Teleport>
</template>
