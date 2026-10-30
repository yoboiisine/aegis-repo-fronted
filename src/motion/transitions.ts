/**
 * Page transition definitions — directional, layered and coordinated with
 * the workspace entry. Direction is derived from navigation depth so moving
 * deeper into the app pushes content forward, going back pulls it rearward.
 */

import { durations, easings } from './tokens'
import type { PageId } from '@/types'

export type MotionDirection = -1 | 0 | 1

/** Navigation order used to infer directionality of a route change. */
const PAGE_ORDER: Record<PageId, number> = {
  overview: 0,
  passwords: 1,
  'api-keys': 2,
  security: 3,
  settings: 4,
}

export function pageDepth(page: PageId): number {
  return PAGE_ORDER[page] ?? 0
}

export function directionBetween(from: PageId, to: PageId): MotionDirection {
  const d = pageDepth(to) - pageDepth(from)
  if (d > 0) return 1
  if (d < 0) return -1
  return 0
}

export interface PageTransitionSpec {
  initial: Record<string, unknown>
  animate: Record<string, unknown>
  exit: Record<string, unknown>
}

/**
 * Build a directional page transition. Exit is quicker than entrance
 * (dismissal rule) and the incoming page arrives with a subtle spatial
 * offset along x, communicating where the user came from / is going.
 */
export function pageTransition(direction: MotionDirection): PageTransitionSpec {
  // Same-page or neutral navigation: pure fade-lift, no directional bias.
  const shift = direction === 0 ? 0 : direction * 26

  return {
    initial: {
      opacity: 0,
      x: shift,
      filter: direction === 0 ? undefined : 'blur(2px)',
    },
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: durations.pageEnter,
        ease: easings.out,
      },
    },
    exit: {
      opacity: 0,
      x: direction === 0 ? 0 : -direction * 18,
      transition: {
        duration: durations.pageExit,
        ease: easings.in,
      },
    },
  }
}

/** Workspace-level transitions for the locked ↔ unlocked environments.
 *  These are cinematic: the vault recedes, the workspace assembles. */
export const workspaceEnter = {
  initial: { opacity: 0, scale: 0.985 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.cinematic, ease: easings.out },
  },
} as const

export const workspaceExit = {
  opacity: 0,
  scale: 0.98,
  transition: { duration: durations.pageExit, ease: easings.in },
} as const

export const lockScreenEnter = {
  initial: { opacity: 0, scale: 1.02 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.cinematic, ease: easings.out },
  },
} as const
