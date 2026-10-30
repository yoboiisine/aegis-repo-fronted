/**
 * useScrollMotion — thin, safe wrapper around motion-v's `useScroll()` for
 * nested scroll containers (Aegis pages scroll inside the main content area,
 * not the window). Returns spring-smoothed progress plus raw MotionValues so
 * components can drive styles directly via `:style` without triggering Vue
 * re-renders per frame.
 *
 * Verified against motion-v@2.9.0 declarations:
 *   useScroll(options) -> { scrollX, scrollY, scrollXProgress, scrollYProgress, ... }
 *   options.container / options.target accept MaybeComputedElementRef (template refs ok)
 */

import { computed, type Ref } from 'vue'
import { useScroll, useSpring, useTransform, type MotionValue } from 'motion-v'
import { springs } from '../tokens'
import { useAppReducedMotion } from './useReducedMotion'

export interface ScrollMotionState {
  /** Raw 0..1 progress of the container. */
  progress: MotionValue<number>
  /** Spring-smoothed progress for indicators & linked transforms. */
  smoothProgress: MotionValue<number>
  /** Map progress through an arbitrary range. */
  transformProgress: (input: number[], output: number[], clamp?: boolean) => MotionValue<number>
}

export function useScrollMotion(container: Ref<HTMLElement | undefined>): ScrollMotionState {
  const { reduced } = useAppReducedMotion()

  // Reactive options: when reduced motion is active we still expose the
  // values (they cost nothing if unused), but consumers can branch on
  // `reduced` to skip binding them at all.
  const scroll = useScroll({
    container: computed(() => container.value) as unknown as Ref<HTMLElement>,
    axis: 'y',
  })

  const smooth = useSpring(scroll.scrollYProgress, {
    stiffness: springs.scroll.stiffness,
    damping: springs.scroll.damping,
    restDelta: springs.scroll.restDelta,
  })

  function transformProgress(
    input: number[],
    output: number[],
    clamp: boolean = true,
  ): MotionValue<number> {
    return useTransform(smooth, input, output, { clamp })
  }

  return {
    progress: scroll.scrollYProgress,
    smoothProgress: smooth,
    transformProgress,
  }
}
