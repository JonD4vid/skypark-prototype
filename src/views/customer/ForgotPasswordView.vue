<template>
  <div v-if="step === 'sent'" class="screen">
    <button class="back-btn" type="button" @click="step = 'request'">‹ Back</button>
    <h1>Check your email</h1>
    <p class="lede">We sent a 6-digit verification code to <strong>{{ email }}</strong>. Open the email on this device, then continue to choose a new password. The code expires in 10 minutes.</p>

    <div class="alert alert-ok">
      <div class="alert-icon">✓</div>
      <div>
        <div style="font:600 14px var(--font);color:var(--green-ink)">Code sent</div>
        <p>{{ resent ? 'A new code is on its way.' : 'Use the code and the reset link in the email to continue.' }}</p>
      </div>
    </div>

    <div class="mail-card">
      <div class="mail-meta">
        <div>
          <div class="mail-from">SkyPark Pay</div>
          <div class="mail-addr">noreply@skypark.tt</div>
        </div>
        <div class="mail-when">Just now</div>
      </div>
      <div class="mail-subject">Reset your SkyPark password</div>
      <p class="mail-body">Use this one-time code to verify it's you, then follow the link to choose a new password.</p>
      <div class="otp-code" aria-label="Verification code">{{ formattedOtp }}</div>
      <button class="btn btn-primary" type="button" @click="openReset">Reset your password</button>
      <p class="tiny" style="text-align:left;margin:10px 0 0">If you didn't request this, you can ignore the email. Your password will stay the same.</p>
    </div>

    <p class="tiny">Prototype inbox. In production this arrives in the customer's email.</p>
    <button class="btn-ghost" type="button" @click="resend">Didn't get it? Send again</button>
    <button class="btn-ghost" type="button" @click="$router.push('/signin')">Back to sign in</button>
  </div>

  <div v-else class="screen">
    <button class="back-btn" type="button" @click="$router.push('/signin')">‹ Back</button>
    <h1>Forgot password</h1>
    <p class="lede">We'll email a one-time verification code and a link to reset your password.</p>

    <form class="auth-form" @submit.prevent="submit">
      <label class="field">
        <span class="field-k">Email</span>
        <input
          class="input-text input-plain"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@email.com"
        />
      </label>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <button class="btn btn-primary" type="submit">Email me a reset code</button>
    </form>

    <p class="tiny">You can still sign in with Google or a sign-in link if you have access to your inbox.</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()

const email = ref(store.pendingResetEmail || store.customerEmail || 'duree@skygrid.tt')
const error = ref('')
const step = ref('request')
const resent = ref(false)

const formattedOtp = computed(() => (store.pendingResetOtp || '648219').split('').join(' '))

function validEmail() {
  return /\S+@\S+\.\S+/.test(email.value.trim())
}

function submit() {
  error.value = ''
  if (!validEmail()) {
    error.value = 'Enter the email on your SkyPark account.'
    return
  }
  store.requestPasswordReset(email.value.trim())
  resent.value = false
  step.value = 'sent'
}

function resend() {
  store.requestPasswordReset(email.value.trim())
  resent.value = true
}

function openReset() {
  router.push({ name: 'signin-reset' })
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
.mail-card {
  background: var(--paper);
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  padding: 18px 18px 16px;
}
.mail-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.mail-from { font: 600 14.5px var(--font); }
.mail-addr { font: 400 12px var(--font); color: var(--subtle); margin-top: 1px; }
.mail-when { font: 400 12px var(--font); color: var(--subtle); }
.mail-subject { font: 700 16px var(--font); margin: 14px 0 8px; }
.mail-body {
  margin: 0 0 14px;
  font: 400 14px/1.5 var(--font);
  color: var(--muted);
}
.otp-code {
  font: 700 28px var(--mono);
  letter-spacing: 8px;
  text-align: center;
  background: var(--canvas);
  border-radius: 12px;
  padding: 14px 12px 14px 20px;
  margin: 0 0 16px;
  color: var(--ink);
}
</style>
