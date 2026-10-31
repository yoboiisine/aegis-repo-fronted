<script setup lang="ts">
/**
 * SettingsView — preferences.
 *
 * Motion: settings groups enter with one-time viewport reveals; the theme
 * control is a shared-layout surface (layoutId) so the pill physically
 * morphs between sun/moon states instead of swapping, and the whole
 * environment crossfades via CSS custom-property transitions (no flash of
 * the previous theme).
 */
import { motion } from 'motion-v';
import { Sun, Moon, Shield, Info } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';
import PageContainer from '@/components/layout/PageContainer.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Card from '@/components/ui/Card.vue';
import Section from '@/components/layout/Section.vue';
import KeyValue from '@/components/ui/KeyValue.vue';
import { MotionReveal } from '@/motion/components';
import { buttonInteraction } from '@/motion/presets';

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <PageContainer>
    <template #sticky-title>
      <span class="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--text-tertiary)]">
        Settings
      </span>
    </template>

    <!-- Header -->
    <MotionReveal tag="header" :distance="12" :once="true">
      <PageHeader
        title="Settings"
        description="Application preferences"
      />
    </MotionReveal>

    <!-- Appearance -->
    <MotionReveal :once="true" :amount="0.25">
      <Card padding="md">
        <Section title="Appearance" :icon="Sun">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[13px] text-[var(--text-secondary)]">Theme</p>
              <p class="text-[11px] text-[var(--text-disabled)] mt-0.5">Switch between light and dark mode</p>
            </div>
            <motion.button
              @click="toggleTheme({ animate: true })"
              v-bind="buttonInteraction"
              class="flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded-md border cursor-pointer"
              :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }"
              :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <!-- Shared-layout icon: the pill morphs between environments. -->
              <motion.span
                :key="theme"
                layoutId="theme-icon"
                :initial="{ opacity: 0, rotate: -45, scale: 0.7 }"
                :animate="{ opacity: 1, rotate: 0, scale: 1 }"
                :exit="{ opacity: 0, rotate: 45, scale: 0.7 }"
                :transition="{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }"
                class="flex items-center"
              >
                <Moon v-if="theme === 'dark'" :size="13" />
                <Sun v-else :size="13" />
              </motion.span>
              {{ theme === 'dark' ? 'Dark' : 'Light' }}
            </motion.button>
          </div>
        </Section>
      </Card>
    </MotionReveal>

    <!-- About -->
    <MotionReveal :once="true" :amount="0.25">
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
    </MotionReveal>
  </PageContainer>
</template>
