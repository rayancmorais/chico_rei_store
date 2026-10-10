<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <section class="mx-auto max-w-md py-16 text-center">
    <h2 class="text-lg font-semibold text-stone-900">{{ title }}</h2>
    <p v-if="description" class="mt-2 text-sm text-stone-600">{{ description }}</p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </section>
</template>
