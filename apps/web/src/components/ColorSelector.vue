<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Color } from '@chico_rei_store/shared'
import PendingTag from '@/components/PendingTag.vue'

const props = defineProps<{ colors: Color[]; value?: string | null; pending?: boolean }>()

const emit = defineEmits<{ (event: 'input', id: string): void }>()

const selectedName = computed(() => props.colors.find((color) => color.id === props.value)?.name)

const root = ref<HTMLFieldSetElement | null>(null)

// Foca a opção marcada (ou a primeira): dali as setas do teclado já trocam a cor.
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
    class="-m-3 min-w-0 rounded-panel border-2.5 border-dashed p-3 transition-colors"
    :class="pending ? 'border-accent bg-accent-soft' : 'border-transparent'"
  >
    <legend class="float-left flex min-h-5 w-full items-center gap-2">
      <span class="flex items-center gap-2">
        <span class="text-eyebrow uppercase">Cor</span>
        <PendingTag v-if="pending" />
      </span>
      <span v-if="selectedName" class="text-sm font-semibold" data-test="color-name">
        {{ selectedName }}
      </span>
    </legend>
    <!-- As cores ficam numa linha só, que rola na horizontal se não couberem. O círculo tem 32 px
         e o label, 6 px de folga em volta: 44 px de área de toque. O padding do trilho deixa
         espaço para o anel de seleção, que a rolagem cortaria. O `min-w-0` do fieldset é o que
         deixa o trilho rolar: sem ele, o fieldset cresce até caber todas as cores. -->
    <div class="clear-left -m-1.5 flex overflow-x-auto p-1.5">
      <label
        v-for="color in colors"
        :key="color.id"
        class="flex-none cursor-pointer p-1.5"
        :title="color.name"
      >
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
          class="block size-8 rounded-full border-2.5 border-ink shadow-hq-sm transition-transform hover:-translate-x-px hover:-translate-y-px hover:scale-105 peer-checked:shadow-ring-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[7px] peer-focus-visible:outline-ink motion-safe:peer-checked:animate-zap"
          :style="{ backgroundColor: color.hex }"
          aria-hidden="true"
        />
      </label>
    </div>
  </fieldset>
</template>
