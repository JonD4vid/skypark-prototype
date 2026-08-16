<template>
  <div v-if="open" class="modal-scrim" @click.self="$emit('close')">
    <div class="modal-card wide">
      <h2 style="margin:0 0 4px;font:700 20px var(--font)">{{ title }}</h2>
      <p class="lede">Name, point of contact, and address are stored on the organisation record.</p>
      <form class="form-grid" @submit.prevent="submit">
        <label class="field">
          <span class="field-k">Name</span>
          <input class="input-text input-plain" v-model="form.name" required />
        </label>
        <label class="field">
          <span class="field-k">Type</span>
          <select class="admin-select" v-model="form.type">
            <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field-k">Suite / location</span>
          <input class="input-text input-plain" v-model="form.suite" />
        </label>
        <label class="field">
          <span class="field-k">Status</span>
          <select class="admin-select" v-model="form.status">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <label class="field">
          <span class="field-k">Point of contact</span>
          <input class="input-text input-plain" v-model="form.contactName" />
        </label>
        <label class="field">
          <span class="field-k">Email</span>
          <input class="input-text input-plain" type="email" v-model="form.contactEmail" />
        </label>
        <label class="field">
          <span class="field-k">Phone</span>
          <input class="input-text input-plain" v-model="form.contactPhone" />
        </label>
        <label class="field span-2">
          <span class="field-k">Address</span>
          <input class="input-text input-plain" v-model="form.address" />
        </label>
        <p v-if="error" class="form-error span-2">{{ error }}</p>
        <div class="toolbar span-2" style="margin-top:4px">
          <button class="btn-sm primary" type="submit">{{ submitLabel }}</button>
          <button class="btn-sm" type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ORG_TYPES } from '@/data/mock'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: 'Organisation' },
  submitLabel: { type: String, default: 'Save' },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save'])
const types = ORG_TYPES
const error = ref('')
const form = reactive(blank())

function blank() {
  return {
    name: '',
    type: 'Tenant',
    suite: '',
    status: 'Active',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  }
}

watch(
  () => [props.open, props.initial],
  () => {
    error.value = ''
    Object.assign(form, blank(), props.initial || {})
  },
)

function submit() {
  if (!form.name.trim()) {
    error.value = 'Name is required.'
    return
  }
  emit('save', { ...form })
}
</script>
