<script lang="ts">
/**
 * ParallaxLayer — decorative depth layer for atmospheric compositions.
 *
 * Moves at a fraction of the parent scroll container's progress by mapping
 * the spring-smoothed 0..1 scroll value straight into `translateY` via
 * `useTransform`. Transform-only, so scrolling stays on the compositor and
 * never re-renders Vue. Disabled entirely under reduced motion (the layer
 * simply renders static). Intended only for decorative geometry — never for
 * functional content or credential data.
 */
import { computed, type Ref } from 'vue'
import { motion, useScroll, useSpring, useTransform } from 'motion-v'
import { springs } from '../tokens'
import { useAppReducedMotion } from '../composables/useReducedMotion'

interface Props {
  /** The scrolling element to measure. */
  container: Ref<HTMLElement | undefined>
  /** Travel in px across the full scroll range (negative moves upward). */
  distance?: number
}

const props = withDefaults(defineProps<Props>(), { distance: 40 })

const { reduced } = useAppReducedMotion()

const { scrollYProgress } = useScroll({ container: computed(() => props.container.value) })

const smooth = useSpring(scrollYProgress, {
  stiffness: springs.scroll.stiffness,
  damping: springs.scroll.damping,
  restDelta: springs.scroll.restDelta,
})

// Eagerly created at setup (composable lifecycle-safe); zero cost when unused.
const y = useTransform(smooth, [0, 1], [0, props.distance])
</script>

<template>
  <motion.div v-if="!reduced" :style="{ y }" class="will-change-transform">
    <slot />
  </motion.div>
  <div v-else>
    <slot />
  </div>
</template>
