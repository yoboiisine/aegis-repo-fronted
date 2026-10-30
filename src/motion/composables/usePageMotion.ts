/**
 * usePageMotion — coordinates directional page transitions with the
 * store-driven navigation model (Aegis has no vue-router; currentPage is a
 * Pinia ref). Tracks the previous destination to derive direction, and
 * exposes reduced-motion-aware transition specs.
 */

import { computed, readonly, ref, watch, type ComputedRef } from 'vue'
import { useVaultStore } from '@/stores/vaultStore'
import {
  directionBetween,
  pageTransition,
  type MotionDirection,
  type PageTransitionSpec,
} from '../transitions'
import { useAppReducedMotion } from './useReducedMotion'
import type { PageId } from '@/types'

export interface PageMotionState {
  /** Current page key driving AnimatePresence. */
  pageKey: ComputedRef<PageId>
  /** Direction of the most recent navigation (-1 back, 0 neutral, 1 forward). */
  direction: ComputedRef<MotionDirection>
  /** Transition spec for the active page (reduced-motion aware). */
  transition: ComputedRef<PageTransitionSpec>
}

export function usePageMotion(): PageMotionState {
  const store = useVaultStore()
  const { reduced } = useAppReducedMotion()

  // Track previous page to infer spatial direction. Updated only after the
  // route actually changes, so rapid repeated navigation stays consistent:
  // each new page reads the immediately-preceding destination.
  const previousPage = ref<PageId>(store.currentPage)
  const currentDirection = ref<MotionDirection>(0)

  watch(
    () => store.currentPage,
    (next, prev) => {
      currentDirection.value = directionBetween(prev ?? previousPage.value, next)
      previousPage.value = next
    },
  )

  const transition = computed<PageTransitionSpec>(() => {
    if (reduced.value) {
      // Reduced motion: pure opacity crossfade, no spatial movement.
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
        exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
      }
    }
    return pageTransition(currentDirection.value)
  })

  return {
    pageKey: computed(() => store.currentPage),
    direction: readonly(currentDirection) as ComputedRef<MotionDirection>,
    transition,
  }
}
