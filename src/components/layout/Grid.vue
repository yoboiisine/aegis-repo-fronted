<script setup lang="ts">
/**
 * Grid - Consistent responsive grid system
 */
defineProps<{
  cols?: number | string
  gap?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    class="grid"
    :class="{
      'gap-2': gap === 'sm' || !gap,
      'gap-3': gap === 'md',
      'gap-4': gap === 'lg',
    }"
    :style="{
      gridTemplateColumns: typeof cols === 'number' ? `repeat(${cols}, minmax(0, 1fr))` : cols
    }"
  >
    <slot />
  </div>
</template>
