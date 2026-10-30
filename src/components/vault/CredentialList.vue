<script setup lang="ts">
import { ref, computed } from 'vue';
import { Motion, AnimatePresence } from 'motion-v';
import { Search, Plus, Filter, ArrowUpDown, Eye, EyeOff, Copy, Check, ExternalLink, Edit3, Trash2, X, Tag } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import { CATEGORIES } from '@/services/api/contracts';
import type { CredentialSummary, CredentialKind } from '@/types';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import CredentialForm from '@/components/vault/CredentialForm.vue';
import SplitLayout from '@/components/layout/SplitLayout.vue';
import SplitSidebarHeader from '@/components/layout/SplitSidebarHeader.vue';
import DetailContainer from '@/components/layout/DetailContainer.vue';
import DetailHeader from '@/components/layout/DetailHeader.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import FieldGroup from '@/components/ui/FieldGroup.vue';

interface Props {
  title: string;
  subtitle: string;
  items: CredentialSummary[];
  defaultKind?: CredentialKind;
}

const props = defineProps<Props>();

const store = useVaultStore();

const searchQuery = ref('');
const showFilters = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const revealedId = ref<string | null>(null);
const copiedId = ref<string | null>(null);

const filteredItems = computed(() => {
  return props.items
    .filter(item => {
      if (props.defaultKind && item.kind !== props.defaultKind) return false;
      if (store.filters.category !== 'All' && item.category !== store.filters.category) return false;
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.username?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const key = store.filters.sortBy;
      const aVal = String(a[key] ?? '');
      const bVal = String(b[key] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return store.filters.sortOrder === 'asc' ? cmp : -cmp;
    });
});

function toggleReveal(id: string) {
  revealedId.value = revealedId.value === id ? null : id;
}

async function copySecret(id: string, secret: string) {
  if (revealedId.value !== id) return;
  try {
    await navigator.clipboard.writeText(secret);
    copiedId.value = id;
    setTimeout(() => { copiedId.value = null; }, 2000);
  } catch { /* ignore */ }
}

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

async function handleCreate(data: any) {
  await store.createCredential(data);
  showCreateModal.value = false;
}

async function handleUpdate(data: any) {
  if (!store.selectedCredential) return;
  await store.updateCredential(store.selectedCredential.id, data);
  showEditModal.value = false;
}

async function handleDelete() {
  if (!store.selectedCredential) return;
  await store.deleteCredential(store.selectedCredential.id);
  showDeleteConfirm.value = false;
}
</script>

<template>
  <SplitLayout>
    <!-- Sidebar -->
    <template #sidebar>
      <SplitSidebarHeader :title="title" :subtitle="subtitle">
        <template #actions>
          <AppButton variant="primary" size="sm" @click="showCreateModal = true">
            <Plus :size="13" />
            Add
          </AppButton>
        </template>
      </SplitSidebarHeader>

      <!-- Toolbar -->
      <div class="px-5 py-3 border-b space-y-2.5" :style="{ borderColor: 'var(--border-subtle)' }">
        <Motion
          :initial="{ opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }"
        >
          <!-- Search -->
          <div class="relative">
            <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2" :style="{ color: 'var(--text-tertiary)' }" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full pl-9 pr-3 py-2 text-[13px] rounded-md border transition-colors"
              :style="{
                background: 'var(--surface-secondary)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }"
              @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'"
              @blur="($event.target as HTMLInputElement).style.borderColor = 'var(--border-subtle)'"
            />
          </div>

          <!-- Filters -->
          <div class="flex items-center gap-2">
            <button
              @click="showFilters = !showFilters"
              class="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors"
              :style="{
                color: showFilters ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                background: showFilters ? 'var(--accent-muted)' : 'var(--surface-secondary)',
              }"
            >
              <Filter :size="11" />
              Filters
            </button>
            <button
              @click="store.setFilters({ sortOrder: store.filters.sortOrder === 'asc' ? 'desc' : 'asc' })"
              class="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors"
              :style="{ color: 'var(--text-tertiary)', background: 'var(--surface-secondary)' }"
            >
              <ArrowUpDown :size="11" />
              {{ store.filters.sortBy === 'title' ? 'Title' : 'Updated' }}
            </button>
            <span class="text-[11px] ml-auto tabular-nums" :style="{ color: 'var(--text-disabled)' }">
              {{ filteredItems.length }}
            </span>
          </div>

          <AnimatePresence>
            <Motion
              v-if="showFilters"
              :initial="{ height: 0, opacity: 0 }"
              :animate="{ height: 'auto', opacity: 1 }"
              :exit="{ height: 0, opacity: 0 }"
              :transition="{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }"
              class="overflow-hidden"
            >
              <div class="flex gap-2 mt-3">
                <select
                  :value="store.filters.category"
                  @change="store.setFilters({ category: ($event.target as HTMLSelectElement).value })"
                  class="flex-1 px-2.5 py-1.5 text-[11px] rounded-md border"
                  :style="{
                    background: 'var(--surface-secondary)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }"
                >
                  <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </Motion>
          </AnimatePresence>
        </Motion>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">
        <EmptyState
          v-if="filteredItems.length === 0"
          :icon="Tag"
          title="No items found"
          :description="props.items.length === 0 ? 'Create your first item' : 'Try adjusting filters'"
        />

        <div v-else class="p-2 space-y-0.5">
          <Motion
            v-for="(item, i) in filteredItems"
            :key="item.id"
            :initial="{ opacity: 0, x: -8 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.2, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }"
          >
            <button
              @click="store.selectCredential(item.id)"
              class="w-full text-left p-3 rounded-md transition-all"
              :style="{
                background: store.selectedCredential?.id === item.id ? 'var(--surface-tertiary)' : 'transparent',
                border: store.selectedCredential?.id === item.id ? '1px solid var(--border-default)' : '1px solid transparent',
              }"
              @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--surface-secondary)'"
              @mouseleave="($event.currentTarget as HTMLElement).style.background = store.selectedCredential?.id === item.id ? 'var(--surface-tertiary)' : 'transparent'"
            >
              <p class="text-[13px] font-medium truncate text-[var(--text-primary)]">
                {{ item.title }}
              </p>
              <p class="text-[11px] truncate mt-0.5 text-[var(--text-tertiary)]">
                {{ item.username || item.category || '—' }}
              </p>
              <p class="text-[10px] mt-1 tabular-nums text-[var(--text-disabled)]">
                {{ formatTimeAgo(item.updatedAt) }}
              </p>
            </button>
          </Motion>
        </div>
      </div>
    </template>

    <!-- Detail Panel -->
    <template #detail>
      <div v-if="!store.selectedCredential" class="flex items-center justify-center h-full">
        <p class="text-[13px] text-[var(--text-disabled)]">
          Select an item to view details
        </p>
      </div>

      <Motion
        v-else
        :key="store.selectedCredential.id"
        :initial="{ opacity: 0, x: 12 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }"
      >
        <DetailContainer>
          <DetailHeader
            :title="store.selectedCredential.title"
            :subtitle="store.selectedCredential.category || 'Uncategorized'"
          >
            <template #actions>
              <button
                @click="showEditModal = true"
                class="p-2 rounded-md transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
              >
                <Edit3 :size="14" />
              </button>
              <button
                @click="showDeleteConfirm = true"
                class="p-2 rounded-md transition-colors text-[var(--danger)] hover:bg-[var(--danger-muted)]"
              >
                <Trash2 :size="14" />
              </button>
              <button
                @click="store.selectCredential(null)"
                class="p-2 rounded-md transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
              >
                <X :size="14" />
              </button>
            </template>
          </DetailHeader>

          <!-- Fields -->
          <div class="space-y-5">
            <!-- Username -->
            <FieldGroup v-if="store.selectedCredential.username" label="Username">
              <div class="px-3 py-2.5 text-[13px] rounded-md border bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                {{ store.selectedCredential.username }}
              </div>
            </FieldGroup>

            <!-- Secret -->
            <FieldGroup label="Secret">
              <div class="flex items-center gap-2">
                <div class="flex-1 px-3 py-2.5 text-[13px] font-mono rounded-md border bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                  <span v-if="revealedId === store.selectedCredential.id" class="break-all">
                    {{ store.selectedCredential.secret }}
                  </span>
                  <span v-else class="tracking-widest text-[var(--text-disabled)]">
                    ••••••••••••••••
                  </span>
                </div>
                <button
                  @click="toggleReveal(store.selectedCredential!.id)"
                  class="p-2.5 rounded-md border transition-colors bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]"
                >
                  <EyeOff v-if="revealedId === store.selectedCredential.id" :size="14" />
                  <Eye v-else :size="14" />
                </button>
                <button
                  @click="copySecret(store.selectedCredential!.id, store.selectedCredential!.secret)"
                  :disabled="revealedId !== store.selectedCredential.id"
                  class="p-2.5 rounded-md border transition-colors"
                  :class="{
                    'bg-[var(--success-muted)] border-[var(--success)] text-[var(--success)]': copiedId === store.selectedCredential.id,
                    'bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)]': copiedId !== store.selectedCredential.id && revealedId === store.selectedCredential.id,
                    'bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[var(--text-disabled)] cursor-not-allowed': revealedId !== store.selectedCredential.id,
                  }"
                >
                  <Check v-if="copiedId === store.selectedCredential.id" :size="14" />
                  <Copy v-else :size="14" />
                </button>
              </div>
            </FieldGroup>

            <!-- URL -->
            <FieldGroup v-if="store.selectedCredential.url" label="URL">
              <div class="flex items-center gap-2 px-3 py-2.5 text-[13px] rounded-md border bg-[var(--surface-primary)] border-[var(--border-subtle)]">
                <ExternalLink :size="13" class="text-[var(--text-tertiary)]" />
                <a
                  :href="store.selectedCredential.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="truncate transition-colors text-[var(--accent-primary)] hover:text-[var(--accent-hover)]"
                >
                  {{ store.selectedCredential.url }}
                </a>
              </div>
            </FieldGroup>

            <!-- Tags -->
            <FieldGroup v-if="store.selectedCredential.tags.length > 0" label="Tags">
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in store.selectedCredential.tags"
                  :key="tag"
                  class="px-2 py-1 text-[11px] rounded border bg-[var(--surface-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  {{ tag }}
                </span>
              </div>
            </FieldGroup>

            <!-- Notes -->
            <FieldGroup v-if="store.selectedCredential.notes" label="Notes">
              <div class="px-3 py-2.5 text-[13px] rounded-md border whitespace-pre-wrap bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                {{ store.selectedCredential.notes }}
              </div>
            </FieldGroup>

            <!-- Metadata -->
            <div class="pt-5 border-t grid grid-cols-2 gap-4 border-[var(--border-subtle)]">
              <div>
                <p class="text-[10px] tracking-wider uppercase text-[var(--text-tertiary)]">Created</p>
                <p class="text-[12px] mt-0.5 tabular-nums text-[var(--text-primary)]">
                  {{ new Date(store.selectedCredential.createdAt).toLocaleDateString() }}
                </p>
              </div>
              <div>
                <p class="text-[10px] tracking-wider uppercase text-[var(--text-tertiary)]">Updated</p>
                <p class="text-[12px] mt-0.5 tabular-nums text-[var(--text-primary)]">
                  {{ new Date(store.selectedCredential.updatedAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
          </div>
        </DetailContainer>
      </Motion>
    </template>
  </SplitLayout>

  <!-- Create Modal -->
  <Teleport to="body">
    <AnimatePresence>
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Motion
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showCreateModal = false"
        />
        <Motion
          :initial="{ opacity: 0, scale: 0.95, y: 10 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.95, y: 10 }"
          :transition="{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }"
          class="relative w-full max-w-lg rounded-lg border p-6"
          :style="{
            background: 'var(--surface-primary)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-xl)',
          }"
        >
          <h2 class="text-[16px] font-semibold mb-4 text-[var(--text-primary)]">
            New {{ props.defaultKind === 'api-key' || props.defaultKind === 'access-token' ? 'API Key' : 'Password' }}
          </h2>
          <CredentialForm
            :default-kind="props.defaultKind"
            :is-edit="false"
            @submit="handleCreate"
            @cancel="showCreateModal = false"
          />
        </Motion>
      </div>
    </AnimatePresence>
  </Teleport>

  <!-- Edit Modal -->
  <Teleport to="body">
    <AnimatePresence>
      <div v-if="showEditModal && store.selectedCredential" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Motion
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="showEditModal = false"
        />
        <Motion
          :initial="{ opacity: 0, scale: 0.95, y: 10 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.95, y: 10 }"
          :transition="{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }"
          class="relative w-full max-w-lg rounded-lg border p-6"
          :style="{
            background: 'var(--surface-primary)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-xl)',
          }"
        >
          <h2 class="text-[16px] font-semibold mb-4 text-[var(--text-primary)]">
            Edit Credential
          </h2>
          <CredentialForm
            :initial="store.selectedCredential"
            :is-edit="true"
            @submit="handleUpdate"
            @cancel="showEditModal = false"
          />
        </Motion>
      </div>
    </AnimatePresence>
  </Teleport>

  <!-- Delete Confirm -->
  <AppDialog
    :open="showDeleteConfirm"
    title="Delete Credential"
    confirm-label="Delete"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteConfirm = false"
  >
    Are you sure you want to permanently delete "{{ store.selectedCredential?.title }}"? This action cannot be undone.
  </AppDialog>
</template>
