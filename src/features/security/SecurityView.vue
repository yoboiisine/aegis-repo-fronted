<script setup lang="ts">
import { Motion } from 'motion-v';
import { Shield, Lock, Key } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import PageContainer from '@/components/layout/PageContainer.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Card from '@/components/ui/Card.vue';
import Section from '@/components/layout/Section.vue';
import KeyValue from '@/components/ui/KeyValue.vue';
import AppButton from '@/components/ui/AppButton.vue';

const store = useVaultStore();

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
    <!-- Header -->
    <Motion
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }"
    >
      <PageHeader
        title="Security"
        description="Vault session and security controls"
      />
    </Motion>

    <!-- Session Status -->
    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }"
    >
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
    </Motion>

    <!-- Lock -->
    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }"
    >
      <Card padding="md">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[13px] font-medium text-[var(--text-primary)]">Lock Vault</p>
            <p class="text-[11px] text-[var(--text-tertiary)] mt-0.5">
              Immediately secure all credentials and end session
            </p>
          </div>
          <AppButton variant="danger" size="sm" @click="store.lock()">
            <Lock :size="12" />
            Lock Now
          </AppButton>
        </div>
      </Card>
    </Motion>

    <!-- Recovery -->
    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }"
    >
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
    </Motion>
  </PageContainer>
</template>
