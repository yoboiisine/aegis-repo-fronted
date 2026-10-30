<script setup lang="ts">
import { computed } from 'vue';
import { Motion } from 'motion-v';
import { Key, Fingerprint, Shield, Activity, Clock, Lock } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import PageContainer from '@/components/layout/PageContainer.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Card from '@/components/ui/Card.vue';
import Section from '@/components/layout/Section.vue';
import Grid from '@/components/layout/Grid.vue';

const store = useVaultStore();

const stats = computed(() => {
  const categories = new Set([
    ...store.passwords.map(p => p.category).filter(Boolean),
    ...store.apiKeys.map(k => k.category).filter(Boolean),
  ]);
  
  return [
    {
      label: 'Passwords',
      value: store.status.passwordCount ?? 0,
      icon: Key,
      color: 'var(--type-password)',
      page: 'passwords' as const,
    },
    {
      label: 'API Keys',
      value: store.status.apiKeyCount ?? 0,
      icon: Fingerprint,
      color: 'var(--type-api-key)',
      page: 'api-keys' as const,
    },
    {
      label: 'Categories',
      value: categories.size,
      icon: Shield,
      color: 'var(--accent-primary)',
      page: 'overview' as const,
    },
    {
      label: 'Total Items',
      value: store.status.credentialCount ?? 0,
      icon: Lock,
      color: 'var(--text-secondary)',
      page: 'overview' as const,
    },
  ];
});

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
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
        title="Vault Overview"
        description="Your secure credential storage at a glance"
      />
    </Motion>

    <!-- Stats Row -->
    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }"
    >
      <Grid :cols="4" gap="sm">
        <button
          v-for="stat in stats"
          :key="stat.label"
          @click="store.navigate(stat.page)"
          class="p-3 rounded-md border transition-all text-left hover:border-[var(--border-default)] bg-[var(--surface-primary)] border-[var(--border-subtle)]"
        >
          <div class="flex items-center gap-1.5 mb-1.5">
            <div
              class="w-6 h-6 rounded flex items-center justify-center"
              :style="{ background: `${stat.color}15` }"
            >
              <component :is="stat.icon" :size="12" :style="{ color: stat.color }" />
            </div>
          </div>
          <p class="text-[20px] font-semibold tracking-tight leading-none text-[var(--text-primary)]">
            {{ stat.value }}
          </p>
          <p class="text-[10px] text-[var(--text-tertiary)] mt-1">
            {{ stat.label }}
          </p>
        </button>
      </Grid>
    </Motion>

    <!-- Main Content -->
    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }"
    >
      <Grid :cols="3" gap="sm">
        <!-- Recent Activity -->
        <div class="col-span-2">
          <Card padding="sm">
            <Section title="Recent Activity" :icon="Activity">
              <div v-if="store.activity.length === 0" class="py-4 text-center">
                <p class="text-[12px] text-[var(--text-tertiary)]">
                  No recent activity
                </p>
              </div>

              <div v-else class="space-y-0.5">
                <div
                  v-for="evt in store.activity.slice(0, 8)"
                  :key="evt.id"
                  class="flex items-start gap-2 py-1.5 px-1.5 rounded transition-colors hover:bg-[var(--surface-secondary)]"
                >
                  <div
                    class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    :style="{
                      background: evt.credentialKind === 'password' ? 'var(--type-password)' + '15' :
                                 evt.credentialKind === 'api-key' ? 'var(--type-api-key)' + '15' :
                                 'var(--surface-tertiary)',
                    }"
                  >
                    <Clock
                      :size="10"
                      :style="{
                        color: evt.credentialKind === 'password' ? 'var(--type-password)' :
                               evt.credentialKind === 'api-key' ? 'var(--type-api-key)' :
                               'var(--text-tertiary)',
                      }"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[12px] font-medium truncate text-[var(--text-primary)]">
                      {{ evt.title }}
                    </p>
                    <p v-if="evt.detail" class="text-[10px] truncate text-[var(--text-tertiary)] mt-0.5">
                      {{ evt.detail }}
                    </p>
                  </div>
                  <span class="text-[10px] flex-shrink-0 tabular-nums text-[var(--text-disabled)]">
                    {{ formatTimeAgo(evt.timestamp) }}
                  </span>
                </div>
              </div>

              <p class="text-[9px] mt-2 italic text-[var(--text-disabled)]">
                Synthetic demonstration data — not real security events
              </p>
            </Section>
          </Card>
        </div>

        <!-- Vault Health -->
        <div>
          <Card padding="sm">
            <Section title="Vault Health" :icon="Shield">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-[var(--text-secondary)]">Status</span>
                  <span class="text-[10px] font-medium text-[var(--success)]">Active</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-[var(--text-secondary)]">Session</span>
                  <span class="text-[10px] tabular-nums text-[var(--text-primary)]">
                    {{ store.status.lastUnlockedAt ? formatTimeAgo(store.status.lastUnlockedAt) : '—' }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-[var(--text-secondary)]">Auto-lock</span>
                  <span class="text-[10px] tabular-nums text-[var(--text-primary)]">15m</span>
                </div>

                <div class="pt-2 border-t border-[var(--border-subtle)]">
                  <button
                    @click="store.navigate('security')"
                    class="text-[11px] font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    Security →
                  </button>
                </div>
              </div>
            </Section>
          </Card>
        </div>
      </Grid>
    </Motion>
  </PageContainer>
</template>
