<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Organisations</h1>
        <p class="lede" style="margin-top:6px">Tenants, merchants and staff groups. Create an organisation, then manage its users and parking activity.</p>
      </div>
      <button class="btn-sm primary" type="button" @click="openCreate">New organisation</button>
    </div>

    <div class="filters">
      <input class="search" v-model="q" placeholder="Name, contact, email, suite" />
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Organisation</th>
            <th>Point of contact</th>
            <th>Email</th>
            <th>Address</th>
            <th>Users</th>
            <th>On site</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td colspan="7" style="color:var(--muted)">No organisations match that search.</td>
          </tr>
          <tr
            v-for="o in rows"
            :key="o.id"
            style="cursor:pointer"
            @click="$router.push('/admin/organisations/' + o.id)"
          >
            <td>
              <div style="font:600 14px var(--font)">{{ o.name }}</div>
              <div style="color:var(--muted);font-size:12.5px">{{ o.type }} · {{ o.suite || '-' }} · {{ o.status }}</div>
            </td>
            <td>
              <div>{{ o.contactName || '-' }}</div>
              <div style="color:var(--muted);font-size:12.5px">{{ o.contactPhone || '' }}</div>
            </td>
            <td>{{ o.contactEmail || '-' }}</td>
            <td>{{ o.address || '-' }}</td>
            <td>{{ stats(o.id).users }}</td>
            <td>{{ stats(o.id).onSite }}</td>
            <td class="col-actions">
              <div class="table-actions">
                <MoreActions @edit="openEdit(o)" @delete="askDelete(o)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <OrgFormModal
      :open="formOpen"
      :title="editing ? 'Edit organisation' : 'New organisation'"
      :submit-label="editing ? 'Save changes' : 'Create organisation'"
      :initial="editing"
      @close="formOpen = false"
      @save="saveOrg"
    />

    <div v-if="pendingDelete" class="modal-scrim" @click.self="pendingDelete = null">
      <div class="modal-card">
        <h2 style="margin:0 0 8px;font:700 20px var(--font)">Delete {{ pendingDelete.name }}?</h2>
        <p class="lede">This removes the organisation and its users. Activity history is kept.</p>
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
import { useRouter } from 'vue-router'
import MoreActions from '@/components/MoreActions.vue'
import OrgFormModal from '@/components/OrgFormModal.vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const router = useRouter()
const q = ref('')
const formOpen = ref(false)
const editing = ref(null)
const pendingDelete = ref(null)

function stats(id) {
  return admin.orgStats(id)
}

const rows = computed(() => {
  const needle = q.value.toLowerCase().trim()
  return admin.organisations.filter((o) => {
    if (!needle) return true
    return `${o.name} ${o.type} ${o.suite} ${o.contactName} ${o.contactEmail} ${o.contactPhone} ${o.address}`
      .toLowerCase()
      .includes(needle)
  })
})

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(org) {
  editing.value = { ...org }
  formOpen.value = true
}

function saveOrg(payload) {
  if (editing.value?.id) {
    admin.updateOrganisation(editing.value.id, payload)
  } else {
    const created = admin.createOrganisation(payload)
    formOpen.value = false
    if (created) router.push('/admin/organisations/' + created.id)
    return
  }
  formOpen.value = false
}

function askDelete(org) {
  pendingDelete.value = org
}

function confirmDelete() {
  if (pendingDelete.value) admin.deleteOrganisation(pendingDelete.value.id)
  pendingDelete.value = null
}
</script>
