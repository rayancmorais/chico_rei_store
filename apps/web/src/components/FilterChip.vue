<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    count?: number
    pressed: boolean
    showCount?: boolean
    alwaysEnabled?: boolean
  }>(),
  { count: undefined, showCount: true, alwaysEnabled: false },
)

const emit = defineEmits<{ (event: 'click'): void }>()

// Opção com 0 resultados fica desabilitada, a não ser que já esteja marcada: sem isso, o usuário
// não conseguiria desmarcar um filtro que os outros zeraram. "Tudo" (alwaysEnabled) limpa o filtro
// e por isso nunca desabilita.
const isDisabled = computed(() => !props.alwaysEnabled && props.count === 0 && !props.pressed)
const hasBadge = computed(() => props.showCount && props.count !== undefined)
</script>

<template>
  <button
    type="button"
    class="flex h-11 flex-none items-center gap-2 rounded-panel border-2 border-ink pl-3.5 text-sm transition-[transform,box-shadow] duration-100 focus-ring md:h-[38px]"
    :class="[
      hasBadge ? 'pr-1.5' : 'pr-3.5',
      pressed
        ? 'bg-ink font-semibold text-surface shadow-hq-accent'
        : 'bg-white text-ink shadow-hq-sm',
      isDisabled
        ? 'cursor-not-allowed border-dashed opacity-50 shadow-none'
        : 'hover:-translate-x-0.5 hover:-translate-y-0.5',
    ]"
    :aria-pressed="pressed ? 'true' : 'false'"
    :disabled="isDisabled"
    @click="emit('click')"
  >
    {{ label }}
    <span
      v-if="hasBadge"
      class="flex h-6 min-w-6 items-center justify-center rounded-pill px-1.5 text-[11px] font-semibold"
      :class="pressed ? 'bg-accent text-surface' : 'bg-sand text-ink'"
    >
      {{ count }}
    </span>
  </button>
</template>
