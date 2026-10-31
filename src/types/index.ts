// Aegis Type Definitions

export type CredentialKind = 'password' | 'api-key' | 'access-token' | 'ssh-key';

export interface CredentialSummary {
  id: string;
  vaultId: string;
  kind: CredentialKind;
  title: string;
  username?: string;
  url?: string;
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CredentialDetail extends CredentialSummary {
  secret: string;
  notes?: string;
}

// API Key specific metadata
export interface ApiKeyMetadata {
  provider?: string;
  project?: string;
  environment?: 'production' | 'staging' | 'development' | 'test';
  expiresAt?: string;
  lastUsed?: string;
  scopes?: string[];
}

export interface ApiKeyDetail extends CredentialDetail {
  metadata?: ApiKeyMetadata;
}

export interface CreateCredentialInput {
  kind: CredentialKind;
  title: string;
  username?: string;
  secret: string;
  url?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  metadata?: ApiKeyMetadata;
}

export interface UpdateCredentialInput {
  title?: string;
  username?: string;
  secret?: string;
  url?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  metadata?: ApiKeyMetadata;
}

export type VaultState = 'uninitialized' | 'locked' | 'unlocked';

export interface VaultStatus {
  state: VaultState;
  vaultId?: string;
  credentialCount?: number;
  passwordCount?: number;
  apiKeyCount?: number;
  lastUnlockedAt?: string;
  sessionExpiresAt?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'credential_created' | 'credential_updated' | 'credential_deleted' | 'credential_accessed' | 'vault_locked' | 'vault_unlocked';
  title: string;
  detail?: string;
  timestamp: string;
  credentialKind?: CredentialKind;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface CredentialFilters {
  search: string;
  kind: CredentialKind | 'all';
  category: string;
  sortBy: 'title' | 'updatedAt' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export type ThemeMode = 'light' | 'dark';

export type PageId = 'overview' | 'passwords' | 'api-keys' | 'security' | 'settings';
