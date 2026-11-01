import assert from 'node:assert/strict';
import { setActivePinia, createPinia } from 'pinia';
import { useVaultStore, setVaultClient } from '../src/stores/vaultStore';
import { vaultClient as defaultVaultClient } from '../src/services/api/vaultClient';
import type {
  VaultClient,
  CreateVaultResult,
  RecoverVaultResult,
} from '../src/services/api/contracts';
import type {
  VaultStatus,
  VaultState,
  CredentialSummary,
  CredentialDetail,
  CreateCredentialInput,
  UpdateCredentialInput,
  ActivityEvent,
} from '../src/types';

interface TestClientOptions {
  initialState?: VaultState;
  supportsRecovery?: boolean;
  shouldFailInit?: boolean;
  shouldFailLock?: boolean;
  shouldFailUnlock?: boolean;
}

/**
 * Creates an isolated, strictly-typed test VaultClient instance.
 * Avoids mutating shared singletons and enables dependency injection.
 */
function createTestVaultClient(options: TestClientOptions = {}): VaultClient & {
  setState(state: VaultState): void;
  setFailLock(fail: boolean): void;
} {
  let currentState: VaultState = options.initialState ?? 'uninitialized';
  let failLock = options.shouldFailLock ?? false;
  let failInit = options.shouldFailInit ?? false;

  const mockCredentials: CredentialSummary[] = [
    {
      id: 'cred-1',
      vaultId: 'test-vault',
      kind: 'password',
      title: 'GitHub',
      tags: ['dev'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const client: VaultClient & {
    setState(state: VaultState): void;
    setFailLock(fail: boolean): void;
  } = {
    setState(state: VaultState) {
      currentState = state;
    },
    setFailLock(fail: boolean) {
      failLock = fail;
    },

    async getVaultStatus(): Promise<VaultStatus> {
      if (failInit) {
        throw new Error('Connection refused by local backend service');
      }
      return {
        state: currentState,
        vaultId: 'test-vault',
        credentialCount: mockCredentials.length,
      };
    },

    async unlockVault(passphrase: string): Promise<{ success: boolean; error?: string }> {
      if (!passphrase) {
        return { success: false, error: 'Passphrase is required.' };
      }
      if (passphrase !== 'correct-master-passphrase-2026') {
        return { success: false, error: 'Incorrect master passphrase. Please try again.' };
      }
      currentState = 'unlocked';
      return { success: true };
    },

    async createVault(passphrase: string, confirm: string): Promise<CreateVaultResult> {
      if (!passphrase || passphrase.length < 12) {
        return { success: false, error: 'Passphrase must be at least 12 characters.' };
      }
      if (passphrase !== confirm) {
        return { success: false, error: 'Passphrases do not match.' };
      }
      currentState = 'unlocked';
      return {
        success: true,
        recoveryKey: 'AEGIS-RCV-TEST-KEY-4821',
      };
    },

    async lockVault(): Promise<void> {
      if (failLock) {
        throw new Error('Backend session destruction failed');
      }
      currentState = 'locked';
    },

    async listCredentials(): Promise<CredentialSummary[]> {
      return [...mockCredentials];
    },

    async listPasswords(): Promise<CredentialSummary[]> {
      return [...mockCredentials];
    },

    async listApiKeys(): Promise<CredentialSummary[]> {
      return [];
    },

    async getCredential(id: string): Promise<CredentialDetail> {
      return {
        ...mockCredentials[0],
        secret: 'test-secret',
      };
    },

    async createCredential(input: CreateCredentialInput): Promise<CredentialSummary> {
      return {
        id: 'new-cred',
        vaultId: 'test-vault',
        kind: input.kind,
        title: input.title,
        tags: input.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    async updateCredential(id: string, input: UpdateCredentialInput): Promise<CredentialSummary> {
      return {
        ...mockCredentials[0],
        title: input.title ?? mockCredentials[0].title,
      };
    },

    async deleteCredential(_id: string): Promise<void> {},

    async getActivity(): Promise<ActivityEvent[]> {
      return [];
    },

    isUnlocked(): boolean {
      return currentState === 'unlocked';
    },
  };

  if (options.supportsRecovery !== false) {
    client.recoverVault = async (recoveryKey: string): Promise<RecoverVaultResult> => {
      const cleaned = recoveryKey.trim().toUpperCase();
      if (!cleaned) {
        return { success: false, error: 'Recovery key cannot be empty.' };
      }
      if (!cleaned.startsWith('AEGIS-') || cleaned.length < 16) {
        return { success: false, error: 'Invalid recovery key format.' };
      }
      currentState = 'unlocked';
      return { success: true };
    };
  }

  return client;
}

console.log('--- Starting Aegis Phase 3 Vault Lifecycle & Security Boundary Tests ---');

async function runTests() {
  setActivePinia(createPinia());

  try {
    // -------------------------------------------------------------------------
    // Test 1: Initialization Loading Gate & Race Condition Protection
    // -------------------------------------------------------------------------
    console.log('Test 1: Initialization loading gate prevents premature setup/unlock');
    const delayedClient = createTestVaultClient({ initialState: 'locked' });
    setVaultClient(delayedClient);
    const store = useVaultStore();

    // Before init resolves, status is null, isInitializing is true, and neither isUninitialized nor isLocked is true
    assert.equal(store.isInitializing, true, 'isInitializing must start true');
    assert.equal(store.isUninitialized, false, 'isUninitialized must not be true while initializing');
    assert.equal(store.isLocked, false, 'isLocked must not be true while initializing');
    assert.equal(store.isUnlocked, false, 'isUnlocked must not be true while initializing');

    // Attempting to call setupVault before status resolution must be blocked
    const prematureSetup = await store.setupVault('short', 'short');
    assert.equal(prematureSetup.success, false);
    assert.match(prematureSetup.error ?? '', /not ready/i);

    // Now resolve init
    await store.init();
    assert.equal(store.isInitializing, false, 'isInitializing must become false after init');
    assert.equal(store.isLocked, true, 'isLocked must match actual backend status (locked)');
    assert.equal(store.isUninitialized, false, 'isUninitialized must remain false for initialized vault');

    // -------------------------------------------------------------------------
    // Test 2: Initialization Connection Error Handling
    // -------------------------------------------------------------------------
    console.log('Test 2: Backend connection error handling with retry mechanism');
    const failingInitClient = createTestVaultClient({ shouldFailInit: true });
    setVaultClient(failingInitClient);
    setActivePinia(createPinia());
    const storeInitFail = useVaultStore();

    await storeInitFail.init();
    assert.equal(storeInitFail.isInitializing, false);
    assert.ok(storeInitFail.initError, 'initError must describe connection failure');
    assert.equal(storeInitFail.isUninitialized, false, 'Must NOT default to uninitialized upon error');
    assert.equal(storeInitFail.isLocked, false, 'Must NOT be active locked state upon connection error');
    assert.equal(storeInitFail.isUnlocked, false, 'Must NOT be active unlocked state upon connection error');
    assert.ok(storeInitFail.initError, 'initError must describe connection failure');

    // -------------------------------------------------------------------------
    // Test 3: First-Run Vault Setup Lifecycle
    // -------------------------------------------------------------------------
    console.log('Test 3: First-run setup validation and recovery key presentation');
    const testClient = createTestVaultClient({ initialState: 'uninitialized' });
    setVaultClient(testClient);
    setActivePinia(createPinia());
    const setupStore = useVaultStore();

    await setupStore.init();
    assert.equal(setupStore.isUninitialized, true, 'Status must confirm uninitialized');

    // Passphrase validation (< 12 characters)
    const shortResult = await setupStore.setupVault('short-pass', 'short-pass');
    assert.equal(shortResult.success, false);
    assert.match(shortResult.error ?? '', /at least 12 characters/i);
    assert.equal(setupStore.recoveryKeyPresented, null);

    // Mismatched passphrases
    const mismatchResult = await setupStore.setupVault(
      'master-passphrase-2026!',
      'different-passphrase-2026!',
    );
    assert.equal(mismatchResult.success, false);
    assert.match(mismatchResult.error ?? '', /do not match/i);
    assert.equal(setupStore.recoveryKeyPresented, null);

    // Valid setup
    const validPassphrase = 'master-passphrase-2026!';
    const successResult = await setupStore.setupVault(validPassphrase, validPassphrase);
    assert.equal(successResult.success, true);
    assert.equal(successResult.recoveryKey, 'AEGIS-RCV-TEST-KEY-4821');
    assert.equal(
      setupStore.recoveryKeyPresented,
      'AEGIS-RCV-TEST-KEY-4821',
      'Recovery key must be in reactive store state for explicit confirmation',
    );

    // Complete setup after explicit confirmation
    await setupStore.completeSetup();
    assert.equal(setupStore.isUnlocked, true, 'Vault must be unlocked after setup completion');
    assert.equal(
      setupStore.recoveryKeyPresented,
      null,
      'Presented recovery key must be cleared from store state',
    );

    // -------------------------------------------------------------------------
    // Test 4: Manual Lock Failure Handling (Security Boundary Verification)
    // -------------------------------------------------------------------------
    console.log('Test 4: Lock failure handling and reactive state clearing');
    await setupStore.loadAll();
    assert.ok(setupStore.credentials.length > 0, 'Credentials loaded in unlocked state');

    // Simulate backend failure during lock session termination
    testClient.setFailLock(true);
    const lockSuccess = await setupStore.lock();
    assert.equal(lockSuccess, false, 'Lock must report false when backend session destruction fails');
    assert.ok(setupStore.lockError, 'lockError must be populated');
    assert.notEqual(setupStore.status?.state, 'locked', 'Status must not falsely declare locked');
    // Crucial: frontend state must still be purged immediately
    assert.equal(setupStore.credentials.length, 0, 'Frontend credentials must be purged immediately');

    // Now resolve backend lock failure with retryLock()
    testClient.setFailLock(false);
    const retrySuccess = await setupStore.retryLock();
    assert.equal(retrySuccess, true, 'retryLock must succeed when backend resolves');
    assert.equal(setupStore.lockError, null, 'lockError must be cleared');
    assert.equal(setupStore.status?.state, 'locked', 'Status is confirmed locked by backend');

    // -------------------------------------------------------------------------
    // Test 5: Passphrase Unlock Experience
    // -------------------------------------------------------------------------
    console.log('Test 5: Passphrase unlock verification');
    const badUnlock = await setupStore.unlock('wrong-passphrase');
    assert.equal(badUnlock, false);
    assert.equal(setupStore.status?.state, 'locked');
    assert.ok(setupStore.error);

    const goodUnlock = await setupStore.unlock('correct-master-passphrase-2026');
    assert.equal(goodUnlock, true);
    assert.equal(setupStore.status?.state, 'unlocked');
    assert.equal(setupStore.error, null);

    // -------------------------------------------------------------------------
    // Test 6: Recovery Flow & Unsupported Backend Handling
    // -------------------------------------------------------------------------
    console.log('Test 6: Recovery key flow and unsupported backend boundary');
    await setupStore.lock();

    // Invalid format
    const badKey = await setupStore.recover('INVALID-FORMAT');
    assert.equal(badKey, false);
    assert.equal(setupStore.status?.state, 'locked');

    // Valid recovery key
    const goodKey = await setupStore.recover('AEGIS-RCV-TEST-KEY-4821');
    assert.equal(goodKey, true);
    assert.equal(setupStore.status?.state, 'unlocked');

    // Unsupported backend recovery test
    const noRecoveryClient = createTestVaultClient({
      initialState: 'locked',
      supportsRecovery: false,
    });
    setVaultClient(noRecoveryClient);
    setActivePinia(createPinia());
    const unsupportedStore = useVaultStore();
    await unsupportedStore.init();

    const unsupportedResult = await unsupportedStore.recover('AEGIS-RCV-TEST-KEY-4821');
    assert.equal(unsupportedResult, false);
    assert.match(
      unsupportedStore.error ?? '',
      /not supported/i,
      'Must explain that emergency recovery is not supported by the active backend',
    );

    console.log('All 6 Aegis Phase 3 Lifecycle & Security Boundary tests passed cleanly!');
  } finally {
    // Restore default client
    setVaultClient(defaultVaultClient);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
