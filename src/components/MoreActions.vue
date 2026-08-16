<template>
  <div class="more-actions" @click.stop>
    <button
      ref="trigger"
      class="more-actions-btn"
      type="button"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="label"
      @click="toggle"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="3.5" cy="8" r="1.5" />
        <circle cx="8" cy="8" r="1.5" />
        <circle cx="12.5" cy="8" r="1.5" />
      </svg>
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        class="more-actions-menu"
        role="menu"
        :style="menuStyle"
      >
        <button role="menuitem" type="button" @click="choose('edit')">{{ editLabel }}</button>
        <div class="more-actions-sep"></div>
        <button role="menuitem" class="danger" type="button" @click="choose('delete')">{{ deleteLabel }}</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  label: { type: String, default: 'More actions' },
  editLabel: { type: String, default: 'Edit' },
  deleteLabel: { type: String, default: 'Delete' },
})
const emit = defineEmits(['edit', 'delete'])

const open = ref(false)
const trigger = ref(null)
const menuStyle = ref({})

function toggle() {
  if (open.value) close()
  else show()
}

function show() {
  open.value = true
  requestAnimationFrame(position)
}

function position() {
  const el = trigger.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const width = 168
  const height = 84
  let top = r.bottom + 6
  let left = r.right - width
  if (left < 8) left = 8
  if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
  if (top + height > window.innerHeight - 8) top = Math.max(8, r.top - height - 6)
  menuStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    width: `${width}px`,
  }
}

function close() {
  open.value = false
}

function choose(action) {
  emit(action)
  close()
}

function onPointerDown(e) {
  if (!open.value) return
  if (trigger.value?.contains(e.target)) return
  if (e.target.closest?.('.more-actions-menu')) return
  close()
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', close)
  window.addEventListener('scroll', close, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', close)
  window.removeEventListener('scroll', close, true)
})
</script>
