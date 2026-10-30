<script setup lang="ts">
/** AppBadge — small status/category chip. Tone maps to semantic tokens only. */
import { computed } from 'vue'

type BadgeTone = 'neutral' | 'accent' | 'gold' | 'success' | 'warning' | 'danger'
type BadgeSize = 'sm' | 'md'

interface Props {
  tone?: BadgeTone
  size?: BadgeSize
  /** Pill with translucent background (default) vs solid emphasis. */
  solid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'neutral',
  size: 'sm',
  solid: false,
})

const tones: Record<BadgeTone, { fg: string; bg: string; border: string }> = {
  neutral: { fg: 'var(--text-secondary)', bg: 'var(--surface-tertiary)', border: 'var(--border-subtle)' },
  accent: { fg: 'var(--accent-primary)', bg: 'var(--accent-muted)', border: 'var(--accent-border)' },
  gold: { fg: 'var(--gold)', bg: 'var(--gold-muted)', border: 'var(--gold-border)' },
  success: { fg: 'var(--success)', bg: 'var(--success-muted)', border: 'transparent' },
  warning: { fg: 'var(--warning)', bg: 'var(--warning-muted)', border: 'transparent' },
  danger: { fg: 'var(--danger)', bg: 'var(--danger-muted)', border: 'transparent' },
}

const style = computed(() => {
  const t = tones[props.tone]
  // Solid emphasis: fill with the tone's foreground color and flip to the
  // theme-aware on-accent ink. Translucent (default) keeps bg/border tokens.
  if (props.solid) {
    return {
      color: 'var(--text-on-accent)',
      background: 'var(--gradient-accent)',
      borderColor: 'transparent',
    }
  }
  return {
    color: t.fg,
    background: t.bg,
    borderColor: t.border,
  }
})

const classes = computed(() => [
  'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
  props.size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]',
])
</script>

<template>
  <span :class="classes" :style="style"><slot /></span>
</template>
