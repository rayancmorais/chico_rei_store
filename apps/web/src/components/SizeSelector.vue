<script setup lang="ts">
import { ref } from 'vue'
import PendingTag from '@/components/PendingTag.vue'

defineProps<{ sizes: string[]; value?: string | null; pending?: boolean }>()

const emit = defineEmits<{ (event: 'input', size: string): void }>()

const root = ref<HTMLFieldSetElement | null>(null)

// Foca a opção marcada (ou a primeira): dali as setas do teclado já trocam o tamanho.
function focus(options?: { preventScroll?: boolean }) {
  const input =
    root.value?.querySelector<HTMLInputElement>('input:checked') ??
    root.value?.querySelector<HTMLInputElement>('input')
  input?.focus(options)
}

defineExpose({ focus })
</script>

<template>
  <fieldset
    ref="root"
    class="-m-3 rounded-panel border-2.5 border-dashed p-3 transition-colors"
    :class="pending ? 'border-accent bg-accent-soft' : 'border-transparent'"
  >
    <legend class="float-left mb-1 flex min-h-6 w-full items-center gap-2">
      <span class="text-eyebrow uppercase">
        Tamanho
        <span v-if="value" class="tracking-normal text-accent">{{ value }}</span>
      </span>
      <PendingTag v-if="pending" />
    </legend>
    <!-- Uma coluna de pelo menos 44 px por tamanho: todos numa linha quando cabem, e quebra só
         em colunas estreitas (tablet). -->
    <div class="clear-left grid grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-1.5">
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
          class="flex h-11 items-center justify-center rounded-control border-2.5 border-ink bg-white text-sm font-bold shadow-hq-sm transition-[transform,box-shadow] duration-100 hover:-translate-x-px hover:-translate-y-px peer-checked:bg-ink peer-checked:text-surface peer-checked:shadow-hq-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
        >
          {{ size }}
        </span>
      </label>
    </div>
  </fieldset>
</template>
