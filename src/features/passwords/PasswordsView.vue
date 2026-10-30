<script setup lang="ts">
import CredentialList from '@/components/vault/CredentialList.vue';
import { useVaultStore } from '@/stores/vaultStore';

const store = useVaultStore();
</script>

<template>
  <CredentialList
    title="Passwords"
    subtitle="Secure password storage"
    :items="store.passwords"
    default-kind="password"
  />
</template>
