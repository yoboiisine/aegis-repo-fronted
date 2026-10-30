<script setup lang="ts">
/**
 * AppTabs — segmented tab bar with a spring-driven selection indicator.
 *
 * Unopinionated shell: emits the selected id; owns no routing/state.
 * The sliding pill uses `springs.snappy` (layout transitions done with
 * transforms only — GPU-friendly, no layout thrash).
 */
import { computed, ref } from 'vue'
import { motion } from 'motion-v'

export interface TabItem {
  id: string
  label: string
}

interface Props {
  tabs: TabItem[]
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), { modelValue: undefined })

const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

const listRef = ref<HTMLElement | null>(null)
const activeId = computed(() => props.modelValue ?? props.tabs[0]?.id ?? '')

function rectOf(id: string): { left: number; width: number } {
  const list = listRef.value?.querySelector<HTMLElement>(`[data-tab="${id}"]`)
  if (!list || !listRef.value) return { left: 0, width: 0 }
  const parentRect = listRef.value.getBoundingClientRect()
  const r = list.getBoundingClientRect()
  return { left: r.left - parentRect.left, width: r.width }
}

const indicator = computed(() => rectOf(activeId.value))

function select(id: string) {
  emit('update:modelValue', id)
}

function onKeydown(e: KeyboardEvent) {
  const ids = props.tabs.map((t) => t.id)
  const i = ids.indexOf(activeId.value)
  if (e.key === 'ArrowRight') select(ids[(i + 1) % ids.length] ?? ids[0]!)
  else if (e.key === 'ArrowLeft') select(ids[(i - 1 + ids.length) % ids.length] ?? ids[0]!)
}
</script>

<template>
  <div
    ref="listRef"
    role="tablist"
    class="relative inline-flex items-center p-1 rounded-lg border"
    :style="{ background: 'var(--glass-bg-subtle)', borderColor: 'var(--border-subtle)' }"
    @keydown="onKeydown"
  >
    <!-- Spring-tracked selection pill -->
    <motion.div
      class="absolute top-1 bottom-1 rounded-md"
      :style="{ width: `${indicator.width}px` }"
      :initial="false"
      :animate="{ x: indicator.left, transition: { type: 'spring', stiffness: 480, damping: 34, mass: 0.9 } }"
      aria-hidden="true"
    >
      <div class="w-full h-full rounded-md" :style="{ background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-sm)' }" />
    </motion.div>

    <button
      v-for="tab in tabs"
      :key="tab.id"
      :data-tab="tab.id"
      role="tab"
      type="button"
      :aria-selected="activeId === tab.id"
      :tabindex="activeId === tab.id ? 0 : -1"
      class="relative z-10 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors outline-none"
      :style="{ color: activeId === tab.id ? 'var(--text-on-accent)' : 'var(--text-secondary)' }"
      @click="select(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
