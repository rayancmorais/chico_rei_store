<script setup lang="ts">
import { computed } from 'vue'
import type { Color } from '@chico_rei_store/shared'

const props = defineProps<{ colors: Color[]; value?: string | null }>()

const emit = defineEmits<{ (event: 'input', id: string): void }>()

const selectedName = computed(() => props.colors.find((color) => color.id === props.value)?.name)
</script>

<template>
  <fieldset>
    <legend class="text-sm font-medium text-stone-900">
      Cor<span v-if="selectedName" class="font-normal text-stone-600">: {{ selectedName }}</span>
    </legend>
    <div class="mt-3 flex flex-wrap gap-3">
      <label v-for="color in colors" :key="color.id" class="cursor-pointer" :title="color.name">
        <input
          type="radio"
          name="color"
          class="peer sr-only"
          :value="color.id"
          :checked="color.id === value"
          :data-test="`color-option-${color.id}`"
          @change="emit('input', color.id)"
        />
        <span class="sr-only">{{ color.name }}</span>
        <span
          class="block h-9 w-9 rounded-full border border-stone-300 ring-stone-900 ring-offset-2 transition peer-checked:ring-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-stone-900"
          :style="{ backgroundColor: color.hex }"
          aria-hidden="true"
        />
      </label>
    </div>
  </fieldset>
</template>
