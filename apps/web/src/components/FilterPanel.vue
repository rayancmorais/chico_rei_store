<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FiltersResponse, ProductSort } from '@chico_rei_store/shared'
import FilterChip from '@/components/FilterChip.vue'
import ColorSwatchButton from '@/components/ColorSwatchButton.vue'
import SortControl from '@/components/SortControl.vue'

const props = defineProps<{
  filters: FiltersResponse
  selectedTypes: string[]
  selectedColors: string[]
  sort: ProductSort
}>()

const emit = defineEmits<{
  (event: 'toggle-type', id: string): void
  (event: 'toggle-color', id: string): void
  (event: 'clear-types'): void
  (event: 'change-sort', sort: ProductSort): void
}>()

const COLLAPSED_COLORS = 8

const showAllColors = ref(false)
const allTypesCount = computed(() => props.filters.types.reduce((sum, type) => sum + type.count, 0))
const visibleColors = computed(() =>
  showAllColors.value ? props.filters.colors : props.filters.colors.slice(0, COLLAPSED_COLORS),
)
const hiddenColorCount = computed(() => props.filters.colors.length - visibleColors.value.length)
</script>

<template>
  <div class="rounded-panel border-3 border-ink bg-surface shadow-[6px_6px_0_#2A1F17]">
    <div
      class="flex items-center gap-1.5 overflow-x-auto border-b-2 border-ink px-3.5 py-3 [scrollbar-width:none]"
    >
      <FilterChip
        label="Tudo"
        :count="allTypesCount"
        :pressed="selectedTypes.length === 0"
        data-test="all-types"
        @click="emit('clear-types')"
      />
      <span class="mx-1.5 h-[26px] w-0.5 flex-none bg-line" aria-hidden="true" />
      <FilterChip
        v-for="type in filters.types"
        :key="type.id"
        :label="type.label"
        :count="type.count"
        :pressed="selectedTypes.includes(type.id)"
        :disabled="type.count === 0 && !selectedTypes.includes(type.id)"
        :data-test="`type-${type.id}`"
        @click="emit('toggle-type', type.id)"
      />
    </div>

    <div class="flex items-center justify-between gap-5 px-3.5 py-2.5">
      <div
        class="flex min-w-0 items-center gap-3"
        role="group"
        aria-labelledby="color-filter-label"
      >
        <span id="color-filter-label" class="text-eyebrow uppercase">Cor</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <ColorSwatchButton
            v-for="color in visibleColors"
            :key="color.id"
            :color="color"
            :count="color.count"
            :pressed="selectedColors.includes(color.id)"
            :data-test="`color-${color.id}`"
            @click="emit('toggle-color', color.id)"
          />
          <button
            v-if="hiddenColorCount > 0"
            type="button"
            class="h-[30px] rounded-pill border-2 border-dashed border-ink px-2.5 text-xs font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
            data-test="more-colors"
            @click="showAllColors = true"
          >
            + {{ hiddenColorCount }} cores
          </button>
        </div>
      </div>

      <div class="flex flex-none items-center gap-2.5" role="group" aria-labelledby="sort-label">
        <span id="sort-label" class="text-eyebrow uppercase">Ordenar</span>
        <SortControl :value="sort" name="sort-panel" @input="emit('change-sort', $event)" />
      </div>
    </div>
  </div>
</template>
