<script setup lang="ts">
import { ref, watch } from 'vue';
import type { CredentialDetail, CredentialKind, CreateCredentialInput } from '@/types';
import { CREDENTIAL_KINDS, CATEGORIES } from '@/services/api/contracts';
import AppButton from '@/components/ui/AppButton.vue';

interface Props {
  initial?: CredentialDetail;
  defaultKind?: CredentialKind;
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const emit = defineEmits<{
  submit: [data: CreateCredentialInput];
  cancel: [];
}>();

const kind = ref<CredentialKind>(props.initial?.kind ?? props.defaultKind ?? 'password');
const title = ref(props.initial?.title ?? '');
const username = ref(props.initial?.username ?? '');
const secret = ref('');
const url = ref(props.initial?.url ?? '');
const category = ref(props.initial?.category ?? '');
const tagsStr = ref(props.initial?.tags?.join(', ') ?? '');
const notes = ref(props.initial?.notes ?? '');
const errors = ref<Record<string, string>>({});

function validate(): boolean {
  const errs: Record<string, string> = {};
  if (!title.value.trim()) errs.title = 'Title is required';
  if (!secret.value.trim() && !props.isEdit) errs.secret = 'Secret is required';
  if (title.value.length > 128) errs.title = 'Title must be 128 characters or less';
  errors.value = errs;
  return Object.keys(errs).length === 0;
}

function handleSubmit() {
  if (!validate()) return;
  const tags = tagsStr.value.split(',').map(t => t.trim()).filter(Boolean);
  emit('submit', {
    kind: kind.value,
    title: title.value.trim(),
    username: username.value.trim() || undefined,
    secret: secret.value.trim() || (props.initial?.secret ?? ''),
    url: url.value.trim() || undefined,
    category: category.value.trim() || undefined,
    tags: tags.length > 0 ? tags : undefined,
    notes: notes.value.trim() || undefined,
  });
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Kind selector (only for create) -->
    <div v-if="!isEdit">
      <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">Type</label>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="k in CREDENTIAL_KINDS"
          :key="k.value"
          type="button"
          @click="kind = k.value"
          class="px-2.5 py-2 text-[11px] font-medium rounded-md border transition-colors"
          :style="{
            background: kind === k.value ? 'var(--accent-muted)' : 'var(--surface-secondary)',
            borderColor: kind === k.value ? 'var(--accent-border)' : 'var(--border-subtle)',
            color: kind === k.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
          }"
        >
          {{ k.label }}
        </button>
      </div>
    </div>

    <!-- Title -->
    <div>
      <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">Title *</label>
      <input
        v-model="title"
        type="text"
        placeholder="e.g., GitHub Enterprise"
        class="w-full px-3 py-2 text-[13px] rounded-md border transition-colors"
        :style="{
          background: 'var(--surface-secondary)',
          borderColor: errors.title ? 'var(--danger)' : 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }"
        @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'"
        @blur="($event.target as HTMLInputElement).style.borderColor = errors.title ? 'var(--danger)' : 'var(--border-subtle)'"
        autofocus
      />
      <p v-if="errors.title" class="text-[10px] mt-1" style="color: var(--danger)">{{ errors.title }}</p>
    </div>

    <!-- Username -->
    <div>
      <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">
        {{ kind === 'password' ? 'Username' : 'Identifier' }}
      </label>
      <input
        v-model="username"
        type="text"
        :placeholder="kind === 'password' ? 'user@example.com' : 'Optional'"
        class="w-full px-3 py-2 text-[13px] rounded-md border transition-colors"
        :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }"
        @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'"
        @blur="($event.target as HTMLInputElement).style.borderColor = 'var(--border-subtle)'"
      />
    </div>

    <!-- Secret -->
    <div>
      <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">
        {{ kind === 'password' ? 'Password' : 'Secret' }} *
      </label>
      <textarea
        v-model="secret"
        :placeholder="isEdit ? '(leave empty to keep current)' : 'Enter secret'"
        rows="2"
        class="w-full px-3 py-2 text-[13px] font-mono rounded-md border transition-colors resize-none"
        :style="{
          background: 'var(--surface-secondary)',
          borderColor: errors.secret ? 'var(--danger)' : 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }"
        @focus="($event.target as HTMLTextAreaElement).style.borderColor = 'var(--border-focus)'"
        @blur="($event.target as HTMLTextAreaElement).style.borderColor = errors.secret ? 'var(--danger)' : 'var(--border-subtle)'"
      />
      <p v-if="errors.secret" class="text-[10px] mt-1" style="color: var(--danger)">{{ errors.secret }}</p>
    </div>

    <!-- URL -->
    <div>
      <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">URL</label>
      <input
        v-model="url"
        type="url"
        placeholder="https://..."
        class="w-full px-3 py-2 text-[13px] rounded-md border transition-colors"
        :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }"
        @focus="($event.target as HTMLInputElement).style.borderColor = 'var(--border-focus)'"
        @blur="($event.target as HTMLInputElement).style.borderColor = 'var(--border-subtle)'"
      />
    </div>

    <!-- Category + Tags -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">Category</label>
        <select
          v-model="category"
          class="w-full px-2.5 py-2 text-[12px] rounded-md border"
          :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }"
        >
          <option value="">None</option>
          <option v-for="c in CATEGORIES.filter(c => c !== 'All')" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">Tags</label>
        <input
          v-model="tagsStr"
          type="text"
          placeholder="tag1, tag2"
          class="w-full px-3 py-2 text-[12px] rounded-md border"
          :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }"
        />
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="text-[10px] font-medium tracking-wider uppercase mb-1.5 block" style="color: var(--text-tertiary)">Notes</label>
      <textarea
        v-model="notes"
        placeholder="Additional context..."
        rows="2"
        class="w-full px-3 py-2 text-[12px] rounded-md border resize-none"
        :style="{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }"
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 pt-2">
      <AppButton variant="secondary" @click="emit('cancel')">Cancel</AppButton>
      <AppButton variant="primary" type="submit">{{ isEdit ? 'Update' : 'Create' }}</AppButton>
    </div>
  </form>
</template>
