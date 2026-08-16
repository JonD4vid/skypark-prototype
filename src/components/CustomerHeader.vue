<template>
  <header class="customer-header">
    <div class="customer-header-inner">
      <button class="brand" type="button" @click="goHome">
        <span class="brand-name">SkyPark</span>
        <span class="brand-pay">Pay</span>
      </button>
      <button v-if="!store.signedIn && !onSignIn" class="link-btn" type="button" @click="$router.push('/signin')">
        Sign in
      </button>
      <button v-else-if="store.signedIn" class="link-btn" type="button" @click="$router.push('/account')">
        My account
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const route = useRoute()
const router = useRouter()
const onSignIn = computed(() => route.path.startsWith('/signin'))

function goHome() {
  store.goEntryExtras()
  router.push('/')
}
</script>
