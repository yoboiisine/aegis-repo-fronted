<script setup lang="ts">
import { onMounted, watch, computed } from 'vue';
import { Motion, AnimatePresence } from 'motion-v';
import { useVaultStore } from '@/stores/vaultStore';
import { useTheme } from '@/composables/useTheme';
import type { PageId } from '@/types';

// Features
import UnlockView from '@/features/vault/UnlockView.vue';
import OverviewView from '@/features/overview/OverviewView.vue';
import PasswordsView from '@/features/passwords/PasswordsView.vue';
import ApiKeysView from '@/features/apikeys/ApiKeysView.vue';
import SecurityView from '@/features/security/SecurityView.vue';
import SettingsView from '@/features/settings/SettingsView.vue';

// Layout
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppToasts from '@/components/ui/AppToasts.vue';

const store = useVaultStore();
const { initTheme } = useTheme();

onMounted(async () => {
  initTheme();
  await store.init();
});

watch(() => store.isUnlocked, (unlocked) => {
  if (unlocked) {
    store.loadAll();
    store.loadActivity();
  }
}, { immediate: true });

const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

const pageKey = computed(() => store.currentPage);
</script>

<template>
  <div class="h-full w-full overflow-hidden" :style="{ background: 'var(--surface-base)' }">
    <!-- Locked state -->
    <AnimatePresence mode="wait">
      <UnlockView v-if="!store.isUnlocked" key="unlock" />
    </AnimatePresence>

    <!-- Unlocked state -->
    <div v-if="store.isUnlocked" class="h-full flex">
      <AppSidebar />
      
      <main class="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          <Motion
            :key="pageKey"
            :initial="pageTransition.initial"
            :animate="pageTransition.animate"
            :exit="pageTransition.exit"
            :transition="pageTransition.transition"
            class="flex-1 overflow-hidden"
          >
            <OverviewView v-if="store.currentPage === 'overview'" class="h-full" />
            <PasswordsView v-else-if="store.currentPage === 'passwords'" class="h-full" />
            <ApiKeysView v-else-if="store.currentPage === 'api-keys'" class="h-full" />
            <SecurityView v-else-if="store.currentPage === 'security'" class="h-full" />
            <SettingsView v-else-if="store.currentPage === 'settings'" class="h-full" />
          </Motion>
        </AnimatePresence>
      </main>

      <AppToasts />
    </div>
  </div>
</template>
