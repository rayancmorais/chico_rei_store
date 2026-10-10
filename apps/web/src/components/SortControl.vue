<script setup lang="ts">
import type { ProductSort } from '@chico_rei_store/shared'

defineProps<{ value: ProductSort; name: string; variant?: 'segmented' | 'chips' }>()

const emit = defineEmits<{ (event: 'input', sort: ProductSort): void }>()

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
]
</script>

<template>
  <div
    class="flex"
    :class="
      variant === 'chips'
        ? 'flex-wrap gap-1.5'
        : 'overflow-hidden rounded-panel border-2 border-ink bg-white'
    "
  >
    <label v-for="(option, index) in SORT_OPTIONS" :key="option.value" class="cursor-pointer">
      <input
        type="radio"
        class="peer sr-only"
        :name="name"
        :value="option.value"
        :checked="option.value === value"
        :data-test="`sort-${option.value}`"
        @change="emit('input', option.value)"
      />
      <span
        class="flex items-center whitespace-nowrap text-[13px] font-medium transition-colors peer-checked:bg-ink peer-checked:text-surface peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-accent"
        :class="
          variant === 'chips'
            ? 'h-10 rounded-panel border-2 border-ink bg-white px-3.5 shadow-hq-sm'
            : ['h-8 px-3', index > 0 ? 'border-l-2 border-ink' : '']
        "
      >
        {{ option.label }}
      </span>
    </label>
  </div>
</template>
