<script setup lang="ts">
/**
 * MotionPage — cinematic page shell used inside App.vue's AnimatePresence.
 *
 * Receives the directional transition spec from usePageMotion and applies it
 * as initial/animate/exit so exiting and entering pages never overlap
 * (mode="wait" at the call site guarantees sequencing). The shell also
 * exposes a named slot structure so each view can establish hierarchy before
 * its content finishes entering.
 */
import { Motion } from 'motion-v'
import type { PageTransitionSpec } from '../transitions'

interface Props {
  /** Directional transition spec (reduced-motion aware, from usePageMotion). */
  spec: PageTransitionSpec
  as?: string
}

const props = withDefaults(defineProps<Props>(), { as: 'div' })
</script>

<template>
  <Motion
    :as="props.as"
    :initial="spec.initial"
    :animate="spec.animate"
    :exit="spec.exit"
    class="h-full"
  >
    <slot />
  </Motion>
</template>
