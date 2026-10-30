<script setup lang="ts">
/**
 * Card - Consistent card container with optional header
 */
defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    class="rounded-md border bg-[var(--surface-primary)] border-[var(--border-subtle)]"
    :class="{
      'p-0': padding === 'none',
      'p-3': padding === 'sm' || !padding,
      'p-4': padding === 'md',
      'p-5': padding === 'lg',
    }"
  >
    <slot />
  </div>
</template>
