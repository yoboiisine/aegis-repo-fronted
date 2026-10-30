<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { Motion } from 'motion-v';
import { Shield, LayoutGrid, Key, Fingerprint, Settings, Lock, Sun, Moon } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import { useTheme } from '@/composables/useTheme';
import type { PageId } from '@/types';

const store = useVaultStore();
const { theme, toggleTheme } = useTheme();

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
          <button
            v-for="item in group.items"
            :key="item.id"
            @click="store.navigate(item.id)"
            class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors relative"
            :style="{
              color: store.currentPage === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: store.currentPage === item.id ? 'var(--surface-tertiary)' : 'transparent',
            }"
          >
            <component
              :is="item.icon"
              :size="15"
              :style="{
                color: store.currentPage === item.id ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              }"
            />
            {{ item.label }}
            <Motion
              v-if="store.currentPage === item.id"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r"
              :style="{ background: 'var(--accent-primary)' }"
              :initial="{ scaleY: 0 }"
              :animate="{ scaleY: 1 }"
              :transition="{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }"
            />
          </button>
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
        <button
          @click="toggleTheme"
          class="p-1.5 rounded-md transition-colors"
          :style="{
            color: 'var(--text-tertiary)',
            background: 'transparent',
          }"
          @mouseenter="($event.target as HTMLElement).style.background = 'var(--surface-tertiary)'"
          @mouseleave="($event.target as HTMLElement).style.background = 'transparent'"
          :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Sun v-if="theme === 'dark'" :size="13" />
          <Moon v-else :size="13" />
        </button>
      </div>

      <!-- Lock button -->
      <button
        @click="handleLock"
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium transition-all"
        :style="{
          color: 'var(--danger)',
          background: 'var(--danger-muted)',
          border: '1px solid transparent',
        }"
        @mouseenter="($event.target as HTMLElement).style.borderColor = 'var(--danger)'"
        @mouseleave="($event.target as HTMLElement).style.borderColor = 'transparent'"
      >
        <Lock :size="12" />
        Lock Vault
      </button>
    </div>
  </aside>
</template>
