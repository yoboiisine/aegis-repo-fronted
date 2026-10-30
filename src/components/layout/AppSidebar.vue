<script setup lang="ts">
/**
 * AppSidebar — workspace navigation.
 *
 * Motion (Layer 02): the active indicator is a single shared-layout element
 * (`layoutId`) that physically travels between destinations instead of
 * being re-rendered per item; nav rows get directional hover nudges and
 * press compression from the centralized presets. Hover styling moved from
 * inline JS handlers to CSS custom properties so pointer movement never
 * triggers Vue renders.
 */
import { computed } from 'vue';
import type { Component } from 'vue';
import { motion } from 'motion-v';
import { Shield, LayoutGrid, Key, Fingerprint, Settings, Lock, Sun, Moon } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import { useTheme } from '@/composables/useTheme';
import { navItemInteraction, iconButtonInteraction } from '@/motion/presets';
import { useAppReducedMotion } from '@/motion/composables/useReducedMotion';
import type { PageId } from '@/types';

const store = useVaultStore();
const { theme, toggleTheme } = useTheme();
const { reduced } = useAppReducedMotion();

interface NavItem {
  id: PageId;
  label: string;
  icon: Component;
  /** Section heading this item belongs to. */
  section: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, section: 'Vault' },
  { id: 'passwords', label: 'Passwords', icon: Key, section: 'Vault' },
  { id: 'api-keys', label: 'API Keys', icon: Fingerprint, section: 'Vault' },
  { id: 'security', label: 'Security', icon: Shield, section: 'System' },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'System' },
];

const groupedNav = computed<{ section: string; items: NavItem[] }[]>(() => {
  const groups: { section: string; items: NavItem[] }[] = [];
  let currentGroup: { section: string; items: NavItem[] } | null = null;

  for (const item of navItems) {
    if (!currentGroup || item.section !== currentGroup.section) {
      currentGroup = { section: item.section, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(item);
  }

  return groups;
});

async function handleLock() {
  // Sensitive state clearing happens inside store.lock() immediately —
  // visual transitions are presentation-only and never gate it.
  await store.lock();
}
</script>

<template>
  <aside
    class="w-[240px] h-full flex flex-col border-r relative"
    :style="{
      background: 'var(--surface-primary)',
      borderColor: 'var(--border-subtle)',
    }"
  >
    <!-- Brand Mark -->
    <div class="px-5 pt-6 pb-5">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-md flex items-center justify-center"
          :style="{
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent-border)',
          }"
        >
          <Shield :size="15" :style="{ color: 'var(--accent-primary)' }" />
        </div>
        <div>
          <h1
            class="text-[13px] font-semibold tracking-tight leading-none"
            :style="{ color: 'var(--text-primary)' }"
          >
            Aegis
          </h1>
          <p
            class="text-[10px] tracking-[0.12em] uppercase mt-0.5"
            :style="{ color: 'var(--text-tertiary)' }"
          >
            Vault
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-2 overflow-y-auto">
      <div v-for="group in groupedNav" :key="group.section" class="mb-5">
        <p
          class="px-2 mb-1.5 text-[10px] font-medium tracking-[0.1em] uppercase"
          :style="{ color: 'var(--text-disabled)' }"
        >
          {{ group.section }}
        </p>
        <div class="space-y-0.5">
          <motion.button
            v-for="item in group.items"
            :key="item.id"
            @click="store.navigate(item.id)"
            v-bind="reduced ? {} : navItemInteraction"
            class="nav-row w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium cursor-pointer relative text-left"
            :class="{ 'nav-row--active': store.currentPage === item.id }"
            :style="{
              color: store.currentPage === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: store.currentPage === item.id ? 'var(--surface-tertiary)' : 'transparent',
            }"
          >
            <!-- Single traveling indicator: one layoutId across all rows, so
                 motion animates THE SAME element between destinations. -->
            <motion.span
              v-if="store.currentPage === item.id"
              layoutId="active-navigation-indicator"
              :transition="{ type: 'spring', stiffness: 480, damping: 34, mass: 0.9 }"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r"
              :style="{ background: 'var(--accent-primary)' }"
            />
            <component
              :is="item.icon"
              :size="15"
              :style="{
                color: store.currentPage === item.id ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              }"
            />
            {{ item.label }}
          </motion.button>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div
      class="px-4 py-4 border-t space-y-3"
      :style="{ borderColor: 'var(--border-subtle)' }"
    >
      <!-- Status -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-1.5 h-1.5 rounded-full"
            :style="{ background: 'var(--success)' }"
          />
          <span class="text-[11px]" :style="{ color: 'var(--text-tertiary)' }">
            Unlocked
          </span>
        </div>
        <motion.button
          @click="toggleTheme"
          v-bind="reduced ? {} : iconButtonInteraction"
          class="p-1.5 rounded-md cursor-pointer hover:bg-[var(--surface-tertiary)] transition-colors"
          :style="{ color: 'var(--text-tertiary)' }"
          :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Sun v-if="theme === 'dark'" :size="13" />
          <Moon v-else :size="13" />
        </motion.button>
      </div>

      <!-- Lock button -->
      <motion.button
        @click="handleLock"
        v-bind="reduced ? {} : iconButtonInteraction"
        class="lock-row w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium cursor-pointer"
        :style="{
          color: 'var(--danger)',
          background: 'var(--danger-muted)',
          border: '1px solid transparent',
        }"
      >
        <Lock :size="12" />
        Lock Vault
      </motion.button>
    </div>
  </aside>
</template>

<style scoped>
/* Hover feedback lives in CSS so pointer movement never triggers renders. */
.nav-row:hover {
  background: var(--surface-secondary);
}
.nav-row--active:hover {
  background: var(--surface-tertiary);
}
.lock-row {
  transition: border-color var(--duration-fast, 150ms) ease;
}
.lock-row:hover {
  border-color: var(--danger);
}
</style>
