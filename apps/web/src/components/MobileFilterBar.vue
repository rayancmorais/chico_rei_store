<script setup lang="ts">
import type { FiltersResponse } from '@chico_rei_store/shared'
import FilterChip from '@/components/FilterChip.vue'

defineProps<{
  types: FiltersResponse['types']
  selectedTypes: string[]
  activeFilterCount: number
  sheetOpen: boolean
}>()

const emit = defineEmits<{
  (event: 'open-filters'): void
  (event: 'toggle-type', id: string): void
  (event: 'clear-types'): void
}>()
</script>

<template>
  <div
    class="sticky top-header z-20 -mx-4 flex gap-2 overflow-x-auto border-b-2 border-ink bg-paper/95 px-4 pb-3 pt-2.5 backdrop-blur [scrollbar-width:none] md:hidden"
  >
    <button
      type="button"
      class="flex h-11 flex-none items-center gap-1.5 rounded-panel border-2 border-ink bg-mustard px-3.5 text-sm font-semibold shadow-hq-md focus-ring"
      aria-haspopup="dialog"
      :aria-expanded="sheetOpen ? 'true' : 'false'"
      data-test="toggle-filters"
      @click="emit('open-filters')"
    >
      Filtros
      <span
        v-if="activeFilterCount"
        class="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-ink px-1 text-[11px] text-surface"
      >
        {{ activeFilterCount }}
      </span>
    </button>
    <template v-if="types.length">
      <FilterChip label="Tudo" :pressed="selectedTypes.length === 0" @click="emit('clear-types')" />
      <FilterChip
        v-for="type in types"
        :key="type.id"
        :label="type.label"
        :pressed="selectedTypes.includes(type.id)"
        :disabled="type.count === 0 && !selectedTypes.includes(type.id)"
        @click="emit('toggle-type', type.id)"
      />
    </template>
  </div>
</template>
