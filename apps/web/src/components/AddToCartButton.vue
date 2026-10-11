<script setup lang="ts">
// O botão fica à direita do card de compra, que já mostra preço, escolha e o selo: aqui ele só diz
// a ação.
defineProps<{ state: 'blocked' | 'ready' | 'added' }>()

const emit = defineEmits<{ (event: 'click'): void }>()
</script>

<template>
  <div class="relative">
    <!-- Bloqueado usa aria-disabled, e não `disabled`: o botão continua clicável para mostrar
         o que falta escolher. -->
    <button
      type="button"
      class="flex h-11 items-center justify-center rounded-panel border-ink px-4 font-bold transition-[transform,box-shadow] duration-100 focus-ring-lg"
      :class="
        state === 'blocked'
          ? 'cursor-not-allowed border-2.5 border-dashed bg-sand-soft'
          : [
              'border-3 text-base text-surface shadow-hq hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hq-raised active:translate-x-[3px] active:translate-y-[3px] active:shadow-hq-press',
              state === 'added'
                ? 'bg-success motion-safe:animate-pop'
                : 'bg-accent hover:bg-accent-hover',
            ]
      "
      :aria-disabled="state === 'blocked' ? 'true' : undefined"
      data-test="add-to-cart"
      @click="emit('click')"
    >
      <span v-if="state === 'added'">Ver<span class="sr-only"> carrinho</span></span>
      <span v-else>Adicionar<span class="sr-only"> ao carrinho</span></span>
    </button>
    <p class="sr-only" role="status" :data-test="state === 'added' ? 'added' : undefined">
      {{ state === 'added' ? 'Adicionado ao carrinho' : '' }}
    </p>
  </div>
</template>
