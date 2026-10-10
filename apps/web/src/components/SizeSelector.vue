<script setup lang="ts">
defineProps<{ sizes: string[]; value?: string | null }>()

const emit = defineEmits<{ (event: 'input', size: string): void }>()
</script>

<template>
  <fieldset>
    <legend class="text-sm font-medium text-stone-900">Tamanho</legend>
    <div class="mt-3 flex flex-wrap gap-2">
      <label v-for="size in sizes" :key="size" class="cursor-pointer">
        <input
          type="radio"
          name="size"
          class="peer sr-only"
          :value="size"
          :checked="size === value"
          :data-test="`size-option-${size}`"
          @change="emit('input', size)"
        />
        <span
          class="flex h-11 min-w-[2.75rem] items-center justify-center rounded-full border border-stone-300 px-3 text-sm text-stone-900 transition hover:border-stone-900 peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-stone-900"
        >
          {{ size }}
        </span>
      </label>
    </div>
  </fieldset>
</template>
