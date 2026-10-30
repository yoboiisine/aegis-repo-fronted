<script setup lang="ts">
import { ref } from 'vue';
import { Motion } from 'motion-v';
import { Shield, AlertTriangle, Loader2 } from 'lucide-vue-next';
import { useVaultStore } from '@/stores/vaultStore';
import AppButton from '@/components/ui/AppButton.vue';

const store = useVaultStore();
const passphrase = ref('');
const showRecovery = ref(false);

async function handleUnlock() {
  const success = await store.unlock(passphrase.value);
  if (success) passphrase.value = '';
}
</script>

<template>
  <div class="h-full flex items-center justify-center" :style="{ background: 'var(--surface-base)' }">
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full" :style="{ background: 'var(--accent-muted)', filter: 'blur(100px)' }" />
    </div>

    <Motion
      :initial="{ opacity: 0, y: 12 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }"
      class="relative w-full max-w-sm px-6"
    >
      <!-- Inner layout wrapper: motion-v renders its own root and forwards
           `class` to it, so spacing/gap must live on a child we control,
           not on the Motion element itself. -->
      <div class="flex flex-col items-stretch">
      <!-- Brand -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
          :style="{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }"
        >
          <Shield :size="22" :style="{ color: 'var(--accent-primary)' }" />
        </div>
        <h1 class="text-[22px] font-semibold tracking-tight" :style="{ color: 'var(--text-primary)' }">Aegis</h1>
        <p class="text-[12px] mt-1" :style="{ color: 'var(--text-tertiary)' }">Secure Credential Vault</p>
      </div>

      <!-- Unlock Card -->
      <div
        v-if="!showRecovery"
        class="rounded-lg border p-6"
        :style="{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }"
      >
        <h2 class="text-[15px] font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Unlock Vault</h2>
        <p class="text-[12px] mb-5" :style="{ color: 'var(--text-tertiary)' }">Enter your master passphrase</p>

        <form @submit.prevent="handleUnlock" class="space-y-4">
          <div>
            <input
              v-model="passphrase"
              type="password"
              placeholder="Master passphrase"
              autocomplete="off"
              class="w-full px-3 py-2.5 text-[13px] rounded-md border transition-colors"
              :style="{
                background: 'var(--surface-secondary)',
                borderColor: store.error ? 'var(--danger)' : 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }"
              @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'"
              @blur="($event.target as HTMLInputElement).style.borderColor = store.error ? 'var(--danger)' : 'var(--border-subtle)'"
              autofocus
            />
            <p v-if="store.error" class="text-[11px] mt-1.5 flex items-center gap-1" :style="{ color: 'var(--danger)' }">
              <AlertTriangle :size="10" />
              {{ store.error }}
            </p>
          </div>

          <AppButton
            variant="primary"
            :loading="store.isUnlocking"
            :disabled="!passphrase"
            class="w-full"
            @click="handleUnlock"
          >
            {{ store.isUnlocking ? 'Deriving key...' : 'Unlock' }}
          </AppButton>
        </form>

        <button
          class="w-full mt-4 text-[11px] transition-colors"
          :style="{ color: 'var(--text-disabled)' }"
          @mouseenter="($event.target as HTMLElement).style.color = 'var(--text-tertiary)'"
          @mouseleave="($event.target as HTMLElement).style.color = 'var(--text-disabled)'"
          @click="showRecovery = true"
        >
          Use recovery key
        </button>
      </div>

      <!-- Recovery Card -->
      <div
        v-else
        class="rounded-lg border p-6"
        :style="{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }"
      >
        <h2 class="text-[15px] font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Recovery Mode</h2>
        <p class="text-[12px] mb-4" :style="{ color: 'var(--text-tertiary)' }">
          Emergency recovery when you've forgotten your passphrase
        </p>
        <div class="p-3 rounded-md border mb-4" :style="{ background: 'var(--warning-muted)', borderColor: 'var(--warning)' + '30' }">
          <p class="text-[11px]" :style="{ color: 'var(--text-secondary)' }">
            Recovery requires backend support. This is a prototype presentation.
          </p>
        </div>
        <input
          type="text"
          placeholder="Recovery key"
          disabled
          class="w-full px-3 py-2.5 text-[13px] font-mono rounded-md border cursor-not-allowed opacity-50"
          :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }"
        />
        <button
          disabled
          class="w-full mt-3 py-2.5 text-[12px] font-medium rounded-md cursor-not-allowed opacity-50"
          :style="{ background: 'var(--surface-secondary)', color: 'var(--text-disabled)' }"
        >
          Recovery unavailable
        </button>
        <button
          class="w-full mt-3 text-[11px] transition-colors"
          :style="{ color: 'var(--text-disabled)' }"
          @click="showRecovery = false"
        >
          ← Back to passphrase
        </button>
      </div>

      <p class="text-center text-[10px] mt-6" :style="{ color: 'var(--text-disabled)' }">
        Prototype mode — in-memory mock adapter
      </p>
      </div>
    </Motion>
  </div>
</template>
