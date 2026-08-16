<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Validations</h1>
        <p class="lede" style="margin-top:6px">Three types: free time, percentage off, and fixed value. Usage feeds audit history.</p>
      </div>
      <button class="btn-sm primary" type="button" @click="openCreate">New validation</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Organisation</th>
            <th>Type</th>
            <th>Rule</th>
            <th>Facility</th>
            <th>Uses</th>
            <th>Cap</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!admin.validationRules.length">
            <td colspan="7" style="color:var(--muted)">No validations yet.</td>
          </tr>
          <tr v-for="v in admin.validationRules" :key="v.id">
            <td>{{ admin.orgLabel(v.orgId) }}</td>
            <td>{{ v.type }}</td>
            <td class="mono">{{ detail(v) }}</td>
            <td>{{ v.facility }}</td>
            <td>{{ v.uses }}</td>
            <td>{{ cap(v) }}</td>
            <td class="col-actions">
              <div class="table-actions">
                <MoreActions
                  edit-label="Edit validation"
                  delete-label="Delete"
                  @edit="openEdit(v)"
                  @delete="askDelete(v)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ValidationFormModal
      :open="formOpen"
      :title="editing ? 'Edit validation' : 'New validation'"
      :submit-label="editing ? 'Save changes' : 'Create validation'"
      :initial="editing"
      :organisations="admin.organisations"
      :facilities="facilityOptions"
      @close="formOpen = false"
      @save="saveRule"
    />

    <div v-if="pendingDelete" class="modal-scrim" @click.self="pendingDelete = null">
      <div class="modal-card">
        <h2 style="margin:0 0 8px;font:700 20px var(--font)">Delete this validation?</h2>
        <p class="lede">{{ admin.orgLabel(pendingDelete.orgId) }} · {{ detail(pendingDelete) }}. Past usage stays in audit history.</p>
        <div class="toolbar" style="margin-top:14px">
          <button class="btn-sm danger" type="button" @click="confirmDelete">Delete</button>
          <button class="btn-sm" type="button" @click="pendingDelete = null">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import MoreActions from '@/components/MoreActions.vue'
import ValidationFormModal from '@/components/ValidationFormModal.vue'
import { validationCap, validationDetail } from '@/data/mock'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const formOpen = ref(false)
const editing = ref(null)
const pendingDelete = ref(null)

const facilityOptions = computed(() => [
  'All SkyPark',
  ...admin.facilities.map((f) => f.name.replace(/^SkyPark · /, '')),
])

function detail(rule) {
  return validationDetail(rule.type, rule.value)
}

function cap(rule) {
  return validationCap(rule.capLimit)
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(rule) {
  editing.value = { ...rule }
  formOpen.value = true
}

function saveRule(payload) {
  if (editing.value?.id) admin.updateValidation(editing.value.id, payload)
  else admin.createValidation(payload)
  formOpen.value = false
}

function askDelete(rule) {
  pendingDelete.value = rule
}

function confirmDelete() {
  if (pendingDelete.value) admin.deleteValidation(pendingDelete.value.id)
  pendingDelete.value = null
}
</script>
