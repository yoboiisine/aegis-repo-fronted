/**
 * useReveal — state-based viewport reveal helper built on motion-v's
 * `useInView()`. Use when a component needs to know reveal state (e.g. to
 * gate child stagger animation or debug); prefer the `MotionReveal` /
 * `MotionStagger` components for plain declarative reveals.
 */

import { ref, watch, type Ref } from 'vue'
import { useInView } from 'motion-v'
import { useAppReducedMotion } from './useReducedMotion'

export interface RevealOptions {
  /** Fraction of the element that must be visible (0..1). Default 0.2. */
  amount?: number
  /** Root scroll container for nested scrolling contexts. */
  root?: Element | Document
  /** When true (default) the reveal fires once and stays revealed. */
  once?: boolean
}

export interface RevealState {
  /** Attach to the element being observed. */
  targetRef: Ref<HTMLElement | undefined>
  /** True once (or while, if `once:false`) the element is in view. */
  isInView: Ref<boolean>
  /** Reduced-motion flag — reveals should collapse to opacity-only. */
  reduced: Ref<boolean>
}

export function useReveal(options: RevealOptions = {}): RevealState {
  const { amount = 0.2, root, once = true } = options
  const { reduced } = useAppReducedMotion()

  const targetRef = ref<HTMLElement | undefined>(undefined)
  const inView = useInView(targetRef as Ref<HTMLElement>, {
    amount,
    margin: '0px 0px -5% 0px',
    ...(root !== undefined ? { root } : {}),
  })

  // `once` semantics: latch the first time it enters view.
  const isInView = ref(false)
  watch(inView, (visible) => {
    if (visible) isInView.value = true
    else if (!once) isInView.value = false
  })

  return {
    targetRef,
    isInView,
    reduced: reduced as unknown as Ref<boolean>,
  }
}
