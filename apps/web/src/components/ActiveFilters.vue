<script setup lang="ts">
import { computed } from 'vue'
import type { FiltersResponse } from '@chico_rei_store/shared'

const props = defineProps<{
  types: FiltersResponse['types']
  colors: FiltersResponse['colors']
  selectedTypes: string[]
  selectedColors: string[]
}>()

const emit = defineEmits<{
  (event: 'toggle-type', id: string): void
  (event: 'toggle-color', id: string): void
  (event: 'clear'): void
}>()

// Id que não está nas facetas (link antigo, ou facetas ainda carregando) aparece cru: o chip
// continua visível e removível.
const chips = computed(() => [
  ...props.selectedTypes.map((id) => ({
    key: `type-${id}`,
    label: props.types.find((type) => type.id === id)?.label ?? id,
    hex: null,
    remove: () => emit('toggle-type', id),
  })),
  ...props.selectedColors.map((id) => {
    const color = props.colors.find((option) => option.id === id)
    return {
      key: `color-${id}`,
      label: color?.name ?? id,
      hex: color?.hex ?? null,
      remove: () => emit('toggle-color', id),
    }
  }),
])
</script>

<template>
  <div v-if="chips.length" class="flex flex-wrap items-center gap-1.5">
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="flex h-[30px] items-center gap-2 rounded-control border-2 border-ink bg-accent pl-2.5 pr-1 text-[13px] font-medium text-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      :aria-label="`Remover filtro ${chip.label}`"
      @click="chip.remove"
    >
      <span
        v-if="chip.hex"
        class="h-3 w-3 rounded-pill ring-[1.5px] ring-surface"
        :style="{ backgroundColor: chip.hex }"
        aria-hidden="true"
      />
      {{ chip.label }}
      <span
        class="flex h-5 w-5 items-center justify-center rounded bg-ink text-[11px]"
        aria-hidden="true"
        >✕</span
      >
    </button>
    <button
      type="button"
      class="ml-1.5 text-[13px] font-semibold underline decoration-2 underline-offset-[3px]"
      data-test="clear-filters"
      @click="emit('clear')"
    >
      Limpar
    </button>
  </div>
</template>
