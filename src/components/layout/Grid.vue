<script setup lang="ts">
/**
 * Grid — responsive grid layout primitive.
 *
 * When `cols` is a number the grid uses Tailwind responsive breakpoints so
 * the layout degrades gracefully on narrow viewports:
 *   cols=1 → always 1 column
 *   cols=2 → 1 col on mobile, 2 on sm+
 *   cols=3 → 1 col on mobile, 2 on sm+, 3 on lg+
 *   cols=4 → 1 col on mobile, 2 on sm+, 4 on xl+
 *
 * A string value is passed through to gridTemplateColumns unchanged (for
 * explicit advanced layouts).
 */
import { computed } from 'vue';

const props = defineProps<{
  cols?: number | string;
  gap?: 'sm' | 'md' | 'lg';
}>();

/** Tailwind responsive class sets for common column counts. */
const responsiveColsClass = computed<string>(() => {
  if (typeof props.cols !== 'number') return '';
  switch (props.cols) {
    case 1: return 'grid-cols-1';
    case 2: return 'grid-cols-1 sm:grid-cols-2';
    case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    case 4: return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
    default: return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${props.cols}`;
  }
});

/** Custom gridTemplateColumns only used when cols is a string expression. */
const inlineStyle = computed(() =>
  typeof props.cols === 'string'
    ? { gridTemplateColumns: props.cols }
    : {},
);
</script>

<template>
  <div
    class="grid"
    :class="[
      responsiveColsClass,
      {
        'gap-2': gap === 'sm' || !gap,
        'gap-3': gap === 'md',
        'gap-4': gap === 'lg',
      },
    ]"
    :style="inlineStyle"
  >
    <slot />
  </div>
</template>
