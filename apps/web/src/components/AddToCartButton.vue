<script setup lang="ts">
import { formatPrice } from '@/utils/format'
import BurstSeal from '@/components/BurstSeal.vue'

withDefaults(
  defineProps<{
    state: 'blocked' | 'ready' | 'added'
    priceCents: number
    missingChoice?: string
  }>(),
  { missingChoice: undefined },
)

const emit = defineEmits<{ (event: 'click'): void }>()
</script>

<template>
  <div class="relative">
    <!-- Bloqueado usa aria-disabled, e não `disabled`: o botão continua clicável para mostrar
         o que falta escolher. -->
    <button
      type="button"
      class="flex w-full flex-col items-center justify-center gap-0.5 rounded-panel border-ink font-bold transition-[transform,box-shadow] duration-100 focus-ring-lg"
      :class="
        state === 'blocked'
          ? 'h-[62px] cursor-not-allowed border-2.5 border-dashed bg-sand-soft'
          : [
              'h-[58px] border-3 text-base text-surface shadow-hq hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hq-raised active:translate-x-[3px] active:translate-y-[3px] active:shadow-hq-press',
              state === 'added'
                ? 'bg-success motion-safe:animate-pop'
                : 'bg-accent hover:bg-accent-hover',
            ]
      "
      :aria-disabled="state === 'blocked' ? 'true' : undefined"
      data-test="add-to-cart"
      @click="emit('click')"
    >
      <template v-if="state === 'blocked'">
        <span class="text-[15px]">Adicionar ao carrinho</span>
        <span class="text-sm font-semibold text-accent">
          <span aria-hidden="true">↑ </span>
          <span data-test="missing-choice">{{ missingChoice }}</span>
        </span>
      </template>
      <template v-else-if="state === 'added'">
        <span><span aria-hidden="true">✓ </span>Adicionado · Ver carrinho →</span>
      </template>
      <template v-else>
        <span>Adicionar ao carrinho — {{ formatPrice(priceCents) }}</span>
      </template>
    </button>
    <BurstSeal
      v-if="state === 'added'"
      label="BOA!"
      size="sm"
      class="pointer-events-none absolute -right-3 -top-9 motion-safe:animate-zap md:-right-5"
    />
    <p class="sr-only" role="status" :data-test="state === 'added' ? 'added' : undefined">
      {{ state === 'added' ? 'Adicionado ao carrinho' : '' }}
    </p>
  </div>
</template>
