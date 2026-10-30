<script setup lang="ts">
/**
 * OverviewView — Vault dashboard.
 *
 * Motion choreography (Layer 03 scroll + Layer 04 interaction):
 *  - ScrollProgressBar and a decorative parallax composition bind to the
 *    actual nested scroll container registered by PageContainer.
 *  - Header + hero enter on a mount-driven stagger; lower groups use
 *    one-time viewport reveals so scrolling has rhythm without replaying
 *    content the user already read.
 *  - Stat cards are interactive surfaces: hover lift + press compression.
 *  - Activity rows stagger in when scrolled into view, capped so long
 *    lists never leave tail items waiting.
 */
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Key, Fingerprint, Shield, Activity, Clock, Lock } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import PageContainer from '@/components/layout/PageContainer.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import Card from '@/components/ui/Card.vue';
import Section from '@/components/layout/Section.vue';
import Grid from '@/components/layout/Grid.vue';
import { MotionReveal, MotionStagger, MotionStaggerItem, ScrollProgressBar, ParallaxLayer } from '@/motion/components';
import { pageScroller } from '@/motion/composables/useScrollContainer';
import { cardInteraction } from '@/motion/presets';
import { staggers, cappedStaggerDelay } from '@/motion/tokens';

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
    <template #sticky-title>
      <span class="text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--text-tertiary)]">
        Vault Overview
      </span>
    </template>

    <!-- Scroll-linked progress: transform-only, driven by Motion values -->
    <ScrollProgressBar :container="pageScroller" />

    <!-- Decorative parallax composition (atmosphere only — no functional
         content lives inside these layers). Two plates at different rates. -->
    <div class="relative">
      <ParallaxLayer :container="pageScroller" :distance="-70" class="pointer-events-none">
        <div
          class="absolute -top-10 right-0 w-[420px] h-[420px] rounded-full opacity-50"
          :style="{ background: 'var(--accent-muted)', filter: 'blur(110px)' }"
          aria-hidden="true"
        />
      </ParallaxLayer>
      <ParallaxLayer :container="pageScroller" :distance="34" class="pointer-events-none">
        <div
          class="absolute top-24 -left-16 w-[240px] h-[240px] rotate-45 border opacity-40"
          :style="{ borderColor: 'var(--border-subtle)', borderRadius: '32px' }"
          aria-hidden="true"
        />
      </ParallaxLayer>

      <!-- Header + stats: coordinated mount stagger -->
      <MotionStagger :interval="staggers.section" when="mount">
        <MotionStaggerItem>
          <PageHeader
            title="Vault Overview"
            description="Your secure credential storage at a glance"
          />
        </MotionStaggerItem>

        <MotionStaggerItem>
          <Grid :cols="4" gap="sm">
            <motion.button
              v-for="stat in stats"
              :key="stat.label"
              @click="store.navigate(stat.page)"
              v-bind="cardInteraction"
              class="p-3 rounded-md border text-left cursor-pointer hover:border-[var(--border-default)] bg-[var(--surface-primary)] border-[var(--border-subtle)]"
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
            </motion.button>
          </Grid>
        </MotionStaggerItem>
      </MotionStagger>
    </div>

    <!-- Main Content: one-time viewport reveal (scroll-triggered) -->
    <MotionReveal :once="true" :amount="0.15">
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

              <!-- Rows stagger in as the group enters view; per-row delay is
                   capped so tail entries never wait absurdly long. -->
              <MotionStagger v-else :interval="staggers.item" :delay-children="0" when="view" tag="div" class="space-y-0.5">
                <MotionStaggerItem
                  v-for="(evt, i) in store.activity.slice(0, 8)"
                  :key="evt.id"
                  tag="div"
                  :distance="8"
                >
                  <div
                    class="flex items-start gap-2 py-1.5 px-1.5 rounded transition-colors hover:bg-[var(--surface-secondary)]"
                    :style="{ transitionDelay: `${cappedStaggerDelay(i)}s` }"
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
                </MotionStaggerItem>
              </MotionStagger>

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
    </MotionReveal>
  </PageContainer>
</template>
