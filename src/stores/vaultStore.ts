// Vault Store — Pinia store for vault state management

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  CredentialSummary,
  CredentialDetail,
  VaultStatus,
  ActivityEvent,
  AppNotification,
  CredentialFilters,
  CreateCredentialInput,
  UpdateCredentialInput,
  PageId,
} from '@/types';
import { vaultClient } from '@/services/api/vaultClient';

export const useVaultStore = defineStore('vault', () => {
  // State
  const status = ref<VaultStatus>({ state: 'locked' });
  const credentials = ref<CredentialSummary[]>([]);
  const passwords = ref<CredentialSummary[]>([]);
  const apiKeys = ref<CredentialSummary[]>([]);
  const selectedCredential = ref<CredentialDetail | null>(null);
  const activity = ref<ActivityEvent[]>([]);
  const notifications = ref<AppNotification[]>([]);
  const filters = ref<CredentialFilters>({
    search: '',
    kind: 'all',
    category: 'All',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isCreating = ref(false);
  const isUnlocking = ref(false);
  const currentPage = ref<PageId>('overview');

  // Computed
  const isUnlocked = computed(() => status.value.state === 'unlocked');

  function applyFilters(items: CredentialSummary[]): CredentialSummary[] {
    return items
      .filter(c => {
        if (filters.value.kind !== 'all' && c.kind !== filters.value.kind) return false;
        if (filters.value.category !== 'All' && c.category !== filters.value.category) return false;
        if (filters.value.search) {
          const q = filters.value.search.toLowerCase();
          return (
            c.title.toLowerCase().includes(q) ||
            c.username?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.tags.some(t => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        const key = filters.value.sortBy;
        const aVal = String(a[key] ?? '');
        const bVal = String(b[key] ?? '');
        const cmp = aVal.localeCompare(bVal);
        return filters.value.sortOrder === 'asc' ? cmp : -cmp;
      });
  }

  const filteredPasswords = computed(() => applyFilters(passwords.value));
  const filteredApiKeys = computed(() => applyFilters(apiKeys.value));

  // Actions
  function notify(notification: Omit<AppNotification, 'id'>) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}`;
    const full: AppNotification = { ...notification, id };
    notifications.value.push(full);
    const duration = notification.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => dismissNotification(id), duration);
    }
  }

  function dismissNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id);
  }

  async function init() {
    const s = await vaultClient.getVaultStatus();
    status.value = s;
  }

  async function unlock(passphrase: string): Promise<boolean> {
    isUnlocking.value = true;
    error.value = null;
    try {
      const result = await vaultClient.unlockVault(passphrase);
      if (result.success) {
        const s = await vaultClient.getVaultStatus();
        status.value = s;
        notify({ type: 'success', title: 'Vault unlocked' });
        return true;
      } else {
        error.value = result.error ?? 'Invalid passphrase';
        return false;
      }
    } catch {
      error.value = 'Failed to unlock vault';
      return false;
    } finally {
      isUnlocking.value = false;
    }
  }

  async function lock() {
    await vaultClient.lockVault();
    status.value = { state: 'locked' };
    credentials.value = [];
    passwords.value = [];
    apiKeys.value = [];
    selectedCredential.value = null;
    activity.value = [];
    error.value = null;
    currentPage.value = 'overview';
  }

  async function loadAll() {
    isLoading.value = true;
    try {
      const [creds, pwds, keys] = await Promise.all([
        vaultClient.listCredentials(),
        vaultClient.listPasswords(),
        vaultClient.listApiKeys(),
      ]);
      credentials.value = creds;
      passwords.value = pwds;
      apiKeys.value = keys;
    } catch {
      error.value = 'Failed to load credentials';
    } finally {
      isLoading.value = false;
    }
  }

  async function loadActivity() {
    try {
      activity.value = await vaultClient.getActivity();
    } catch { /* non-critical */ }
  }

  async function selectCredential(id: string | null) {
    if (!id) {
      selectedCredential.value = null;
      return;
    }
    try {
      selectedCredential.value = await vaultClient.getCredential(id);
    } catch {
      notify({ type: 'error', title: 'Failed to load credential' });
    }
  }

  async function createCredential(input: CreateCredentialInput): Promise<CredentialSummary> {
    isCreating.value = true;
    try {
      const summary = await vaultClient.createCredential(input);
      credentials.value = [summary, ...credentials.value];
      if (input.kind === 'api-key' || input.kind === 'access-token') {
        apiKeys.value = [summary, ...apiKeys.value];
      } else {
        passwords.value = [summary, ...passwords.value];
      }
      notify({ type: 'success', title: 'Credential created' });
      return summary;
    } catch {
      notify({ type: 'error', title: 'Failed to create credential' });
      throw new Error('Failed');
    } finally {
      isCreating.value = false;
    }
  }

  async function updateCredential(id: string, input: UpdateCredentialInput): Promise<CredentialSummary> {
    try {
      const summary = await vaultClient.updateCredential(id, input);
      credentials.value = credentials.value.map(c => c.id === id ? summary : c);
      passwords.value = passwords.value.map(c => c.id === id ? summary : c);
      apiKeys.value = apiKeys.value.map(c => c.id === id ? summary : c);
      if (selectedCredential.value?.id === id) {
        selectedCredential.value = { ...selectedCredential.value, ...summary } as CredentialDetail;
      }
      notify({ type: 'success', title: 'Credential updated' });
      return summary;
    } catch {
      notify({ type: 'error', title: 'Failed to update credential' });
      throw new Error('Failed');
    }
  }

  async function deleteCredential(id: string) {
    try {
      await vaultClient.deleteCredential(id);
      credentials.value = credentials.value.filter(c => c.id !== id);
      passwords.value = passwords.value.filter(c => c.id !== id);
      apiKeys.value = apiKeys.value.filter(c => c.id !== id);
      if (selectedCredential.value?.id === id) selectedCredential.value = null;
      notify({ type: 'success', title: 'Credential deleted' });
    } catch {
      notify({ type: 'error', title: 'Failed to delete credential' });
      throw new Error('Failed');
    }
  }

  function setFilters(partial: Partial<CredentialFilters>) {
    filters.value = { ...filters.value, ...partial };
  }

  function navigate(page: PageId) {
    currentPage.value = page;
  }

  return {
    status, credentials, passwords, apiKeys, selectedCredential,
    activity, notifications, filters, isLoading, error,
    isCreating, isUnlocking, currentPage,
    isUnlocked, filteredPasswords, filteredApiKeys,
    notify, dismissNotification, init, unlock, lock,
    loadAll, loadActivity, selectCredential,
    createCredential, updateCredential, deleteCredential,
    setFilters, navigate,
  };
});
