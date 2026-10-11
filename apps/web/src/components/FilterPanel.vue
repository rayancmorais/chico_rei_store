<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { FiltersResponse, ProductSort } from '@chico_rei_store/shared'
import FilterChip from '@/components/FilterChip.vue'
import ColorSwatchButton from '@/components/ColorSwatchButton.vue'
import SortControl from '@/components/SortControl.vue'
import { useScrollArrows } from '@/composables/useScrollArrows'
import { pluralize } from '@/utils/format'

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

const typeTrack = ref<HTMLElement | null>(null)
const { canScrollBack, canScrollForward, hiddenAhead, measure, scrollBack, scrollForward } =
  useScrollArrows(typeTrack)
const forwardLabel = computed(() => {
  const count = hiddenAhead.value
  if (count === 0) return 'Ver mais tipos'
  return `Ver mais ${pluralize(count, 'tipo', 'tipos')}`
})
// A largura dos chips muda com as contagens, que mudam a cada filtro.
watch(
  () => props.filters.types,
  () => nextTick(measure),
)
</script>

<template>
  <div class="rounded-panel border-3 border-ink bg-surface shadow-hq-raised">
    <div class="flex items-center border-b-2 border-ink py-3 pl-3.5 pr-2">
      <FilterChip
        label="Tudo"
        always-enabled
        :count="allTypesCount"
        :pressed="selectedTypes.length === 0"
        data-test="all-types"
        @click="emit('clear-types')"
      />
      <span class="mx-3 h-[26px] w-0.5 flex-none bg-line" aria-hidden="true" />

      <div class="relative min-w-0 flex-1">
        <!-- O padding dá espaço para a sombra e o hover dos chips, que o overflow cortaria. -->
        <div
          ref="typeTrack"
          class="-my-1.5 flex items-center gap-1.5 overflow-x-auto py-1.5 pl-0.5 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Tipos de produto"
          data-test="type-track"
        >
          <FilterChip
            v-for="type in filters.types"
            :key="type.id"
            :label="type.label"
            :count="type.count"
            :pressed="selectedTypes.includes(type.id)"
            :data-test="`type-${type.id}`"
            @click="emit('toggle-type', type.id)"
          />
        </div>

        <div
          v-if="canScrollBack"
          class="pointer-events-none absolute inset-y-0 left-0 flex items-center bg-gradient-to-r from-surface from-55% to-transparent pr-7"
        >
          <button
            type="button"
            class="pointer-events-auto flex h-[38px] items-center rounded-panel border-2 border-ink bg-white px-3 text-sm font-bold shadow-hq-sm active:translate-x-px active:translate-y-px active:shadow-none focus-ring"
            aria-label="Ver tipos anteriores"
            data-test="types-back"
            @click="scrollBack"
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>
        <div
          v-if="canScrollForward"
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-surface from-55% to-transparent pl-7"
        >
          <button
            type="button"
            class="pointer-events-auto flex h-[38px] items-center gap-1.5 rounded-panel border-2 border-ink bg-accent pl-2 pr-3 text-sm font-bold text-surface shadow-hq-sm active:translate-x-px active:translate-y-px active:shadow-none focus-ring"
            :aria-label="forwardLabel"
            data-test="types-forward"
            @click="scrollForward"
          >
            <span
              v-if="hiddenAhead"
              class="flex h-[22px] min-w-6 items-center justify-center rounded-pill border-2 border-ink bg-mustard px-1.5 text-[11px] text-ink"
              aria-hidden="true"
            >
              +{{ hiddenAhead }}
            </span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
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
