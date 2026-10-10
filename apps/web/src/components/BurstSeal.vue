<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ label: string; tone?: 'mustard' | 'accent'; size?: 'sm' | 'md' }>(),
  { tone: 'mustard', size: 'md' },
)

// Onomatopeia curta ("POW!") cabe grande; frase ("Arte autoral") precisa de letra menor para
// não ser cortada pelas pontas da estrela.
const isPhrase = computed(() => props.label.length > 6)
const textSize = computed(() => {
  if (props.size === 'md') return isPhrase.value ? 'text-lg' : 'text-[28px]'
  return isPhrase.value ? 'text-[13px]' : 'text-lg'
})
</script>

<template>
  <!-- As camadas se empilham pelo grid, e não por `absolute`: assim a raiz não precisa ser
       `relative` e quem usa o selo pode posicioná-lo com `absolute` sem conflito de classes. -->
  <span
    class="inline-grid shrink-0"
    :class="size === 'md' ? 'h-[104px] w-[130px]' : 'h-[64px] w-[80px]'"
    aria-hidden="true"
  >
    <span class="burst bg-ink [grid-area:1/1]" />
    <span
      class="burst m-1 flex items-center justify-center px-3 text-center font-display leading-[1.05] [grid-area:1/1]"
      :class="[tone === 'accent' ? 'bg-accent text-surface' : 'bg-mustard text-ink', textSize]"
    >
      {{ label }}
    </span>
  </span>
</template>

<style scoped>
/* Estrela de 14 pontas do balão de onomatopeia. */
.burst {
  clip-path: polygon(
    50% 0%,
    58.5% 13%,
    71.7% 5%,
    73.7% 20.3%,
    89.1% 18.8%,
    84.2% 33.5%,
    98.7% 38.9%,
    88% 50%,
    98.7% 61.1%,
    84.2% 66.5%,
    89.1% 81.2%,
    73.7% 79.7%,
    71.7% 95%,
    58.5% 87%,
    50% 100%,
    41.5% 87%,
    28.3% 95%,
    26.3% 79.7%,
    10.9% 81.2%,
    15.8% 66.5%,
    1.3% 61.1%,
    12% 50%,
    1.3% 38.9%,
    15.8% 33.5%,
    10.9% 18.8%,
    26.3% 20.3%,
    28.3% 5%,
    41.5% 13%
  );
}
</style>
