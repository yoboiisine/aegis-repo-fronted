<script setup lang="ts">
/** AppIconButton — bare icon control with consistent sizing/focus/hover. */
import { computed } from 'vue'
import { motion } from 'motion-v'
import type { LucideIcon } from 'lucide-vue-next'
import { iconButtonInteraction } from '@/motion/presets'
import { useAppReducedMotion } from '@/motion/composables/useReducedMotion'

interface Props {
  icon: LucideIcon
  label: string
  size?: number
  tone?: 'default' | 'accent' | 'gold' | 'danger'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 15,
  tone: 'default',
  disabled: false,
})

const { reduced } = useAppReducedMotion()

const toneColor = computed(() => {
  switch (props.tone) {
    case 'accent': return 'var(--accent-primary)'
    case 'gold': return 'var(--gold)'
    case 'danger': return 'var(--danger)'
    default: return 'var(--text-tertiary)'
  }
})
</script>

<template>
  <motion.button
    type="button"
    :aria-label="label"
    :disabled="disabled"
    class="grid place-items-center rounded-md border border-transparent transition-colors outline-none"
    :style="{
      color: toneColor,
      width: `${size + 14}px`,
      height: `${size + 14}px`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }"
    v-bind="reduced || disabled ? {} : iconButtonInteraction"
    @mouseenter="(e: MouseEvent) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'var(--surface-tertiary)' }"
    @mouseleave="(e: MouseEvent) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }"
  >
    <component :is="icon" :size="size" />
  </motion.button>
</template>
