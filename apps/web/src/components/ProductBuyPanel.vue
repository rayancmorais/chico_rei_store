<script setup lang="ts">
import { formatPrice } from '@/utils/format'
import { imageUrl } from '@/utils/image'
import AddToCartButton from '@/components/AddToCartButton.vue'
import BurstSeal from '@/components/BurstSeal.vue'

// O botão fica num card com a miniatura, o preço e a escolha, para a pessoa conferir o que vai
// comprar sem voltar aos seletores. O estado (escolha, aviso e tempo) é da página de produto.
defineProps<{
  image: string
  priceCents: number
  state: 'blocked' | 'ready' | 'added'
  choice: { ready: boolean; text: string }
  colorHex?: string
  notice?: { name: string; detail: string }
}>()

const emit = defineEmits<{ (event: 'click'): void }>()
</script>

<template>
  <div
    class="relative flex items-center gap-2.5 rounded-panel border-3 border-ink bg-surface p-2 shadow-hq md:gap-3 md:p-2.5"
    data-test="buy-box"
  >
    <BurstSeal
      v-if="notice"
      label="BOA!"
      size="sm"
      class="pointer-events-none absolute -left-3 -top-5 z-10 motion-safe:animate-zap"
    />
    <span class="relative flex-none" aria-hidden="true">
      <img
        :src="imageUrl(image, 120, { trim: true })"
        alt=""
        width="44"
        height="44"
        class="size-11 rounded-control border-2 border-ink bg-sand object-cover"
      />
      <span
        v-if="colorHex"
        class="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-ink"
        :style="{ backgroundColor: colorHex }"
      />
    </span>
    <span v-if="notice" class="flex min-w-0 flex-1 flex-col" data-test="added-notice">
      <span class="text-xs font-bold text-success"
        ><span aria-hidden="true">✓ </span>Adicionado ao carrinho</span
      >
      <span class="truncate font-bold">{{ notice.name }}</span>
      <span class="truncate text-xs text-muted-strong">{{ notice.detail }}</span>
    </span>
    <span v-else class="flex min-w-0 flex-1 flex-col" data-test="buy-summary">
      <span class="text-lg font-bold leading-tight">{{ formatPrice(priceCents) }}</span>
      <span
        class="truncate text-xs font-bold"
        :class="choice.ready ? 'text-success' : 'text-accent'"
        data-test="choice-line"
        >{{ choice.text }}</span
      >
    </span>
    <AddToCartButton :state="state" class="flex-none" @click="emit('click')" />
  </div>
</template>
