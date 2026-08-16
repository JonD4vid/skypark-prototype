<template>
  <div v-if="done" class="screen" style="padding-top:40px">
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0 4px">
      <div class="ok-mark">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 10 18 20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div style="font:700 26px var(--font);letter-spacing:-0.6px;text-align:center">Password updated</div>
      <p class="lede" style="text-align:center;max-width:340px">You can now sign in to SkyPark with your new password.</p>
    </div>
    <button class="btn btn-primary" type="button" @click="goSignIn">Sign in</button>
  </div>

  <div v-else class="screen">
    <button class="back-btn" type="button" @click="$router.push('/signin/forgot')">‹ Back</button>
    <h1>Reset password</h1>
    <p class="lede">Enter the 6-digit code we emailed to <strong>{{ resetEmail }}</strong>, then choose a new password.</p>

    <form class="auth-form" @submit.prevent="submit">
      <label class="field">
        <span class="field-k">Verification code</span>
        <input
          class="input-id sm"
          :value="otp"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          placeholder="000000"
          aria-label="6-digit verification code"
          @input="otp = $event.target.value.replace(/\D/g, '').slice(0, 6)"
        />
      </label>
      <label class="field">
        <span class="field-k">New password</span>
        <input
          class="input-text input-plain"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="At least 8 characters"
        />
      </label>
      <label class="field">
        <span class="field-k">Confirm password</span>
        <input
          class="input-text input-plain"
          v-model="confirm"
          type="password"
          autocomplete="new-password"
          placeholder="Re-enter password"
        />
      </label>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <button class="btn btn-primary" type="submit">Update password</button>
    </form>

    <p class="tiny">The code expires in 10 minutes and can only be used once.</p>
    <button class="btn-ghost" type="button" @click="$router.push('/signin/forgot')">Email me a new code</button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()

const otp = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')
const done = ref(false)

const resetEmail = computed(() => store.pendingResetEmail || store.customerEmail || 'duree@skygrid.tt')

onMounted(() => {
  if (!store.pendingResetEmail) {
    store.requestPasswordReset(resetEmail.value)
  }
})

function submit() {
  error.value = ''
  if (otp.value.length !== 6) {
    error.value = 'Enter the 6-digit code from your email.'
    return
  }
  const otpResult = store.verifyResetOtp(otp.value)
  if (!otpResult.ok) {
    error.value = otpResult.error
    return
  }
  if (password.value.length < 8) {
    error.value = 'Use at least 8 characters.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Those passwords do not match. Try again.'
    return
  }
  store.completePasswordReset()
  done.value = true
}

function goSignIn() {
  router.push({ path: '/signin', query: { reset: '1' } })
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.auth-error {
  margin: 0;
  font: 500 13px var(--font);
  color: var(--red);
}
</style>
