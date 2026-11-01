<script setup lang="ts">
/**
 * SettingsView — application preferences.
 *
 * Sections:
 *  - Appearance: theme selection with animated ThemeToggle, font and display
 *    preferences (simulated local-state only — no backend writes).
 *  - General: simulated auto-lock timeout selector and session display with
 *    an honest prototype disclaimer so users cannot mistake frontend state
 *    for a real backend security operation.
 *  - About: build identity and environment information.
 *
 * Motion: section cards enter with one-time viewport reveals; the theme
 * toggle uses the shared ThemeToggle component so the Sidebar and Settings
 * share one animated knob aesthetic.
 */
import { ref } from 'vue';
import { Sun, SlidersHorizontal, Info, Clock, CheckCircle2 } from 'lucide-vue-next';
import { useTheme } from '@/composables/useTheme';
import PageContainer from '@/components/layout/PageContainer.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Card from '@/components/ui/Card.vue';
import AppButton from '@/components/ui/AppButton.vue';
import Section from '@/components/layout/Section.vue';
import KeyValue from '@/components/ui/KeyValue.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import { MotionReveal } from '@/motion/components';

const { theme } = useTheme();

/** Simulated auto-lock options — frontend session preference only. */
const AUTO_LOCK_OPTIONS = [
  { value: 5,   label: '5 minutes' },
  { value: 10,  label: '10 minutes' },
  { value: 15,  label: '15 minutes' },
  { value: 30,  label: '30 minutes' },
  { value: 60,  label: '1 hour' },
  { value: 0,   label: 'Never (not recommended)' },
] as const;

type AutoLockValue = typeof AUTO_LOCK_OPTIONS[number]['value'];

const autoLockTimeout = ref<AutoLockValue>(15);
const clearClipboardOnLock = ref(true);
const showSavedBanner = ref(false);
let savedBannerTimer: ReturnType<typeof setTimeout> | null = null;

function savePreferences() {
  // Frontend simulation only — preferences are held in reactive state during
  // the current session. Real persistence requires backend support.
  showSavedBanner.value = true;
  if (savedBannerTimer) clearTimeout(savedBannerTimer);
  savedBannerTimer = setTimeout(() => {
    showSavedBanner.value = false;
  }, 2500);
}

