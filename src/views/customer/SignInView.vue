<template>
  <div v-if="step === 'google'" class="screen screen-center" style="gap:18px">
    <div class="spinner"></div>
    <div style="font:600 16px var(--font)">Connecting to Google…</div>
    <p class="lede">You'll come back here after choosing an account.</p>
  </div>

  <div v-else-if="step === 'sent'" class="screen">
    <button class="back-btn" type="button" @click="step = 'form'">‹ Back</button>
    <h1>Check your email</h1>
    <p class="lede">We sent a sign-in link to <strong>{{ email }}</strong>. Open it on this device to finish signing in. The link expires in 15 minutes.</p>

    <div class="alert alert-ok">
      <div class="alert-icon">✓</div>
      <div>
        <div style="font:600 14px var(--font);color:var(--green-ink)">Link sent</div>
        <p>{{ resent ? 'A new link is on its way.' : 'No password needed. Tap the button in the email.' }}</p>
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
      <div class="mail-subject">Sign in to SkyPark</div>
      <p class="mail-body">Tap the button below to sign in to your SkyPark account. This link expires in 15 minutes and can only be used once.</p>
      <button class="btn btn-primary" type="button" @click="openMagicLink">Sign in to SkyPark</button>
      <p class="tiny" style="text-align:left;margin:10px 0 0">If you didn't request this, you can ignore the email.</p>
    </div>

    <p class="tiny">Prototype inbox. In production this arrives in the customer's email.</p>
    <button class="btn-ghost" type="button" @click="resend">Didn't get it? Send again</button>
    <button class="btn-ghost" type="button" @click="step = 'form'">Use password or Google instead</button>
  </div>

  <div v-else class="screen">
    <button class="back-btn" type="button" @click="$router.push('/')">‹ Back</button>
    <h1>{{ creating ? 'Create an account' : 'Sign in' }}</h1>
    <p class="lede">{{ creating ? 'Keep receipts, save plates, and top up prepaid credit. You can still pay as a guest.' : 'Optional. You can always pay as a guest.' }}</p>

    <div v-if="resetDone" class="alert alert-ok">
      <div class="alert-icon">✓</div>
      <div>
        <div style="font:600 14px var(--font);color:var(--green-ink)">Password updated</div>
        <p>Sign in with your new password.</p>
      </div>
    </div>

    <button class="btn btn-google" type="button" @click="googleOpen = true">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>

    <div class="auth-or">or</div>

    <form class="auth-form" @submit.prevent="submitPassword">
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
      <label class="field">
        <span class="field-head">
          <span class="field-k">Password</span>
          <router-link class="field-link" to="/signin/forgot">Forgot password?</router-link>
        </span>
        <input
          class="input-text input-plain"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Password"
        />
      </label>
      <p v-if="error" class="auth-error">{{ error }}</p>
      <button class="btn btn-primary" type="submit">{{ creating ? 'Create account' : 'Sign in' }}</button>
    </form>

    <div class="auth-or">or</div>

    <button class="choice" type="button" @click="sendLink">
      <span>
        <span style="display:block;font:600 15px var(--font)">Email me a sign-in link</span>
        <span style="display:block;font:400 13px/1.45 var(--font);color:var(--muted);margin-top:2px">Passwordless. We'll send a one-time link to your inbox.</span>
      </span>
      <span class="chev">›</span>
    </button>
  </div>

  <div v-if="googleOpen" class="auth-scrim" @click="googleOpen = false">
    <div class="google-sheet" role="dialog" aria-labelledby="google-title" @click.stop>
      <div class="google-sheet-head">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Sign in with Google</span>
      </div>
      <div id="google-title" class="google-sheet-title">Choose an account</div>
      <p class="google-sheet-sub">to continue to SkyPark Pay</p>
      <button class="google-account" type="button" @click="pickGoogle">
        <span class="google-avatar">DA</span>
        <span>
          <span style="display:block;font:600 14.5px var(--font)">Duree Arthur</span>
          <span style="display:block;font:400 12.5px var(--font);color:var(--muted);margin-top:1px">duree@skygrid.tt</span>
        </span>
      </button>
      <button class="google-cancel" type="button" @click="googleOpen = false">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const router = useRouter()
const route = useRoute()

const email = ref(store.pendingResetEmail || store.pendingLinkEmail || store.customerEmail || 'duree@skygrid.tt')
const password = ref('')
const error = ref('')
const step = ref('form')
const googleOpen = ref(false)
const resent = ref(false)
const creating = computed(() => route.query.intent === 'create')
const resetDone = computed(() => route.query.reset === '1')

let googleTimer

onUnmounted(() => clearTimeout(googleTimer))

function validEmail() {
  return /\S+@\S+\.\S+/.test(email.value.trim())
}

function submitPassword() {
  error.value = ''
  if (!validEmail()) {
    error.value = 'Enter a valid email address.'
    return
  }
  if (!password.value) {
    error.value = 'Enter your password.'
    return
  }
  store.signIn({ method: 'password', email: email.value.trim() })
  router.push('/account')
}

function sendLink() {
  error.value = ''
  if (!validEmail()) {
    error.value = 'Enter the email we should send the sign-in link to.'
    return
  }
  store.requestSignInLink(email.value.trim())
  resent.value = false
  step.value = 'sent'
}

function resend() {
  store.requestSignInLink(email.value.trim())
  resent.value = true
}

function openMagicLink() {
  router.push({ name: 'signin-link' })
}

function pickGoogle() {
  googleOpen.value = false
  step.value = 'google'
  googleTimer = setTimeout(() => {
    store.signIn({ method: 'google', email: 'duree@skygrid.tt' })
    router.push('/account')
  }, 900)
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
  margin: 0 0 16px;
  font: 400 14px/1.5 var(--font);
  color: var(--muted);
}
.auth-scrim {
  position: fixed;
  inset: 0;
  background: rgba(15, 22, 35, 0.45);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.google-sheet {
  width: min(400px, 100%);
  background: #fff;
  border-radius: 16px;
  padding: 20px 20px 16px;
  box-shadow: 0 18px 50px rgba(15, 22, 35, 0.28);
}
.google-sheet-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font: 500 13px var(--font);
  color: var(--muted);
}
.google-sheet-title { font: 700 22px var(--font); margin-top: 18px; letter-spacing: -0.4px; }
.google-sheet-sub { margin: 4px 0 16px; font: 400 13.5px var(--font); color: var(--muted); }
.google-account {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 8px;
  border: none;
  border-top: 1px solid var(--line-faint);
  border-bottom: 1px solid var(--line-faint);
  background: none;
  cursor: pointer;
  text-align: left;
}
.google-account:hover { background: #f7f8fb; }
.google-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--blue);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 600 12px var(--font);
  flex: none;
}
.google-cancel {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  background: none;
  border: none;
  font: 500 14px var(--font);
  color: var(--blue);
  cursor: pointer;
}
</style>
