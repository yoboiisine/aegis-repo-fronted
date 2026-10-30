// Service contracts — typed interface for vault operations

import type {
  CredentialSummary,
  CredentialDetail,
  CreateCredentialInput,
  UpdateCredentialInput,
  VaultStatus,
  ActivityEvent,
} from '@/types';

export interface VaultClient {
  getVaultStatus(): Promise<VaultStatus>;
  unlockVault(passphrase: string): Promise<{ success: boolean; error?: string }>;
  createVault(passphrase: string, confirmPassphrase: string): Promise<{ success: boolean; error?: string }>;
  lockVault(): Promise<void>;
  listCredentials(): Promise<CredentialSummary[]>;
  listPasswords(): Promise<CredentialSummary[]>;
  listApiKeys(): Promise<CredentialSummary[]>;
  getCredential(id: string): Promise<CredentialDetail>;
  createCredential(input: CreateCredentialInput): Promise<CredentialSummary>;
  updateCredential(id: string, input: UpdateCredentialInput): Promise<CredentialSummary>;
  deleteCredential(id: string): Promise<void>;
  getActivity(): Promise<ActivityEvent[]>;
  isUnlocked(): boolean;
}

export const CREDENTIAL_KINDS: { value: 'password' | 'api-key' | 'access-token' | 'ssh-key'; label: string }[] = [
  { value: 'password', label: 'Password' },
  { value: 'api-key', label: 'API Key' },
  { value: 'access-token', label: 'Access Token' },
  { value: 'ssh-key', label: 'SSH Key' },
];

export const CATEGORIES = ['All', 'Development', 'Infrastructure', 'Payments', 'Communications', 'Operations', 'AI Services'];
