<script setup lang="ts">
/**
 * PageContainer - Consistent page wrapper with predictable boundaries
 * Provides uniform padding, max-width, and vertical rhythm
 */
</script>

<template>
  <div class="h-full overflow-y-auto bg-[var(--surface-base)]">
    <div class="max-w-[1600px] mx-auto px-6 py-5 space-y-5">
      <slot />
    </div>
  </div>
</template>
