<script setup lang="ts">
/**
 * MotionStagger — group entrance choreography.
 *
 * Parent drives `variants` with staggerChildren; children are ordinary
 * `Motion` elements with matching variant names (see usage in views).
 * Fires on mount (page-level sequences) or when scrolled into view,
 * depending on the `when` prop. Reduced motion collapses to a fade.
 */
import { computed } from 'vue'
import { Motion } from 'motion-v'
import { durations, easings, staggers } from '../tokens'
import { useAppReducedMotion } from '../composables/useReducedMotion'

interface Props {
  /** Stagger interval override (seconds). Defaults to section cadence. */
  interval?: number
  /** Trigger on mount or when scrolled into view. */
  when?: 'mount' | 'view'
  /** Delay before the first child enters (seconds). */
  delayChildren?: number
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  interval: staggers.section,
  when: 'mount',
  delayChildren: 0.05,
  as: 'div',
})

const { reduced } = useAppReducedMotion()

const parentVariants = computed(() => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: reduced.value ? 0 : props.interval,
      delayChildren: reduced.value ? 0 : props.delayChildren,
    },
  },
}))

const animateState = computed(() =>
  props.when === 'mount' ? 'visible' : undefined,
)

const inViewTarget = computed(() =>
  props.when === 'view' ? 'visible' : undefined,
)
</script>

<template>
  <Motion
    :as="props.as"
    :variants="parentVariants"
    :initial="'hidden'"
    :animate="animateState"
    :while-in-view="inViewTarget"
    :in-view-options="{ once: true, amount: 0.15 }"
  >
    <slot />
  </Motion>
</template>


