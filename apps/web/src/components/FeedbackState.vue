<script setup lang="ts">
import BurstSeal from '@/components/BurstSeal.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    seal: string
    sealTone?: 'mustard' | 'accent'
  }>(),
  { description: undefined, sealTone: 'mustard' },
)
</script>

<template>
  <section
    class="mt-2 flex flex-col items-center gap-3.5 rounded-panel border-3 border-dashed border-ink bg-surface px-5 pb-16 pt-14 text-center"
  >
    <BurstSeal :label="seal" :tone="sealTone" class="motion-safe:animate-stamp" />
    <h2 class="font-display text-title-sm md:text-title-md">{{ title }}</h2>
    <p v-if="description" class="max-w-sm text-base text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-2">
      <slot />
    </div>
  </section>
</template>
