// Mock Vault Client — development-only adapter

import type { VaultClient } from '@/services/api/contracts';
import type {
  CredentialSummary,
  CredentialDetail,
  CreateCredentialInput,
  UpdateCredentialInput,
  VaultStatus,
  ActivityEvent,
  ApiKeyDetail,
} from '@/types';
import { SYNTHETIC_CREDENTIALS, SYNTHETIC_API_KEYS, SYNTHETIC_ACTIVITY } from './fixtures';

const MOCK_DELAY = 300;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

let credentials: CredentialDetail[] = [...SYNTHETIC_CREDENTIALS];
let apiKeys: ApiKeyDetail[] = [...SYNTHETIC_API_KEYS];
let isUnlocked = false;
let unlockedAt: string | null = null;

export const mockVaultClient: VaultClient = {
  async getVaultStatus(): Promise<VaultStatus> {
    await delay(MOCK_DELAY);
    const totalCount = credentials.length + apiKeys.length;
    if (!isUnlocked) {
      return {
        state: 'locked',
        vaultId: 'vault-main',
        credentialCount: totalCount,
        passwordCount: credentials.length,
        apiKeyCount: apiKeys.length,
      };
    }
    return {
      state: 'unlocked',
      vaultId: 'vault-main',
      credentialCount: totalCount,
      passwordCount: credentials.length,
      apiKeyCount: apiKeys.length,
      lastUnlockedAt: unlockedAt ?? undefined,
      sessionExpiresAt: unlockedAt
        ? new Date(new Date(unlockedAt).getTime() + 15 * 60 * 1000).toISOString()
        : undefined,
    };
  },

  async unlockVault(passphrase: string): Promise<{ success: boolean; error?: string }> {
    await delay(600);
    if (!passphrase || passphrase.length < 1) {
      return { success: false, error: 'Passphrase is required.' };
    }
    isUnlocked = true;
    unlockedAt = new Date().toISOString();
    return { success: true };
  },

  async createVault(passphrase: string, confirm: string): Promise<{ success: boolean; error?: string }> {
    await delay(800);
    if (!passphrase || passphrase.length < 12) {
      return { success: false, error: 'Passphrase must be at least 12 characters.' };
    }
    if (passphrase !== confirm) {
      return { success: false, error: 'Passphrases do not match.' };
    }
    isUnlocked = true;
    unlockedAt = new Date().toISOString();
    return { success: true };
  },

  async lockVault(): Promise<void> {
    await delay(100);
    isUnlocked = false;
    unlockedAt = null;
  },

  async listCredentials(): Promise<CredentialSummary[]> {
    await delay(MOCK_DELAY);
    if (!isUnlocked) throw new Error('Vault is locked');
    const allCreds = [...credentials, ...apiKeys];
    return allCreds.map(({ secret: _s, notes: _n, ...summary }) => {
      const { metadata: _m, ...rest } = summary as any;
      return rest;
    });
  },

  async listPasswords(): Promise<CredentialSummary[]> {
    await delay(MOCK_DELAY);
    if (!isUnlocked) throw new Error('Vault is locked');
    return credentials.map(({ secret: _s, notes: _n, ...summary }) => summary);
  },

  async listApiKeys(): Promise<CredentialSummary[]> {
    await delay(MOCK_DELAY);
    if (!isUnlocked) throw new Error('Vault is locked');
    return apiKeys.map((key) => {
      const { secret: _s, notes: _n, metadata: _m, ...summary } = key;
      return summary;
    });
  },

  async getCredential(id: string): Promise<CredentialDetail> {
    await delay(MOCK_DELAY);
    if (!isUnlocked) throw new Error('Vault is locked');
    const cred = [...credentials, ...apiKeys].find(c => c.id === id);
    if (!cred) throw new Error('Credential not found');
    return cred;
  },

  async createCredential(input: CreateCredentialInput): Promise<CredentialSummary> {
    await delay(MOCK_DELAY);
    if (!isUnlocked) throw new Error('Vault is locked');
    const now = new Date().toISOString();
    const newCred: CredentialDetail = {
      id: generateId(),
      vaultId: 'vault-main',
      kind: input.kind,
      title: input.title,
      username: input.username,
      url: input.url,
      category: input.category,
      tags: input.tags ?? [],
      secret: input.secret,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    
    if (input.kind === 'api-key' || input.kind === 'access-token') {
      const apiKey = { ...newCred, metadata: input.metadata } as ApiKeyDetail;
      apiKeys = [apiKey, ...apiKeys];
    } else {
      credentials = [newCred, ...credentials];
    }
    
    const { secret: _s, notes: _n, ...summary } = newCred;
    return summary;
  },

  async updateCredential(id: string, input: UpdateCredentialInput): Promise<CredentialSummary> {
    await delay(MOCK_DELAY);
    if (!isUnlocked) throw new Error('Vault is locked');
    
    let credIdx = credentials.findIndex(c => c.id === id);
    let keyIdx = apiKeys.findIndex(k => k.id === id);
    
    if (credIdx === -1 && keyIdx === -1) throw new Error('Credential not found');
    
    const isApiKey = keyIdx !== -1;
    const idx = isApiKey ? keyIdx : credIdx;
    const list = isApiKey ? apiKeys : credentials;
    const existing = list[idx];
    
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) updates[key] = value;
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as CredentialDetail;
    
    if (isApiKey) {
      apiKeys[idx] = updated as ApiKeyDetail;
    } else {
      credentials[idx] = updated;
    }
    
    const { secret: _s, notes: _n, ...summary } = updated;
    return summary;
  },

  async deleteCredential(id: string): Promise<void> {
    await delay(MOCK_DELAY);
    if (!isUnlocked) throw new Error('Vault is locked');
    credentials = credentials.filter(c => c.id !== id);
    apiKeys = apiKeys.filter(k => k.id !== id);
  },

  async getActivity(): Promise<ActivityEvent[]> {
    await delay(MOCK_DELAY);
    return SYNTHETIC_ACTIVITY;
  },

  isUnlocked(): boolean {
    return isUnlocked;
  },
};
