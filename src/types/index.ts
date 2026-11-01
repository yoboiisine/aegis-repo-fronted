// Aegis Type Definitions

export type CredentialKind =
  | 'password'
  | 'api-key'
  | 'access-token'
  | 'ssh-key'
  | 'oauth2'
  | 'secure-note';

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

// API Key specific metadata
export interface ApiKeyMetadata {
  provider?: string;
  project?: string;
  environment?: 'production' | 'staging' | 'development' | 'test';
  expiresAt?: string;
  lastUsed?: string;
  scopes?: string[];
}

// OAuth2 credential storage metadata (storage model, without OAuth flow execution)
export interface OAuth2Metadata {
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  authUrl?: string;
  scopes?: string[];
  grantType?: 'authorization_code' | 'client_credentials' | 'refresh_token' | 'implicit';
  expiresAt?: string;
  lastRefreshedAt?: string;
}

// SSH Key specific metadata
export interface SshKeyMetadata {
  keyType?: 'ed25519' | 'rsa' | 'ecdsa';
  fingerprint?: string;
  passphraseProtected?: boolean;
  publicKey?: string;
}

// Secure Note specific metadata
export interface SecureNoteMetadata {
  format?: 'plain' | 'markdown';
  isSensitive?: boolean;
  characterCount?: number;
}

export interface CredentialDetail extends CredentialSummary {
  secret: string;
  notes?: string;
  metadata?: ApiKeyMetadata;
  apiKeyMetadata?: ApiKeyMetadata;
  oauth2Metadata?: OAuth2Metadata;
  sshKeyMetadata?: SshKeyMetadata;
  secureNoteMetadata?: SecureNoteMetadata;
}

export interface ApiKeyDetail extends CredentialDetail {
  kind: 'api-key' | 'access-token';
  metadata?: ApiKeyMetadata;
  apiKeyMetadata?: ApiKeyMetadata;
}

export interface OAuth2Detail extends CredentialDetail {
  kind: 'oauth2';
  oauth2Metadata?: OAuth2Metadata;
}

export interface SshKeyDetail extends CredentialDetail {
  kind: 'ssh-key';
  sshKeyMetadata?: SshKeyMetadata;
}

export interface SecureNoteDetail extends CredentialDetail {
  kind: 'secure-note';
  secureNoteMetadata?: SecureNoteMetadata;
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
  apiKeyMetadata?: ApiKeyMetadata;
  oauth2Metadata?: OAuth2Metadata;
  sshKeyMetadata?: SshKeyMetadata;
  secureNoteMetadata?: SecureNoteMetadata;
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
  apiKeyMetadata?: ApiKeyMetadata;
  oauth2Metadata?: OAuth2Metadata;
  sshKeyMetadata?: SshKeyMetadata;
  secureNoteMetadata?: SecureNoteMetadata;
}

export type VaultState = 'uninitialized' | 'locked' | 'unlocked';

export interface VaultStatus {
  state: VaultState;
  vaultId?: string;
  credentialCount?: number;
  passwordCount?: number;
  apiKeyCount?: number;
  tokenCount?: number;
  sshKeyCount?: number;
  oauth2Count?: number;
  secureNoteCount?: number;
  lastUnlockedAt?: string;
  sessionExpiresAt?: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | 'credential_created'
    | 'credential_updated'
    | 'credential_deleted'
    | 'credential_accessed'
    | 'vault_locked'
    | 'vault_unlocked';
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

/**
 * Non-application route surfaced for Phase 1 review only: the design-system
 * showcase is mounted when the URL hash equals `#/design-system`. It is not
 * part of the vault navigation model (PageId) and never renders app data.
 */
export const DESIGN_SYSTEM_HASH = '#/design-system';

export function isDesignSystemRoute(hash: string): boolean {
  return hash === DESIGN_SYSTEM_HASH;
}
