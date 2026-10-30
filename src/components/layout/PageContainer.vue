<script setup lang="ts">
/**
 * PageContainer - Consistent page wrapper with predictable boundaries
 * Provides uniform padding, max-width, and vertical rhythm.
 *
 * Motion: this element IS Aegis's nested scroll container. It registers
 * itself with the shared `pageScroller` ref so ScrollProgressBar and
 * ParallaxLayer bind their useScroll() to the element that actually scrolls
 * (not window). No manual listeners — motion-v owns observation/cleanup.
 *
 * Scroll-linked transformation: the sticky header strip crossfades as the
 * page scrolls, communicating depth without hijacking scroll behaviour. The
 * mapping is created eagerly at setup via a computed container ref — when no
 * scroller is registered yet, motion-v simply observes nothing (zero cost),
 * and it re-observes automatically once PageContainer mounts its element.
 */
import { computed, onBeforeUnmount } from 'vue'
import { motion, useScroll, useTransform } from 'motion-v'
import { pageScroller } from '@/motion/composables/useScrollContainer'
import { useAppReducedMotion } from '@/motion/composables/useReducedMotion'

const { reduced } = useAppReducedMotion()

const setScroller = (el: unknown): void => {
  pageScroller.value = el instanceof HTMLElement ? el : undefined
}

onBeforeUnmount(() => {
  // Never leave a stale detached node in the shared ref.
  pageScroller.value = undefined
})

// Eagerly-created Motion values (composable lifecycle-safe; never built from
// deferred callbacks). Drives styles directly — zero Vue re-renders per frame.
const { scrollY } = useScroll({ container: computed(() => pageScroller.value) })
const headerOpacity = useTransform(scrollY, [0, 140], [1, 0.35])
const headerBlur = useTransform(scrollY, [0, 140], ['0px', '2px'])
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-[var(--surface-base)]">
    <!-- Sticky header strip: releases naturally (no snap), fades with scroll
         progress. Hidden entirely under reduced motion — content stays fully
         legible because the page headers themselves are always rendered. -->
    <motion.div
      v-if="!reduced"
      class="sticky top-0 z-10 shrink-0 h-10 pointer-events-none flex items-center justify-center"
      :style="{
        opacity: headerOpacity,
        backdropFilter: headerBlur,
        WebkitBackdropFilter: headerBlur,
        background: 'color-mix(in srgb, var(--surface-base) 78%, transparent)',
        borderBottom: '1px solid var(--border-subtle)',
      }"
      aria-hidden="true"
    >
      <slot name="sticky-title" />
    </motion.div>

    <div :ref="setScroller" class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-[1600px] mx-auto px-6 py-5 space-y-5">
        <slot />
      </div>
    </div>
  </div>
</template>