function resetPreferences() {
  autoLockTimeout.value = 15;
  clearClipboardOnLock.value = true;
}
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
        description="Application preferences and display options"
      />
    </MotionReveal>

    <!-- Appearance -->
    <MotionReveal :once="true" :amount="0.2">
      <Card padding="md">
        <Section title="Appearance" :icon="Sun">
          <div class="space-y-4">
            <!-- Theme toggle -->
            <div class="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p class="text-[13px] font-medium text-[var(--text-primary)]">Theme</p>
                <p class="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  Switch between Glacier (light) and Midnight (dark)
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-[11px] text-[var(--text-tertiary)]">
                  {{ theme === 'dark' ? 'Midnight' : 'Glacier' }}
                </span>
                <ThemeToggle size="md" />
              </div>
            </div>

            <!-- Theme description -->
            <div
              class="rounded-md p-3 border text-[11px] leading-relaxed text-[var(--text-tertiary)]"
              :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }"
            >
              <span class="font-medium text-[var(--text-secondary)]">
                {{ theme === 'dark' ? 'Midnight' : 'Glacier' }}
              </span>
              —
              {{ theme === 'dark'
                ? 'Graphite and charcoal foundations with layered dark surfaces, restrained navy-blue depth, and subtle gold accents.'
                : 'Clean white and off-white surfaces with soft ice-blue primary accents, muted warm gold highlights, and blue-grey borders.'
              }}
              Theme preference is stored locally in your browser.
            </div>
          </div>
        </Section>
      </Card>
    </MotionReveal>

    <!-- General preferences — simulated, no backend -->
    <MotionReveal :once="true" :amount="0.2">
      <Card padding="md">
        <Section title="Session Preferences" :icon="SlidersHorizontal">
          <!-- Prototype disclaimer — honest about what changes here -->
          <div
            class="flex items-start gap-2 p-2.5 rounded-md border mb-3"
            :style="{ background: 'var(--warning-muted)', borderColor: 'var(--warning)' + '40' }"
          >
            <Clock :size="12" class="mt-0.5 shrink-0" :style="{ color: 'var(--warning)' }" />
            <p class="text-[11px] leading-relaxed" :style="{ color: 'var(--text-secondary)' }">
              <span class="font-semibold" :style="{ color: 'var(--warning)' }">Prototype mode:</span>
              these preferences are held in session state only. They are not written to the backend
              and will not persist across page reloads. Real auto-lock enforcement requires backend
              session management.
            </p>
          </div>

          <div class="space-y-4">
            <!-- Auto-lock timeout -->
            <div class="flex items-center justify-between gap-4 flex-wrap">
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-[var(--text-primary)]">Auto-lock timeout</p>
                <p class="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  How long the vault stays unlocked without interaction
                </p>
              </div>
              <select
                v-model="autoLockTimeout"
                class="px-2.5 py-1.5 text-[12px] rounded-md border outline-none shrink-0"
                :style="{
                  background: 'var(--surface-input)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--specular-rim-subtle)',
                  minWidth: '160px',
                }"
                aria-label="Auto-lock timeout"
              >
                <option
                  v-for="opt in AUTO_LOCK_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Clear clipboard on lock -->
            <div class="flex items-center justify-between gap-4 flex-wrap">
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-[var(--text-primary)]">Clear clipboard on lock</p>
                <p class="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  Remove copied secrets from the clipboard when the vault locks
                </p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="clearClipboardOnLock"
                :aria-label="clearClipboardOnLock ? 'Disable clear clipboard on lock' : 'Enable clear clipboard on lock'"
                class="relative w-11 h-6 rounded-full border outline-none transition-colors shrink-0"
                :style="{
                  background: clearClipboardOnLock ? 'var(--accent-primary)' : 'var(--surface-tertiary)',
                  borderColor: clearClipboardOnLock ? 'var(--accent-border)' : 'var(--border-default)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
                }"
                @click="clearClipboardOnLock = !clearClipboardOnLock"
              >
                <span
                  class="absolute top-0.5 rounded-full bg-white transition-all duration-200"
                  :style="{
                    width: '18px',
                    height: '18px',
                    left: clearClipboardOnLock ? 'calc(100% - 20px)' : '2px',
                    boxShadow: 'var(--shadow-sm)',
                  }"
                />
              </button>
            </div>
          </div>

          <!-- Save / Reset actions -->
          <div class="flex items-center justify-between gap-3 pt-3 border-t" :style="{ borderColor: 'var(--border-subtle)' }">
            <!-- Save confirmation feedback -->
            <div
              class="flex items-center gap-1.5 text-[11px] transition-all duration-300"
              :style="{
                color: 'var(--success)',
                opacity: showSavedBanner ? 1 : 0,
                transform: showSavedBanner ? 'translateX(0)' : 'translateX(-6px)',
              }"
              aria-live="polite"
              aria-atomic="true"
            >
              <CheckCircle2 :size="13" />
              Preferences saved for this session
            </div>

            <div class="flex items-center gap-2 ml-auto">
              <AppButton variant="ghost" size="sm" @click="resetPreferences">
                Reset
              </AppButton>
              <AppButton variant="secondary" size="sm" @click="savePreferences">
                Save
              </AppButton>
            </div>
          </div>
        </Section>
      </Card>
    </MotionReveal>

    <!-- About -->
    <MotionReveal :once="true" :amount="0.2">
      <Card padding="md">
        <Section title="About" :icon="Info">
          <div class="space-y-2.5">
            <KeyValue label="Application">
              <span class="text-[11px] font-medium text-[var(--text-primary)]">Aegis Vault</span>
            </KeyValue>
            <KeyValue label="Framework">
              <span class="text-[11px] text-[var(--text-primary)]">Vue 3 + TypeScript</span>
            </KeyValue>
            <KeyValue label="State">
              <span class="text-[11px] text-[var(--text-primary)]">Pinia</span>
            </KeyValue>
            <KeyValue label="Motion">
              <span class="text-[11px] text-[var(--text-primary)]">motion-v</span>
            </KeyValue>
            <KeyValue label="Mode">
              <span
                class="text-[10px] font-mono px-1.5 py-0.5 rounded"
                :style="{ color: 'var(--warning)', background: 'var(--warning-muted)' }"
              >
                PROTOTYPE
              </span>
            </KeyValue>
            <KeyValue label="Backend">
              <span class="text-[11px] text-[var(--text-tertiary)]">Mock adapter (no real backend connected)</span>
            </KeyValue>
          </div>
        </Section>
      </Card>
    </MotionReveal>
  </PageContainer>
</template>
