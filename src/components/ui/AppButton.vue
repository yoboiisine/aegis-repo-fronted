<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Loader2 } from 'lucide-vue-next';
import { buttonInteraction } from '@/motion/presets';
import { useAppReducedMotion } from '@/motion/composables/useReducedMotion';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  disabled?: boolean;
}

const { reduced } = useAppReducedMotion();

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  loading: false,
  disabled: false,
});

const styles = computed(() => {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-all';
  
  const variants = {
    primary: {
      background: 'var(--accent-primary)',
      color: '#ffffff',
      border: '1px solid transparent',
    },
    secondary: {
      background: 'var(--surface-secondary)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
    },
    danger: {
      background: 'var(--danger-muted)',
      color: 'var(--danger)',
      border: '1px solid transparent',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-[11px]',
    md: 'px-3 py-2 text-[12px]',
  };

  return {
    class: `${base} ${sizes[props.size]}`,
    style: {
      ...variants[props.variant],
      opacity: props.disabled || props.loading ? 0.5 : 1,
      cursor: props.disabled || props.loading ? 'not-allowed' : 'pointer',
    },
  };
});
</script>

<template>
  <motion.button
    :class="styles.class"
    :style="styles.style"
    :disabled="disabled || loading"
    v-bind="reduced || disabled || loading ? {} : buttonInteraction"
  >
    <Loader2 v-if="loading" :size="12" class="animate-spin" />
    <slot />
  </motion.button>
</template>
