import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import {
  BASE_AMOUNT,
  DEFAULT_CARDS,
  DEFAULT_HISTORY,
  DEFAULT_VEHICLES,
  FACILITY,
  PAYMENT_ERRORS,
  VALIDATION_ERRORS,
  VALIDATION_RESULTS,
} from '@/data/mock'
import { formatPlate, money, nowIso } from '@/lib/format'
import {
  buildGatewayTimeline,
  emptyRefund,
  maskPan,
  newTransactionId,
  timelineErrors,
  tokenizeCard,
} from '@/lib/powertranz'
import { useActivityStore } from '@/stores/activity'
import { useAdminStore } from '@/stores/admin'

export const useSkyParkStore = defineStore('skypark', () => {
  const plate = ref('')
  const ticket = ref('')
  const phone = ref('')
  const code = ref('')
  const card = ref('')
  const exp = ref('')
  const cvv = ref('')
  const fromQR = ref(false)
  const signedIn = ref(false)
  const customerName = ref('Duree')
  const customerEmail = ref('duree@skygrid.tt')
  const pendingLinkEmail = ref('')
  const pendingResetEmail = ref('')
  const pendingResetOtp = ref('648219')
  const resetOtpVerified = ref(false)
  const authMethod = ref(null)
  const customerId = ref('c1')
  const creditBalance = ref(65)
  const vehicles = ref(DEFAULT_VEHICLES.map((v) => ({ ...v })))
  const cards = ref(DEFAULT_CARDS.map((c) => ({ ...c })))
  const selectedCardId = ref(DEFAULT_CARDS[0].id)
  const saveNewCard = ref(false)
  const history = ref(DEFAULT_HISTORY.map((h) => ({ ...h })))
  const validation = ref(null)
  const codeError = ref(null)
  const payError = ref(null)
  const payMethod = ref('token')
  const processingLabel = ref('')
  const procStep = ref(0)
  const entervoState = ref('ok')
  const lastRef = ref('SP-88214')
  const lastTransactionId = ref('')
  const lastCardMasked = ref('41112xxxxxxx456')
  const lastTimeline = ref([])
  const sent = reactive({ email: false, sms: false, pdf: false })
  const paying = ref(false)
  const paymentPurpose = ref('parking')
  const topUpAmount = ref(0)

  const demo = reactive({
    lookup: 'found',
    valid: 'freetime',
    wallets: true,
    lpr: true,
    payment: 'approved',
    entervo: 'posted',
    scan: 'ok',
  })

  const plateShown = computed(() => formatPlate(plate.value) || 'PDE 1234')
  const amountNumber = computed(() => (validation.value ? validation.value.total : BASE_AMOUNT))
  const amountDue = computed(() => money(amountNumber.value))
  const topUpDue = computed(() => money(topUpAmount.value))
  const chargeAmount = computed(() => (paymentPurpose.value === 'topup' ? topUpAmount.value : amountNumber.value))
  const chargeDue = computed(() => money(chargeAmount.value))
  const hasValidation = computed(() => !!validation.value)
  const selectedCard = computed(() => cards.value.find((c) => c.id === selectedCardId.value) || null)
  const actorName = computed(() => (signedIn.value ? 'Duree Arthur' : 'Guest'))
  const actorType = computed(() => (signedIn.value ? 'customer' : 'guest'))

  function log(partial) {
    useActivityStore().record({
      actorType: actorType.value === 'guest' ? 'customer' : actorType.value,
      actor: actorName.value,
      customerId: signedIn.value ? customerId.value : null,
      plate: plateShown.value,
      ...partial,
    })
  }

  function resetReceiptFlags() {
    sent.email = false
    sent.sms = false
    sent.pdf = false
  }

  function setDemo(key, val) {
    demo[key] = val
    if (key === 'valid') {
      validation.value = null
      codeError.value = null
    }
  }

  function goEntryExtras() {
    fromQR.value = false
    payError.value = null
  }

  function applyCode() {
    const kind = demo.valid
    if (VALIDATION_ERRORS[kind]) {
      codeError.value = VALIDATION_ERRORS[kind]
      validation.value = null
      log({
        action: 'Validation failed',
        category: 'validation',
        outcome: 'fail',
        detail: VALIDATION_ERRORS[kind],
      })
      return { ok: false, zero: false }
    }
    codeError.value = null
    validation.value = { ...VALIDATION_RESULTS[kind] }
    log({
      action: 'Validation applied',
      category: 'validation',
      detail: `${code.value || 'SKY-4TXQ'} · ${validation.value.summary}`,
    })
    return { ok: true, zero: validation.value.total === 0 }
  }

  function isWalletMethod(method = payMethod.value) {
    return method === 'wallet' || method === 'apple' || method === 'google'
  }

  function paymentMethodSnapshot() {
    if (payMethod.value === 'apple') {
      return { method: 'Apple Pay', cardMasked: 'Wallet · Apple Pay', cardBrand: 'Apple Pay', tokenized: false }
    }
    if (payMethod.value === 'google') {
      return { method: 'Google Pay', cardMasked: 'Wallet · Google Pay', cardBrand: 'Google Pay', tokenized: false }
    }
    if (payMethod.value === 'wallet') {
      return { method: 'Apple Pay', cardMasked: 'Wallet · Apple Pay', cardBrand: 'Apple Pay', tokenized: false }
    }
    if (payMethod.value === 'credit') {
      return { method: 'Prepaid credit', cardMasked: 'Prepaid credit', cardBrand: '-', tokenized: false }
    }
    if (payMethod.value === 'validation') {
      return { method: 'Fully validated', cardMasked: 'Fully validated', cardBrand: '-', tokenized: false }
    }
    if (payMethod.value === 'token' && selectedCard.value) {
      return {
        method: 'Tokenized card',
        cardMasked: selectedCard.value.masked,
        cardBrand: selectedCard.value.brand,
        tokenized: true,
      }
    }
    return { method: 'Card', cardMasked: currentCardMasked(), cardBrand: 'Card', tokenized: false }
  }

  function currentCardMasked() {
    if (payMethod.value === 'token' && selectedCard.value) return selectedCard.value.masked
    if (payMethod.value === 'apple') return 'Wallet · Apple Pay'
    if (payMethod.value === 'google') return 'Wallet · Google Pay'
    if (payMethod.value === 'wallet') return 'Wallet · Apple / Google Pay'
    if (payMethod.value === 'credit') return 'Prepaid credit'
    if (payMethod.value === 'validation') return 'Fully validated'
    if (card.value) return maskPan(card.value)
    return 'Card · hosted PowerTranz'
  }

  function currentCardToken() {
    if (payMethod.value === 'token' && selectedCard.value) return selectedCard.value.token
    return '-'
  }

  function startPayment(method, purpose = 'parking') {
    if (paying.value) return { duplicate: true }
    paying.value = true
    paymentPurpose.value = purpose
    payError.value = null
    payMethod.value = method
    procStep.value = 0
    processingLabel.value = isWalletMethod(method)
      ? 'Confirming with your wallet…'
      : 'Securely contacting your bank (3DS2)…'
    const snap = paymentMethodSnapshot()
    log({
      action: purpose === 'topup' ? 'Credit top-up started' : 'Payment started',
      category: 'payment',
      detail: `${snap.method} · ${snap.cardMasked} · ${chargeDue.value}`,
      ...snap,
    })
    return { duplicate: false }
  }

  function paymentTick(step) {
    procStep.value = step
    if (step === 1) processingLabel.value = 'Verifying the payment with PowerTranz…'
    if (step === 2) {
      processingLabel.value =
        paymentPurpose.value === 'topup'
          ? 'Adding credit to your account…'
          : 'Recording the sale in the parking system…'
    }
  }

  function finishPayment() {
    paying.value = false
    const result = demo.payment
    const datetime = nowIso()
    const transactionId = newTransactionId()
    const timeline = buildGatewayTimeline({
      startedAt: datetime,
      outcome: result,
      entervo: demo.entervo === 'posted' ? 'ok' : 'failed',
    })
    const errors = timelineErrors(timeline)
    const cardMasked = currentCardMasked()
    lastTransactionId.value = transactionId
    lastCardMasked.value = cardMasked
    lastTimeline.value = timeline
    const snap = paymentMethodSnapshot()

    if (result !== 'approved') {
      payError.value = PAYMENT_ERRORS[result]
      lastRef.value = 'SP-' + String(88000 + Math.floor(Math.random() * 900)).padStart(5, '0')
      log({
        action: 'Payment failed',
        category: 'payment',
        outcome: 'fail',
        detail: `${payError.value[0]} · ${cardMasked} · ${errors[0]?.message || result}`,
        ref: lastRef.value,
        amount: amountNumber.value,
        ...snap,
      })
      return {
        ok: false,
        datetime,
        transactionId,
        timeline,
        errors,
        cardMasked,
        cardToken: currentCardToken(),
        paymentStatus: 'Declined',
        entervoStatus: '-',
      }
    }

    if (payMethod.value === 'card' && signedIn.value && saveNewCard.value && card.value) {
      addCard(card.value, exp.value || '12/28', { silent: true })
    }

    entervoState.value = demo.entervo === 'posted' ? 'ok' : 'failed'
    lastRef.value = 'SP-' + String(88000 + Math.floor(Math.random() * 900)).padStart(5, '0')
    resetReceiptFlags()
    if (signedIn.value) {
      history.value = [
        {
          id: lastRef.value,
          where: FACILITY.name,
          when: 'Today · ' + FACILITY.duration,
          amount: amountNumber.value,
          ref: lastRef.value,
          status: 'Captured',
          plate: plateShown.value,
          ...snap,
        },
        ...history.value,
      ]
      if (payMethod.value === 'credit') {
        creditBalance.value = Math.max(0, creditBalance.value - amountNumber.value)
      }
    }
    log({
      action: 'Payment captured',
      category: 'payment',
      detail: `${snap.method} · ${cardMasked} · ${money(amountNumber.value)}`,
      ref: lastRef.value,
      amount: amountNumber.value,
      ...snap,
    })
    return {
      ok: true,
      datetime,
      transactionId,
      timeline,
      errors,
      cardMasked,
      cardToken: currentCardToken(),
      paymentStatus: 'Captured',
      entervo: entervoState.value,
      entervoStatus: entervoState.value === 'ok' ? 'Posted' : 'Retrying',
    }
  }

  function finishZeroDue() {
    payMethod.value = 'validation'
    entervoState.value = demo.entervo === 'posted' ? 'ok' : 'failed'
    lastCardMasked.value = 'Fully validated'
    lastTransactionId.value = newTransactionId()
    resetReceiptFlags()
    log({
      action: 'Session settled with validation',
      category: 'payment',
      detail: 'Amount due reduced to zero. No PowerTranz charge',
    })
    return entervoState.value
  }

  function payMethodLabel() {
    if (payMethod.value === 'apple') return 'Apple Pay · PowerTranz'
    if (payMethod.value === 'google') return 'Google Pay · PowerTranz'
    if (payMethod.value === 'wallet') return 'Wallet · PowerTranz'
    if (payMethod.value === 'credit') return 'Prepaid credit'
    if (payMethod.value === 'validation') return 'Fully validated · no card charge'
    if (payMethod.value === 'token' && selectedCard.value) {
      return `Tokenized ${selectedCard.value.brand} ${selectedCard.value.masked} · PowerTranz`
    }
    return `${currentCardMasked()} · PowerTranz`
  }

  function beginTopUp(amount) {
    topUpAmount.value = Number(amount) || 0
    paymentPurpose.value = 'topup'
    payError.value = null
    paying.value = false
  }

  function topUp(amount) {
    creditBalance.value += amount
    useAdminStore().syncCustomerCredit(customerId.value, creditBalance.value)
    log({
      action: 'Prepaid credit topped up',
      category: 'account',
      detail: money(amount),
    })
  }

  function finishTopUpPayment() {
    paying.value = false
    const result = demo.payment
    const datetime = nowIso()
    const transactionId = newTransactionId()
    const timeline = buildGatewayTimeline({
      startedAt: datetime,
      outcome: result,
      entervo: 'skip',
    })
    const errors = timelineErrors(timeline)
    const cardMasked = currentCardMasked()
    lastTransactionId.value = transactionId
    lastCardMasked.value = cardMasked
    lastTimeline.value = timeline
    const snap = paymentMethodSnapshot()

    if (result !== 'approved') {
      payError.value = PAYMENT_ERRORS[result]
      lastRef.value = 'SP-' + String(88000 + Math.floor(Math.random() * 900)).padStart(5, '0')
      log({
        action: 'Credit top-up failed',
        category: 'payment',
        outcome: 'fail',
        detail: `${payError.value[0]} · ${cardMasked} · ${errors[0]?.message || result}`,
        ref: lastRef.value,
        amount: topUpAmount.value,
        ...snap,
      })
      return {
        ok: false,
        datetime,
        transactionId,
        timeline,
        errors,
        cardMasked,
        cardToken: currentCardToken(),
        paymentStatus: 'Declined',
        entervoStatus: '-',
      }
    }

    if (payMethod.value === 'card' && signedIn.value && saveNewCard.value && card.value) {
      addCard(card.value, exp.value || '12/28', { silent: true })
    }

    lastRef.value = 'SP-' + String(88000 + Math.floor(Math.random() * 900)).padStart(5, '0')
    resetReceiptFlags()
    history.value = [
      {
        id: lastRef.value,
        where: 'Prepaid credit top-up',
        when: 'Today',
        amount: topUpAmount.value,
        ref: lastRef.value,
        status: 'Captured',
        plate: '-',
        ...snap,
      },
      ...history.value,
    ]
    log({
      action: 'Credit top-up captured',
      category: 'payment',
      detail: `${snap.method} · ${cardMasked} · ${topUpDue.value}`,
      ref: lastRef.value,
      amount: topUpAmount.value,
      ...snap,
    })
    topUp(topUpAmount.value)
    return {
      ok: true,
      datetime,
      transactionId,
      timeline,
      errors,
      cardMasked,
      cardToken: currentCardToken(),
      paymentStatus: 'Captured',
      entervoStatus: '-',
    }
  }

  function addVehicle(nextPlate, label = 'Saved plate') {
    const formatted = formatPlate(nextPlate)
    if (!formatted) return
    if (vehicles.value.some((v) => v.plate.replace(/\s/g, '') === formatted.replace(/\s/g, ''))) return
    vehicles.value.push({ plate: formatted, label })
    log({ action: 'Vehicle saved', category: 'account', detail: formatted, plate: formatted })
  }

  function removeVehicle(nextPlate) {
    vehicles.value = vehicles.value.filter((v) => v.plate !== nextPlate)
    log({ action: 'Vehicle removed', category: 'account', detail: nextPlate, plate: nextPlate })
  }

  function useSavedPlate(nextPlate) {
    plate.value = formatPlate(nextPlate)
  }

  function addCard(pan, expiry, { silent } = {}) {
    const tokenized = tokenizeCard(pan, expiry)
    if (!cards.value.length) tokenized.default = true
    cards.value.push(tokenized)
    selectedCardId.value = tokenized.id
    useAdminStore().syncCustomerCards(customerId.value, cards.value)
    if (!silent) {
      log({
        action: 'Card added',
        category: 'card',
        detail: `Tokenized ${tokenized.brand} ${tokenized.masked} · ${tokenized.token}`,
      })
    }
    card.value = ''
    exp.value = ''
    cvv.value = ''
    return tokenized
  }

  function removeCard(id) {
    const existing = cards.value.find((c) => c.id === id)
    cards.value = cards.value.filter((c) => c.id !== id)
    if (selectedCardId.value === id) {
      selectedCardId.value = cards.value[0]?.id || null
    }
    useAdminStore().syncCustomerCards(customerId.value, cards.value)
    if (existing) {
      log({
        action: 'Card removed',
        category: 'card',
        detail: `Removed token for ${existing.masked}`,
      })
    }
  }

  function resolveEntervo() {
    entervoState.value = 'ok'
  }

  function signIn(opts = {}) {
    signedIn.value = true
    authMethod.value = opts.method || 'password'
    if (opts.email) customerEmail.value = opts.email
    pendingLinkEmail.value = ''
    const methodLabel =
      authMethod.value === 'google'
        ? 'Google'
        : authMethod.value === 'link'
          ? 'email link'
          : 'email and password'
    log({
      action: 'Signed in',
      category: 'account',
      actorType: 'customer',
      actor: 'Duree Arthur',
      customerId: 'c1',
      detail: `Signed in with ${methodLabel}`,
    })
  }

  function requestSignInLink(email) {
    pendingLinkEmail.value = email
    log({
      action: 'Sign-in link requested',
      category: 'account',
      actorType: 'customer',
      actor: 'Duree Arthur',
      customerId: 'c1',
      detail: `Passwordless link sent to ${email}`,
    })
  }

  function consumeSignInLink() {
    signIn({ method: 'link', email: pendingLinkEmail.value || customerEmail.value })
  }

  function requestPasswordReset(email) {
    pendingResetEmail.value = email
    pendingResetOtp.value = '648219'
    resetOtpVerified.value = false
    log({
      action: 'Password reset requested',
      category: 'account',
      actorType: 'customer',
      actor: 'Duree Arthur',
      customerId: 'c1',
      detail: `OTP sent to ${email}`,
    })
  }

  function verifyResetOtp(code) {
    const entered = String(code || '').replace(/\s/g, '')
    if (entered === pendingResetOtp.value) {
      resetOtpVerified.value = true
      log({
        action: 'Password reset OTP verified',
        category: 'account',
        actorType: 'customer',
        actor: 'Duree Arthur',
        customerId: 'c1',
        detail: `Code accepted for ${pendingResetEmail.value || customerEmail.value}`,
      })
      return { ok: true }
    }
    return { ok: false, error: "That code doesn't match. Check the email and try again." }
  }

  function completePasswordReset() {
    const email = pendingResetEmail.value || customerEmail.value
    customerEmail.value = email
    pendingResetEmail.value = email
    pendingResetOtp.value = ''
    resetOtpVerified.value = false
    log({
      action: 'Password updated',
      category: 'account',
      actorType: 'customer',
      actor: 'Duree Arthur',
      customerId: 'c1',
      detail: `New password set for ${email}`,
    })
    return { email }
  }

  function signOut() {
    log({ action: 'Signed out', category: 'account' })
    signedIn.value = false
    authMethod.value = null
  }

  function resetSession() {
    validation.value = null
    codeError.value = null
    payError.value = null
    paying.value = false
    procStep.value = 0
    code.value = ''
    card.value = ''
    exp.value = ''
    cvv.value = ''
  }

  return {
    plate,
    ticket,
    phone,
    code,
    card,
    exp,
    cvv,
    fromQR,
    signedIn,
    customerName,
    customerEmail,
    pendingLinkEmail,
    pendingResetEmail,
    pendingResetOtp,
    resetOtpVerified,
    authMethod,
    customerId,
    creditBalance,
    vehicles,
    cards,
    selectedCardId,
    selectedCard,
    saveNewCard,
    history,
    validation,
    codeError,
    payError,
    payMethod,
    processingLabel,
    procStep,
    entervoState,
    lastRef,
    lastTransactionId,
    lastCardMasked,
    lastTimeline,
    sent,
    paying,
    paymentPurpose,
    topUpAmount,
    topUpDue,
    demo,
    facility: FACILITY,
    plateShown,
    amountNumber,
    amountDue,
    hasValidation,
    actorName,
    setDemo,
    goEntryExtras,
    applyCode,
    startPayment,
    paymentTick,
    finishPayment,
    finishTopUpPayment,
    finishZeroDue,
    payMethodLabel,
    currentCardMasked,
    paymentMethodSnapshot,
    beginTopUp,
    topUp,
    addVehicle,
    removeVehicle,
    useSavedPlate,
    addCard,
    removeCard,
    resolveEntervo,
    signIn,
    requestSignInLink,
    consumeSignInLink,
    requestPasswordReset,
    verifyResetOtp,
    completePasswordReset,
    signOut,
    resetSession,
    resetReceiptFlags,
    log,
    emptyRefund,
  }
})
