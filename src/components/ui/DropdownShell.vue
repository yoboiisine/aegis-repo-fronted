<script setup lang="ts">
/**
 * DropdownShell — unopinionated dropdown/menu presentation primitive.
 *
 * Provides: trigger slot + floating glass panel, click-outside dismissal,
 * Escape dismissal, arrow-key roving focus over `[role="menuitem"]` children,
 * and tokenized entrance choreography (springs.snappy scale/fade). Consumers
 * fill the menu slot; no data or action logic lives here.
 */
import { nextTick, onUnmounted, ref, useId } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { durations, easings, springs } from '@/motion/tokens'

interface Props {
  /** Align the panel to the end edge of the trigger. */
  align?: 'start' | 'end'
  /** Panel width as CSS value. */
  width?: string
}

withDefaults(defineProps<Props>(), { align: 'start', width: '12rem' })

const emit = defineEmits<{ openChange: [open: boolean] }>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const labelId = useId()

function setOpen(value: boolean) {
  if (open.value === value) return
  open.value = value
  emit('openChange', value)
  if (value) {
    void nextTick(() => {
      panelRef.value?.querySelector<HTMLElement>('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]')?.focus()
    })
  }
}

function onDocPointer(e: PointerEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) setOpen(false)
}

document.addEventListener('pointerdown', onDocPointer)
onUnmounted(() => document.removeEventListener('pointerdown', onDocPointer))

function onPanelKeydown(e: KeyboardEvent) {
  const items = Array.from(
    panelRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]:not([disabled])') ?? [],
  )
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(i + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(i - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    setOpen(false)
  }
}
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <div @click="setOpen(!open)" :aria-expanded="open" aria-haspopup="menu">
      <slot name="trigger" />
    </div>

    <AnimatePresence>
      <motion.div
        v-if="open"
        ref="panelRef"
        role="menu"
        :aria-labelledby="labelId"
        :id="labelId"
        :initial="{ opacity: 0, scale: 0.95, y: -4 }"
        :animate="{ opacity: 1, scale: 1, y: 0, transition: { ...springs.snappy, opacity: { duration: durations.micro, ease: easings.out } } }"
        :exit="{ opacity: 0, scale: 0.97, y: -2, transition: { duration: durations.micro, ease: easings.in } }"
        class="a-glass a-glass--elevated absolute top-full mt-1.5 z-50 p-1.5 origin-top"
        :class="align === 'end' ? 'right-0' : 'left-0'"
        :style="{ width, borderRadius: 'var(--radius-lg)' }"
        @keydown="onPanelKeydown"
      >
        <slot />
      </motion.div>
    </AnimatePresence>
  </div>
</template>
