<script setup lang="ts">
/**
 * SecurityView — session & protection status.
 *
 * Motion: sticky storytelling composition for the protection explainer —
 * the "how the vault protects you" panel holds while its three assurance
 * steps scroll past (Layer 03). It releases naturally at the end of its
 * section, collapses to a normal stacked layout on small screens, and is
 * disabled under reduced motion (content order stays identical either way).
 * Cards themselves enter with one-time viewport reveals.
 */
import { Shield, Lock, Key } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import PageContainer from '@/components/layout/PageContainer.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Card from '@/components/ui/Card.vue';
import Section from '@/components/layout/Section.vue';
import KeyValue from '@/components/ui/KeyValue.vue';
import AppButton from '@/components/ui/AppButton.vue';
import { MotionReveal, MotionStagger, MotionStaggerItem, ScrollProgressBar } from '@/motion/components';
import { pageScroller } from '@/motion/composables/useScrollContainer';
import { buttonInteraction } from '@/motion/presets';
import { staggers } from '@/motion/tokens';
import { motion } from 'motion-v';

const store = useVaultStore();

/** The three assurances shown alongside the sticky explainer. */
const protections = [
  {
    title: 'Local-first storage',
    body: 'Credentials live in your own environment. The frontend never owns encryption keys.',
  },
  {
    title: 'Authoritative sessions',
    body: 'Backend verification decides unlock and lock outcomes — the UI only reports them.',
  },
  {
    title: 'Immediate locking',
    body: 'Locking clears sensitive state instantly; animation never delays securing the vault.',
  },
];

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
</script>

<template>
  <PageContainer>
    <template #sticky-title>
      <span class="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--text-tertiary)]">
        Security
      </span>
    </template>

    <ScrollProgressBar :container="pageScroller" />

    <!-- Header -->
    <MotionReveal tag="header" :distance="12" :once="true">
      <PageHeader
        title="Security"
        description="Vault session and security controls"
      />
    </MotionReveal>

    <!-- Session Status -->
    <MotionReveal :once="true" :amount="0.25">
      <Card padding="md">
        <Section title="Session Status" :icon="Shield">
          <div class="space-y-2.5">
            <KeyValue label="Status">
              <span class="flex items-center gap-1.5 text-[10px] font-medium text-[var(--success)]">
                <span class="w-1.5 h-1.5 rounded-full" :style="{ background: 'var(--success)' }" />
                Active
              </span>
            </KeyValue>
            <KeyValue label="Unlocked">
              <span class="text-[10px] tabular-nums text-[var(--text-primary)]">
                {{ store.status.lastUnlockedAt ? formatTimeAgo(store.status.lastUnlockedAt) + ' ago' : '—' }}
              </span>
            </KeyValue>
            <KeyValue label="Auto-lock timeout">
              <span class="text-[10px] tabular-nums text-[var(--text-primary)]">15 minutes</span>
            </KeyValue>
          </div>
        </Section>
      </Card>
    </MotionReveal>

    <!-- Sticky protection storytelling: the explainer panel holds while the
         assurance steps scroll by. Releases naturally; stacks on mobile. -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div class="lg:col-span-2">
        <div class="lg:sticky lg:top-16">
          <MotionReveal :once="true" :cinematic="true" :amount="0.3">
            <Card padding="md">
              <Section title="How Aegis Protects You" :icon="Shield">
                <p class="text-[12px] leading-relaxed text-[var(--text-secondary)]">
                  Aegis treats every session as temporary and every secret as
                  borrowed. These are the guarantees that hold while the vault
                  is open — scroll through them beside this panel.
                </p>
                <p class="text-[10px] mt-3 italic text-[var(--text-disabled)]">
                  Prototype presentation — backend wiring remains authoritative.
                </p>
              </Section>
            </Card>
          </MotionReveal>
        </div>
      </div>

      <MotionStagger class="lg:col-span-3 space-y-4" :interval="staggers.section" when="view" :delay-children="0">
        <MotionStaggerItem v-for="(p, i) in protections" :key="p.title" :distance="20">
          <Card padding="md">
            <div class="flex items-start gap-3">
              <div
                class="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-[11px] font-semibold tabular-nums"
                :style="{ background: 'var(--accent-muted)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)' }"
              >
                {{ i + 1 }}
              </div>
              <div>
                <p class="text-[13px] font-medium text-[var(--text-primary)]">{{ p.title }}</p>
                <p class="text-[11px] mt-1 leading-relaxed text-[var(--text-tertiary)]">{{ p.body }}</p>
              </div>
            </div>
          </Card>
        </MotionStaggerItem>
      </MotionStagger>
    </div>

    <!-- Lock -->
    <MotionReveal :once="true" :amount="0.25">
      <Card padding="md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-[var(--text-primary)]">Lock Vault</p>
            <p class="text-[11px] text-[var(--text-tertiary)] mt-0.5">
              Immediately secure all credentials and end session
            </p>
          </div>
          <!-- store.lock() runs synchronously on click; sensitive state is
               cleared before any exit animation begins. -->
          <motion.div v-bind="buttonInteraction">
            <AppButton variant="danger" size="sm" @click="store.lock()">
              <Lock :size="12" />
              Lock Now
            </AppButton>
          </motion.div>
        </div>
      </Card>
    </MotionReveal>

    <!-- Recovery -->
    <MotionReveal :once="true" :amount="0.25">
      <Card padding="md">
        <Section title="Recovery" :icon="Key">
          <div
            class="p-3 rounded-md border"
            :style="{ background: 'var(--warning-muted)', borderColor: 'var(--warning)' + '30' }"
          >
            <p class="text-[12px] text-[var(--text-secondary)]">
              Your recovery key is an emergency backup for when you forget your master passphrase. Store it securely offline.
            </p>
            <p class="text-[10px] mt-2 italic text-[var(--text-disabled)]">
              Recovery key management requires backend support.
            </p>
          </div>
        </Section>
      </Card>
    </MotionReveal>
  </PageContainer>
</template>
