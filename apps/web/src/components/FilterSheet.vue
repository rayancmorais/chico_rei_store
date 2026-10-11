<script setup lang="ts">
import { ref } from 'vue'
import type { FiltersResponse, ProductSort } from '@chico_rei_store/shared'
import { useModalDialog } from '@/composables/useModalDialog'
import { pluralize } from '@/utils/format'
import FilterChip from '@/components/FilterChip.vue'
import ColorSwatchButton from '@/components/ColorSwatchButton.vue'
import SortControl from '@/components/SortControl.vue'

const props = defineProps<{
  open: boolean
  filters: FiltersResponse
  selectedTypes: string[]
  selectedColors: string[]
  sort: ProductSort
  total: number
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'toggle-type', id: string): void
  (event: 'toggle-color', id: string): void
  (event: 'clear'): void
  (event: 'change-sort', sort: ProductSort): void
}>()

const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)

const { onKeydown } = useModalDialog({
  isOpen: () => props.open,
  panel,
  initialFocus: closeButton,
  onClose: () => emit('close'),
})
</script>

<template>
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-class="opacity-0"
    leave-active-class="transition-opacity duration-150"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-40 md:hidden" @keydown="onKeydown">
      <div
        class="absolute inset-0 bg-ink/40"
        aria-hidden="true"
        data-test="sheet-backdrop"
        @click="emit('close')"
      />

      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        class="absolute inset-x-2 bottom-2 flex max-h-[88%] flex-col overflow-hidden rounded-[10px] border-3 border-ink bg-surface shadow-[5px_5px_0_#2A1F17] motion-safe:animate-sheet-up"
        data-test="filter-sheet"
      >
        <div class="flex items-center justify-between border-b-3 border-ink bg-mustard px-4 py-3.5">
          <h2 id="filter-sheet-title" class="font-display text-2xl">Filtrar</h2>
          <button
            ref="closeButton"
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-panel border-2 border-ink bg-surface text-lg shadow-hq-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            aria-label="Fechar filtros"
            data-test="close-sheet"
            @click="emit('close')"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div class="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5 pt-2">
          <div role="group" aria-labelledby="sheet-sort-label">
            <p id="sheet-sort-label" class="mb-2.5 text-sm font-semibold">Ordenar por</p>
            <SortControl
              :value="sort"
              name="sort-sheet"
              variant="chips"
              @input="emit('change-sort', $event)"
            />
          </div>

          <div role="group" aria-labelledby="sheet-type-label">
            <p id="sheet-type-label" class="mb-2.5 text-sm font-semibold">Tipo de peça</p>
            <div class="flex flex-wrap gap-1.5">
              <FilterChip
                v-for="type in filters.types"
                :key="type.id"
                :label="type.label"
                :count="type.count"
                :pressed="selectedTypes.includes(type.id)"
                :disabled="type.count === 0 && !selectedTypes.includes(type.id)"
                @click="emit('toggle-type', type.id)"
              />
            </div>
          </div>

          <div role="group" aria-labelledby="sheet-color-label">
            <p id="sheet-color-label" class="mb-2.5 text-sm font-semibold">Cor</p>
            <div class="grid grid-cols-4 gap-x-1.5 gap-y-3.5">
              <ColorSwatchButton
                v-for="color in filters.colors"
                :key="color.id"
                :color="color"
                :count="color.count"
                :pressed="selectedColors.includes(color.id)"
                size="lg"
                @click="emit('toggle-color', color.id)"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-2.5 border-t-3 border-ink bg-paper px-4 pb-4.5 pt-3.5">
          <button
            type="button"
            class="h-13 rounded-panel border-2 border-ink bg-white px-4.5 text-[15px] font-medium shadow-hq-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            data-test="sheet-clear"
            @click="emit('clear')"
          >
            Limpar
          </button>
          <button
            type="button"
            class="btn-hq-accent h-13 flex-1"
            data-test="sheet-apply"
            @click="emit('close')"
          >
            Ver {{ pluralize(total, 'produto', 'produtos') }} →
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
