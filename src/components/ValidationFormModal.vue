<template>
  <div v-if="open" class="modal-scrim" @click.self="$emit('close')">
    <div class="modal-card wide">
      <h2 style="margin:0 0 4px;font:700 20px var(--font)">{{ title }}</h2>
      <p class="lede">Free time, percentage off, or a fixed credit. Usage still feeds audit history.</p>
      <form class="form-grid" @submit.prevent="submit">
        <label class="field span-2">
          <span class="field-k">Organisation</span>
          <select class="admin-select" v-model="form.orgId" required>
            <option value="" disabled>Select organisation</option>
            <option v-for="o in organisations" :key="o.id" :value="o.id">
              {{ o.suite ? `${o.name} · ${o.suite}` : o.name }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="field-k">Type</span>
          <select class="admin-select" v-model="form.type">
            <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field-k">{{ valueLabel }}</span>
          <input
            class="input-text input-plain"
            type="number"
            :min="form.type === 'Percentage' ? 1 : 0.01"
            :max="form.type === 'Percentage' ? 100 : undefined"
            :step="form.type === 'Fixed value' ? '0.01' : '1'"
            v-model.number="form.value"
            required
          />
        </label>
        <label class="field">
          <span class="field-k">Facility</span>
          <select class="admin-select" v-model="form.facility">
            <option v-for="f in facilities" :key="f" :value="f">{{ f }}</option>
          </select>
        </label>
        <label class="field">
          <span class="field-k">Usage cap</span>
          <select class="admin-select" v-model="form.capMode">
            <option value="unlimited">Unlimited</option>
            <option value="monthly">Per month</option>
          </select>
        </label>
        <label v-if="form.capMode === 'monthly'" class="field span-2">
          <span class="field-k">Monthly uses</span>
          <input class="input-text input-plain" type="number" min="1" step="1" v-model.number="form.capLimit" required />
        </label>
        <p v-if="preview" class="lede span-2" style="margin:0">Rule: {{ preview }}</p>
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
import { computed, reactive, ref, watch } from 'vue'
import { VALIDATION_TYPES, validationDetail } from '@/data/mock'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: 'Validation' },
  submitLabel: { type: String, default: 'Save' },
  initial: { type: Object, default: null },
  organisations: { type: Array, default: () => [] },
  facilities: { type: Array, default: () => ['All SkyPark'] },
})
const emit = defineEmits(['close', 'save'])
const types = VALIDATION_TYPES
const error = ref('')
const form = reactive(blank())

function blank() {
  return {
    orgId: '',
    type: 'Free time',
    value: 2,
    facility: 'All SkyPark',
    capMode: 'unlimited',
    capLimit: 50,
  }
}

const valueLabel = computed(() => {
  if (form.type === 'Percentage') return 'Percent off'
  if (form.type === 'Fixed value') return 'Credit amount ($)'
  return 'Hours free'
})

const preview = computed(() => validationDetail(form.type, form.value))

watch(
  () => [props.open, props.initial],
  () => {
    error.value = ''
    const next = blank()
    if (props.initial) {
      Object.assign(next, {
        orgId: props.initial.orgId || '',
        type: props.initial.type || 'Free time',
        value: props.initial.value,
        facility: props.initial.facility || 'All SkyPark',
        capMode: props.initial.capLimit ? 'monthly' : 'unlimited',
        capLimit: props.initial.capLimit || 50,
      })
    }
    Object.assign(form, next)
  },
)

function submit() {
  if (!form.orgId) {
    error.value = 'Organisation is required.'
    return
  }
  const value = Number(form.value)
  if (!Number.isFinite(value) || value <= 0) {
    error.value = 'Enter a value greater than zero.'
    return
  }
  if (form.type === 'Percentage' && value > 100) {
    error.value = 'Percentage off cannot be more than 100.'
    return
  }
  const capLimit = form.capMode === 'monthly' ? Number(form.capLimit) : null
  if (form.capMode === 'monthly' && (!Number.isFinite(capLimit) || capLimit < 1)) {
    error.value = 'Monthly cap must be at least 1.'
    return
  }
  emit('save', {
    orgId: form.orgId,
    type: form.type,
    value,
    facility: form.facility,
    capLimit,
  })
}
</script>
