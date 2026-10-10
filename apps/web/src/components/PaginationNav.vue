<script setup lang="ts">
defineProps<{ page: number; totalPages: number }>()

const emit = defineEmits<{ (event: 'change', page: number): void }>()
</script>

<template>
  <nav aria-label="Paginação" class="mt-10 flex items-center justify-center gap-4">
    <button
      type="button"
      class="rounded-full border border-stone-300 px-4 py-2 text-sm hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-300"
      :disabled="page <= 1"
      data-test="prev-page"
      @click="emit('change', page - 1)"
    >
      Anterior
    </button>
    <p class="text-sm text-stone-600" data-test="page-status">
      Página {{ page }} de {{ totalPages }}
    </p>
    <button
      type="button"
      class="rounded-full border border-stone-300 px-4 py-2 text-sm hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-300"
      :disabled="page >= totalPages"
      data-test="next-page"
      @click="emit('change', page + 1)"
    >
      Próxima
    </button>
  </nav>
</template>
