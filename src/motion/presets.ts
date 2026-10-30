/**
 * Interaction presets — small, reusable whileHover / whilePress bundles so
 * components share one tactile language instead of inventing per-file values.
 */

import { durations, easings, springs } from './tokens'

/** Buttons: subtle lift on hover, compression on press. */
export const buttonInteraction = {
  whileHover: { y: -1.5 },
  whilePress: { scale: 0.97, y: 0 },
  transition: springs.snappy,
} as const

/** Ghost/icon buttons: gentler response than primary actions. */
export const iconButtonInteraction = {
  whileHover: { scale: 1.06 },
  whilePress: { scale: 0.92 },
  transition: { duration: durations.micro, ease: easings.out },
} as const

/** Cards / list rows: quiet elevation, no bounce. */
export const cardInteraction = {
  whileHover: { y: -2 },
  whilePress: { scale: 0.995 },
  transition: { duration: durations.control, ease: easings.out },
} as const

/** Navigation items: horizontal nudge toward content. */
export const navItemInteraction = {
  whileHover: { x: 2 },
  whilePress: { scale: 0.98 },
  transition: springs.snappy,
} as const

/** Reveal/copy micro controls: quick state pop on success. */
export const confirmPop = {
  scale: [1, 1.18, 1],
  transition: { duration: durations.component, ease: easings.out },
} as const

/** Atmospheric entrance for the locked environment background layers. */
export const atmosphereEnter = (layer: number) => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: durations.cinematic + layer * 0.15,
      ease: easings.out,
      delay: layer * 0.1,
    },
  },
}) as const
