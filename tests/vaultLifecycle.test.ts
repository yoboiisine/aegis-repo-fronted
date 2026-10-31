import assert from 'node:assert/strict';
import { setActivePinia, createPinia } from 'pinia';
import { useVaultStore } from '../src/stores/vaultStore';
import { mockVaultClient, setMockVaultState } from '../src/services/mock/mockVaultClient';
import type { VaultClient } from '../src/services/api/contracts';

console.log('--- Starting Aegis Phase 3 Vault Lifecycle Tests ---');

async function runTests() {
  // Setup Pinia
  setActivePinia(createPinia());
  const store = useVaultStore();

  // Test 1: Distinguish uninitialized from locked
  console.log('Test 1: Distinguish uninitialized vault status');
  setMockVaultState('uninitialized');
  await store.init();
  assert.equal(store.status.state, 'uninitialized', 'Vault state should be uninitialized');
  assert.equal(store.isUninitialized, true, 'isUninitialized should be true');
  assert.equal(store.isUnlocked, false, 'isUnlocked should be false');
  assert.equal(store.isLocked, false, 'isLocked should be false');

  // Test 2: First-run setup validation (< 12 chars)
  console.log('Test 2: Validation on short passphrase (< 12 chars)');
  const shortResult = await store.setupVault('short-pass', 'short-pass');
  assert.equal(shortResult.success, false, 'Short passphrase must fail');
  assert.match(shortResult.error ?? '', /at least 12 characters/i, 'Error message should mention minimum length');
  assert.equal(store.recoveryKeyPresented, null, 'No recovery key presented on failure');

  // Test 3: First-run setup validation (mismatch)
  console.log('Test 3: Validation on mismatched passphrases');
  const mismatchResult = await store.setupVault('correct-long-passphrase-123', 'different-passphrase-123');
  assert.equal(mismatchResult.success, false, 'Mismatched passphrases must fail');
  assert.match(mismatchResult.error ?? '', /do not match/i, 'Error message should mention mismatch');
  assert.equal(store.recoveryKeyPresented, null, 'No recovery key presented on failure');

  // Test 4: First-run setup success & recovery key presentation
  console.log('Test 4: First-run setup success with backend recovery key presentation');
  const validPass = 'master-secure-passphrase-2026!';
  const successResult = await store.setupVault(validPass, validPass);
  assert.equal(successResult.success, true, 'Valid setup must succeed');
  assert.ok(successResult.recoveryKey, 'Backend must supply recovery key');
  assert.equal(store.recoveryKeyPresented, successResult.recoveryKey, 'Store must present recovery key in memory');

  // Test 5: Explicit confirmation completes setup
  console.log('Test 5: Recovery key confirmation and setup completion');
  await store.completeSetup();
  assert.equal(store.status.state, 'unlocked', 'Vault state must be unlocked after setup completion');
  assert.equal(store.isUnlocked, true, 'isUnlocked must be true');
  assert.equal(store.recoveryKeyPresented, null, 'Presented recovery key must be cleared from memory');

  // Load credentials
  await store.loadAll();
  assert.ok(store.credentials.length > 0, 'Credentials should be loaded when unlocked');

  // Test 6: Manual Lock & immediate sensitive state wipe
  console.log('Test 6: Manual lock and immediate synchronous memory wipe');
  await store.lock();
  assert.equal(store.status.state, 'locked', 'Vault must be locked');
  assert.equal(store.isUnlocked, false, 'isUnlocked must be false');
  assert.equal(store.isLocked, true, 'isLocked must be true');
  assert.equal(store.credentials.length, 0, 'Credentials must be wiped on lock');
  assert.equal(store.passwords.length, 0, 'Passwords must be wiped on lock');
  assert.equal(store.apiKeys.length, 0, 'API keys must be wiped on lock');
  assert.equal(store.selectedCredential, null, 'Selected credential must be null');
  assert.equal(store.recoveryKeyPresented, null, 'Recovery key must be null');

  // Test 7: Unlock validation (invalid passphrase)
  console.log('Test 7: Unlock with incorrect/invalid passphrase');
  const badUnlock = await store.unlock('wrong');
  assert.equal(badUnlock, false, 'Invalid unlock must fail');
  assert.equal(store.status.state, 'locked', 'Vault must remain locked');
  assert.ok(store.error, 'Error message must be present');

  // Test 8: Unlock success
  console.log('Test 8: Unlock with valid passphrase');
  const goodUnlock = await store.unlock('valid-master-passphrase');
  assert.equal(goodUnlock, true, 'Valid unlock must succeed');
  assert.equal(store.status.state, 'unlocked', 'Vault state must be unlocked');
  assert.equal(store.error, null, 'Error must be cleared on success');

  // Lock again for recovery testing
  await store.lock();
  assert.equal(store.status.state, 'locked', 'Vault locked for recovery test');

  // Test 9: Recovery validation (empty key)
  console.log('Test 9: Recovery with empty key');
  const emptyRecov = await store.recover('');
  assert.equal(emptyRecov, false, 'Empty recovery key must fail');
  assert.equal(store.status.state, 'locked', 'Vault must remain locked');

  // Test 10: Recovery validation (invalid format)
  console.log('Test 10: Recovery with invalid format key');
  const invalidRecov = await store.recover('INVALID-KEY');
  assert.equal(invalidRecov, false, 'Malformed recovery key must fail');
  assert.equal(store.status.state, 'locked', 'Vault must remain locked');

  // Test 11: Recovery success
  console.log('Test 11: Recovery with valid key');
  const validRecov = await store.recover('AEGIS-RCV-9B4F-28A1-7CE0-D532');
  assert.equal(validRecov, true, 'Valid recovery key must succeed');
  assert.equal(store.status.state, 'unlocked', 'Vault must be unlocked after recovery');

  // Test 12: Recovery on backend client without recovery support
  console.log('Test 12: Recovery handling when backend client does not support recovery');
  const customClient: VaultClient = {
    ...mockVaultClient,
    recoverVault: undefined,
  };
  // Temporarily test undefined recoverVault
  const savedRecoverVault = mockVaultClient.recoverVault;
  delete (mockVaultClient as any).recoverVault;
  await store.lock();
  const unsupportedRecov = await store.recover('AEGIS-RCV-9B4F-28A1-7CE0-D532');
  assert.equal(unsupportedRecov, false, 'Must fail when unsupported');
  assert.match(store.error ?? '', /not supported/i, 'Error message must state unsupported backend recovery');
  // Restore
  mockVaultClient.recoverVault = savedRecoverVault;

  console.log('All 12 Vault Lifecycle & Authentication tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
