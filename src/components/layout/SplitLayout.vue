<script setup lang="ts">
/**
 * SplitLayout - Consistent split-panel layout for list/detail views
 * Used by Passwords and API Keys pages
 */
withDefaults(defineProps<{
  sidebarWidth?: string
}>(), {
  sidebarWidth: '380px'
})
</script>

<template>
  <div class="h-full flex">
    <!-- Sidebar Panel -->
    <div 
      class="border-r flex flex-col overflow-hidden"
      :style="{ 
        width: sidebarWidth,
        borderColor: 'var(--border-subtle)',
        background: 'var(--surface-primary)'
      }"
    >
      <slot name="sidebar" />
    </div>

    <!-- Detail Panel -->
    <div 
      class="flex-1 overflow-y-auto"
      :style="{ background: 'var(--surface-base)' }"
    >
      <slot name="detail" />
    </div>
  </div>
</template>
