<script setup lang="ts">
import { computed } from 'vue'
import type { Color } from '@chico_rei_store/shared'
import { pluralize } from '@/utils/format'

const props = withDefaults(
  defineProps<{ color: Color; count: number; pressed: boolean; size?: 'sm' | 'lg' }>(),
  { size: 'sm' },
)

const emit = defineEmits<{ (event: 'click'): void }>()

// Opção com 0 resultados fica desabilitada, a não ser que já esteja marcada: sem isso, o usuário
// não conseguiria desmarcar um filtro que os outros zeraram.
const isDisabled = computed(() => props.count === 0 && !props.pressed)
</script>

<template>
  <button
    type="button"
    class="flex flex-col items-center gap-1.5 rounded-pill text-[11px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-not-allowed"
    :title="`${color.name} (${count})`"
    :aria-label="`${color.name}, ${pluralize(count, 'produto', 'produtos')}`"
    :aria-pressed="pressed ? 'true' : 'false'"
    :disabled="isDisabled"
    @click="emit('click')"
  >
    <span
      class="block rounded-pill border-2 border-ink transition-transform duration-100"
      :class="[
        size === 'lg' ? 'h-11 w-11' : 'h-[30px] w-[30px] [button:enabled:hover_&]:scale-110',
        pressed ? 'shadow-ring-accent' : '',
        isDisabled ? 'opacity-30' : '',
      ]"
      :style="{ backgroundColor: color.hex }"
      aria-hidden="true"
    />
    <span v-if="size === 'lg'" aria-hidden="true">{{ color.name }}</span>
  </button>
</template>
