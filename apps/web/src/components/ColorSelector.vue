<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Color } from '@chico_rei_store/shared'
import PendingTag from '@/components/PendingTag.vue'

const props = defineProps<{ colors: Color[]; value?: string | null; pending?: boolean }>()

const emit = defineEmits<{ (event: 'input', id: string): void }>()

const selectedName = computed(() => props.colors.find((color) => color.id === props.value)?.name)

const root = ref<HTMLFieldSetElement | null>(null)

// Foca a opção marcada (ou a primeira): dali as setas do teclado já trocam a cor.
function focus() {
  const input =
    root.value?.querySelector<HTMLInputElement>('input:checked') ??
    root.value?.querySelector<HTMLInputElement>('input')
  input?.focus()
}

defineExpose({ focus })
</script>

<template>
  <fieldset
    ref="root"
    class="-m-3 rounded-panel border-2.5 border-dashed p-3 transition-colors"
    :class="pending ? 'border-accent bg-accent-soft' : 'border-transparent'"
  >
    <legend class="float-left mb-3 flex min-h-6 w-full items-center justify-between gap-2">
      <span class="flex items-center gap-2">
        <span class="text-eyebrow uppercase">Cor</span>
        <PendingTag v-if="pending" />
      </span>
      <span v-if="selectedName" class="text-sm font-semibold" data-test="color-name">
        {{ selectedName }}
      </span>
    </legend>
    <div class="clear-left flex flex-wrap gap-3">
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
          class="block size-11 rounded-full border-2.5 border-ink shadow-hq-sm transition-transform hover:-translate-x-px hover:-translate-y-px hover:scale-105 peer-checked:shadow-ring-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[7px] peer-focus-visible:outline-ink motion-safe:peer-checked:animate-zap"
          :style="{ backgroundColor: color.hex }"
          aria-hidden="true"
        />
      </label>
    </div>
  </fieldset>
</template>
