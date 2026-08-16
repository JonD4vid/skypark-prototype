<template>
  <div>
    <div class="admin-top">
      <div>
        <h1>Validations</h1>
        <p class="lede" style="margin-top:6px">Three types: free time, percentage off, and fixed value. Usage feeds audit history.</p>
      </div>
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in admin.validationRules" :key="v.id">
            <td>{{ v.org }}</td>
            <td>{{ v.type }}</td>
            <td class="mono">{{ v.detail }}</td>
            <td>{{ v.facility }}</td>
            <td>{{ v.uses }}</td>
            <td>{{ v.cap }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from '@/stores/admin'
const admin = useAdminStore()
</script>
