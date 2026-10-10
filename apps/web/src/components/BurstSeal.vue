<script setup lang="ts">
withDefaults(defineProps<{ label: string; tone?: 'mustard' | 'accent'; size?: 'sm' | 'md' }>(), {
  tone: 'mustard',
  size: 'md',
})
</script>

<template>
  <span
    class="relative inline-block shrink-0"
    :class="size === 'md' ? 'h-[104px] w-[130px]' : 'h-[64px] w-[80px]'"
    aria-hidden="true"
  >
    <span class="burst absolute inset-0 bg-ink" />
    <span
      class="burst absolute inset-1 flex items-center justify-center text-center font-display leading-none"
      :class="[
        tone === 'accent' ? 'bg-accent text-surface' : 'bg-mustard text-ink',
        size === 'md' ? 'text-[28px]' : 'text-lg',
      ]"
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
