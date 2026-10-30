<script setup lang="ts">
/**
 * AppButton — action primitive.
 * Variants: primary (gradient accent) · secondary · danger · ghost ·
 * glass (translucent surface tier) · gold (restrained premium accent).
 * All colors resolve through semantic tokens; hover/press come from the
 * centralized buttonInteraction preset and collapse under reduced motion.
 */
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Loader2 } from 'lucide-vue-next';
import { buttonInteraction } from '@/motion/presets';
import { useAppReducedMotion } from '@/motion/composables/useReducedMotion';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'gold';
  size?: 'sm' | 'md' | 'lg';
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
      background: 'var(--gradient-accent)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-sm), var(--shadow-accent)',
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
    // Glass tier — depth comes from the shared .a-glass CSS recipe.
    glass: {
      color: 'var(--text-primary)',
      border: '1px solid var(--glass-border)',
    },
    gold: {
      background: 'var(--gold-muted)',
      color: 'var(--gold)',
      border: '1px solid var(--gold-border)',
    },
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-[11px]',
    md: 'px-3 py-2 text-[12px]',
    lg: 'px-4 py-2.5 text-[13px]',
  };

  return {
    class: `${base} ${props.variant === 'glass' ? 'a-glass a-glass--subtle' : ''} ${sizes[props.size]}`,
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
    <Loader2 v-if="loading" :size="size === 'lg' ? 14 : 12" class="animate-spin" />
    <slot />
  </motion.button>
</template>
