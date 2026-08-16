<template>
  <div v-if="org">
    <button class="back-btn" type="button" @click="$router.push('/admin/organisations')">‹ Organisations</button>
    <div class="admin-top" style="margin-top:8px">
      <div>
        <h1>{{ org.name }}</h1>
        <p class="lede" style="margin-top:6px">{{ org.type }} · {{ org.suite || 'No suite' }} · {{ org.status }}</p>
      </div>
      <MoreActions
        style="align-self:center"
        edit-label="Edit organisation"
        delete-label="Delete"
        @edit="orgFormOpen = true"
        @delete="pendingOrgDelete = true"
      />
    </div>

    <div class="detail-grid">
      <div>
        <div class="meta-k">Name</div>
        <div class="meta-v">{{ org.name }}</div>
      </div>
      <div>
        <div class="meta-k">Point of contact</div>
        <div class="meta-v">{{ org.contactName || '-' }}</div>
      </div>
      <div>
        <div class="meta-k">Email</div>
        <div class="meta-v">{{ org.contactEmail || '-' }}</div>
      </div>
      <div>
        <div class="meta-k">Phone</div>
        <div class="meta-v">{{ org.contactPhone || '-' }}</div>
      </div>
      <div style="grid-column:1 / -1">
        <div class="meta-k">Address</div>
        <div class="meta-v">{{ org.address || '-' }}</div>
      </div>
    </div>

    <div class="metrics" style="margin-top:16px">
      <div class="metric">
        <div class="meta-k">Users</div>
        <div class="amount-fig" style="font-size:24px">{{ stats.users }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">Vehicles</div>
        <div class="amount-fig" style="font-size:24px">{{ stats.vehicles }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">Validation codes</div>
        <div class="amount-fig" style="font-size:24px">{{ stats.codes }}</div>
      </div>
      <div class="metric">
        <div class="meta-k">On site now</div>
        <div class="amount-fig" style="font-size:24px">{{ stats.onSite }}</div>
      </div>
    </div>

    <div class="admin-top" style="margin-bottom:10px">
      <h2 style="font:700 18px var(--font);margin:0">Users</h2>
      <button class="btn-sm primary" type="button" @click="openCreateUser">Add user</button>
    </div>
    <p class="lede" style="margin:0 0 12px">Each user has a unique validation code. Select a row to see when they were validated, entered, and exited.</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Plate</th>
            <th>Validation code</th>
            <th>Validated</th>
            <th>Entered</th>
            <th>Exited</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users.length">
            <td colspan="8" style="color:var(--muted)">No users yet.</td>
          </tr>
          <tr
            v-for="u in users"
            :key="u.id"
            :class="{ 'is-selected': selectedUserId === u.id }"
            style="cursor:pointer"
            @click="selectedUserId = selectedUserId === u.id ? null : u.id"
          >
            <td>
              <div style="font:600 14px var(--font)">{{ u.name }}</div>
              <div style="color:var(--muted);font-size:12.5px">{{ u.email || u.phone || '-' }}</div>
            </td>
            <td>{{ u.role || '-' }}</td>
            <td class="mono">{{ u.plate || '-' }}</td>
            <td class="mono">{{ u.code }}</td>
            <td style="white-space:nowrap">{{ formatShort(u.lastValidated) }}</td>
            <td style="white-space:nowrap">
              {{ formatShort(u.lastEntry) }}
              <span v-if="onSite(u)" class="pill pill-ok" style="margin-left:6px">On site</span>
            </td>
            <td style="white-space:nowrap">{{ formatShort(u.lastExit) }}</td>
            <td class="col-actions">
              <div class="table-actions">
                <MoreActions
                  delete-label="Remove"
                  @edit="openEditUser(u)"
                  @delete="pendingUser = u"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="admin-top" style="margin:22px 0 10px">
      <h2 style="font:700 18px var(--font);margin:0">{{ selectedUser ? selectedUser.name + ' · activity' : 'Organisation activity' }}</h2>
      <button v-if="selectedUser" class="btn-sm" type="button" @click="selectedUserId = null">All users</button>
    </div>
    <div class="filters">
      <button class="pill-btn" :class="{ on: activityFilter === 'all' }" type="button" @click="activityFilter = 'all'">All</button>
      <button class="pill-btn" :class="{ on: activityFilter === 'validation' }" type="button" @click="activityFilter = 'validation'">Validated</button>
      <button class="pill-btn" :class="{ on: activityFilter === 'entry' }" type="button" @click="activityFilter = 'entry'">Entries</button>
      <button class="pill-btn" :class="{ on: activityFilter === 'exit' }" type="button" @click="activityFilter = 'exit'">Exits</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date / time</th>
            <th>User</th>
            <th>Action</th>
            <th>Result</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!logs.length">
            <td colspan="5" style="color:var(--muted)">No activity for this filter.</td>
          </tr>
          <tr v-for="e in logs" :key="e.id">
            <td style="white-space:nowrap;color:var(--muted)">{{ formatDateTime(e.at) }}</td>
            <td>{{ e.actor }}</td>
            <td>{{ e.action }}</td>
            <td :class="e.outcome === 'fail' ? 'log-fail' : 'log-ok'">{{ e.outcome }}</td>
            <td>{{ e.detail }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <OrgFormModal
      :open="orgFormOpen"
      title="Edit organisation"
      submit-label="Save changes"
      :initial="org"
      @close="orgFormOpen = false"
      @save="saveOrg"
    />

    <div v-if="userFormOpen" class="modal-scrim" @click.self="userFormOpen = false">
      <div class="modal-card wide">
        <h2 style="margin:0 0 4px;font:700 20px var(--font)">{{ editingUser ? 'Edit user' : 'Add user' }}</h2>
        <p class="lede">Users belong to this organisation. A validation code is issued if you leave the field blank.</p>
        <form class="form-grid" @submit.prevent="saveUser">
          <label class="field">
            <span class="field-k">Name</span>
            <input class="input-text input-plain" v-model="userForm.name" required />
          </label>
          <label class="field">
            <span class="field-k">Role</span>
            <input class="input-text input-plain" v-model="userForm.role" />
          </label>
          <label class="field">
            <span class="field-k">Email</span>
            <input class="input-text input-plain" type="email" v-model="userForm.email" />
          </label>
          <label class="field">
            <span class="field-k">Phone</span>
            <input class="input-text input-plain" v-model="userForm.phone" />
          </label>
          <label class="field">
            <span class="field-k">Plate</span>
            <input class="input-text input-plain" v-model="userForm.plate" />
          </label>
          <label class="field">
            <span class="field-k">Validation code</span>
            <input class="input-text input-plain" v-model="userForm.code" :placeholder="editingUser ? '' : 'Issued on save'" />
          </label>
          <label class="field">
            <span class="field-k">Status</span>
            <select class="admin-select" v-model="userForm.status">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <p v-if="userError" class="form-error span-2">{{ userError }}</p>
          <div class="toolbar span-2" style="margin-top:4px">
            <button class="btn-sm primary" type="submit">{{ editingUser ? 'Save changes' : 'Add user' }}</button>
            <button class="btn-sm" type="button" @click="userFormOpen = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="pendingOrgDelete" class="modal-scrim" @click.self="pendingOrgDelete = false">
      <div class="modal-card">
        <h2 style="margin:0 0 8px;font:700 20px var(--font)">Delete {{ org.name }}?</h2>
        <p class="lede">This removes the organisation and its users. Activity history is kept.</p>
        <div class="toolbar" style="margin-top:14px">
          <button class="btn-sm danger" type="button" @click="deleteOrg">Delete</button>
          <button class="btn-sm" type="button" @click="pendingOrgDelete = false">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="pendingUser" class="modal-scrim" @click.self="pendingUser = null">
      <div class="modal-card">
        <h2 style="margin:0 0 8px;font:700 20px var(--font)">Remove {{ pendingUser.name }}?</h2>
        <p class="lede">Their validation code will no longer work. Past activity stays on this organisation.</p>
        <div class="toolbar" style="margin-top:14px">
          <button class="btn-sm danger" type="button" @click="removeUser">Remove</button>
          <button class="btn-sm" type="button" @click="pendingUser = null">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  <p v-else>Organisation not found.</p>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MoreActions from '@/components/MoreActions.vue'
import OrgFormModal from '@/components/OrgFormModal.vue'
import { formatDateTime, formatShort } from '@/lib/format'
import { useActivityStore } from '@/stores/activity'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const activity = useActivityStore()
const route = useRoute()
const router = useRouter()

const orgFormOpen = ref(false)
const pendingOrgDelete = ref(false)
const userFormOpen = ref(false)
const editingUser = ref(null)
const pendingUser = ref(null)
const selectedUserId = ref(null)
const activityFilter = ref('all')
const userError = ref('')
const userForm = reactive(blankUser())

const org = computed(() => admin.organisations.find((o) => o.id === route.params.id))
const users = computed(() => (org.value ? admin.usersFor(org.value.id) : []))
const stats = computed(() => (org.value ? admin.orgStats(org.value.id) : { users: 0, vehicles: 0, codes: 0, onSite: 0 }))
const selectedUser = computed(() => users.value.find((u) => u.id === selectedUserId.value) || null)

watch(
  () => route.params.id,
  () => {
    selectedUserId.value = null
    activityFilter.value = 'all'
    orgFormOpen.value = false
    userFormOpen.value = false
    pendingOrgDelete.value = false
    pendingUser.value = null
  },
)

const logs = computed(() => {
  if (!org.value) return []
  return activity.events
    .filter((e) => {
      if (e.orgId !== org.value.id) return false
      if (selectedUserId.value && e.orgUserId !== selectedUserId.value) return false
      if (activityFilter.value === 'validation' && e.category !== 'validation') return false
      if (activityFilter.value === 'entry' && e.action !== 'Check-in') return false
      if (activityFilter.value === 'exit' && !String(e.action).toLowerCase().includes('out')) return false
      return true
    })
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
})

function onSite(user) {
  return Boolean(user.lastEntry && (!user.lastExit || user.lastEntry > user.lastExit))
}

function blankUser() {
  return { name: '', role: '', email: '', phone: '', plate: '', code: '', status: 'Active' }
}

function saveOrg(payload) {
  admin.updateOrganisation(org.value.id, payload)
  orgFormOpen.value = false
}

function deleteOrg() {
  admin.deleteOrganisation(org.value.id)
  router.push('/admin/organisations')
}

function openCreateUser() {
  editingUser.value = null
  userError.value = ''
  Object.assign(userForm, blankUser())
  userFormOpen.value = true
}

function openEditUser(user) {
  editingUser.value = user
  userError.value = ''
  Object.assign(userForm, {
    name: user.name,
    role: user.role,
    email: user.email,
    phone: user.phone,
    plate: user.plate,
    code: user.code,
    status: user.status,
  })
  userFormOpen.value = true
}

function saveUser() {
  if (!userForm.name.trim()) {
    userError.value = 'Name is required.'
    return
  }
  if (editingUser.value) {
    admin.updateOrgUser(editingUser.value.id, { ...userForm })
  } else {
    admin.createOrgUser(org.value.id, { ...userForm })
  }
  userFormOpen.value = false
}

function removeUser() {
  if (!pendingUser.value) return
  if (selectedUserId.value === pendingUser.value.id) selectedUserId.value = null
  admin.deleteOrgUser(pendingUser.value.id)
  pendingUser.value = null
}
</script>
