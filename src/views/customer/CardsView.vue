<template>
  <div class="screen">
    <button class="back-btn" type="button" @click="$router.push('/account')">‹ Back</button>
    <h1>Tokenized cards</h1>
    <p class="lede">Cards are tokenized by PowerTranz. SkyPark stores only the token and a masked PAN.</p>

    <div class="card">
      <div v-for="c in store.cards" :key="c.id" class="list-btn">
        <span>
          <span class="mono" style="display:block;font-size:15px">{{ c.masked }}</span>
          <span style="display:block;font:400 12.5px var(--font);color:var(--subtle);margin-top:1px">{{ c.brand }} · exp {{ c.exp }} · {{ c.token }}</span>
        </span>
        <button class="link-btn" type="button" @click="store.removeCard(c.id)">Remove</button>
      </div>
      <div v-if="!store.cards.length" class="card-pad" style="color:var(--muted)">No cards on file.</div>
    </div>

    <h2 style="font:700 18px var(--font);margin:8px 0 0">Add a card</h2>
    <p class="lede">Hosted by PowerTranz. After tokenize, only the mask is kept, e.g. 41112xxxxxxx456.</p>
    <input class="input-text" v-model="pan" placeholder="Card number" inputmode="numeric" />
    <div class="btn-row">
      <input class="input-text" v-model="exp" placeholder="MM / YY" inputmode="numeric" />
      <input class="input-text" v-model="cvv" placeholder="CVV" inputmode="numeric" />
    </div>
    <button class="btn btn-primary" type="button" @click="add">Tokenize and save</button>
    <p v-if="preview" class="tiny">Will be stored as {{ preview }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { maskPan } from '@/lib/powertranz'
import { useSkyParkStore } from '@/stores/skypark'

const store = useSkyParkStore()
const pan = ref('')
const exp = ref('')
const cvv = ref('')
const preview = computed(() => (pan.value.replace(/\D/g, '').length >= 8 ? maskPan(pan.value) : ''))

function add() {
  if (pan.value.replace(/\D/g, '').length < 12) return
  store.addCard(pan.value, exp.value || '12/28')
  pan.value = ''
  exp.value = ''
  cvv.value = ''
}
</script>
