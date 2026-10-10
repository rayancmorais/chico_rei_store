<script setup lang="ts">
import { computed } from 'vue'
import type { FiltersResponse } from '@chico_rei_store/shared'

const props = defineProps<{
  filters: FiltersResponse
  selectedTypes: string[]
  selectedColors: string[]
}>()

const emit = defineEmits<{
  (event: 'toggle-type', id: string): void
  (event: 'toggle-color', id: string): void
  (event: 'clear'): void
}>()

const hasSelection = computed(() => props.selectedTypes.length + props.selectedColors.length > 0)

// Opção com 0 resultados fica desabilitada, a não ser que já esteja marcada: sem isso, o usuário
// não conseguiria desmarcar um filtro que os outros zeraram.
function isUnavailable(count: number, selected: boolean) {
  return count === 0 && !selected
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-stone-900">Filtros</h2>
      <button
        v-if="hasSelection"
        type="button"
        class="text-sm text-stone-600 underline underline-offset-2 hover:text-stone-900"
        data-test="clear-filters"
        @click="emit('clear')"
      >
        Limpar filtros
      </button>
    </div>

    <fieldset>
      <legend class="text-sm font-medium text-stone-900">Tipo</legend>
      <ul class="mt-3 space-y-2">
        <li v-for="type in filters.types" :key="type.id">
          <label
            class="flex cursor-pointer items-center gap-2 text-sm text-stone-700"
            :class="{
              'cursor-not-allowed opacity-50': isUnavailable(
                type.count,
                selectedTypes.includes(type.id),
              ),
            }"
          >
            <input
              type="checkbox"
              class="h-4 w-4 accent-stone-900"
              :checked="selectedTypes.includes(type.id)"
              :disabled="isUnavailable(type.count, selectedTypes.includes(type.id))"
              :data-test="`type-${type.id}`"
              @change="emit('toggle-type', type.id)"
            />
            <span class="flex-1">{{ type.label }}</span>
            <span class="text-xs text-stone-500">{{ type.count }}</span>
          </label>
        </li>
      </ul>
    </fieldset>

    <fieldset>
      <legend class="text-sm font-medium text-stone-900">Cor</legend>
      <ul class="mt-3 space-y-2">
        <li v-for="color in filters.colors" :key="color.id">
          <label
            class="flex cursor-pointer items-center gap-2 text-sm text-stone-700"
            :class="{
              'cursor-not-allowed opacity-50': isUnavailable(
                color.count,
                selectedColors.includes(color.id),
              ),
            }"
          >
            <input
              type="checkbox"
              class="peer sr-only"
              :checked="selectedColors.includes(color.id)"
              :disabled="isUnavailable(color.count, selectedColors.includes(color.id))"
              :data-test="`color-${color.id}`"
              @change="emit('toggle-color', color.id)"
            />
            <span
              class="h-5 w-5 rounded-full border border-stone-300 ring-stone-900 ring-offset-2 peer-checked:ring-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-stone-900"
              :style="{ backgroundColor: color.hex }"
              aria-hidden="true"
            />
            <span class="flex-1">{{ color.name }}</span>
            <span class="text-xs text-stone-500">{{ color.count }}</span>
          </label>
        </li>
      </ul>
    </fieldset>
  </div>
</template>
