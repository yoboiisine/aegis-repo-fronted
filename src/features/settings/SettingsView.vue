<script setup lang="ts">
import { Motion } from 'motion-v';
import { Sun, Moon, Shield, Info } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';
import PageContainer from '@/components/layout/PageContainer.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Card from '@/components/ui/Card.vue';
import Section from '@/components/layout/Section.vue';
import KeyValue from '@/components/ui/KeyValue.vue';

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <PageContainer>
    <!-- Header -->
    <Motion :initial="{ opacity: 0, y: 8 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }">
      <PageHeader
        title="Settings"
        description="Application preferences"
      />
    </Motion>

    <!-- Appearance -->
    <Motion :initial="{ opacity: 0, y: 12 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }">
      <Card padding="md">
        <Section title="Appearance" :icon="Sun">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[13px] text-[var(--text-secondary)]">Theme</p>
              <p class="text-[11px] text-[var(--text-disabled)] mt-0.5">Switch between light and dark mode</p>
            </div>
            <button
              @click="toggleTheme"
              class="flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded-md border transition-colors"
              :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }"
            >
              <Moon v-if="theme === 'dark'" :size="13" />
              <Sun v-else :size="13" />
              {{ theme === 'dark' ? 'Dark' : 'Light' }}
            </button>
          </div>
        </Section>
      </Card>
    </Motion>

    <!-- About -->
    <Motion :initial="{ opacity: 0, y: 12 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }">
      <Card padding="md">
        <Section title="About" :icon="Info">
          <div class="space-y-2.5">
            <KeyValue label="Application">
              <span class="text-[11px] font-medium text-[var(--text-primary)]">Aegis Vault</span>
            </KeyValue>
            <KeyValue label="Framework">
              <span class="text-[11px] text-[var(--text-primary)]">Vue 3 + TypeScript</span>
            </KeyValue>
            <KeyValue label="Mode">
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded" :style="{ color: 'var(--warning)', background: 'var(--warning-muted)' }">PROTOTYPE</span>
            </KeyValue>
            <KeyValue label="Backend">
              <span class="text-[11px] text-[var(--text-tertiary)]">Mock adapter</span>
            </KeyValue>
          </div>
        </Section>
      </Card>
    </Motion>
  </PageContainer>
</template>
