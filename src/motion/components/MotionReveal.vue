<script setup lang="ts">
/**
 * MotionReveal — declarative scroll-triggered entrance wrapper.
 *
 * Uses motion-v `whileInView` + `inViewOptions` (verified against the
 * installed motion-v@2.9.0 declarations). Supports one-time and replayable
 * reveals, intensity variants, and collapses to a short opacity fade under
 * prefers-reduced-motion.
 */
import { computed } from 'vue'
import { durations, easings } from '../tokens'
import { useAppReducedMotion } from '../composables/useReducedMotion'


// motion-v's `Motion` is a generic functional component whose type only
// accepts literal tags at call sites; this alias preserves full typing while
// letting us forward a dynamic `as` prop from our own components.
const MotionEl = Motion as unknown as typeof Motion
interface Props {
  /** Travel distance in px for the vertical entrance. */
  distance?: number
  /** Reveal once (default) or replay on re-entry. */
  once?: boolean
  /** Fraction of element visible before triggering (0..1). */
  amount?: number
  /** Delay before the reveal starts (seconds), for local sequencing. */
  delay?: number
  /** Stronger cinematic entrance. */
  cinematic?: boolean
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  distance: 24,
  once: true,
  amount: 0.2,
  delay: 0,
  cinematic: false,
  as: 'div',
})

const { reduced } = useAppReducedMotion()

const hidden = computed(() =>
  reduced.value
    ? { opacity: 0 }
    : { opacity: 0, y: props.cinematic ? props.distance * 1.3 : props.distance },
)

const shown = computed(() => ({
  opacity: 1,
  y: 0,
  transition: {
    duration: reduced.value ? durations.control : (props.cinematic ? durations.cinematic : durations.scrollReveal),
    delay: reduced.value ? 0 : props.delay,
    ease: easings.out,
  },
}))

const exitState = computed(() =>
  props.once || reduced.value ? undefined : { opacity: 0, y: -props.distance / 2 },
)
</script>

<template>
  <MotionEl
    :as="props.as"
    :initial="hidden"
    :while-in-view="shown"
    :exit="exitState"
    :in-view-options="{ once: props.once, amount: props.amount }"
  >
    <slot />
  </Motion>
</template>
