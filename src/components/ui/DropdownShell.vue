<script setup lang="ts">
/**
 * DropdownShell — unopinionated dropdown/menu presentation primitive.
 *
 * Provides: trigger slot + floating glass panel, click-outside dismissal,
 * auto-close on menu-item activation, Escape dismissal with focus return to
 * the trigger, and arrow-key roving focus over `[role="menuitem"]` children.
 * Consumers fill the menu slot; no data or action logic lives here.
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
const menuId = useId()

/**
 * Menu-item selector. Each role gets its own `:not([disabled])` filter —
 * `a, b, c:not([disabled])` would only apply the filter to `c`.
 */
const MENU_ITEM_SELECTOR = ['[role="menuitem"]', '[role="menuitemradio"]', '[role="menuitemcheckbox"]']
  .map((s) => `${s}:not([disabled])`)
  .join(', ')

function focusTrigger() {
  rootRef.value
    ?.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ?.focus()
}

function setOpen(value: boolean) {
  if (open.value === value) return
  open.value = value
  emit('openChange', value)
  if (value) {
    void nextTick(() => {
      panelRef.value?.querySelector<HTMLElement>(MENU_ITEM_SELECTOR)?.focus()
    })
  } else {
    // Return focus to the trigger control on keyboard/click dismissal so
    // users are not dumped back to the top of the document.
    focusTrigger()
  }
}

function onDocPointer(e: PointerEvent) {
  const target = e.target as Element | null
  if (!rootRef.value || !target) return
  if (!rootRef.value.contains(target)) {
    if (open.value) setOpen(false)
    return
  }
  // Click landed on a menu item inside an open panel: close after the item's
  // own click handler runs (pointerdown precedes click), unless the row opts
  // out via data-dropdown-keep-open (e.g. checkbox rows).
  if (open.value && target.closest(MENU_ITEM_SELECTOR) && !target.closest('[data-dropdown-keep-open]')) {
    setTimeout(() => setOpen(false), 0)
  }
}

document.addEventListener('pointerdown', onDocPointer)
onUnmounted(() => document.removeEventListener('pointerdown', onDocPointer))

function onRootKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    setOpen(false)
  }
}

function onPanelKeydown(e: KeyboardEvent) {
  const items = Array.from(panelRef.value?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [])
  if (items.length === 0) return
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(i + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(i - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Home') {
    e.preventDefault()
    items[0]?.focus()
  } else if (e.key === 'End') {
    e.preventDefault()
    items[items.length - 1]?.focus()
  } else if (e.key === 'Tab') {
    setOpen(false)
  }
}
</script>

<template>
  <div ref="rootRef" class="relative inline-block" @keydown="onRootKeydown">
    <!--
      Accessibility contract: the element rendered in the #trigger slot must
      be a focusable control (button / AppIconButton). The wrapper is NOT the
      accessible control, so aria-expanded/aria-haspopup are advisory here;
      consumers who need them on the actual button can bind them from the
      `openChange` event. Escape is handled at the root so it works no matter
      which descendant holds focus.
    -->
    <div aria-haspopup="menu" :aria-expanded="open" @click="setOpen(!open)">
      <slot name="trigger" />
    </div>

    <AnimatePresence>
      <motion.div
        v-if="open"
        ref="panelRef"
        role="menu"
        :id="menuId"
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
