<template>
  <div class="customer-app">
    <CustomerHeader />
    <router-view />
  </div>
</template>

<script setup>
import CustomerHeader from '@/components/CustomerHeader.vue'
</script>
